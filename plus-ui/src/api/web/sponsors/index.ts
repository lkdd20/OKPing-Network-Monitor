import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SponsorsVO, SponsorsForm, SponsorsQuery, SponsorsListVO } from '@/api/web/sponsors/types';

/**
 * 查询赞助商列表
 * @param query
 * @returns {*}
 */
export const listSponsors = (query?: SponsorsQuery): AxiosPromise<SponsorsVO[]> => {
  return request({
    url: '/web/sponsors/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询公开赞助商列表
 */
export const listsSponsors = (): AxiosPromise<SponsorsListVO[]> => {
  return request({
    url: '/web/sponsors/lists',
    method: 'get'
  });
};

/**
 * 查询赞助商详细
 * @param id
 */
export const getSponsors = (id: string | number): AxiosPromise<SponsorsVO> => {
  return request({
    url: '/web/sponsors/' + id,
    method: 'get'
  });
};

/**
 * 新增赞助商
 * @param data
 */
export const addSponsors = (data: SponsorsForm) => {
  return request({
    url: '/web/sponsors',
    method: 'post',
    data: data
  });
};

/**
 * 修改赞助商
 * @param data
 */
export const updateSponsors = (data: SponsorsForm) => {
  return request({
    url: '/web/sponsors',
    method: 'put',
    data: data
  });
};

/**
 * 删除赞助商
 * @param id
 */
export const delSponsors = (id: string | number | Array<string | number>) => {
  return request({
    url: '/web/sponsors/' + id,
    method: 'delete'
  });
};
