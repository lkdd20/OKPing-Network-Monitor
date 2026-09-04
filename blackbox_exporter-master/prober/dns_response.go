package prober

import (
	"context"

	"github.com/miekg/dns"
)

type dnsResponseCollectorKey struct{}

// DNSResponseInfo is a snapshot of the DNS response returned by one probe.
type DNSResponseInfo struct {
	Rcode      string   `json:"rcode"`
	Answers    []string `json:"answers"`
	Authority  []string `json:"authority"`
	Additional []string `json:"additional"`
	IPs        []string `json:"ips"`
}

// WithDNSResponseCollector attaches a callback used to collect the complete DNS
// response record sets for manual debugging output.
func WithDNSResponseCollector(ctx context.Context, collector func(DNSResponseInfo)) context.Context {
	return context.WithValue(ctx, dnsResponseCollectorKey{}, collector)
}

func recordDNSResponse(ctx context.Context, response *dns.Msg) {
	if response == nil {
		return
	}

	collector, ok := ctx.Value(dnsResponseCollectorKey{}).(func(DNSResponseInfo))
	if !ok || collector == nil {
		return
	}

	collector(DNSResponseInfo{
		Rcode:      dns.RcodeToString[response.Rcode],
		Answers:    rrStrings(response.Answer),
		Authority:  rrStrings(response.Ns),
		Additional: rrStrings(response.Extra),
		IPs:        answerIPs(response.Answer),
	})
}

func rrStrings(rrs []dns.RR) []string {
	result := make([]string, 0, len(rrs))
	for _, rr := range rrs {
		result = append(result, rr.String())
	}
	return result
}

func answerIPs(rrs []dns.RR) []string {
	result := make([]string, 0, len(rrs))
	for _, rr := range rrs {
		switch typed := rr.(type) {
		case *dns.A:
			result = append(result, typed.A.String())
		case *dns.AAAA:
			result = append(result, typed.AAAA.String())
		}
	}
	return result
}
