package main

import (
	"context"
	"fmt"
	"testing"

	"github.com/prometheus/blackbox_exporter/probeapi"
)

func TestCallHTTP2xx(t *testing.T) {
	followRedirects := true
	result, err := probeapi.RunHTTP(context.Background(), probeapi.HTTPRequest{
		CommonOptions: probeapi.CommonOptions{
			TimeoutSeconds: 5,
		},
		Target:          "https://www.baidu.com",
		Method:          "GET",
		Referer:         "https://www.baidu.com",
		UserAgent:       "Mozilla/5.0 probeapi",
		FollowRedirects: &followRedirects,
		MaxRedirects:    10,
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
