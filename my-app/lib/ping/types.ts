export type PingResponse<T> = {
  code?: number | string;
  data?: T;
  msg?: string;
  message?: string;
};

export type ProbeType =
  | "ping"
  | "tcping"
  | "http"
  | "dns"
  | "traceroute"
  | "ping_v6"
  | "tcping_v6"
  | "http_v6"
  | "traceroute_v6";
export type BatchProbeType = "batch_ping" | "batch_tcping";
export type ProbeModel = "" | "persistent" | "slow";

export type DnsQueryType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "PTR"
  | "SRV"
  | "TXT";

export type ProbeTargetParts = {
  agreement: string;
  hostname: string;
  pathOrParams: string;
  port: number | null;
  raw: string;
};

export type ProbeConfig = {
  operators: string[];
  region: string[];
};

export type ProbePayload = {
  agreement: string;
  body: string;
  config: string;
  continueParam?: boolean;
  dns: string | null;
  model: ProbeModel;
  number?: number;
  pathOrParams: string;
  port: number | null;
  sign?: string | null;
  type: ProbeType | BatchProbeType;
  url: string;
  user?: string;
};

export type NodeScreenRequest = {
  operators: string[];
  region: string[];
};

export type NodeDataPoint = {
  timeout: boolean;
  value: number;
};

export type PingNode = {
  city?: string | null;
  content?: string | null;
  content2?: string | null;
  content3?: string | null;
  coordinate?: unknown;
  country?: string | null;
  dataValue?: NodeDataPoint[];
  homeState?: boolean;
  key: number;
  name?: string | null;
  operators?: string | null;
  province?: string | null;
  region?: string | null;
  sponsorText?: string | null;
  sponsorUrl?: string | null;
  state?: string | null;
  time?: number | string | null;
};

export type PingDnsResponse = {
  additional?: string[];
  answers?: string[];
  authority?: string[];
  ips?: string[];
  rcode?: string;
};

export type PingProbeResult = {
  dns_response?: PingDnsResponse | null;
  duration_seconds: number;
  effective_target?: string | null;
  metrics?: unknown;
  probe: string;
  resolve_ip?: string | null;
  response_headers?: unknown;
  success: boolean;
  target: string;
  timeout_seconds: number;
};

export type PingTracerouteProbe = {
  durationMilliseconds?: number | null;
  ip?: string | null;
  ipLocation?: string | null;
  timeout: boolean;
};

export type PingTracerouteHop = {
  hop: number;
  probes: PingTracerouteProbe[];
};

export type PingTracerouteResult = {
  durationMilliseconds: number;
  hops: PingTracerouteHop[];
  maxHops: number;
  probesPerHop: number;
  reached: boolean;
  target: string;
  targetIp: string;
};

export type PingNodeResult = PingNode & {
  dnsDurationSeconds?: number | null;
  error?: string | null;
  finalResult?: boolean;
  id?: number | null;
  ip?: string | null;
  ipLocation?: string | null;
  measuredAt?: number | null;
  probeResult?: PingProbeResult | null;
  resolvedIps?: string[] | null;
  sequence?: number | null;
  totalRuns?: number | null;
  dataValue: NodeDataPoint[];
};

export type PingNodeMessage = {
  batchIndex?: number | null;
  batchTarget?: string | null;
  dnsDurationSeconds?: number;
  error?: string | null;
  finalResult: boolean;
  ip?: string | null;
  ipLocation?: string | null;
  measuredAt: number;
  nodeId: number | string;
  probeResult?: PingProbeResult | null;
  resolvedIps?: string[] | null;
  sequence: number;
  totalRuns: number;
  traceResult?: PingTracerouteResult | null;
  type: string;
};

export type IpStat = {
  percentage: string;
  value: string;
};

export type PingPublicPageConfig = {
  canonicalPath?: string;
  description?: string;
  enabled?: boolean;
  h1?: string;
  intro?: string;
  keywords?: string;
  pageKey?: string;
  pageName?: string;
  target?: string;
  title?: string;
};

export type PingNavItem = {
  children?: PingNavItem[];
  icon?: string;
  text?: string;
  url?: string;
};

export type PingLinkItem = {
  title?: string;
  url?: string;
};

export type PingFooterColumn = {
  links?: PingLinkItem[];
  title?: string;
};

export type PingAnnouncementItem = {
  content?: string;
  level?: "info" | "warning" | "danger" | string;
  url?: string;
};

export type PingHomeToolItem = {
  category?: "ipv4" | "ipv6" | "batch" | string;
  color?: string;
  description?: string;
  enabled?: boolean;
  icon?: string;
  title?: string;
  url?: string;
};

export type PingSponsor = {
  imgUrl?: string | null;
  name?: string | null;
  url?: string | null;
};

export type PingAdLinks = {
  center?: PingSponsor[];
  left?: PingSponsor[];
  right?: PingSponsor[];
  top?: PingSponsor[];
  [key: string]: PingSponsor[] | undefined;
};

export type PingBlogPost = {
  category: string;
  coverUrl?: string | null;
  featured?: boolean;
  id: number | string;
  publishTime?: string | null;
  slug: string;
  summary: string;
  tags?: string[];
  title: string;
  updateTime?: string | null;
};

export type PingBlogPostDetail = PingBlogPost & {
  content: string;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  seoTitle?: string | null;
};

export type PingBlogPage = {
  categories: string[];
  pageNum: number;
  pageSize: number;
  rows: PingBlogPost[];
  total: number;
};

export type PingMilestone = {
  id: number | string;
  year: string;
  month: string;
  content: string;
};

export type PingPublicLayoutConfig = {
  adLinks?: PingAdLinks;
  announcements?: PingAnnouncementItem[];
  configKey?: string;
  copyright?: string;
  footerColumns?: PingFooterColumn[];
  footerLogoUrl?: string;
  footerSlogan?: string;
  friendshipLinks?: PingLinkItem[];
  homeTools?: PingHomeToolItem[];
  icpText?: string;
  icpUrl?: string;
  logoUrl?: string;
  navItems?: PingNavItem[];
  serviceLinkText?: string;
  serviceLinkUrl?: string;
  serviceText?: string;
  siteName?: string;
};

export type PingPublicIpFeedbackStatus = "pending" | "approved" | "rejected";

export type PingPublicIpFeedbackItem = {
  actualEndIp?: string | null;
  actualLocation?: string | null;
  actualStartIp?: string | null;
  createTime?: string | null;
  endIp: string;
  id: number | string;
  ipVersion: "ipv4" | "ipv6";
  reviewTime?: string | null;
  startIp: string;
  status: PingPublicIpFeedbackStatus;
  submittedLocation?: string | null;
};

export type PingPublicIpFeedbackPage = {
  pageNum: number;
  pageSize: number;
  rows: PingPublicIpFeedbackItem[];
  submittedIpCount7d: string;
  total: number;
  updatedIpCount7d: string;
};

export type PingIpSecurity = {
  abuser: boolean;
  anonymous: boolean;
  anycast: boolean;
  attacker: boolean;
  available: boolean;
  bogon: boolean;
  crawler: boolean;
  datacenter: boolean;
  mobile: boolean;
  proxy: boolean;
  relay: boolean;
  satellite: boolean;
  threat: boolean;
  tor: boolean;
  vpn: boolean;
};

export type PingIpAbuse = {
  address?: string | null;
  email?: string | null;
  name?: string | null;
  phone?: string | null;
};

export type PingIpInfo = {
  abuse: PingIpAbuse;
  asn?: string | null;
  asnDomain?: string | null;
  asnOrganization?: string | null;
  city?: string | null;
  companyDomain?: string | null;
  companyName?: string | null;
  country?: string | null;
  countryCode?: string | null;
  ip: string;
  ipVersion: "ipv4" | "ipv6";
  isp?: string | null;
  latitude?: number | null;
  location?: string | null;
  longitude?: number | null;
  nativeIp?: boolean | null;
  network?: string | null;
  networkType?: string | null;
  postalCode?: string | null;
  privacyServiceType?: string | null;
  queriedAt: number;
  region?: string | null;
  riskScore?: number | null;
  riskSource?: string | null;
  security: PingIpSecurity;
  sources: string[];
  timezone?: string | null;
  warnings: string[];
};

export type PingWhois = {
  creationDate?: string | null;
  dnssec?: string | null;
  domain: string;
  expirationDate?: string | null;
  nameServers: string[];
  rawWhois: string;
  registrantEmail?: string | null;
  registrantOrg?: string | null;
  registrar?: string | null;
  registrarUrl?: string | null;
  statuses: string[];
  updatedDate?: string | null;
  whoisServer?: string | null;
};

export type PingIssueType = "problem" | "suggestion" | "cooperation";
export type PingIssueStatus = "pending" | "processing" | "resolved" | "closed";

export type PingIssueAttachment = {
  ossId: number | string;
  originalName: string;
  size: number;
  url: string;
};

export type PingIssueMessage = {
  attachments: PingIssueAttachment[];
  content: string;
  createTime: string;
  id: number | string;
  issueId: number | string;
  publicVisible: boolean;
  senderName: string;
  senderType: "user" | "admin";
  senderUserId?: number | string | null;
  updateTime?: string | null;
};

export type PingIssue = {
  adminReply?: string | null;
  attachments: PingIssueAttachment[];
  content: string;
  createTime: string;
  id: number | string;
  issueType: PingIssueType;
  messages: PingIssueMessage[];
  nickname?: string | null;
  publicVisible: boolean;
  remark?: string | null;
  replyTime?: string | null;
  replyUserName?: string | null;
  status: PingIssueStatus;
  title: string;
  updateTime?: string | null;
  userId?: number | string;
  userName?: string;
};

export type PingPublicIssue = Omit<
  PingIssue,
  "nickname" | "publicVisible" | "remark" | "userId" | "userName"
> & {
  authorName: string;
};

export type PingPublicIssuePage = {
  pageNum: number;
  pageSize: number;
  rows: PingPublicIssue[];
  total: number;
};
