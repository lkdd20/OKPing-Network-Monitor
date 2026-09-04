package pingagent

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRegistrationClientRegister(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		if request.Method != http.MethodPost || request.URL.Path != "/ping/agent/register" {
			t.Fatalf("unexpected request: %s %s", request.Method, request.URL.Path)
		}
		var body RegisterRequest
		if err := json.NewDecoder(request.Body).Decode(&body); err != nil {
			t.Fatal(err)
		}
		if body.UUID != "node-uuid" || len(body.Capabilities) != 1 || body.Capabilities[0] != "ping" {
			t.Fatalf("unexpected registration body: %#v", body)
		}
		response.Header().Set("Content-Type", "application/json")
		_, _ = response.Write([]byte(`{"code":200,"msg":"success","data":{"enabled":false,"heartbeatIntervalSeconds":600}}`))
	}))
	defer server.Close()

	client, err := NewRegistrationClient(server.URL, server.Client())
	if err != nil {
		t.Fatal(err)
	}
	registration, err := client.Register(context.Background(), RegisterRequest{
		UUID:         "node-uuid",
		Capabilities: []string{"ping"},
	})
	if err != nil {
		t.Fatal(err)
	}
	if registration.Enabled || registration.HeartbeatIntervalSeconds != 600 {
		t.Fatalf("unexpected registration response: %#v", registration)
	}
}

func TestRegistrationClientRejectsUnknownNode(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, _ *http.Request) {
		_, _ = response.Write([]byte(`{"code":500,"msg":"节点不存在","data":null}`))
	}))
	defer server.Close()

	client, err := NewRegistrationClient(server.URL, server.Client())
	if err != nil {
		t.Fatal(err)
	}
	if _, err := client.Register(context.Background(), RegisterRequest{UUID: "missing"}); err == nil || err.Error() != "节点不存在" {
		t.Fatalf("expected node rejection, got %v", err)
	}
}
