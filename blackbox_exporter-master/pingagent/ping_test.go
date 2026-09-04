package pingagent

import (
	"context"
	"encoding/json"
	"strings"
	"testing"
	"time"

	"github.com/prometheus/blackbox_exporter/probeapi"
	"github.com/prometheus/blackbox_exporter/prober"
)

func TestProcessorMapsPingResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(context.Context, string, string, string) ([]string, time.Duration, error) {
		return []string{"1.1.1.1", "1.0.0.1"}, 12 * time.Millisecond, nil
	}
	processor.ping = func(_ context.Context, request probeapi.PingRequest) (*probeapi.Result, error) {
		if request.Target != "1.1.1.1" || request.PreferredIPProtocol != "ip4" {
			t.Fatalf("unexpected probe request: %#v", request)
		}
		return &probeapi.Result{
			Probe:           "icmp",
			Success:         true,
			DurationSeconds: 0.05,
			TimeoutSeconds:  5,
			Metrics:         json.RawMessage(`[{"name":"probe_success","value":1}]`),
		}, nil
	}

	result := processor.Handle(context.Background(), Task{TaskID: "task-1", Type: "ping", URL: "example.com"})
	if result.ProbeResult == nil || !result.ProbeResult.Success || result.ProbeResult.DurationSeconds != 0.05 {
		t.Fatalf("unexpected ping result: %#v", result)
	}
	if result.DNSDurationSeconds != 0.012 {
		t.Fatalf("unexpected DNS duration: %#v", result)
	}
	if result.NodeUUID != "node-uuid" || result.TaskID != "task-1" || len(result.ResolvedIPs) != 2 {
		t.Fatalf("unexpected result identity/address mapping: %#v", result)
	}
	if result.IP != "1.1.1.1" {
		t.Fatalf("unexpected result ip: %#v", result)
	}
	if result.ProbeResult.Target != "example.com" || result.ProbeResult.EffectiveTarget != "1.1.1.1" || result.ProbeResult.ResolveIP != "1.1.1.1" {
		t.Fatalf("unexpected probe target mapping: %#v", result.ProbeResult)
	}
	body, err := json.Marshal(result)
	if err != nil {
		t.Fatal(err)
	}
	encoded := string(body)
	for _, legacyField := range []string{`"user"`, `"uuid"`, `"state"`, `"time"`, `"firstIp"`, `"ipAddress"`} {
		if strings.Contains(encoded, legacyField) {
			t.Fatalf("modern result contains legacy field %s: %s", legacyField, encoded)
		}
	}
	var message map[string]json.RawMessage
	if err := json.Unmarshal(body, &message); err != nil {
		t.Fatal(err)
	}
	for _, removedField := range []string{"success", "latencyMs", "targetIp", "dnsLatencyMs"} {
		if _, ok := message[removedField]; ok {
			t.Fatalf("result contains removed top-level field %s: %s", removedField, encoded)
		}
	}
}

func TestProcessorPreservesBatchCorrelation(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(context.Context, string, string, string) ([]string, time.Duration, error) {
		return []string{"1.1.1.1"}, 0, nil
	}
	processor.ping = func(context.Context, probeapi.PingRequest) (*probeapi.Result, error) {
		return &probeapi.Result{Probe: "icmp", Success: true}, nil
	}
	index := 7
	result := processor.Handle(context.Background(), Task{
		BatchIndex:  &index,
		BatchTarget: "example.com",
		TaskID:      "task-1",
		Type:        "ping",
		URL:         "example.com",
	})
	if result.BatchIndex == nil || *result.BatchIndex != 7 || result.BatchTarget != "example.com" {
		t.Fatalf("unexpected batch correlation: %#v", result)
	}
}

func TestProcessorMapsTCPingResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(_ context.Context, target string, dns string, protocol string) ([]string, time.Duration, error) {
		if target != "example.com" || dns != "system" || protocol != "ip4" {
			t.Fatalf("unexpected resolver input: target=%q dns=%q protocol=%q", target, dns, protocol)
		}
		return []string{"93.184.216.34"}, 8 * time.Millisecond, nil
	}
	processor.tcping = func(_ context.Context, request probeapi.TCPingRequest) (*probeapi.Result, error) {
		if request.Target != "93.184.216.34:443" || request.PreferredIPProtocol != "ip4" {
			t.Fatalf("unexpected tcping request: %#v", request)
		}
		return &probeapi.Result{
			Probe:           "tcp",
			Success:         true,
			DurationSeconds: 0.03,
			TimeoutSeconds:  5,
			Metrics:         json.RawMessage(`[{"name":"probe_success","value":1}]`),
		}, nil
	}

	result := processor.Handle(context.Background(), Task{
		TaskID: "task-1",
		Type:   "tcping",
		URL:    "example.com",
		DNS:    "system",
		Port:   443,
	})
	if result.Error != "" || result.ProbeResult == nil || !result.ProbeResult.Success {
		t.Fatalf("unexpected tcping result: %#v", result)
	}
	if result.DNSDurationSeconds != 0.008 || len(result.ResolvedIPs) != 1 || result.ResolvedIPs[0] != "93.184.216.34" {
		t.Fatalf("unexpected resolver mapping: %#v", result)
	}
	if result.IP != "93.184.216.34" {
		t.Fatalf("unexpected tcping ip: %#v", result)
	}
	if result.ProbeResult.Probe != "tcp" || result.ProbeResult.Target != "example.com:443" {
		t.Fatalf("unexpected tcping probe identity: %#v", result.ProbeResult)
	}
	if result.ProbeResult.EffectiveTarget != "93.184.216.34:443" || result.ProbeResult.ResolveIP != "93.184.216.34" {
		t.Fatalf("unexpected tcping probe target mapping: %#v", result.ProbeResult)
	}
}

func TestProcessorTCPingUsesDefaultPort(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(context.Context, string, string, string) ([]string, time.Duration, error) {
		return []string{"93.184.216.34"}, 0, nil
	}
	processor.tcping = func(_ context.Context, request probeapi.TCPingRequest) (*probeapi.Result, error) {
		if request.Target != "93.184.216.34:80" {
			t.Fatalf("unexpected tcping target: %q", request.Target)
		}
		return &probeapi.Result{Probe: "tcp", Success: true, DurationSeconds: 0.03, TimeoutSeconds: 5}, nil
	}

	result := processor.Handle(context.Background(), Task{TaskID: "task-1", Type: "tcping", URL: "example.com"})
	if result.Error != "" || result.ProbeResult == nil || result.ProbeResult.Target != "example.com:80" {
		t.Fatalf("unexpected tcping default port result: %#v", result)
	}
}

func TestProcessorTCPingRejectsInvalidPort(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(context.Context, string, string, string) ([]string, time.Duration, error) {
		t.Fatal("resolver should not run when tcping port is invalid")
		return nil, 0, nil
	}

	result := processor.Handle(context.Background(), Task{TaskID: "task-1", Type: "tcping", URL: "example.com", Port: 70000})
	if result.ProbeResult != nil || result.Error != "invalid tcping port: 70000" {
		t.Fatalf("unexpected invalid port result: %#v", result)
	}
}

func TestProcessorTCPingIPv6Target(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(_ context.Context, _ string, _ string, protocol string) ([]string, time.Duration, error) {
		if protocol != "ip6" {
			t.Fatalf("unexpected protocol: %q", protocol)
		}
		return []string{"2001:4860:4860::8888"}, 0, nil
	}
	processor.tcping = func(_ context.Context, request probeapi.TCPingRequest) (*probeapi.Result, error) {
		if request.Target != "[2001:4860:4860::8888]:443" || request.PreferredIPProtocol != "ip6" {
			t.Fatalf("unexpected tcping v6 request: %#v", request)
		}
		return &probeapi.Result{Probe: "tcp", Success: true, DurationSeconds: 0.03, TimeoutSeconds: 5}, nil
	}

	result := processor.Handle(context.Background(), Task{TaskID: "task-1", Type: "tcping_v6", URL: "2001:4860:4860::8888", Port: 443})
	if result.Error != "" || result.ProbeResult == nil || result.ProbeResult.Target != "[2001:4860:4860::8888]:443" {
		t.Fatalf("unexpected tcping v6 result: %#v", result)
	}
}

func TestProcessorMapsHTTPResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(_ context.Context, target string, dns string, protocol string) ([]string, time.Duration, error) {
		if target != "example.com" || dns != "8.8.8.8" || protocol != "ip4" {
			t.Fatalf("unexpected resolver input: target=%q dns=%q protocol=%q", target, dns, protocol)
		}
		return []string{"93.184.216.34"}, 15 * time.Millisecond, nil
	}
	processor.http = func(_ context.Context, request probeapi.HTTPRequest) (*probeapi.Result, error) {
		if request.Target != "https://example.com:8443/path?a=1" || request.ResolveIP != "93.184.216.34" {
			t.Fatalf("unexpected http target: %#v", request)
		}
		if request.Method != "POST" || request.Headers["User-Agent"] != "okping" {
			t.Fatalf("unexpected http options: %#v", request)
		}
		return &probeapi.Result{
			Probe:           "http",
			Target:          request.Target,
			EffectiveTarget: "https://93.184.216.34:8443/path?a=1",
			ResolveIP:       request.ResolveIP,
			Success:         true,
			DurationSeconds: 0.2,
			TimeoutSeconds:  5,
			Metrics:         json.RawMessage(`[{"name":"probe_http_status_code","value":200}]`),
		}, nil
	}

	result := processor.Handle(context.Background(), Task{
		Agreement:    "https:",
		Body:         `{"method":"POST","headers":[{"key":"User-Agent","value":"okping"}]}`,
		DNS:          "8.8.8.8",
		PathOrParams: "/path?a=1",
		Port:         8443,
		TaskID:       "task-1",
		Type:         "http",
		URL:          "example.com",
	})
	if result.Error != "" || result.ProbeResult == nil || !result.ProbeResult.Success {
		t.Fatalf("unexpected http result: %#v", result)
	}
	if result.IP != "93.184.216.34" || result.ResolvedIPs[0] != "93.184.216.34" {
		t.Fatalf("unexpected http ip mapping: %#v", result)
	}
	if result.DNSDurationSeconds != 0.015 {
		t.Fatalf("unexpected http dns duration: %#v", result)
	}
}

func TestProcessorMapsDNSResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.dns = func(_ context.Context, request probeapi.DNSRequest) (*probeapi.Result, error) {
		if request.Server != "8.8.8.8:53" || request.QueryName != "www.qq.com" || request.QueryType != "A" {
			t.Fatalf("unexpected dns request: %#v", request)
		}
		return &probeapi.Result{
			Probe:           "dns",
			Success:         true,
			DurationSeconds: 0.025,
			TimeoutSeconds:  5,
			DNSResponse: &prober.DNSResponseInfo{
				Rcode:   "NOERROR",
				Answers: []string{"www.qq.com. 60 IN A 1.1.1.1"},
				IPs:     []string{"1.1.1.1", "1.1.1.1"},
			},
		}, nil
	}

	result := processor.Handle(context.Background(), Task{
		Body:   `{"queryType":"A"}`,
		DNS:    "8.8.8.8",
		TaskID: "task-1",
		Type:   "dns",
		URL:    "www.qq.com",
	})
	if result.Error != "" || result.ProbeResult == nil || !result.ProbeResult.Success {
		t.Fatalf("unexpected dns result: %#v", result)
	}
	if result.IP != "1.1.1.1" || len(result.ResolvedIPs) != 1 || result.DNSDurationSeconds != 0.025 {
		t.Fatalf("unexpected dns result mapping: %#v", result)
	}
	if result.ProbeResult.Target != "www.qq.com" || result.ProbeResult.EffectiveTarget != "8.8.8.8:53" {
		t.Fatalf("unexpected dns targets: %#v", result.ProbeResult)
	}
}

func TestProcessorMapsDNSPTRTarget(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.dns = func(_ context.Context, request probeapi.DNSRequest) (*probeapi.Result, error) {
		if request.QueryName != "8.8.8.8.in-addr.arpa." || request.QueryType != "PTR" {
			t.Fatalf("unexpected PTR request: %#v", request)
		}
		return &probeapi.Result{Probe: "dns", Success: true}, nil
	}

	result := processor.Handle(context.Background(), Task{
		Body: `{"queryType":"PTR"}`,
		Type: "dns",
		URL:  "8.8.8.8",
	})
	if result.Error != "" || result.ProbeResult == nil {
		t.Fatalf("unexpected PTR result: %#v", result)
	}
}

func TestProcessorRejectsUnsupportedDNSQueryType(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.dns = func(context.Context, probeapi.DNSRequest) (*probeapi.Result, error) {
		t.Fatal("dns probe should not run for an unsupported record type")
		return nil, nil
	}

	result := processor.Handle(context.Background(), Task{Body: `{"queryType":"CAA"}`, Type: "dns", URL: "example.com"})
	if result.ProbeResult != nil || result.Error != "unsupported dns query type: CAA" {
		t.Fatalf("unexpected unsupported dns type result: %#v", result)
	}
}

func TestProcessorMapsTracerouteResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(_ context.Context, target string, dns string, protocol string) ([]string, time.Duration, error) {
		if target != "example.com" || dns != "8.8.8.8" || protocol != "ip4" {
			t.Fatalf("unexpected traceroute resolution: target=%q dns=%q protocol=%q", target, dns, protocol)
		}
		return []string{"1.1.1.1"}, 15 * time.Millisecond, nil
	}
	processor.trace = func(_ context.Context, target string) (*TracerouteResult, error) {
		if target != "1.1.1.1" {
			t.Fatalf("unexpected traceroute target: %q", target)
		}
		duration := 12.5
		return &TracerouteResult{
			MaxHops:      tracerouteMaxHops,
			ProbesPerHop: tracerouteProbesPerHop,
			Reached:      true,
			Hops: []TracerouteHop{{
				Hop: 1,
				Probes: []TracerouteProbe{{
					IP:                   "1.1.1.1",
					DurationMilliseconds: &duration,
				}},
			}},
		}, nil
	}

	result := processor.Handle(context.Background(), Task{
		TaskID: "task-1",
		Type:   "traceroute",
		URL:    "example.com",
		DNS:    "8.8.8.8",
	})
	if result.Error != "" || result.TraceResult == nil {
		t.Fatalf("unexpected traceroute result: %#v", result)
	}
	if result.IP != "1.1.1.1" || result.DNSDurationSeconds != 0.015 {
		t.Fatalf("unexpected traceroute address mapping: %#v", result)
	}
	if result.TraceResult.Target != "example.com" || result.TraceResult.TargetIP != "1.1.1.1" || !result.TraceResult.Reached {
		t.Fatalf("unexpected traceroute identity mapping: %#v", result.TraceResult)
	}
}

func TestProcessorStreamsTenTracerouteRoundsBeforeFinalResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(context.Context, string, string, string) ([]string, time.Duration, error) {
		return []string{"1.1.1.1"}, 10 * time.Millisecond, nil
	}
	processor.traceStream = func(_ context.Context, target string, emit tracerouteResultEmitter) (*TracerouteResult, error) {
		if target != "1.1.1.1" {
			t.Fatalf("unexpected traceroute target: %s", target)
		}
		for sequence := 1; sequence <= tracerouteProbesPerHop; sequence++ {
			emit(&TracerouteResult{
				TargetIP:     target,
				MaxHops:      tracerouteMaxHops,
				ProbesPerHop: tracerouteProbesPerHop,
				Hops:         []TracerouteHop{{Hop: 1, Probes: make([]TracerouteProbe, sequence)}},
			})
		}
		return &TracerouteResult{
			TargetIP:     target,
			MaxHops:      tracerouteMaxHops,
			ProbesPerHop: tracerouteProbesPerHop,
			Reached:      true,
			Hops:         []TracerouteHop{{Hop: 1, Probes: make([]TracerouteProbe, tracerouteProbesPerHop)}},
		}, nil
	}

	updates := make([]ResultMessage, 0, tracerouteProbesPerHop)
	result, err := processor.HandleTracerouteStream(context.Background(), Task{
		TaskID: "task-1",
		Type:   "traceroute",
		URL:    "example.com",
	}, func(update ResultMessage) error {
		updates = append(updates, update)
		return nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(updates) != tracerouteProbesPerHop {
		t.Fatalf("incremental result count = %d, want %d", len(updates), tracerouteProbesPerHop)
	}
	for index, update := range updates {
		if update.Sequence != index+1 || update.TotalRuns != tracerouteProbesPerHop+1 || update.FinalResult || update.TraceResult == nil {
			t.Fatalf("unexpected incremental result %d: %#v", index, update)
		}
		if update.TraceResult.Target != "example.com" || len(update.TraceResult.Hops) != 1 || len(update.TraceResult.Hops[0].Probes) != index+1 {
			t.Fatalf("unexpected incremental traceroute payload %d: %#v", index, update.TraceResult)
		}
	}
	if result.Sequence != tracerouteProbesPerHop+1 || result.TotalRuns != tracerouteProbesPerHop+1 || !result.FinalResult || result.TraceResult == nil {
		t.Fatalf("unexpected final traceroute result: %#v", result)
	}
}

func TestProcessorRejectsIPv6TracerouteTarget(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.trace = func(context.Context, string) (*TracerouteResult, error) {
		t.Fatal("traceroute probe should not run for an IPv6 target")
		return nil, nil
	}

	result := processor.Handle(context.Background(), Task{Type: "traceroute", URL: "2001:db8::1"})
	if result.TraceResult != nil || result.Error != "target has no IPv4 address" {
		t.Fatalf("unexpected IPv6 traceroute result: %#v", result)
	}
}

func TestProcessorMapsIPv6TracerouteResult(t *testing.T) {
	processor := NewProcessor("node-uuid")
	processor.resolve = func(_ context.Context, target string, dns string, protocol string) ([]string, time.Duration, error) {
		if target != "example.com" || dns != "2001:4860:4860::8888" || protocol != "ip6" {
			t.Fatalf("unexpected IPv6 traceroute resolution: target=%q dns=%q protocol=%q", target, dns, protocol)
		}
		return []string{"2001:db8::10"}, 12 * time.Millisecond, nil
	}
	processor.trace = func(_ context.Context, target string) (*TracerouteResult, error) {
		if target != "2001:db8::10" {
			t.Fatalf("unexpected IPv6 traceroute target: %q", target)
		}
		return &TracerouteResult{Reached: true}, nil
	}

	result := processor.Handle(context.Background(), Task{
		Type: "traceroute_v6",
		URL:  "example.com",
		DNS:  "2001:4860:4860::8888",
	})
	if result.Error != "" || result.TraceResult == nil || result.IP != "2001:db8::10" {
		t.Fatalf("unexpected IPv6 traceroute result: %#v", result)
	}
}

func TestProcessorRejectsUnsupportedTask(t *testing.T) {
	result := NewProcessor("node-uuid").Handle(context.Background(), Task{Type: "whois", TaskID: "task-1"})
	if result.ProbeResult != nil || result.Error != "unsupported task type: whois" {
		t.Fatalf("unexpected unsupported result: %#v", result)
	}
}

func TestPingHostAcceptsURLAndHostPort(t *testing.T) {
	tests := map[string]string{
		"https://www.ping.cn/path": "www.ping.cn",
		"example.com:443":             "example.com",
		"8.8.8.8":                     "8.8.8.8",
	}
	for input, expected := range tests {
		actual, err := pingHost(input)
		if err != nil {
			t.Fatalf("pingHost(%q): %v", input, err)
		}
		if actual != expected {
			t.Fatalf("pingHost(%q) = %q, want %q", input, actual, expected)
		}
	}
}
