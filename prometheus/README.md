# Node Monitor

This directory provides a local Prometheus stack for node and Docker container monitoring.

## Start

```bash
chmod +x deploy-prometheus.sh
./deploy-prometheus.sh
```

If your server cannot pull from `gcr.io`, use the default mirror in `.env.example`:

```bash
cp .env.example .env
./deploy-prometheus.sh
```

If cAdvisor still cannot be pulled because of network timeout, start the core panel first:

```bash
./deploy-prometheus.sh --without-cadvisor
```

## Access

- Prometheus: `http://YOUR_SERVER_IP:9090`
- Grafana: `http://YOUR_SERVER_IP:3001`
- Grafana account: `admin`
- Grafana password: `admin123456`

If you use a domain name, set `GRAFANA_ROOT_URL` to that public URL before starting Docker.

Grafana automatically provisions two dashboards in the `Ping` folder:

- `Ping 节点与 RabbitMQ 监控`, used as the default home dashboard.
- `RabbitMQ 队列消费历史`, a dedicated queue-history page that defaults to `ping_logs_python`.

## Add Remote Nodes

Install `node-exporter` on the target server, allow the Prometheus server to access port `9100`, then add another target group under the existing `job_name: node` in `prometheus.yml`:

```yaml
- targets:
    - 192.168.1.10:9100
  labels:
    instance: app-server-01
    node_name: Hangzhou Telecom 01
    region: Zhejiang
    operator: Telecom
```

Keep remote targets in `job_name: node`; the bundled availability alert uses `up{job="node"}`.

Reload Prometheus after editing:

```bash
curl -X POST http://localhost:9090/-/reload
```

## RabbitMQ Metrics

The Prometheus configuration automatically scrapes the Ping RabbitMQ metrics endpoint through `host.docker.internal:15692`. Deploy the files from the sibling `rabbitmq` directory so the `rabbitmq_prometheus` plugin and host port are enabled.

Verify both sides after deployment:

```bash
curl http://127.0.0.1:15692/metrics
curl http://127.0.0.1:9090/api/v1/query?query=up%7Bjob%3D%22rabbitmq%22%7D
```

The second response should contain a value of `1`. Grafana can then query RabbitMQ metrics such as `rabbitmq_queue_consumers` and `rabbitmq_queue_messages`.

## Notes

This compose file is intended for Linux servers. Docker Desktop on macOS can run the stack, but host-level node metrics are not equivalent to a real Linux host.

Make sure the server firewall or cloud security group allows inbound `9090` and `3001`.
