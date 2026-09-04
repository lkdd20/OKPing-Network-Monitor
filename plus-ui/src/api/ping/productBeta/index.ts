import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PingProductBetaQuery, PingProductBetaSignupVO, PingProductBetaStatusForm, PingProductBetaSummary } from './types';

export function listProductBetaSignups(query: PingProductBetaQuery): AxiosPromise<PingProductBetaSignupVO[]> {
  return request({
    url: '/ping/product-beta/list',
    method: 'get',
    params: query
  });
}

export function getProductBetaSummary(): AxiosPromise<PingProductBetaSummary> {
  return request({
    url: '/ping/product-beta/summary',
    method: 'get'
  });
}

export function updateProductBetaStatus(data: PingProductBetaStatusForm) {
  return request({
    url: '/ping/product-beta/status',
    method: 'put',
    data
  });
}
