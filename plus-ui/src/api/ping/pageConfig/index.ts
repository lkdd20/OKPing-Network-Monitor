import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PingPageConfigForm, PingPageConfigQuery, PingPageConfigVO } from '@/api/ping/pageConfig/types';

export const listPingPageConfig = (query?: PingPageConfigQuery): AxiosPromise<PingPageConfigVO[]> => {
  return request({
    url: '/ping/page-config/list',
    method: 'get',
    params: query
  });
};

export const getPingPageConfig = (id: string | number): AxiosPromise<PingPageConfigVO> => {
  return request({
    url: `/ping/page-config/${id}`,
    method: 'get'
  });
};

export const addPingPageConfig = (data: PingPageConfigForm) => {
  return request({
    url: '/ping/page-config',
    method: 'post',
    data
  });
};

export const updatePingPageConfig = (data: PingPageConfigForm) => {
  return request({
    url: '/ping/page-config',
    method: 'put',
    data
  });
};

export const delPingPageConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: `/ping/page-config/${id}`,
    method: 'delete'
  });
};
