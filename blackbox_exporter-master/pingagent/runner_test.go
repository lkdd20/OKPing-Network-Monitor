package pingagent

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"testing"
	"time"
)

type registrarFunc func(context.Context, RegisterRequest) (*Registration, error)

func (function registrarFunc) Register(ctx context.Context, request RegisterRequest) (*Registration, error) {
	return function(ctx, request)
}

func TestRunnerDoesNotStartRabbitWhenDisabled(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	startCount := 0
	runner := &Runner{
		config: Config{UUID: "node-uuid", RetryInterval: time.Millisecond},
		registrar: registrarFunc(func(_ context.Context, request RegisterRequest) (*Registration, error) {
			if len(request.Capabilities) != 10 ||
				request.Capabilities[0] != "ping" ||
				request.Capabilities[1] != "tcping" ||
				request.Capabilities[2] != "http" ||
				request.Capabilities[3] != "dns" ||
				request.Capabilities[4] != "traceroute" ||
				request.Capabilities[5] != "ping_v6" ||
				request.Capabilities[6] != "tcping_v6" ||
				request.Capabilities[7] != "http_v6" ||
				request.Capabilities[8] != "dns_v6" ||
				request.Capabilities[9] != "traceroute_v6" {
				t.Fatalf("unexpected capabilities: %#v", request.Capabilities)
			}
			cancel()
			return &Registration{Enabled: false, HeartbeatIntervalSeconds: 600}, nil
		}),
		processor: NewProcessor("node-uuid"),
		logger:    slog.New(slog.NewTextHandler(io.Discard, nil)),
		start: func(context.Context, Registration, *Processor, *slog.Logger) (consumerSession, error) {
			startCount++
			return nil, errors.New("must not start")
		},
	}

	err := runner.Run(ctx)
	if !errors.Is(err, context.Canceled) {
		t.Fatalf("expected canceled runner, got %v", err)
	}
	if startCount != 0 {
		t.Fatalf("RabbitMQ session started %d time(s) for a disabled node", startCount)
	}
}

func TestTaskRunCount(t *testing.T) {
	tests := []struct {
		name string
		task Task
		want int
	}{
		{name: "single", task: Task{Number: 100}, want: 1},
		{name: "persistent default", task: Task{Model: "persistent"}, want: 1},
		{name: "persistent", task: Task{Model: "persistent", Number: 100}, want: 100},
		{name: "persistent capped", task: Task{Model: "persistent", Number: 10000}, want: maxPersistentRuns},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := taskRunCount(test.task); got != test.want {
				t.Fatalf("taskRunCount() = %d, want %d", got, test.want)
			}
		})
	}
}

func TestTaskProbeTimeout(t *testing.T) {
	if got := taskProbeTimeout(Task{Type: "ping"}); got != probeTimeout {
		t.Fatalf("ping timeout = %s, want %s", got, probeTimeout)
	}
	if got := taskProbeTimeout(Task{Type: "traceroute"}); got != tracerouteTimeout {
		t.Fatalf("traceroute timeout = %s, want %s", got, tracerouteTimeout)
	}
	if got := taskProbeTimeout(Task{Type: "traceroute_v6"}); got != tracerouteTimeout {
		t.Fatalf("IPv6 traceroute timeout = %s, want %s", got, tracerouteTimeout)
	}
}
