package pingagent

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

type HTTPDoer interface {
	Do(request *http.Request) (*http.Response, error)
}

type Registrar interface {
	Register(ctx context.Context, request RegisterRequest) (*Registration, error)
}

type RegistrationClient struct {
	masterURL string
	http      HTTPDoer
}

type apiResponse struct {
	Code int           `json:"code"`
	Msg  string        `json:"msg"`
	Data *Registration `json:"data"`
}

func NewRegistrationClient(masterURL string, httpClient HTTPDoer) (*RegistrationClient, error) {
	masterURL = strings.TrimRight(strings.TrimSpace(masterURL), "/")
	parsed, err := url.Parse(masterURL)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return nil, errors.New("ping Agent master URL must be an absolute http or https URL")
	}
	if httpClient == nil {
		httpClient = http.DefaultClient
	}
	return &RegistrationClient{masterURL: masterURL, http: httpClient}, nil
}

func (client *RegistrationClient) Register(ctx context.Context, request RegisterRequest) (*Registration, error) {
	body, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("encode registration request: %w", err)
	}
	httpRequest, err := http.NewRequestWithContext(
		ctx,
		http.MethodPost,
		client.masterURL+"/ping/agent/register",
		bytes.NewReader(body),
	)
	if err != nil {
		return nil, fmt.Errorf("create registration request: %w", err)
	}
	httpRequest.Header.Set("Content-Type", "application/json")
	httpRequest.Header.Set("Accept", "application/json")
	httpRequest.Header.Set("User-Agent", "ping-agent")

	response, err := client.http.Do(httpRequest)
	if err != nil {
		return nil, fmt.Errorf("register Agent: %w", err)
	}
	defer response.Body.Close()
	responseBody, err := io.ReadAll(io.LimitReader(response.Body, 1024*1024))
	if err != nil {
		return nil, fmt.Errorf("read registration response: %w", err)
	}
	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return nil, fmt.Errorf("register Agent: HTTP %d: %s", response.StatusCode, strings.TrimSpace(string(responseBody)))
	}

	var envelope apiResponse
	if err := json.Unmarshal(responseBody, &envelope); err != nil {
		return nil, fmt.Errorf("decode registration response: %w", err)
	}
	if envelope.Code != http.StatusOK || envelope.Data == nil {
		message := strings.TrimSpace(envelope.Msg)
		if message == "" {
			message = "registration rejected"
		}
		return nil, errors.New(message)
	}
	return envelope.Data, nil
}
