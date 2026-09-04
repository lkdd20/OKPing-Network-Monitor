package pingagent

import (
	"context"
	"crypto/rand"
	"encoding/binary"
	"errors"
	"fmt"
	"net"
	"os"
	"time"

	"golang.org/x/net/icmp"
	"golang.org/x/net/ipv4"
	"golang.org/x/net/ipv6"
)

const (
	tracerouteMaxHops       = 30
	tracerouteProbesPerHop  = 10
	tracerouteProbeTimeout  = 800 * time.Millisecond
	tracerouteProbeInterval = time.Second
)

type icmpTraceProtocol struct {
	network            string
	listenAddress      string
	protocol           int
	echoRequestType    icmp.Type
	echoReplyType      icmp.Type
	timeExceededType   icmp.Type
	destinationType    icmp.Type
	setHopLimit        func(*icmp.PacketConn, int) error
	embeddedHeaderSize func([]byte) (int, error)
}

type tracerouteHopProbe func(
	context.Context,
	icmpTraceProtocol,
	*net.IPAddr,
	net.IP,
	int,
	int,
) (TracerouteProbe, bool, error)

type tracerouteProbeOutcome struct {
	hop     int
	probe   TracerouteProbe
	reached bool
	err     error
}

type tracerouteResultEmitter func(*TracerouteResult)

func runTraceroute(ctx context.Context, target string) (*TracerouteResult, error) {
	return runTracerouteStream(ctx, target, nil)
}

func runTracerouteStream(ctx context.Context, target string, emit tracerouteResultEmitter) (*TracerouteResult, error) {
	targetIP := net.ParseIP(target)
	if targetIP == nil {
		return nil, fmt.Errorf("invalid traceroute target IP: %s", target)
	}
	if ipv4Target := targetIP.To4(); ipv4Target != nil {
		targetIP = ipv4Target
	} else {
		targetIP = targetIP.To16()
	}
	protocol := tracerouteProtocolForIP(targetIP)
	permissionCheck, err := icmp.ListenPacket(protocol.network, protocol.listenAddress)
	if err != nil {
		return nil, fmt.Errorf("open traceroute ICMP socket: %w", err)
	}
	if err := permissionCheck.Close(); err != nil {
		return nil, fmt.Errorf("close traceroute ICMP permission-check socket: %w", err)
	}
	return runTracerouteIPStreamAtInterval(ctx, targetIP, protocol, traceProbe, emit, tracerouteProbeInterval)
}

func runTracerouteIPv4(ctx context.Context, targetIP net.IP, probe tracerouteHopProbe) (*TracerouteResult, error) {
	return runTracerouteIPv4StreamAtInterval(ctx, targetIP, probe, nil, tracerouteProbeInterval)
}

func runTracerouteIPv4Stream(
	ctx context.Context,
	targetIP net.IP,
	probe tracerouteHopProbe,
	emit tracerouteResultEmitter,
) (*TracerouteResult, error) {
	return runTracerouteIPStreamAtInterval(ctx, targetIP, tracerouteProtocol(), probe, emit, tracerouteProbeInterval)
}

func runTracerouteIPv4StreamAtInterval(
	ctx context.Context,
	targetIP net.IP,
	probe tracerouteHopProbe,
	emit tracerouteResultEmitter,
	interval time.Duration,
) (*TracerouteResult, error) {
	return runTracerouteIPStreamAtInterval(ctx, targetIP, tracerouteProtocol(), probe, emit, interval)
}

func runTracerouteIPStreamAtInterval(
	ctx context.Context,
	targetIP net.IP,
	protocol icmpTraceProtocol,
	probe tracerouteHopProbe,
	emit tracerouteResultEmitter,
	interval time.Duration,
) (*TracerouteResult, error) {
	startedAt := time.Now()
	destination := &net.IPAddr{IP: targetIP}
	hops := make([]TracerouteHop, tracerouteMaxHops)
	for index := range hops {
		hops[index] = TracerouteHop{Hop: index + 1, Probes: make([]TracerouteProbe, 0, tracerouteProbesPerHop)}
	}
	hopErrors := make([]error, tracerouteMaxHops)
	firstReachedHop := tracerouteMaxHops + 1

	for sequence := 1; sequence <= tracerouteProbesPerHop; sequence++ {
		if err := ctx.Err(); err != nil {
			return tracerouteSnapshot(targetIP, startedAt, hops, firstReachedHop), err
		}
		roundStartedAt := time.Now()
		outcomes := make(chan tracerouteProbeOutcome, tracerouteMaxHops)
		for hop := 1; hop <= tracerouteMaxHops; hop++ {
			go func(hop int) {
				probeResult, reached, err := probe(ctx, protocol, destination, targetIP, hop, sequence)
				outcomes <- tracerouteProbeOutcome{hop: hop, probe: probeResult, reached: reached, err: err}
			}(hop)
		}

		for range tracerouteMaxHops {
			outcome := <-outcomes
			if outcome.err != nil {
				outcome.probe.Timeout = true
				if hopErrors[outcome.hop-1] == nil {
					hopErrors[outcome.hop-1] = outcome.err
				}
			}
			hops[outcome.hop-1].Probes = append(hops[outcome.hop-1].Probes, outcome.probe)
			if outcome.reached && outcome.hop < firstReachedHop {
				firstReachedHop = outcome.hop
			}
		}
		if emit != nil {
			emit(tracerouteSnapshot(targetIP, startedAt, hops, firstReachedHop))
		}
		if sequence < tracerouteProbesPerHop && !waitForTracerouteRound(ctx, roundStartedAt, interval) {
			return tracerouteSnapshot(targetIP, startedAt, hops, firstReachedHop), ctx.Err()
		}
	}

	result := tracerouteSnapshot(targetIP, startedAt, hops, firstReachedHop)
	lastHop := len(result.Hops)
	var firstError error
	for index := 0; index < lastHop; index++ {
		if firstError == nil && hopErrors[index] != nil {
			firstError = hopErrors[index]
		}
	}
	return result, firstError
}

func tracerouteSnapshot(
	targetIP net.IP,
	startedAt time.Time,
	hops []TracerouteHop,
	firstReachedHop int,
) *TracerouteResult {
	lastHop := tracerouteMaxHops
	reached := firstReachedHop <= tracerouteMaxHops
	if reached {
		lastHop = firstReachedHop
	}
	snapshot := make([]TracerouteHop, lastHop)
	for index := 0; index < lastHop; index++ {
		snapshot[index] = TracerouteHop{
			Hop:    hops[index].Hop,
			Probes: append([]TracerouteProbe(nil), hops[index].Probes...),
		}
	}
	return &TracerouteResult{
		TargetIP:             targetIP.String(),
		MaxHops:              tracerouteMaxHops,
		ProbesPerHop:         tracerouteProbesPerHop,
		Reached:              reached,
		DurationMilliseconds: millisecondsSince(startedAt),
		Hops:                 snapshot,
	}
}

func waitForTracerouteRound(ctx context.Context, startedAt time.Time, interval time.Duration) bool {
	delay := interval - time.Since(startedAt)
	if delay <= 0 {
		return true
	}
	timer := time.NewTimer(delay)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}

func traceProbe(
	ctx context.Context,
	protocol icmpTraceProtocol,
	destination *net.IPAddr,
	targetIP net.IP,
	hop int,
	sequence int,
) (TracerouteProbe, bool, error) {
	connection, err := icmp.ListenPacket(protocol.network, protocol.listenAddress)
	if err != nil {
		return TracerouteProbe{}, false, fmt.Errorf("open traceroute hop %d probe %d ICMP socket: %w", hop, sequence, err)
	}
	defer connection.Close()
	if err := protocol.setHopLimit(connection, hop); err != nil {
		return TracerouteProbe{}, false, fmt.Errorf("set traceroute hop limit %d probe %d: %w", hop, sequence, err)
	}
	return traceOneHop(ctx, connection, protocol, destination, targetIP, tracerouteIdentifier(), sequence)
}

func traceOneHop(
	ctx context.Context,
	connection *icmp.PacketConn,
	protocol icmpTraceProtocol,
	destination *net.IPAddr,
	targetIP net.IP,
	identifier int,
	sequence int,
) (TracerouteProbe, bool, error) {
	message := icmp.Message{
		Type: protocol.echoRequestType,
		Code: 0,
		Body: &icmp.Echo{ID: identifier, Seq: sequence, Data: []byte("ping-traceroute")},
	}
	payload, err := message.Marshal(nil)
	if err != nil {
		return TracerouteProbe{}, false, fmt.Errorf("encode traceroute probe: %w", err)
	}

	startedAt := time.Now()
	if _, err := connection.WriteTo(payload, destination); err != nil {
		return TracerouteProbe{}, false, fmt.Errorf("send traceroute probe: %w", err)
	}
	deadline := startedAt.Add(tracerouteProbeTimeout)
	if contextDeadline, ok := ctx.Deadline(); ok && contextDeadline.Before(deadline) {
		deadline = contextDeadline
	}
	if err := connection.SetReadDeadline(deadline); err != nil {
		return TracerouteProbe{}, false, fmt.Errorf("set traceroute read deadline: %w", err)
	}

	buffer := make([]byte, 1500)
	for {
		if err := ctx.Err(); err != nil {
			return TracerouteProbe{}, false, err
		}
		length, peer, err := connection.ReadFrom(buffer)
		if err != nil {
			var networkError net.Error
			if errors.As(err, &networkError) && networkError.Timeout() {
				return TracerouteProbe{Timeout: true}, false, nil
			}
			return TracerouteProbe{}, false, fmt.Errorf("read traceroute response: %w", err)
		}
		response, err := icmp.ParseMessage(protocol.protocol, buffer[:length])
		if err != nil {
			continue
		}
		matched, reached := matchTracerouteResponse(response, protocol, identifier, sequence)
		if !matched {
			continue
		}
		peerIP := addressIP(peer)
		if peerIP == "" {
			continue
		}
		if reached && !net.ParseIP(peerIP).Equal(targetIP) {
			reached = false
		}
		duration := millisecondsSince(startedAt)
		return TracerouteProbe{IP: peerIP, DurationMilliseconds: &duration}, reached, nil
	}
}

func matchTracerouteResponse(message *icmp.Message, protocol icmpTraceProtocol, identifier int, sequence int) (bool, bool) {
	if message.Type == protocol.echoReplyType {
		echo, ok := message.Body.(*icmp.Echo)
		return ok && echo.ID == identifier && echo.Seq == sequence, true
	}

	var data []byte
	switch body := message.Body.(type) {
	case *icmp.TimeExceeded:
		if message.Type != protocol.timeExceededType {
			return false, false
		}
		data = body.Data
	case *icmp.DstUnreach:
		if message.Type != protocol.destinationType {
			return false, false
		}
		data = body.Data
	default:
		return false, false
	}

	headerSize, err := protocol.embeddedHeaderSize(data)
	if err != nil || headerSize >= len(data) {
		return false, false
	}
	embedded, err := icmp.ParseMessage(protocol.protocol, data[headerSize:])
	if err != nil || embedded.Type != protocol.echoRequestType {
		return false, false
	}
	echo, ok := embedded.Body.(*icmp.Echo)
	return ok && echo.ID == identifier && echo.Seq == sequence, message.Type == protocol.destinationType
}

func tracerouteProtocol() icmpTraceProtocol {
	return icmpTraceProtocol{
		network:          "ip4:icmp",
		listenAddress:    "0.0.0.0",
		protocol:         1,
		echoRequestType:  ipv4.ICMPTypeEcho,
		echoReplyType:    ipv4.ICMPTypeEchoReply,
		timeExceededType: ipv4.ICMPTypeTimeExceeded,
		destinationType:  ipv4.ICMPTypeDestinationUnreachable,
		setHopLimit: func(connection *icmp.PacketConn, hop int) error {
			return connection.IPv4PacketConn().SetTTL(hop)
		},
		embeddedHeaderSize: func(data []byte) (int, error) {
			header, err := ipv4.ParseHeader(data)
			if err != nil {
				return 0, err
			}
			return header.Len, nil
		},
	}
}

func tracerouteProtocolForIP(targetIP net.IP) icmpTraceProtocol {
	if targetIP.To4() != nil {
		return tracerouteProtocol()
	}
	return tracerouteIPv6Protocol()
}

func tracerouteIPv6Protocol() icmpTraceProtocol {
	return icmpTraceProtocol{
		network:          "ip6:ipv6-icmp",
		listenAddress:    "::",
		protocol:         58,
		echoRequestType:  ipv6.ICMPTypeEchoRequest,
		echoReplyType:    ipv6.ICMPTypeEchoReply,
		timeExceededType: ipv6.ICMPTypeTimeExceeded,
		destinationType:  ipv6.ICMPTypeDestinationUnreachable,
		setHopLimit: func(connection *icmp.PacketConn, hop int) error {
			packetConnection := connection.IPv6PacketConn()
			if packetConnection == nil {
				return errors.New("traceroute ICMPv6 packet connection is unavailable")
			}
			return packetConnection.SetHopLimit(hop)
		},
		embeddedHeaderSize: func(data []byte) (int, error) {
			const ipv6HeaderSize = 40
			if len(data) < ipv6HeaderSize || data[0]>>4 != 6 {
				return 0, errors.New("invalid embedded IPv6 header")
			}
			return ipv6HeaderSize, nil
		},
	}
}

func tracerouteIdentifier() int {
	buffer := make([]byte, 2)
	if _, err := rand.Read(buffer); err == nil {
		return int(binary.BigEndian.Uint16(buffer))
	}
	return os.Getpid() & 0xffff
}

func addressIP(address net.Addr) string {
	if ipAddress, ok := address.(*net.IPAddr); ok {
		return ipAddress.IP.String()
	}
	host, _, err := net.SplitHostPort(address.String())
	if err == nil {
		return host
	}
	parsed := net.ParseIP(address.String())
	if parsed == nil {
		return ""
	}
	return parsed.String()
}

func millisecondsSince(startedAt time.Time) float64 {
	return float64(time.Since(startedAt).Microseconds()) / 1000
}
