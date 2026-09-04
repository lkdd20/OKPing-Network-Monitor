import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PingLayoutConfigForm, PingLayoutConfigQuery, PingLayoutConfigVO } from '@/api/ping/layoutConfig/types';

export const listPingLayoutConfig = (query?: PingLayoutConfigQuery): AxiosPromise<PingLayoutConfigVO[]> => {
  return request({
    url: '/ping/layout-config/list',
    method: 'get',
    params: query
  });
};

export const getPingLayoutConfig = (id: string | number): AxiosPromise<PingLayoutConfigVO> => {
  return request({
    url: `/ping/layout-config/${id}`,
    method: 'get'
  });
};

export const addPingLayoutConfig = (data: PingLayoutConfigForm) => {
  return request({
    url: '/ping/layout-config',
    method: 'post',
    data
  });
};

export const updatePingLayoutConfig = (data: PingLayoutConfigForm) => {
  return request({
    url: '/ping/layout-config',
    method: 'put',
    data
  });
};

export const delPingLayoutConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: `/ping/layout-config/${id}`,
    method: 'delete'
  });
};
