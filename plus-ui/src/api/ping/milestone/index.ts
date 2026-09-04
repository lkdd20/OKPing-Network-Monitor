import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PingMilestoneForm, PingMilestoneQuery, PingMilestoneVO } from './types';

export function listMilestones(query: PingMilestoneQuery): AxiosPromise<PingMilestoneVO[]> {
  return request({
    url: '/ping/milestone/list',
    method: 'get',
    params: query
  });
}

export function getMilestone(id: number | string): AxiosPromise<PingMilestoneVO> {
  return request({
    url: `/ping/milestone/${id}`,
    method: 'get'
  });
}

export function addMilestone(data: PingMilestoneForm) {
  return request({
    url: '/ping/milestone',
    method: 'post',
    data
  });
}

export function updateMilestone(data: PingMilestoneForm) {
  return request({
    url: '/ping/milestone',
    method: 'put',
    data
  });
}

export function deleteMilestones(ids: number | string | Array<number | string>) {
  return request({
    url: `/ping/milestone/${ids}`,
    method: 'delete'
  });
}
