package probeapi

import (
	"context"
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"net"
	"net/textproto"
	"net/url"
	"strings"
	"time"

	"github.com/alecthomas/units"
	"github.com/prometheus/blackbox_exporter/config"
	"github.com/prometheus/blackbox_exporter/prober"
	"github.com/prometheus/blackbox_exporter/utils"
	"github.com/prometheus/client_golang/prometheus"
)

const (
	DefaultTimeoutSeconds          = 5
	DefaultHTTPBodySizeLimitBytes  = 500 * 1024
	defaultPreferredIPProtocol     = "ip4"
	defaultDNSServer               = "223.5.5.5:53"
	defaultDNSTransportProtocol    = "udp"
	defaultDNSQueryType            = "A"
	defaultPingPayloadSize         = 56
	defaultTCPProbeName            = "tcp"
	defaultICMPProbeName           = "icmp"
	defaultHTTPProbeName           = "http"
	defaultDNSProbeName            = "dns"
)

// CommonOptions are shared by all probe methods.
type CommonOptions struct {
	TimeoutSeconds     float64 `json:"timeout_seconds,omitempty"`
	PreferredIPProtocol string  `json:"preferred_ip_protocol,omitempty"`
	IPProtocolFallback *bool   `json:"ip_protocol_fallback,omitempty"`
	SourceIPAddress    string  `json:"source_ip_address,omitempty"`
}

// HTTPRequest contains the arguments needed to run an HTTP probe.
type HTTPRequest struct {
	CommonOptions
	Target             string            `json:"target"`
	Method             string            `json:"method,omitempty"`
	Referer            string            `json:"referer,omitempty"`
	UserAgent          string            `json:"user_agent,omitempty"`
	Headers            map[string]string `json:"headers,omitempty"`
	ResolveIP          string            `json:"resolve_ip,omitempty"`
	Body               string            `json:"body,omitempty"`
	BodySizeLimitBytes int64             `json:"body_size_limit_bytes,omitempty"`
	FollowRedirects    *bool             `json:"follow_redirects,omitempty"`
	MaxRedirects       int               `json:"max_redirects,omitempty"`
}

// PingRequest contains the arguments needed to run an ICMP ping probe.
type PingRequest struct {
	CommonOptions
	Target      string `json:"target"`
	PayloadSize int    `json:"payload_size,omitempty"`
	TTL         int    `json:"ttl,omitempty"`
}

// TCPingRequest contains the arguments needed to run a TCP connect probe.
type TCPingRequest struct {
	CommonOptions
	Target string `json:"target"`
	TLS    bool   `json:"tls,omitempty"`
}

// DNSRequest contains the arguments needed to run a DNS probe.
type DNSRequest struct {
	CommonOptions
	Server            string   `json:"server,omitempty"`
	QueryName         string   `json:"query_name"`
	QueryType         string   `json:"query_type,omitempty"`
	QueryClass        string   `json:"query_class,omitempty"`
	TransportProtocol string   `json:"transport_protocol,omitempty"`
	DNSOverTLS        bool     `json:"dns_over_tls,omitempty"`
	RecursionDesired  *bool    `json:"recursion_desired,omitempty"`
	ValidRcodes       []string `json:"valid_rcodes,omitempty"`
}

// Result is the unified JSON shape returned by all probe methods.
type Result struct {
	Probe           string                          `json:"probe"`
	Target          string                          `json:"target"`
	EffectiveTarget string                          `json:"effective_target,omitempty"`
	ResolveIP       string                          `json:"resolve_ip,omitempty"`
	Success         bool                            `json:"success"`
	DurationSeconds float64                         `json:"duration_seconds"`
	TimeoutSeconds  float64                         `json:"timeout_seconds"`
	Metrics         json.RawMessage                 `json:"metrics"`
	ResponseHeaders []prober.HTTPResponseHeaderInfo `json:"response_headers,omitempty"`
	DNSResponse     *prober.DNSResponseInfo         `json:"dns_response,omitempty"`
}

func (r *Result) JSON() ([]byte, error) {
	return json.Marshal(r)
}

func (r *Result) PrettyJSON() ([]byte, error) {
	return json.MarshalIndent(r, "", "  ")
}

func CallHTTP(ctx context.Context, req HTTPRequest) ([]byte, error) {
	result, err := RunHTTP(ctx, req)
	if err != nil {
		return nil, err
	}
	return result.JSON()
}

func CallPing(ctx context.Context, req PingRequest) ([]byte, error) {
	result, err := RunPing(ctx, req)
	if err != nil {
		return nil, err
	}
	return result.JSON()
}

func CallTCPing(ctx context.Context, req TCPingRequest) ([]byte, error) {
	result, err := RunTCPing(ctx, req)
	if err != nil {
		return nil, err
	}
	return result.JSON()
}

func CallDNS(ctx context.Context, req DNSRequest) ([]byte, error) {
	result, err := RunDNS(ctx, req)
	if err != nil {
		return nil, err
	}
	return result.JSON()
}

func RunHTTP(ctx context.Context, req HTTPRequest) (*Result, error) {
	if err := requireTarget(req.Target); err != nil {
		return nil, err
	}
	target := strings.TrimSpace(req.Target)
	headers := cloneHeaders(req.Headers)

	if req.Referer != "" {
		setHeader(headers, "Referer", req.Referer)
	}
	if req.UserAgent != "" {
		setHeader(headers, "User-Agent", req.UserAgent)
	}

	resolveIP := strings.TrimSpace(req.ResolveIP)
	if resolveIP != "" {
		effectiveTarget, hostHeader, err := targetWithResolveIP(target, resolveIP)
		if err != nil {
			return nil, err
		}
		target = effectiveTarget
		if !hasHeader(headers, "Host") {
			setHeader(headers, "Host", hostHeader)
		}
	}

	module := defaultModule(defaultHTTPProbeName, req.CommonOptions)
	module.HTTP.IPProtocol = preferredIPProtocol(req.PreferredIPProtocol)
	module.HTTP.IPProtocolFallback = ipProtocolFallback(req.IPProtocolFallback)
	module.HTTP.Method = strings.TrimSpace(req.Method)
	module.HTTP.Headers = headers
	module.HTTP.Body = req.Body
	module.HTTP.BodySizeLimit = units.Base2Bytes(httpBodySizeLimit(req.BodySizeLimitBytes))
	module.HTTP.MaxRedirects = req.MaxRedirects
	if req.FollowRedirects != nil {
		module.HTTP.HTTPClientConfig.FollowRedirects = *req.FollowRedirects
	}

	var responseHeaders []prober.HTTPResponseHeaderInfo
	result, err := run(ctx, defaultHTTPProbeName, target, module, func(ctx context.Context, result *Result) context.Context {
		return prober.WithHTTPResponseHeaderCollector(ctx, func(info prober.HTTPResponseHeaderInfo) {
			responseHeaders = append(responseHeaders, info)
			result.ResponseHeaders = responseHeaders
		})
	})
	if err != nil {
		return nil, err
	}
	result.Target = strings.TrimSpace(req.Target)
	if target != result.Target {
		result.EffectiveTarget = target
	}
	if resolveIP != "" {
		result.ResolveIP = resolveIP
	}
	return result, nil
}

func RunPing(ctx context.Context, req PingRequest) (*Result, error) {
	if err := requireTarget(req.Target); err != nil {
		return nil, err
	}

	module := defaultModule(defaultICMPProbeName, req.CommonOptions)
	module.ICMP.IPProtocol = preferredIPProtocol(req.PreferredIPProtocol)
	module.ICMP.IPProtocolFallback = ipProtocolFallback(req.IPProtocolFallback)
	module.ICMP.SourceIPAddress = strings.TrimSpace(req.SourceIPAddress)
	module.ICMP.PayloadSize = req.PayloadSize
	if module.ICMP.PayloadSize <= 0 {
		module.ICMP.PayloadSize = defaultPingPayloadSize
	}
	if req.TTL > 0 {
		module.ICMP.TTL = req.TTL
	}

	return run(ctx, defaultICMPProbeName, req.Target, module, nil)
}

func RunTCPing(ctx context.Context, req TCPingRequest) (*Result, error) {
	if err := requireTarget(req.Target); err != nil {
		return nil, err
	}

	module := defaultModule(defaultTCPProbeName, req.CommonOptions)
	module.TCP.IPProtocol = preferredIPProtocol(req.PreferredIPProtocol)
	module.TCP.IPProtocolFallback = ipProtocolFallback(req.IPProtocolFallback)
	module.TCP.SourceIPAddress = strings.TrimSpace(req.SourceIPAddress)
	module.TCP.TLS = req.TLS

	return run(ctx, defaultTCPProbeName, req.Target, module, nil)
}

func RunDNS(ctx context.Context, req DNSRequest) (*Result, error) {
	if strings.TrimSpace(req.QueryName) == "" {
		return nil, errors.New("query_name is required")
	}

	target := strings.TrimSpace(req.Server)
	if target == "" {
		target = defaultDNSServer
	}

	module := defaultModule(defaultDNSProbeName, req.CommonOptions)
	module.DNS.IPProtocol = preferredIPProtocol(req.PreferredIPProtocol)
	module.DNS.IPProtocolFallback = ipProtocolFallback(req.IPProtocolFallback)
	module.DNS.SourceIPAddress = strings.TrimSpace(req.SourceIPAddress)
	module.DNS.TransportProtocol = defaultString(req.TransportProtocol, defaultDNSTransportProtocol)
	module.DNS.QueryName = strings.TrimSpace(req.QueryName)
	module.DNS.QueryType = defaultString(req.QueryType, defaultDNSQueryType)
	module.DNS.QueryClass = strings.TrimSpace(req.QueryClass)
	module.DNS.DNSOverTLS = req.DNSOverTLS
	if req.RecursionDesired != nil {
		module.DNS.Recursion = *req.RecursionDesired
	}
	if len(req.ValidRcodes) > 0 {
		module.DNS.ValidRcodes = req.ValidRcodes
	}

	var dnsResponse *prober.DNSResponseInfo
	return run(ctx, defaultDNSProbeName, target, module, func(ctx context.Context, result *Result) context.Context {
		return prober.WithDNSResponseCollector(ctx, func(info prober.DNSResponseInfo) {
			dnsResponse = &info
			result.DNSResponse = dnsResponse
		})
	})
}

func run(ctx context.Context, probeName string, target string, module config.Module, wrapContext func(context.Context, *Result) context.Context) (*Result, error) {
	probeFn, ok := prober.Probers[module.Prober]
	if !ok {
		return nil, errors.New("unknown prober: " + module.Prober)
	}

	timeout := module.Timeout
	timeoutSeconds := timeout.Seconds()
	if ctx == nil {
		ctx = context.Background()
	}

	ctx, cancel := context.WithTimeout(ctx, timeout)
	defer cancel()

	result := &Result{
		Probe:          probeName,
		Target:         target,
		TimeoutSeconds: timeoutSeconds,
	}
	if wrapContext != nil {
		ctx = wrapContext(ctx, result)
	}

	registry := prometheus.NewRegistry()
	probeSuccessGauge := prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "probe_success",
		Help: "Displays whether or not the probe was a success",
	})
	probeDurationGauge := prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "probe_duration_seconds",
		Help: "Returns how long the probe took to complete in seconds",
	})
	probeTimeoutGauge := prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "probe_timeout_seconds",
		Help: "Returns how long the probe timeout is in seconds",
	})
	registry.MustRegister(probeSuccessGauge)
	registry.MustRegister(probeDurationGauge)
	registry.MustRegister(probeTimeoutGauge)

	start := time.Now()
	success := probeFn(ctx, target, module, registry, discardLogger())
	duration := time.Since(start).Seconds()
	result.Success = success
	result.DurationSeconds = duration

	if success {
		probeSuccessGauge.Set(1)
	} else {
		probeSuccessGauge.Set(0)
	}
	probeDurationGauge.Set(duration)
	probeTimeoutGauge.Set(timeoutSeconds)

	metricFamilies, err := registry.Gather()
	if err != nil {
		return nil, err
	}
	metrics, err := utils.ToJson(metricFamilies)
	if err != nil {
		return nil, err
	}
	result.Metrics = json.RawMessage(metrics)

	return result, nil
}

func defaultModule(probeName string, options CommonOptions) config.Module {
	module := config.DefaultModule
	module.Prober = probeName
	module.Timeout = timeout(options.TimeoutSeconds)
	return module
}

func timeout(timeoutSeconds float64) time.Duration {
	if timeoutSeconds <= 0 {
		return DefaultTimeoutSeconds * time.Second
	}
	return time.Duration(timeoutSeconds * float64(time.Second))
}

func preferredIPProtocol(value string) string {
	return defaultString(value, defaultPreferredIPProtocol)
}

func ipProtocolFallback(value *bool) bool {
	if value == nil {
		return true
	}
	return *value
}

func httpBodySizeLimit(value int64) int64 {
	if value <= 0 {
		return DefaultHTTPBodySizeLimitBytes
	}
	return value
}

func defaultString(value string, fallback string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return fallback
	}
	return value
}

func cloneHeaders(headers map[string]string) map[string]string {
	if len(headers) == 0 {
		return map[string]string{}
	}

	cloned := make(map[string]string, len(headers))
	for key, value := range headers {
		cloned[key] = value
	}
	return cloned
}

func setHeader(headers map[string]string, key string, value string) {
	if strings.TrimSpace(value) == "" {
		return
	}

	canonicalKey := textproto.CanonicalMIMEHeaderKey(key)
	for existingKey := range headers {
		if textproto.CanonicalMIMEHeaderKey(existingKey) == canonicalKey {
			delete(headers, existingKey)
		}
	}
	headers[canonicalKey] = value
}

func hasHeader(headers map[string]string, key string) bool {
	canonicalKey := textproto.CanonicalMIMEHeaderKey(key)
	for existingKey := range headers {
		if textproto.CanonicalMIMEHeaderKey(existingKey) == canonicalKey {
			return true
		}
	}
	return false
}

func targetWithResolveIP(target string, resolveIP string) (string, string, error) {
	targetURL, err := url.Parse(normalizeHTTPTarget(target))
	if err != nil {
		return "", "", err
	}

	hostHeader := targetURL.Host
	if targetURL.Hostname() == "" || hostHeader == "" {
		return "", "", errors.New("target host is required")
	}

	ip := net.ParseIP(strings.Trim(resolveIP, "[]"))
	if ip == nil {
		return "", "", errors.New("resolve_ip must be a valid IP address")
	}

	if port := targetURL.Port(); port != "" {
		targetURL.Host = net.JoinHostPort(ip.String(), port)
	} else if ip.To4() == nil {
		targetURL.Host = "[" + ip.String() + "]"
	} else {
		targetURL.Host = ip.String()
	}

	return targetURL.String(), hostHeader, nil
}

func normalizeHTTPTarget(target string) string {
	target = strings.TrimSpace(target)
	targetLower := strings.ToLower(target)
	if !strings.HasPrefix(targetLower, "http://") && !strings.HasPrefix(targetLower, "https://") {
		return "http://" + target
	}
	return target
}

func requireTarget(target string) error {
	if strings.TrimSpace(target) == "" {
		return errors.New("target is required")
	}
	return nil
}

func discardLogger() *slog.Logger {
	return slog.New(slog.NewTextHandler(io.Discard, nil))
}
