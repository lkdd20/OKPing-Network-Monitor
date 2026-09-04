import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { BlacklistVO, BlacklistForm, BlacklistQuery, BlacklistInfoVO } from '@/api/web/blacklist/types';

/**
 * 查询域名黑名单列表
 * @param query
 * @returns {*}
 */

export const listBlacklist = (query?: BlacklistQuery): AxiosPromise<BlacklistVO[]> => {
  return request({
    url: '/web/blacklist/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询 URL/IP 是否命中黑名单
 * @param value
 */
export const infoBlacklist = (value: string): AxiosPromise<BlacklistInfoVO> => {
  return request({
    url: '/web/blacklist/info',
    method: 'get',
    params: { value }
  });
};

/**
 * 查询域名黑名单详细
 * @param id
 */
export const getBlacklist = (id: string | number): AxiosPromise<BlacklistVO> => {
  return request({
    url: '/web/blacklist/' + id,
    method: 'get'
  });
};

/**
 * 新增域名黑名单
 * @param data
 */
export const addBlacklist = (data: BlacklistForm) => {
  return request({
    url: '/web/blacklist',
    method: 'post',
    data: data
  });
};

/**
 * 修改域名黑名单
 * @param data
 */
export const updateBlacklist = (data: BlacklistForm) => {
  return request({
    url: '/web/blacklist',
    method: 'put',
    data: data
  });
};

/**
 * 删除域名黑名单
 * @param id
 */
export const delBlacklist = (id: string | number | Array<string | number>) => {
  return request({
    url: '/web/blacklist/' + id,
    method: 'delete'
  });
};
