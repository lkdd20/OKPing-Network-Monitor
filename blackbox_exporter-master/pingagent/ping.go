package pingagent

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"
	"time"

	mdns "github.com/miekg/dns"
	"github.com/prometheus/blackbox_exporter/probeapi"
)

type pingProbe func(context.Context, probeapi.PingRequest) (*probeapi.Result, error)
type tcpingProbe func(context.Context, probeapi.TCPingRequest) (*probeapi.Result, error)
type httpProbe func(context.Context, probeapi.HTTPRequest) (*probeapi.Result, error)
type dnsProbe func(context.Context, probeapi.DNSRequest) (*probeapi.Result, error)
type tracerouteProbe func(context.Context, string) (*TracerouteResult, error)
type tracerouteStreamProbe func(context.Context, string, tracerouteResultEmitter) (*TracerouteResult, error)
type targetResolver func(context.Context, string, string, string) ([]string, time.Duration, error)

type Processor struct {
	uuid        string
	ping        pingProbe
	tcping      tcpingProbe
	http        httpProbe
	dns         dnsProbe
	trace       tracerouteProbe
	traceStream tracerouteStreamProbe
	resolve     targetResolver
}

func NewProcessor(uuid string) *Processor {
	return &Processor{
		uuid:        uuid,
		ping:        probeapi.RunPing,
		tcping:      probeapi.RunTCPing,
		http:        probeapi.RunHTTP,
		dns:         probeapi.RunDNS,
		trace:       runTraceroute,
		traceStream: runTracerouteStream,
		resolve:     resolvePingTarget,
	}
}

func (processor *Processor) Handle(ctx context.Context, task Task) ResultMessage {
	result := ResultMessage{
		TaskID:      task.TaskID,
		NodeUUID:    processor.uuid,
		Type:        task.Type,
		MeasuredAt:  time.Now().UnixMilli(),
		BatchIndex:  task.BatchIndex,
		BatchTarget: task.BatchTarget,
	}

	switch task.Type {
	case "ping", "ping_v6":
		return processor.handlePing(ctx, task, result)
	case "tcping", "tcping_v6":
		return processor.handleTCPing(ctx, task, result)
	case "http", "http_v6":
		return processor.handleHTTP(ctx, task, result)
	case "dns", "dns_v6":
		return processor.handleDNS(ctx, task, result)
	case "traceroute", "traceroute_v6":
		return processor.handleTraceroute(ctx, task, result)
	default:
		result.Error = "unsupported task type: " + task.Type
		return result
	}
}

func (processor *Processor) handleTraceroute(ctx context.Context, task Task, result ResultMessage) ResultMessage {
	ips, dnsDuration, err := processor.resolve(ctx, task.URL, task.DNS, taskIPProtocol(task.Type))
	result.DNSDurationSeconds = dnsDuration.Seconds()
	if err != nil {
		result.Error = err.Error()
		return result
	}
	result.ResolvedIPs = ips
	result.IP = ips[0]

	traceResult, err := processor.trace(ctx, ips[0])
	if traceResult != nil {
		traceResult.Target = strings.TrimSpace(task.URL)
		traceResult.TargetIP = ips[0]
		result.TraceResult = traceResult
	}
	if err != nil {
		result.Error = err.Error()
	}
	return result
}

func (processor *Processor) HandleTracerouteStream(
	ctx context.Context,
	task Task,
	emit func(ResultMessage) error,
) (ResultMessage, error) {
	result := ResultMessage{
		TaskID:      task.TaskID,
		NodeUUID:    processor.uuid,
		Type:        task.Type,
		MeasuredAt:  time.Now().UnixMilli(),
		BatchIndex:  task.BatchIndex,
		BatchTarget: task.BatchTarget,
	}
	if task.Type != "traceroute" && task.Type != "traceroute_v6" {
		result.Error = "streaming is unsupported for task type: " + task.Type
		result.Sequence = 1
		result.TotalRuns = 1
		result.FinalResult = true
		return result, nil
	}

	ips, dnsDuration, err := processor.resolve(ctx, task.URL, task.DNS, taskIPProtocol(task.Type))
	result.DNSDurationSeconds = dnsDuration.Seconds()
	if err != nil {
		result.Error = err.Error()
		result.Sequence = 1
		result.TotalRuns = 1
		result.FinalResult = true
		return result, nil
	}
	result.ResolvedIPs = ips
	result.IP = ips[0]

	traceContext, cancel := context.WithCancel(ctx)
	defer cancel()
	emitted := 0
	var emitError error
	traceResult, traceError := processor.traceStream(traceContext, ips[0], func(update *TracerouteResult) {
		if update == nil || emitError != nil {
			return
		}
		update.Target = strings.TrimSpace(task.URL)
		update.TargetIP = ips[0]
		partial := result
		partial.Sequence = emitted + 1
		partial.TotalRuns = tracerouteProbesPerHop + 1
		partial.FinalResult = false
		partial.MeasuredAt = time.Now().UnixMilli()
		partial.TraceResult = update
		if err := emit(partial); err != nil {
			emitError = err
			cancel()
			return
		}
		emitted++
	})
	if emitError != nil {
		return result, emitError
	}
	if traceResult != nil {
		traceResult.Target = strings.TrimSpace(task.URL)
		traceResult.TargetIP = ips[0]
		result.TraceResult = traceResult
	}
	if traceError != nil {
		result.Error = traceError.Error()
	}
	result.Sequence = emitted + 1
	result.TotalRuns = tracerouteProbesPerHop + 1
	result.FinalResult = true
	result.MeasuredAt = time.Now().UnixMilli()
	return result, nil
}

func (processor *Processor) handleDNS(ctx context.Context, task Task, result ResultMessage) ResultMessage {
	options, err := parseDNSOptions(task.Body)
	if err != nil {
		result.Error = err.Error()
		return result
	}
	queryName, err := dnsQueryName(task.URL, options.QueryType)
	if err != nil {
		result.Error = err.Error()
		return result
	}
	server, err := dnsServer(task.DNS)
	if err != nil {
		result.Error = err.Error()
		return result
	}

	probeResult, err := processor.dns(ctx, probeapi.DNSRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds:      5,
			PreferredIPProtocol: taskIPProtocol(task.Type),
		},
		Server:      server,
		QueryName:   queryName,
		QueryType:   options.QueryType,
		ValidRcodes: []string{"NOERROR"},
	})
	if err != nil {
		result.Error = err.Error()
		return result
	}

	probeResult.Target = strings.TrimSpace(task.URL)
	probeResult.EffectiveTarget = server
	result.DNSDurationSeconds = probeResult.DurationSeconds
	if probeResult.DNSResponse != nil {
		result.ResolvedIPs = uniqueStrings(probeResult.DNSResponse.IPs)
		if len(result.ResolvedIPs) > 0 {
			result.IP = result.ResolvedIPs[0]
			probeResult.ResolveIP = result.IP
		}
	}
	result.ProbeResult = probeResult
	if !probeResult.Success {
		result.Error = "dns probe failed"
	}
	return result
}

func (processor *Processor) handlePing(ctx context.Context, task Task, result ResultMessage) ResultMessage {
	protocol := taskIPProtocol(task.Type)
	ips, dnsDuration, err := processor.resolve(ctx, task.URL, task.DNS, protocol)
	result.DNSDurationSeconds = dnsDuration.Seconds()
	if err != nil {
		result.Error = err.Error()
		return result
	}
	result.ResolvedIPs = ips
	result.IP = ips[0]

	probeResult, err := processor.ping(ctx, probeapi.PingRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds:      5,
			PreferredIPProtocol: protocol,
		},
		Target: ips[0],
	})
	if err != nil {
		result.Error = err.Error()
		return result
	}
	probeResult.Target = strings.TrimSpace(task.URL)
	probeResult.EffectiveTarget = ips[0]
	probeResult.ResolveIP = ips[0]
	result.ProbeResult = probeResult
	if !probeResult.Success {
		result.Error = "ping timeout"
	}
	return result
}

func (processor *Processor) handleTCPing(ctx context.Context, task Task, result ResultMessage) ResultMessage {
	protocol := taskIPProtocol(task.Type)
	port, err := tcpingPort(task)
	if err != nil {
		result.Error = err.Error()
		return result
	}
	ips, dnsDuration, err := processor.resolve(ctx, task.URL, task.DNS, protocol)
	result.DNSDurationSeconds = dnsDuration.Seconds()
	if err != nil {
		result.Error = err.Error()
		return result
	}
	result.ResolvedIPs = ips
	result.IP = ips[0]

	displayTarget, effectiveTarget := tcpingTargets(task.URL, ips[0], port)
	probeResult, err := processor.tcping(ctx, probeapi.TCPingRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds:      5,
			PreferredIPProtocol: protocol,
		},
		Target: effectiveTarget,
	})
	if err != nil {
		result.Error = err.Error()
		return result
	}
	probeResult.Target = displayTarget
	probeResult.EffectiveTarget = effectiveTarget
	probeResult.ResolveIP = ips[0]
	result.ProbeResult = probeResult
	if !probeResult.Success {
		result.Error = "tcping timeout"
	}
	return result
}

func (processor *Processor) handleHTTP(ctx context.Context, task Task, result ResultMessage) ResultMessage {
	protocol := taskIPProtocol(task.Type)
	target, err := httpTarget(task)
	if err != nil {
		result.Error = err.Error()
		return result
	}
	ips, dnsDuration, err := processor.resolve(ctx, task.URL, task.DNS, protocol)
	result.DNSDurationSeconds = dnsDuration.Seconds()
	if err != nil {
		result.Error = err.Error()
		return result
	}
	result.ResolvedIPs = ips
	result.IP = ips[0]

	options := httpOptions(task.Body)
	probeResult, err := processor.http(ctx, probeapi.HTTPRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds:      5,
			PreferredIPProtocol: protocol,
		},
		Target:    target,
		Method:    options.Method,
		Headers:   options.Headers,
		ResolveIP: ips[0],
		Body:      options.Body,
	})
	if err != nil {
		result.Error = err.Error()
		return result
	}
	if probeResult.ResolveIP == "" {
		probeResult.ResolveIP = ips[0]
	}
	result.ProbeResult = probeResult
	if !probeResult.Success {
		result.Error = "http probe failed"
	}
	return result
}

func taskIPProtocol(taskType string) string {
	if strings.HasSuffix(taskType, "_v6") {
		return "ip6"
	}
	return "ip4"
}

func tcpingTargets(rawTarget string, ip string, port int) (string, string) {
	host, err := pingHost(rawTarget)
	if err != nil || host == "" {
		host = strings.TrimSpace(rawTarget)
	}
	portString := strconv.Itoa(port)
	return net.JoinHostPort(strings.Trim(host, "[]"), portString), net.JoinHostPort(ip, portString)
}

func tcpingPort(task Task) (int, error) {
	if task.Port != 0 {
		return validateTCPingPort(task.Port)
	}
	target := strings.TrimSpace(task.URL)
	if target == "" {
		return 80, nil
	}
	if strings.Contains(target, "://") {
		parsed, err := url.Parse(target)
		if err == nil && parsed.Port() != "" {
			return parseTCPingPort(parsed.Port())
		}
	}
	if _, port, err := net.SplitHostPort(target); err == nil && port != "" {
		return parseTCPingPort(port)
	}
	return 80, nil
}

func validateTCPingPort(port int64) (int, error) {
	if port < 1 || port > 65535 {
		return 0, fmt.Errorf("invalid tcping port: %d", port)
	}
	return int(port), nil
}

func parseTCPingPort(port string) (int, error) {
	parsed, err := strconv.Atoi(strings.TrimSpace(port))
	if err != nil {
		return 0, fmt.Errorf("invalid tcping port: %s", port)
	}
	return validateTCPingPort(int64(parsed))
}

type httpHeaderPair struct {
	Key   string `json:"key"`
	Value string `json:"value"`
}

type parsedHTTPOptions struct {
	Method  string            `json:"method"`
	Headers map[string]string `json:"headers"`
	Body    string            `json:"body"`
}

type parsedDNSOptions struct {
	QueryType string `json:"queryType"`
}

var supportedDNSQueryTypes = map[string]struct{}{
	"A": {}, "AAAA": {}, "CNAME": {}, "MX": {},
	"NS": {}, "PTR": {}, "SRV": {}, "TXT": {},
}

func parseDNSOptions(rawBody string) (parsedDNSOptions, error) {
	options := parsedDNSOptions{QueryType: "A"}
	rawBody = strings.TrimSpace(rawBody)
	if rawBody != "" {
		if err := json.Unmarshal([]byte(rawBody), &options); err != nil {
			return options, errors.New("invalid dns options")
		}
	}
	options.QueryType = strings.ToUpper(strings.TrimSpace(options.QueryType))
	if options.QueryType == "" {
		options.QueryType = "A"
	}
	if _, ok := supportedDNSQueryTypes[options.QueryType]; !ok {
		return options, fmt.Errorf("unsupported dns query type: %s", options.QueryType)
	}
	return options, nil
}

func dnsQueryName(rawTarget string, queryType string) (string, error) {
	host, err := pingHost(rawTarget)
	if err != nil {
		return "", err
	}
	if queryType != "PTR" {
		return host, nil
	}
	if strings.HasSuffix(strings.ToLower(host), ".arpa") {
		return mdns.Fqdn(host), nil
	}
	ip := net.ParseIP(strings.Trim(host, "[]"))
	if ip == nil {
		return "", errors.New("PTR query target must be an IP address")
	}
	return mdns.ReverseAddr(ip.String())
}

func dnsServer(rawServer string) (string, error) {
	server := strings.TrimSpace(rawServer)
	if server == "" || strings.EqualFold(server, "system") {
		config, err := mdns.ClientConfigFromFile("/etc/resolv.conf")
		if err == nil && len(config.Servers) > 0 {
			return net.JoinHostPort(strings.Trim(config.Servers[0], "[]"), defaultString(config.Port, "53")), nil
		}
		return "223.5.5.5:53", nil
	}
	if host, port, err := net.SplitHostPort(server); err == nil {
		if strings.TrimSpace(host) == "" || strings.TrimSpace(port) == "" {
			return "", errors.New("invalid dns server")
		}
		return net.JoinHostPort(strings.Trim(host, "[]"), port), nil
	}
	server = strings.Trim(server, "[]")
	if server == "" || strings.ContainsAny(server, " \t\r\n/") {
		return "", errors.New("invalid dns server")
	}
	return net.JoinHostPort(server, "53"), nil
}

func uniqueStrings(values []string) []string {
	seen := make(map[string]struct{}, len(values))
	result := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(value)
		if value == "" {
			continue
		}
		if _, ok := seen[value]; ok {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

type legacyHTTPOptions struct {
	Method  string          `json:"method"`
	Headers json.RawMessage `json:"headers"`
	Body    string          `json:"body"`
}

func httpOptions(rawBody string) parsedHTTPOptions {
	options := parsedHTTPOptions{
		Method:  "GET",
		Headers: map[string]string{},
	}
	rawBody = strings.TrimSpace(rawBody)
	if rawBody == "" {
		return options
	}

	var legacy legacyHTTPOptions
	if err := json.Unmarshal([]byte(rawBody), &legacy); err == nil {
		if method := httpMethod(legacy.Method); method != "" {
			options.Method = method
		}
		options.Body = legacy.Body
		options.Headers = parseHTTPHeaders(legacy.Headers)
		return options
	}

	options.Body = rawBody
	options.Method = "POST"
	return options
}

func parseHTTPHeaders(raw json.RawMessage) map[string]string {
	headers := map[string]string{}
	if len(raw) == 0 {
		return headers
	}

	var pairs []httpHeaderPair
	if err := json.Unmarshal(raw, &pairs); err == nil {
		for _, header := range pairs {
			key := strings.TrimSpace(header.Key)
			value := strings.TrimSpace(header.Value)
			if key != "" && value != "" {
				headers[key] = value
			}
		}
		return headers
	}

	var object map[string]string
	if err := json.Unmarshal(raw, &object); err == nil {
		for key, value := range object {
			key = strings.TrimSpace(key)
			value = strings.TrimSpace(value)
			if key != "" && value != "" {
				headers[key] = value
			}
		}
	}
	return headers
}

func httpMethod(method string) string {
	method = strings.ToUpper(strings.TrimSpace(method))
	switch method {
	case "GET", "POST", "HEAD", "PUT", "PATCH", "DELETE", "OPTIONS":
		return method
	default:
		return ""
	}
}

func httpTarget(task Task) (string, error) {
	host, err := pingHost(task.URL)
	if err != nil {
		return "", err
	}
	scheme := strings.TrimSuffix(strings.ToLower(strings.TrimSpace(task.Agreement)), ":")
	if scheme == "" {
		scheme = "http"
	}
	if scheme != "http" && scheme != "https" {
		return "", fmt.Errorf("unsupported http agreement: %s", task.Agreement)
	}

	hostPort := host
	if task.Port != 0 {
		port, err := validateTCPingPort(task.Port)
		if err != nil {
			return "", err
		}
		hostPort = net.JoinHostPort(strings.Trim(host, "[]"), strconv.Itoa(port))
	} else if strings.Contains(host, ":") {
		hostPort = "[" + strings.Trim(host, "[]") + "]"
	}

	pathOrParams := strings.TrimSpace(task.PathOrParams)
	if pathOrParams != "" && !strings.HasPrefix(pathOrParams, "/") && !strings.HasPrefix(pathOrParams, "?") {
		pathOrParams = "/" + pathOrParams
	}
	return scheme + "://" + hostPort + pathOrParams, nil
}

func resolvePingTarget(ctx context.Context, rawTarget string, dnsServer string, protocol string) ([]string, time.Duration, error) {
	host, err := pingHost(rawTarget)
	if err != nil {
		return nil, 0, err
	}
	if ip := net.ParseIP(host); ip != nil {
		if protocol == "ip4" && ip.To4() == nil {
			return nil, 0, errors.New("target has no IPv4 address")
		}
		if protocol == "ip6" && ip.To4() != nil {
			return nil, 0, errors.New("target has no IPv6 address")
		}
		return []string{ip.String()}, 0, nil
	}

	resolver := net.DefaultResolver
	dnsServer = strings.TrimSpace(dnsServer)
	if dnsServer != "" && !strings.EqualFold(dnsServer, "system") {
		if _, _, err := net.SplitHostPort(dnsServer); err != nil {
			dnsServer = net.JoinHostPort(strings.Trim(dnsServer, "[]"), "53")
		}
		resolver = &net.Resolver{
			PreferGo: true,
			Dial: func(ctx context.Context, network string, _ string) (net.Conn, error) {
				return (&net.Dialer{}).DialContext(ctx, "udp", dnsServer)
			},
		}
	}

	start := time.Now()
	addresses, err := resolver.LookupIP(ctx, protocol, host)
	duration := time.Since(start)
	if err != nil {
		return nil, duration, fmt.Errorf("resolve %s: %w", host, err)
	}
	result := make([]string, 0, len(addresses))
	for _, address := range addresses {
		result = append(result, address.String())
	}
	if len(result) == 0 {
		return nil, duration, fmt.Errorf("resolve %s: no %s address", host, protocol)
	}
	return result, duration, nil
}

func pingHost(rawTarget string) (string, error) {
	target := strings.TrimSpace(rawTarget)
	if target == "" {
		return "", errors.New("ping target is required")
	}
	if strings.Contains(target, "://") {
		parsed, err := url.Parse(target)
		if err != nil || parsed.Hostname() == "" {
			return "", errors.New("invalid ping target")
		}
		return parsed.Hostname(), nil
	}
	if ip := net.ParseIP(strings.Trim(target, "[]")); ip != nil {
		return ip.String(), nil
	}
	if host, _, err := net.SplitHostPort(target); err == nil {
		return strings.Trim(host, "[]"), nil
	}
	if slash := strings.IndexByte(target, '/'); slash >= 0 {
		target = target[:slash]
	}
	target = strings.TrimSuffix(target, ".")
	if target == "" || strings.ContainsAny(target, " \t\r\n") {
		return "", errors.New("invalid ping target")
	}
	return target, nil
}
