import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PingBlogPostForm, PingBlogPostQuery, PingBlogPostVO } from './types';

export function listBlogPosts(query: PingBlogPostQuery): AxiosPromise<PingBlogPostVO[]> {
  return request({
    url: '/ping/blog/list',
    method: 'get',
    params: query
  });
}

export function getBlogPost(id: number | string): AxiosPromise<PingBlogPostVO> {
  return request({
    url: `/ping/blog/${id}`,
    method: 'get'
  });
}

export function addBlogPost(data: PingBlogPostForm) {
  return request({
    url: '/ping/blog',
    method: 'post',
    data
  });
}

export function updateBlogPost(data: PingBlogPostForm) {
  return request({
    url: '/ping/blog',
    method: 'put',
    data
  });
}

export function deleteBlogPosts(ids: number | string | Array<number | string>) {
  return request({
    url: `/ping/blog/${ids}`,
    method: 'delete'
  });
}
