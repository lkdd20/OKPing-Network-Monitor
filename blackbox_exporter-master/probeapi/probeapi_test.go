package probeapi

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestRunHTTPCollectsRedirectResponseHeaders(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(response http.ResponseWriter, request *http.Request) {
		switch request.URL.Path {
		case "/start":
			response.Header().Set("Location", "/final")
			response.Header().Add("X-Redirect-Header", "first")
			response.WriteHeader(http.StatusMovedPermanently)
		case "/final":
			response.Header().Add("X-Final-Header", "second")
			response.WriteHeader(http.StatusOK)
		default:
			http.NotFound(response, request)
		}
	}))
	defer server.Close()

	result, err := RunHTTP(context.Background(), HTTPRequest{Target: server.URL + "/start"})
	if err != nil {
		t.Fatalf("RunHTTP returned an error: %v", err)
	}
	if !result.Success {
		t.Fatal("expected redirected request to succeed")
	}
	if len(result.ResponseHeaders) != 2 {
		t.Fatalf("expected redirect and final response headers, got %#v", result.ResponseHeaders)
	}

	redirect := result.ResponseHeaders[0]
	if redirect.StatusCode != http.StatusMovedPermanently || redirect.Protocol == "" {
		t.Fatalf("unexpected redirect response: %#v", redirect)
	}
	if len(redirect.Headers["Location"]) != 1 || redirect.Headers["Location"][0] != "/final" ||
		len(redirect.Headers["X-Redirect-Header"]) != 1 || redirect.Headers["X-Redirect-Header"][0] != "first" {
		t.Fatalf("redirect headers were not preserved: %#v", redirect.Headers)
	}

	final := result.ResponseHeaders[1]
	if final.StatusCode != http.StatusOK || final.Protocol == "" {
		t.Fatalf("unexpected final response: %#v", final)
	}
	if len(final.Headers["X-Final-Header"]) != 1 || final.Headers["X-Final-Header"][0] != "second" {
		t.Fatalf("final response headers were not preserved: %#v", final.Headers)
	}
}
