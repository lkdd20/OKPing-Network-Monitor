package prober

import (
	"context"
	"net/http"
)

type httpResponseHeaderCollectorKey struct{}

// HTTPResponseHeaderInfo is a snapshot of headers returned by one HTTP response.
type HTTPResponseHeaderInfo struct {
	URL        string              `json:"url,omitempty"`
	Protocol   string              `json:"protocol,omitempty"`
	Status     string              `json:"status,omitempty"`
	StatusCode int                 `json:"status_code"`
	Headers    map[string][]string `json:"headers"`
}

// WithHTTPResponseHeaderCollector attaches a callback used to collect response
// headers for the final response and every followed redirect response.
func WithHTTPResponseHeaderCollector(ctx context.Context, collector func(HTTPResponseHeaderInfo)) context.Context {
	return context.WithValue(ctx, httpResponseHeaderCollectorKey{}, collector)
}

func recordHTTPResponseHeaders(ctx context.Context, resp *http.Response) {
	if resp == nil {
		return
	}

	collector, ok := ctx.Value(httpResponseHeaderCollectorKey{}).(func(HTTPResponseHeaderInfo))
	if !ok || collector == nil {
		return
	}

	url := ""
	if resp.Request != nil && resp.Request.URL != nil {
		url = resp.Request.URL.String()
	}

	collector(HTTPResponseHeaderInfo{
		URL:        url,
		Protocol:   resp.Proto,
		Status:     resp.Status,
		StatusCode: resp.StatusCode,
		Headers:    resp.Header.Clone(),
	})
}
