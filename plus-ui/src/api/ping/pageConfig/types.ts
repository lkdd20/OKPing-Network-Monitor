export interface PingPageConfigVO {
  id: string | number;
  pageKey: string;
  pageName: string;
  titleTemplate: string;
  descriptionTemplate: string;
  keywordsTemplate: string;
  h1Template: string;
  introTemplate: string;
  status: string;
  sortOrder: number;
  remark: string;
  createTime: string;
  updateTime: string;
}

export interface PingPageConfigForm extends BaseEntity {
  id?: string | number;
  pageKey?: string;
  pageName?: string;
  titleTemplate?: string;
  descriptionTemplate?: string;
  keywordsTemplate?: string;
  h1Template?: string;
  introTemplate?: string;
  status?: string;
  sortOrder?: number;
  remark?: string;
}

export interface PingPageConfigQuery extends PageQuery {
  pageKey?: string;
  pageName?: string;
  status?: string;
  params?: any;
}
