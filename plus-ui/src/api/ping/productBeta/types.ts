export type ProductBetaStatus = 'registered' | 'notified';

export interface PingProductBetaSignupVO extends BaseEntity {
  id: number | string;
  userId: number | string;
  userName: string;
  nickname?: string;
  status: ProductBetaStatus;
  source: string;
  createTime?: string;
  notifiedTime?: string;
  remark?: string;
  updateTime?: string;
}

export interface PingProductBetaQuery extends PageQuery {
  keyword?: string;
  status?: ProductBetaStatus | '';
  params?: Record<string, unknown>;
}

export interface PingProductBetaStatusForm {
  id: number | string;
  status: ProductBetaStatus;
  remark?: string;
}

export interface PingProductBetaSummary {
  total: number;
  registered: number;
  notified: number;
  today: number;
  lastSevenDays: number;
}
