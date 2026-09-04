import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { NodeConfigVO, NodeConfigForm, NodeConfigQuery, NodeConfigAvailableQuery } from '@/api/webone/nodeConfig/types';

/**
 * 查询节点信息列表
 * @param query
 * @returns {*}
 */

export const listNodeConfig = (query?: NodeConfigQuery): AxiosPromise<NodeConfigVO[]> => {
  return request({
    url: '/webone/nodeConfig/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询可用节点列表
 * @param data
 */
export const availableNodeConfig = (data?: NodeConfigAvailableQuery): AxiosPromise<NodeConfigVO[]> => {
  return request({
    url: '/webone/nodeConfig/available',
    method: 'post',
    data: data
  });
};

/**
 * 查询节点信息详细
 * @param id
 */
export const getNodeConfig = (id: string | number): AxiosPromise<NodeConfigVO> => {
  return request({
    url: '/webone/nodeConfig/' + id,
    method: 'get'
  });
};

/**
 * 新增节点信息
 * @param data
 */
export const addNodeConfig = (data: NodeConfigForm) => {
  return request({
    url: '/webone/nodeConfig',
    method: 'post',
    data: data
  });
};

/**
 * 修改节点信息
 * @param data
 */
export const updateNodeConfig = (data: NodeConfigForm) => {
  return request({
    url: '/webone/nodeConfig',
    method: 'put',
    data: data
  });
};

/**
 * 删除节点信息
 * @param id
 */
export const delNodeConfig = (id: string | number | Array<string | number>) => {
  return request({
    url: '/webone/nodeConfig/' + id,
    method: 'delete'
  });
};
