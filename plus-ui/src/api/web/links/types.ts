export interface LinksVO {
  /**
   * 主键
   */
  id: string | number;

  /**
   * 名称
   */
  name: string;

  /**
   * 连接地址
   */
  url: string;

  /**
   * 权重
   */
  weight: number;

}

export interface LinksForm extends BaseEntity {
  /**
   * 主键
   */
  id?: string | number;

  /**
   * 名称
   */
  name?: string;

  /**
   * 连接地址
   */
  url?: string;

  /**
   * 权重
   */
  weight?: number;

}

export interface LinksQuery extends PageQuery {

  /**
   * 名称
   */
  name?: string;

  /**
   * 连接地址
   */
  url?: string;

  /**
   * 权重
   */
  weight?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}
