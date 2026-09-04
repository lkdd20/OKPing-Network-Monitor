export interface BlacklistVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * 匹配值
   */
  value: string;

  /**
   * 是否生效
   */
  status: number;

  /**
   * 拦截到期时间
   */
  stopTime: string;
}

export interface BlacklistInfoVO {
  /**
   * 是否命中黑名单
   */
  blocked: boolean;

  /**
   * 查询值
   */
  queryValue?: string;

  /**
   * 命中的规则值
   */
  value?: string;

  /**
   * 匹配类型
   */
  matchType?: string;

  /**
   * 是否生效
   */
  status?: number;

  /**
   * 拦截到期时间
   */
  stopTime?: string;
}

export interface BlacklistForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * 匹配值
   */
  value?: string;

  /**
   * 是否生效
   */
  status?: number;

  /**
   * 拦截到期时间
   */
  stopTime?: string;
}

export interface BlacklistQuery extends PageQuery {
  /**
   * 匹配值
   */
  value?: string;

  /**
   * 是否生效
   */
  status?: number;

  /**
   * 拦截到期时间
   */
  stopTime?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
