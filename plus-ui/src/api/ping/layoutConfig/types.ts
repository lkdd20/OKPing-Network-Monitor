export interface PingLayoutConfigVO {
  id: string | number;
  configKey: string;
  siteName: string;
  logoUrl: string;
  footerLogoUrl: string;
  footerSlogan: string;
  copyright: string;
  icpText: string;
  icpUrl: string;
  serviceText: string;
  serviceLinkText: string;
  serviceLinkUrl: string;
  navItemsJson: string;
  footerColumnsJson: string;
  friendshipLinksJson: string;
  announcementsJson: string;
  homeToolsJson: string;
  status: string;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface PingLayoutConfigForm extends BaseEntity {
  id?: string | number;
  configKey?: string;
  siteName?: string;
  logoUrl?: string;
  footerLogoUrl?: string;
  footerSlogan?: string;
  copyright?: string;
  icpText?: string;
  icpUrl?: string;
  serviceText?: string;
  serviceLinkText?: string;
  serviceLinkUrl?: string;
  navItemsJson?: string;
  footerColumnsJson?: string;
  friendshipLinksJson?: string;
  announcementsJson?: string;
  homeToolsJson?: string;
  status?: string;
  remark?: string;
}

export interface PingLayoutConfigQuery extends PageQuery {
  configKey?: string;
  siteName?: string;
  status?: string;
  params?: any;
}
