export const DEFAULT_REGIONS = [
  "华东地区",
  "华北地区",
  "华中地区",
  "华南地区",
  "西南地区",
  "西北地区",
  "东北地区",
  "港澳台",
  "海外地区",
  "大洋洲",
  "非洲",
  "南美洲",
  "北美洲",
  "欧洲",
  "亚洲",
] as const;

export const OPERATOR_OPTIONS = [
  "移动",
  "联通",
  "电信",
  "多线",
  "港澳台、海外",
] as const;

export const NODE_RESULT_FILTERS = [
  "全部",
  "电信",
  "移动",
  "联通",
  "多线",
  "海外",
  "超时",
] as const;

export const DEFAULT_PING_BACKEND_BASE_URL = "http://localhost:8080";
export const DEFAULT_PING_WS_BASE_URL = "ws://localhost:8080/websocket";