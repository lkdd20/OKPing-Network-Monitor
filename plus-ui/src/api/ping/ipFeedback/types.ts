export type PingIpFeedbackStatus = 'pending' | 'approved' | 'rejected';
export type PingIpVersion = 'ipv4' | 'ipv6';

export interface PingIpFeedbackVO {
  id: string | number;
  ipVersion: PingIpVersion;
  startIp: string;
  endIp: string;
  location: string;
  status: PingIpFeedbackStatus;
  reviewRemark?: string;
  createTime?: string;
  reviewTime?: string;
}

export interface PingIpFeedbackQuery extends PageQuery {
  ipVersion?: PingIpVersion;
  startIp?: string;
  status?: PingIpFeedbackStatus;
  params?: any;
}

export interface PingIpFeedbackReviewForm {
  id: string | number;
  status: Exclude<PingIpFeedbackStatus, 'pending'>;
  reviewRemark?: string;
}
