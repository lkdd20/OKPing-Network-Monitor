export type BlogStatus = 'draft' | 'published';

export interface PingBlogPostVO extends BaseEntity {
  id: number | string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverOssId?: number | string | null;
  coverUrl?: string;
  category: string;
  tags?: string;
  status: BlogStatus;
  featured: boolean;
  sortOrder: number;
  publishTime?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  remark?: string;
  createTime?: string;
  updateTime?: string;
}

export interface PingBlogPostQuery extends PageQuery {
  keyword?: string;
  category?: string;
  status?: BlogStatus | '';
}

export interface PingBlogPostForm extends BaseEntity {
  id?: number | string;
  title: string;
  slug?: string;
  summary: string;
  content: string;
  coverOssId?: number | string | null;
  category: string;
  tags?: string;
  status: BlogStatus;
  featured: boolean;
  sortOrder: number;
  publishTime?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  remark?: string;
}
