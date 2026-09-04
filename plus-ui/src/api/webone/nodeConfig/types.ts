export interface NodeConfigVO {
  /**
   * ID
   */
  id: string | number;

  /**
   * 国家
   */
  country: string;

  /**
   * 是否是海外
   */
  overseas: string;

  /**
   * 区域
   */
  region: string;

  /**
   * 城市
   */
  city: string;

  /**
   * 运营商
   */
  operators: string;

  /**
   * 名称
   */
  name: string;

  /**
   * 权重
   */
  weight: number;

  /**
   * 坐标
   */
  coordinate: string;

  /**
   * 状态
   */
  state: string;

  /**
   * 备注信息
   */
  content: string;

  /**
   * 备注信息2
   */
  content2: string;

  /**
   * 备注信息3
   */
  content3: string;

  /**
   * 在线时刻
   */
  online: number;

  /**
   * 是否家宽
   */
  homeState: string;

  /**
   * 省份
   */
  province: string;

  /**
   * 路由追踪开启
   */
  traceroute: string;

  /**
   * ipv6支持
   */
  ipv6: string;
}

export interface NodeConfigForm extends BaseEntity {
  /**
   * ID
   */
  id?: string | number;

  /**
   * 国家
   */
  country?: string;

  /**
   * 是否是海外
   */
  overseas?: string;

  /**
   * 区域
   */
  region?: string;

  /**
   * 城市
   */
  city?: string;

  /**
   * 运营商
   */
  operators?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 权重
   */
  weight?: number;

  /**
   * 坐标
   */
  coordinate?: string;

  /**
   * 状态
   */
  state?: string;

  /**
   * 备注信息
   */
  content?: string;

  /**
   * 备注信息2
   */
  content2?: string;

  /**
   * 备注信息3
   */
  content3?: string;

  /**
   * 在线时刻
   */
  online?: number;

  /**
   * 是否家宽
   */
  homeState?: string;

  /**
   * 省份
   */
  province?: string;

  /**
   * 路由追踪开启
   */
  traceroute?: string;

  /**
   * ipv6支持
   */
  ipv6?: string;
}

export interface NodeConfigQuery extends PageQuery {
  /**
   * 国家
   */
  country?: string;

  /**
   * 是否是海外
   */
  overseas?: string;

  /**
   * 区域
   */
  region?: string;

  /**
   * 城市
   */
  city?: string;

  /**
   * 运营商
   */
  operators?: string;

  /**
   * 名称
   */
  name?: string;

  /**
   * 权重
   */
  weight?: number;

  /**
   * 坐标
   */
  coordinate?: string;

  /**
   * 状态
   */
  state?: string;

  /**
   * 备注信息
   */
  content?: string;

  /**
   * 备注信息2
   */
  content2?: string;

  /**
   * 备注信息3
   */
  content3?: string;

  /**
   * 在线时刻
   */
  online?: number;

  /**
   * 是否家宽
   */
  homeState?: string;

  /**
   * 省份
   */
  province?: string;

  /**
   * 路由追踪开启
   */
  traceroute?: string;

  /**
   * ipv6支持
   */
  ipv6?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

export interface NodeConfigAvailableQuery {
  /**
   * 运营商
   */
  operators?: string[];

  /**
   * ipv6支持
   */
  ipv6?: string;

  /**
   * 路由追踪开启
   */
  traceroute?: string;
}
