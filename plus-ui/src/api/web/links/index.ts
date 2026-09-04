import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LinksVO, LinksForm, LinksQuery } from '@/api/web/links/types';

/**
 * 查询友情链接列表
 * @param query
 * @returns {*}
 */

export const listLinks = (query?: LinksQuery): AxiosPromise<LinksVO[]> => {
  return request({
    url: '/web/links/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询友情链接详细
 * @param id
 */
export const getLinks = (id: string | number): AxiosPromise<LinksVO> => {
  return request({
    url: '/web/links/' + id,
    method: 'get'
  });
};

/**
 * 新增友情链接
 * @param data
 */
export const addLinks = (data: LinksForm) => {
  return request({
    url: '/web/links',
    method: 'post',
    data: data
  });
};

/**
 * 修改友情链接
 * @param data
 */
export const updateLinks = (data: LinksForm) => {
  return request({
    url: '/web/links',
    method: 'put',
    data: data
  });
};

/**
 * 删除友情链接
 * @param id
 */
export const delLinks = (id: string | number | Array<string | number>) => {
  return request({
    url: '/web/links/' + id,
    method: 'delete'
  });
};
