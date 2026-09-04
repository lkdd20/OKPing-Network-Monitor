package pingagent

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"strings"
	"time"
)

type Runner struct {
	config    Config
	registrar Registrar
	processor *Processor
	logger    *slog.Logger
	start     sessionStarter
}

func New(config Config, logger *slog.Logger) (*Runner, error) {
	config.MasterURL = strings.TrimSpace(config.MasterURL)
	config.UUID = strings.TrimSpace(config.UUID)
	if config.UUID == "" {
		return nil, errors.New("ping Agent UUID is required")
	}
	if config.RetryInterval <= 0 {
		config.RetryInterval = 30 * time.Second
	}
	if config.HTTPTimeout <= 0 {
		config.HTTPTimeout = 15 * time.Second
	}
	if logger == nil {
		logger = slog.New(slog.NewTextHandler(os.Stdout, nil))
	}
	client, err := NewRegistrationClient(config.MasterURL, &http.Client{Timeout: config.HTTPTimeout})
	if err != nil {
		return nil, err
	}
	return &Runner{
		config:    config,
		registrar: client,
		processor: NewProcessor(config.UUID),
		logger:    logger,
		start:     startRabbitSession,
	}, nil
}

func (runner *Runner) Run(ctx context.Context) error {
	request := RegisterRequest{
		UUID:    runner.config.UUID,
		Version: runner.config.Version,
		Capabilities: []string{
			"ping", "tcping", "http", "dns", "traceroute",
			"ping_v6", "tcping_v6", "http_v6", "dns_v6", "traceroute_v6",
		},
	}
	var session consumerSession
	var activeConfig string
	defer func() {
		if session != nil {
			_ = session.Close()
		}
	}()

	for {
		registration, err := runner.registrar.Register(ctx, request)
		if err != nil {
			runner.logger.Error("ping Agent registration failed", "err", err)
			if !wait(ctx, runner.config.RetryInterval) {
				return ctx.Err()
			}
			continue
		}

		heartbeatInterval := time.Duration(registration.HeartbeatIntervalSeconds) * time.Second
		if heartbeatInterval <= 0 {
			heartbeatInterval = 10 * time.Minute
		}
		if !registration.Enabled {
			if session != nil {
				_ = session.Close()
				session = nil
				activeConfig = ""
			}
			runner.logger.Info("ping Agent is disabled by the controller; waiting for the next status poll")
			if !wait(ctx, heartbeatInterval) {
				return ctx.Err()
			}
			continue
		}

		fingerprint := registrationFingerprint(*registration)
		if session == nil || fingerprint != activeConfig {
			if session != nil {
				_ = session.Close()
			}
			session, err = runner.start(ctx, *registration, runner.processor, runner.logger)
			if err != nil {
				session = nil
				runner.logger.Error("ping Agent RabbitMQ startup failed", "err", err)
				if !wait(ctx, runner.config.RetryInterval) {
					return ctx.Err()
				}
				continue
			}
			activeConfig = fingerprint
			runner.logger.Info("ping Agent is online", "uuid", runner.config.UUID, "queue", registration.Node.Queue)
		}

		timer := time.NewTimer(heartbeatInterval)
		select {
		case <-ctx.Done():
			stopTimer(timer)
			return ctx.Err()
		case err := <-session.Done():
			stopTimer(timer)
			_ = session.Close()
			session = nil
			activeConfig = ""
			if err != nil && !errors.Is(err, context.Canceled) {
				runner.logger.Warn("ping Agent RabbitMQ session ended", "err", err)
			}
			if !wait(ctx, runner.config.RetryInterval) {
				return ctx.Err()
			}
		case <-timer.C:
			// Register again. The response may disable the node or change its route.
		}
	}
}

func registrationFingerprint(registration Registration) string {
	return fmt.Sprintf("%s\x00%s\x00%s\x00%s\x00%d\x00%s\x00%s\x00%s\x00%s\x00%t",
		registration.Node.Exchange,
		registration.Node.Queue,
		registration.Node.Binding,
		registration.Rabbit.Host,
		registration.Rabbit.Port,
		registration.Rabbit.Username,
		registration.Rabbit.Password,
		registration.Rabbit.VirtualHost,
		registration.Rabbit.ResultExchange+"\x00"+registration.Rabbit.ResultRoutingKey,
		registration.Rabbit.TLS,
	)
}

func wait(ctx context.Context, duration time.Duration) bool {
	timer := time.NewTimer(duration)
	defer stopTimer(timer)
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}

func stopTimer(timer *time.Timer) {
	if !timer.Stop() {
		select {
		case <-timer.C:
		default:
		}
	}
}
