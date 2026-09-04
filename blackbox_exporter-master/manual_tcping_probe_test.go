package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/prometheus/blackbox_exporter/probeapi"
)

func TestCallTCPing(t *testing.T) {
	result, err := probeapi.RunTCPing(context.Background(), probeapi.TCPingRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds: 5,
		},
		Target: "www.qq.com:80",
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
