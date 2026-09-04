package pingagent

import (
	"context"
	"errors"
	"net"
	"strings"
	"testing"
	"time"

	"golang.org/x/net/icmp"
	"golang.org/x/net/ipv4"
	"golang.org/x/net/ipv6"
)

func TestMatchTracerouteTimeExceededResponse(t *testing.T) {
	const identifier = 1200
	const sequence = 4
	echoPayload, err := (&icmp.Message{
		Type: ipv4.ICMPTypeEcho,
		Body: &icmp.Echo{ID: identifier, Seq: sequence, Data: []byte("ping")},
	}).Marshal(nil)
	if err != nil {
		t.Fatal(err)
	}
	headerPayload, err := (&ipv4.Header{
		Version:  4,
		Len:      20,
		TotalLen: 20 + len(echoPayload),
		TTL:      1,
		Protocol: 1,
		Src:      net.ParseIP("192.0.2.10").To4(),
		Dst:      net.ParseIP("198.51.100.20").To4(),
	}).Marshal()
	if err != nil {
		t.Fatal(err)
	}
	response := &icmp.Message{
		Type: ipv4.ICMPTypeTimeExceeded,
		Body: &icmp.TimeExceeded{Data: append(headerPayload, echoPayload...)},
	}

	matched, reached := matchTracerouteResponse(response, tracerouteProtocol(), identifier, sequence)
	if !matched || reached {
		t.Fatalf("unexpected time-exceeded match: matched=%t reached=%t", matched, reached)
	}
}

func TestMatchTracerouteIPv6TimeExceededResponse(t *testing.T) {
	const identifier = 1201
	const sequence = 5
	echoPayload, err := (&icmp.Message{
		Type: ipv6.ICMPTypeEchoRequest,
		Body: &icmp.Echo{ID: identifier, Seq: sequence, Data: []byte("ping")},
	}).Marshal(nil)
	if err != nil {
		t.Fatal(err)
	}
	headerPayload := make([]byte, 40)
	headerPayload[0] = 0x60
	headerPayload[6] = 58
	response := &icmp.Message{
		Type: ipv6.ICMPTypeTimeExceeded,
		Body: &icmp.TimeExceeded{Data: append(headerPayload, echoPayload...)},
	}

	matched, reached := matchTracerouteResponse(response, tracerouteIPv6Protocol(), identifier, sequence)
	if !matched || reached {
		t.Fatalf("unexpected IPv6 time-exceeded match: matched=%t reached=%t", matched, reached)
	}
}

func TestTracerouteProtocolForIPv6(t *testing.T) {
	protocol := tracerouteProtocolForIP(net.ParseIP("2001:db8::1"))
	if protocol.network != "ip6:ipv6-icmp" || protocol.listenAddress != "::" || protocol.protocol != 58 {
		t.Fatalf("unexpected IPv6 traceroute protocol: %#v", protocol)
	}
}

func TestRunTracerouteExecutesDifferentHopsConcurrently(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	started := make(chan int, tracerouteMaxHops)
	release := make(chan struct{})
	released := false
	defer func() {
		if !released {
			close(release)
		}
	}()

	probe := func(
		ctx context.Context,
		_ icmpTraceProtocol,
		_ *net.IPAddr,
		_ net.IP,
		hop int,
		sequence int,
	) (TracerouteProbe, bool, error) {
		if sequence == 1 {
			started <- hop
			select {
			case <-ctx.Done():
				return TracerouteProbe{}, false, ctx.Err()
			case <-release:
			}
		}
		if hop > 5 {
			return TracerouteProbe{}, false, errors.New("ignored error after target")
		}
		return TracerouteProbe{Timeout: true}, hop == 5, nil
	}

	type traceResponse struct {
		result *TracerouteResult
		err    error
	}
	response := make(chan traceResponse, 1)
	go func() {
		result, err := runTracerouteIPv4StreamAtInterval(
			ctx,
			net.ParseIP("198.51.100.20").To4(),
			probe,
			nil,
			0,
		)
		response <- traceResponse{result: result, err: err}
	}()

	seen := make(map[int]struct{}, tracerouteMaxHops)
	for len(seen) < tracerouteMaxHops {
		select {
		case hop := <-started:
			seen[hop] = struct{}{}
		case <-ctx.Done():
			t.Fatalf("only %d hop workers started before timeout", len(seen))
		}
	}
	close(release)
	released = true

	trace := <-response
	if trace.err != nil {
		t.Fatal(trace.err)
	}
	if !trace.result.Reached || len(trace.result.Hops) != 5 {
		t.Fatalf("unexpected concurrent traceroute result: %#v", trace.result)
	}
	for index, hop := range trace.result.Hops {
		if hop.Hop != index+1 || len(hop.Probes) != tracerouteProbesPerHop {
			t.Fatalf("unexpected sorted hop at index %d: %#v", index, hop)
		}
	}
}

func TestRunTracerouteRunsTenProbesAtConfiguredInterval(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	const interval = 25 * time.Millisecond
	started := make(chan time.Time, tracerouteProbesPerHop)

	probe := func(
		_ context.Context,
		_ icmpTraceProtocol,
		_ *net.IPAddr,
		_ net.IP,
		hop int,
		_ int,
	) (TracerouteProbe, bool, error) {
		if hop == 1 {
			started <- time.Now()
		}
		return TracerouteProbe{Timeout: true}, hop == 2, nil
	}

	result, err := runTracerouteIPv4StreamAtInterval(
		ctx,
		net.ParseIP("198.51.100.20").To4(),
		probe,
		nil,
		interval,
	)
	if err != nil {
		t.Fatal(err)
	}
	if !result.Reached || len(result.Hops) != 2 || len(result.Hops[0].Probes) != tracerouteProbesPerHop {
		t.Fatalf("unexpected paced traceroute result: %#v", result)
	}
	times := make([]time.Time, 0, tracerouteProbesPerHop)
	for range tracerouteProbesPerHop {
		times = append(times, <-started)
	}
	for index := 1; index < len(times); index++ {
		if elapsed := times[index].Sub(times[index-1]); elapsed < interval-5*time.Millisecond {
			t.Fatalf("probe round %d started after %s, want approximately %s", index+1, elapsed, interval)
		}
	}
}

func TestRunTracerouteStreamsEveryRoundBeforeFinalResult(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	probe := func(
		_ context.Context,
		_ icmpTraceProtocol,
		_ *net.IPAddr,
		_ net.IP,
		hop int,
		_ int,
	) (TracerouteProbe, bool, error) {
		return TracerouteProbe{Timeout: true}, hop == 3, nil
	}

	incremental := make(chan *TracerouteResult, tracerouteProbesPerHop)
	type traceResponse struct {
		result *TracerouteResult
		err    error
	}
	response := make(chan traceResponse, 1)
	go func() {
		result, err := runTracerouteIPv4StreamAtInterval(
			ctx,
			net.ParseIP("198.51.100.20").To4(),
			probe,
			func(update *TracerouteResult) { incremental <- update },
			20*time.Millisecond,
		)
		response <- traceResponse{result: result, err: err}
	}()

	select {
	case update := <-incremental:
		if len(update.Hops) != 3 || len(update.Hops[0].Probes) != 1 {
			t.Fatalf("unexpected first incremental result: %#v", update)
		}
	case <-response:
		t.Fatal("traceroute returned before streaming its first completed round")
	case <-ctx.Done():
		t.Fatal("traceroute did not stream the first round before timeout")
	}

	trace := <-response
	if trace.err != nil {
		t.Fatal(trace.err)
	}
	if !trace.result.Reached || len(trace.result.Hops) != 3 {
		t.Fatalf("unexpected final streamed traceroute result: %#v", trace.result)
	}
	if len(trace.result.Hops[0].Probes) != tracerouteProbesPerHop || len(incremental) != tracerouteProbesPerHop-1 {
		t.Fatalf("unexpected streamed round count: final=%d remaining=%d", len(trace.result.Hops[0].Probes), len(incremental))
	}
}

func TestRunTracerouteLoopback(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	result, err := runTraceroute(ctx, "127.0.0.1")
	if err != nil {
		message := strings.ToLower(err.Error())
		if strings.Contains(message, "operation not permitted") || strings.Contains(message, "permission denied") {
			t.Skipf("raw ICMP is unavailable: %v", err)
		}
		t.Fatal(err)
	}
	if !result.Reached || len(result.Hops) != 1 {
		t.Fatalf("unexpected loopback trace: %#v", result)
	}
}

func TestRunTracerouteIPv6Loopback(t *testing.T) {
	ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	result, err := runTraceroute(ctx, "::1")
	if err != nil {
		message := strings.ToLower(err.Error())
		if strings.Contains(message, "operation not permitted") || strings.Contains(message, "permission denied") {
			t.Skipf("raw ICMPv6 is unavailable: %v", err)
		}
		t.Fatal(err)
	}
	if !result.Reached || len(result.Hops) != 1 {
		t.Fatalf("unexpected IPv6 loopback trace: %#v", result)
	}
}
