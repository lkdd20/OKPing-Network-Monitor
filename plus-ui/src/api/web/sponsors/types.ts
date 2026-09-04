export interface SponsorsVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * 链接地址
   */
  url: string;

  /**
   * 图片地址
   */
  imgUrl: string;

  /**
   * 权重
   */
  weight: number;
}

export interface SponsorsListVO {
  /**
   * 名称
   */
  name: string;

  /**
   * 链接地址
   */
  url: string;

  /**
   * 图片地址
   */
  imgUrl: string;
}

export interface SponsorsForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 链接地址
   */
  url?: string;

  /**
   * 图片地址
   */
  imgUrl?: string;

  /**
   * 权重
   */
  weight?: number;
}

export interface SponsorsQuery extends PageQuery {
  /**
   * 名称
   */
  name?: string;

  /**
   * 链接地址
   */
  url?: string;

  /**
   * 图片地址
   */
  imgUrl?: string;

  /**
   * 权重
   */
  weight?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
