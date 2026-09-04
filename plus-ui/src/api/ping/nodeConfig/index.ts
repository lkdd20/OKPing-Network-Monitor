import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  PingAgentDeployConfigForm,
  PingAgentDeployConfigVO,
  PingAgentDeploymentVO,
  PingIpDatabaseStatusVO,
  PingNodeConfigForm,
  PingNodeConfigQuery,
  PingNodeConfigVO,
  PingOssUploadVO
} from '@/api/ping/nodeConfig/types';

export const listPingNodeConfig = (query?: PingNodeConfigQuery): AxiosPromise<PingNodeConfigVO[]> => {
  return request({
    url: '/ping/node-config/list',
    method: 'get',
    params: query
  });
};

export const getPingNodeConfig = (id: string | number): AxiosPromise<PingNodeConfigVO> => {
  return request({
    url: `/ping/node-config/${id}`,
    method: 'get'
  });
};

export const addPingNodeConfig = (data: PingNodeConfigForm) => {
  return request({
    url: '/ping/node-config',
    method: 'post',
    data
  });
};

export const updatePingNodeConfig = (data: PingNodeConfigForm) => {
  return request({
    url: '/ping/node-config',
    method: 'put',
    data
  });
};

export const delPingNodeConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: `/ping/node-config/${id}`,
    method: 'delete'
  });
};

export const getPingIpDatabaseStatus = (): AxiosPromise<PingIpDatabaseStatusVO[]> => {
  return request({
    url: '/ping/ip-database/status',
    method: 'get'
  });
};

export const uploadPingIpDatabase = (version: 'ipv4' | 'ipv6', file: File): AxiosPromise<PingIpDatabaseStatusVO> => {
  const data = new FormData();
  data.append('version', version);
  data.append('file', file);
  return request({
    url: '/ping/ip-database/upload',
    method: 'post',
    headers: {
      repeatSubmit: false
    },
    data
  });
};

export const getPingAgentDeployConfig = (): AxiosPromise<PingAgentDeployConfigVO> => {
  return request({
    url: '/ping/node-config/agent-deploy-config',
    method: 'get'
  });
};

export const updatePingAgentDeployConfig = (data: PingAgentDeployConfigForm) => {
  return request({
    url: '/ping/node-config/agent-deploy-config',
    method: 'put',
    data
  });
};

export const getPingAgentDeployment = (id: string | number): AxiosPromise<PingAgentDeploymentVO> => {
  return request({
    url: `/ping/node-config/${id}/agent-deployment`,
    method: 'get'
  });
};

export const uploadPingAgentImage = (file: File): AxiosPromise<PingOssUploadVO> => {
  const data = new FormData();
  data.append('file', file);
  return request({
    url: '/resource/oss/upload',
    method: 'post',
    headers: {
      repeatSubmit: false
    },
    data
  });
};
