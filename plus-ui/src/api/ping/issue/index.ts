import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type {
  PingIssueAdminMessageForm,
  PingIssueMessageVisibilityForm,
  PingIssueQuery,
  PingIssueReviewForm,
  PingIssueVO
} from './types';

export function listIssues(query: PingIssueQuery): AxiosPromise<PingIssueVO[]> {
  return request({
    url: '/ping/issues/list',
    method: 'get',
    params: query
  });
}

export function getIssue(id: string): AxiosPromise<PingIssueVO> {
  return request({
    url: `/ping/issues/${id}`,
    method: 'get'
  });
}

export function reviewIssue(data: PingIssueReviewForm) {
  return request({
    url: '/ping/issues/review',
    method: 'put',
    data
  });
}

export function addIssueMessage(id: string, data: PingIssueAdminMessageForm) {
  return request({
    url: `/ping/issues/${id}/messages`,
    method: 'post',
    data
  });
}

export function updateIssueMessageVisibility(data: PingIssueMessageVisibilityForm) {
  return request({
    url: '/ping/issues/messages/visibility',
    method: 'put',
    data
  });
}
