export interface AdLinksVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * 类型
   */
  type: number;

  /**
   * 连接地址
   */
  url: string;

  /**
   * 图片地址
   */
  imgUrl: string;

  /**
   * 到期时间
   */
  delTime: string;

  /**
   * 权重
   */
  weight: number;

}

export interface AdLinksForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 类型
   */
  type?: number;

  /**
   * 连接地址
   */
  url?: string;

  /**
   * 图片地址
   */
  imgUrl?: string;

  /**
   * 到期时间
   */
  delTime?: string;

  /**
   * 权重
   */
  weight?: number;

}

export interface AdLinksQuery extends PageQuery {

  /**
   * 名称
   */
  name?: string;

  /**
   * 类型
   */
  type?: number;

  /**
   * 连接地址
   */
  url?: string;

  /**
   * 图片地址
   */
  imgUrl?: string;

  /**
   * 到期时间
   */
  delTime?: string;

  /**
   * 权重
   */
  weight?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
