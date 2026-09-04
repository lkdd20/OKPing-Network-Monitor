import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AdLinksVO, AdLinksForm, AdLinksQuery } from '@/api/web/adLinks/types';

/**
 * 查询广告链接列表
 * @param query
 * @returns {*}
 */

export const listAdLinks = (query?: AdLinksQuery): AxiosPromise<AdLinksVO[]> => {
  return request({
    url: '/web/adLinks/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询广告链接详细
 * @param id
 */
export const getAdLinks = (id: string | number): AxiosPromise<AdLinksVO> => {
  return request({
    url: '/web/adLinks/' + id,
    method: 'get'
  });
};

/**
 * 新增广告链接
 * @param data
 */
export const addAdLinks = (data: AdLinksForm) => {
  return request({
    url: '/web/adLinks',
    method: 'post',
    data: data
  });
};

/**
 * 修改广告链接
 * @param data
 */
export const updateAdLinks = (data: AdLinksForm) => {
  return request({
    url: '/web/adLinks',
    method: 'put',
    data: data
  });
};

/**
 * 删除广告链接
 * @param id
 */
export const delAdLinks = (id: string | number | Array<string | number>) => {
  return request({
    url: '/web/adLinks/' + id,
    method: 'delete'
  });
};
