package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/prometheus/blackbox_exporter/probeapi"
)

func TestCallDNS(t *testing.T) {
	result, err := probeapi.RunDNS(context.Background(), probeapi.DNSRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds: 5,
		},
		Server:    "223.5.5.5:53",
		QueryName: "www.qq.com",
		QueryType: "A",
		ValidRcodes: []string{
			"NOERROR",
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	resultData, err := result.PrettyJSON()
	if err != nil {
		t.Fatal(err)
	}

	fmt.Println(string(resultData))
}
