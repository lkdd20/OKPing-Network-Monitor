package utils

import (
	"encoding/json"

	dto "github.com/prometheus/client_model/go"
)

type MetricJSON struct {
	Name   string            `json:"name"`
	Labels map[string]string `json:"labels"`
	Value  float64           `json:"value"`
	Type   string            `json:"type"`
}

func ToJson(metricFamilies []*dto.MetricFamily) ([]byte, error) {
	var result []MetricJSON

	for _, mf := range metricFamilies {
		metricType := mf.GetType().String()

		for _, metric := range mf.GetMetric() {
			labels := make(map[string]string)

			for _, lp := range metric.GetLabel() {
				labels[lp.GetName()] = lp.GetValue()
			}

			var value float64

			switch mf.GetType() {
			case dto.MetricType_COUNTER:
				value = metric.GetCounter().GetValue()

			case dto.MetricType_GAUGE:
				value = metric.GetGauge().GetValue()

			case dto.MetricType_UNTYPED:
				value = metric.GetUntyped().GetValue()

			case dto.MetricType_SUMMARY:
				value = metric.GetSummary().GetSampleSum()

			case dto.MetricType_HISTOGRAM:
				value = metric.GetHistogram().GetSampleSum()
			}

			result = append(result, MetricJSON{
				Name:   mf.GetName(),
				Labels: labels,
				Value:  value,
				Type:   metricType,
			})
		}
	}

	return json.Marshal(result)
}
