package pingagent

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"

	amqp "github.com/rabbitmq/amqp091-go"
)

const (
	maxPersistentRuns  = 1000
	taskConcurrency    = 4
	persistentInterval = time.Second
	probeTimeout       = 10 * time.Second
	tracerouteTimeout  = 90 * time.Second
)

type consumerSession interface {
	Done() <-chan error
	Close() error
}

type sessionStarter func(context.Context, Registration, *Processor, *slog.Logger) (consumerSession, error)

type rabbitSession struct {
	connection *amqp.Connection
	channel    *amqp.Channel
	done       chan error
	cancel     context.CancelFunc
	channelMu  sync.Mutex
}

func startRabbitSession(parent context.Context, registration Registration, processor *Processor, logger *slog.Logger) (consumerSession, error) {
	if err := validateRabbitConfig(registration); err != nil {
		return nil, err
	}
	rabbit := registration.Rabbit
	scheme := "amqp"
	if rabbit.TLS {
		scheme = "amqps"
	}
	address := scheme + "://" + net.JoinHostPort(rabbit.Host, strconv.Itoa(rabbit.Port))
	dialConfig := amqp.Config{
		SASL:      []amqp.Authentication{&amqp.PlainAuth{Username: rabbit.Username, Password: rabbit.Password}},
		Vhost:     defaultString(rabbit.VirtualHost, "/"),
		Heartbeat: 30 * time.Second,
		Dial:      amqp.DefaultDial(10 * time.Second),
	}
	if rabbit.TLS {
		dialConfig.TLSClientConfig = &tls.Config{MinVersion: tls.VersionTLS12, ServerName: rabbit.Host}
	}
	connection, err := amqp.DialConfig(address, dialConfig)
	if err != nil {
		return nil, fmt.Errorf("connect RabbitMQ %s: %w", net.JoinHostPort(rabbit.Host, strconv.Itoa(rabbit.Port)), err)
	}
	channel, err := connection.Channel()
	if err != nil {
		connection.Close()
		return nil, fmt.Errorf("open RabbitMQ channel: %w", err)
	}
	cleanup := func() {
		channel.Close()
		connection.Close()
	}

	if err := channel.ExchangeDeclare(registration.Node.Exchange, "direct", true, false, false, false, nil); err != nil {
		cleanup()
		return nil, fmt.Errorf("declare task exchange: %w", err)
	}
	if _, err := channel.QueueDeclare(registration.Node.Queue, true, false, false, false, nil); err != nil {
		cleanup()
		return nil, fmt.Errorf("declare task queue: %w", err)
	}
	if err := channel.QueueBind(registration.Node.Queue, registration.Node.Binding, registration.Node.Exchange, false, nil); err != nil {
		cleanup()
		return nil, fmt.Errorf("bind task queue: %w", err)
	}
	if rabbit.ResultExchange != "" {
		if err := channel.ExchangeDeclare(rabbit.ResultExchange, "direct", true, false, false, false, nil); err != nil {
			cleanup()
			return nil, fmt.Errorf("declare result exchange: %w", err)
		}
	} else if _, err := channel.QueueDeclare(rabbit.ResultRoutingKey, true, false, false, false, nil); err != nil {
		cleanup()
		return nil, fmt.Errorf("declare result queue: %w", err)
	}
	if err := channel.Qos(taskConcurrency, 0, false); err != nil {
		cleanup()
		return nil, fmt.Errorf("configure RabbitMQ qos: %w", err)
	}
	if err := channel.Confirm(false); err != nil {
		cleanup()
		return nil, fmt.Errorf("enable RabbitMQ publisher confirms: %w", err)
	}

	ctx, cancel := context.WithCancel(parent)
	deliveries, err := channel.ConsumeWithContext(ctx, registration.Node.Queue, "ping-agent-"+registration.Node.UUID, false, false, false, false, nil)
	if err != nil {
		cancel()
		cleanup()
		return nil, fmt.Errorf("consume task queue: %w", err)
	}
	session := &rabbitSession{
		connection: connection,
		channel:    channel,
		done:       make(chan error, 1),
		cancel:     cancel,
	}
	closeNotifications := connection.NotifyClose(make(chan *amqp.Error, 1))
	go session.consume(ctx, deliveries, closeNotifications, registration, processor, logger)
	return session, nil
}

func (session *rabbitSession) consume(ctx context.Context, deliveries <-chan amqp.Delivery, closeNotifications <-chan *amqp.Error, registration Registration, processor *Processor, logger *slog.Logger) {
	taskSlots := make(chan struct{}, taskConcurrency)
	var workers sync.WaitGroup
	defer func() {
		workers.Wait()
		close(session.done)
	}()

	for {
		select {
		case <-ctx.Done():
			session.report(ctx.Err())
			return
		case err, ok := <-closeNotifications:
			if ok && err != nil {
				session.report(err)
			} else {
				session.report(errors.New("RabbitMQ connection closed"))
			}
			return
		case delivery, ok := <-deliveries:
			if !ok {
				session.report(errors.New("RabbitMQ delivery channel closed"))
				return
			}
			select {
			case taskSlots <- struct{}{}:
			case <-ctx.Done():
				return
			}
			workers.Add(1)
			go func(delivery amqp.Delivery) {
				defer workers.Done()
				defer func() { <-taskSlots }()
				session.handleDelivery(ctx, delivery, registration.Rabbit, processor, logger)
			}(delivery)
		}
	}
}

func (session *rabbitSession) handleDelivery(ctx context.Context, delivery amqp.Delivery, rabbit RabbitConfig, processor *Processor, logger *slog.Logger) {
	var task Task
	if err := json.Unmarshal(delivery.Body, &task); err != nil {
		logger.Error("Discarding invalid ping task", "err", err)
		_ = session.reject(delivery, false)
		return
	}
	if isTracerouteTask(task.Type) {
		session.handleTracerouteDelivery(ctx, delivery, rabbit, processor, task, logger)
		return
	}
	runCount := taskRunCount(task)
	for sequence := 1; sequence <= runCount; sequence++ {
		probeContext, cancel := context.WithTimeout(ctx, taskProbeTimeout(task))
		result := processor.Handle(probeContext, task)
		cancel()
		result.Sequence = sequence
		result.TotalRuns = runCount
		result.FinalResult = sequence == runCount
		if err := session.publishResult(ctx, rabbit, result); err != nil {
			logger.Error("Unable to publish ping result", "sequence", sequence, "err", err)
			_ = session.nack(delivery, false, true)
			return
		}
		if sequence < runCount && !waitForNextProbe(ctx, persistentInterval) {
			_ = session.nack(delivery, false, true)
			return
		}
	}
	if err := session.ack(delivery, false); err != nil {
		logger.Warn("Unable to acknowledge ping task", "err", err)
	}
}

func (session *rabbitSession) handleTracerouteDelivery(
	ctx context.Context,
	delivery amqp.Delivery,
	rabbit RabbitConfig,
	processor *Processor,
	task Task,
	logger *slog.Logger,
) {
	probeContext, cancel := context.WithTimeout(ctx, taskProbeTimeout(task))
	result, err := processor.HandleTracerouteStream(probeContext, task, func(partial ResultMessage) error {
		return session.publishResult(ctx, rabbit, partial)
	})
	cancel()
	if err != nil {
		logger.Error("Unable to publish incremental ping traceroute result", "sequence", result.Sequence, "err", err)
		_ = session.nack(delivery, false, true)
		return
	}
	if err := session.publishResult(ctx, rabbit, result); err != nil {
		logger.Error("Unable to publish final ping traceroute result", "sequence", result.Sequence, "err", err)
		_ = session.nack(delivery, false, true)
		return
	}
	if err := session.ack(delivery, false); err != nil {
		logger.Warn("Unable to acknowledge ping traceroute task", "err", err)
	}
}

func taskProbeTimeout(task Task) time.Duration {
	if isTracerouteTask(task.Type) {
		return tracerouteTimeout
	}
	return probeTimeout
}

func isTracerouteTask(taskType string) bool {
	return taskType == "traceroute" || taskType == "traceroute_v6"
}

func (session *rabbitSession) publishResult(ctx context.Context, rabbit RabbitConfig, result ResultMessage) error {
	body, err := json.Marshal(result)
	if err != nil {
		return fmt.Errorf("encode result: %w", err)
	}
	publishContext, cancel := context.WithTimeout(ctx, probeTimeout)
	defer cancel()
	session.channelMu.Lock()
	defer session.channelMu.Unlock()
	confirmation, err := session.channel.PublishWithDeferredConfirmWithContext(publishContext, rabbit.ResultExchange, rabbit.ResultRoutingKey, false, false, amqp.Publishing{
		ContentType:  "application/json",
		DeliveryMode: amqp.Persistent,
		Timestamp:    time.Now(),
		Body:         body,
	})
	if err != nil {
		return err
	}
	confirmed, err := confirmation.WaitContext(publishContext)
	if err != nil {
		return err
	}
	if !confirmed {
		return errors.New("RabbitMQ did not confirm ping result")
	}
	return nil
}

func taskRunCount(task Task) int {
	if task.Model != "persistent" {
		return 1
	}
	count := task.Number
	if count <= 0 {
		return 1
	}
	if count > maxPersistentRuns {
		return maxPersistentRuns
	}
	return int(count)
}

func waitForNextProbe(ctx context.Context, interval time.Duration) bool {
	timer := time.NewTimer(interval)
	defer timer.Stop()
	select {
	case <-ctx.Done():
		return false
	case <-timer.C:
		return true
	}
}

func (session *rabbitSession) Done() <-chan error {
	return session.done
}

func (session *rabbitSession) Close() error {
	session.cancel()
	session.channelMu.Lock()
	defer session.channelMu.Unlock()
	channelErr := session.channel.Close()
	connectionErr := session.connection.Close()
	return errors.Join(channelErr, connectionErr)
}

func (session *rabbitSession) ack(delivery amqp.Delivery, multiple bool) error {
	session.channelMu.Lock()
	defer session.channelMu.Unlock()
	return delivery.Ack(multiple)
}

func (session *rabbitSession) nack(delivery amqp.Delivery, multiple bool, requeue bool) error {
	session.channelMu.Lock()
	defer session.channelMu.Unlock()
	return delivery.Nack(multiple, requeue)
}

func (session *rabbitSession) reject(delivery amqp.Delivery, requeue bool) error {
	session.channelMu.Lock()
	defer session.channelMu.Unlock()
	return delivery.Reject(requeue)
}

func (session *rabbitSession) report(err error) {
	select {
	case session.done <- err:
	default:
	}
}

func validateRabbitConfig(registration Registration) error {
	if strings.TrimSpace(registration.Node.UUID) == "" || strings.TrimSpace(registration.Node.Exchange) == "" ||
		strings.TrimSpace(registration.Node.Queue) == "" || strings.TrimSpace(registration.Node.Binding) == "" {
		return errors.New("registration returned incomplete node routing")
	}
	if strings.TrimSpace(registration.Rabbit.Host) == "" || registration.Rabbit.Port <= 0 ||
		strings.TrimSpace(registration.Rabbit.Username) == "" || strings.TrimSpace(registration.Rabbit.ResultRoutingKey) == "" {
		return errors.New("registration returned incomplete RabbitMQ configuration")
	}
	return nil
}

func defaultString(value string, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}
