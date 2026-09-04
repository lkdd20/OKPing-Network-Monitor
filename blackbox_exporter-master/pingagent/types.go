package pingagent

import (
	"time"

	"github.com/prometheus/blackbox_exporter/probeapi"
)

type Config struct {
	MasterURL     string
	UUID          string
	Version       string
	RetryInterval time.Duration
	HTTPTimeout   time.Duration
}

type RegisterRequest struct {
	UUID         string   `json:"uuid"`
	Version      string   `json:"version,omitempty"`
	Capabilities []string `json:"capabilities"`
}

type Registration struct {
	Enabled                  bool         `json:"enabled"`
	HeartbeatIntervalSeconds int64        `json:"heartbeatIntervalSeconds"`
	Node                     NodeConfig   `json:"node"`
	Rabbit                   RabbitConfig `json:"rabbit"`
}

type NodeConfig struct {
	UUID     string `json:"uuid"`
	Exchange string `json:"exchange"`
	Queue    string `json:"queue"`
	Binding  string `json:"binding"`
}

type RabbitConfig struct {
	Host             string `json:"host"`
	Port             int    `json:"port"`
	Username         string `json:"username"`
	Password         string `json:"password"`
	VirtualHost      string `json:"virtualHost"`
	TLS              bool   `json:"tls"`
	ResultExchange   string `json:"resultExchange"`
	ResultRoutingKey string `json:"resultRoutingKey"`
}

type Task struct {
	TaskID       string `json:"taskId"`
	Type         string `json:"type"`
	URL          string `json:"url"`
	DNS          string `json:"dns,omitempty"`
	Model        string `json:"model,omitempty"`
	Number       int64  `json:"number,omitempty"`
	Port         int64  `json:"port,omitempty"`
	PathOrParams string `json:"pathOrParams,omitempty"`
	Agreement    string `json:"agreement,omitempty"`
	Body         string `json:"body,omitempty"`
	Config       any    `json:"config,omitempty"`
	BatchIndex   *int   `json:"batchIndex,omitempty"`
	BatchTarget  string `json:"batchTarget,omitempty"`
}

type ResultMessage struct {
	TaskID             string            `json:"taskId"`
	NodeUUID           string            `json:"nodeUuid"`
	Type               string            `json:"type"`
	Sequence           int               `json:"sequence"`
	TotalRuns          int               `json:"totalRuns"`
	FinalResult        bool              `json:"finalResult"`
	IP                 string            `json:"ip,omitempty"`
	ResolvedIPs        []string          `json:"resolvedIps,omitempty"`
	DNSDurationSeconds float64           `json:"dnsDurationSeconds"`
	ProbeResult        *probeapi.Result  `json:"probeResult,omitempty"`
	Error              string            `json:"error,omitempty"`
	MeasuredAt         int64             `json:"measuredAt"`
	BatchIndex         *int              `json:"batchIndex,omitempty"`
	BatchTarget        string            `json:"batchTarget,omitempty"`
	TraceResult        *TracerouteResult `json:"traceResult,omitempty"`
}

type TracerouteResult struct {
	Target               string          `json:"target"`
	TargetIP             string          `json:"targetIp"`
	MaxHops              int             `json:"maxHops"`
	ProbesPerHop         int             `json:"probesPerHop"`
	Reached              bool            `json:"reached"`
	DurationMilliseconds float64         `json:"durationMilliseconds"`
	Hops                 []TracerouteHop `json:"hops"`
}

type TracerouteHop struct {
	Hop    int               `json:"hop"`
	Probes []TracerouteProbe `json:"probes"`
}

type TracerouteProbe struct {
	IP                   string   `json:"ip,omitempty"`
	DurationMilliseconds *float64 `json:"durationMilliseconds,omitempty"`
	Timeout              bool     `json:"timeout"`
}
