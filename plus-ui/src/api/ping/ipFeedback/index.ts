import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PingIpFeedbackQuery, PingIpFeedbackReviewForm, PingIpFeedbackVO } from './types';

export const listPingIpFeedback = (query?: PingIpFeedbackQuery): AxiosPromise<PingIpFeedbackVO[]> => {
  return request({
    url: '/ping/ip-feedback/list',
    method: 'get',
    params: query
  });
};

export const reviewPingIpFeedback = (data: PingIpFeedbackReviewForm) => {
  return request({
    url: '/ping/ip-feedback/review',
    method: 'post',
    data
  });
};
