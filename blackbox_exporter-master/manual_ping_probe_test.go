package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/prometheus/blackbox_exporter/probeapi"
)

func TestCallPing(t *testing.T) {
	result, err := probeapi.RunPing(context.Background(), probeapi.PingRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds: 5,
		},
		Target: "www.qq.com",
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
