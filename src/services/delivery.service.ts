import api from './api';
import type { PaginatedResult } from '../types/common.types';
import type { DeliveryOrder, ColdChainData } from '../types/delivery.types';

export const deliveryService = {
  getOrders: () => api.get<any, PaginatedResult<DeliveryOrder>>('/api/v1/delivery/orders'),
  getColdChainData: () => api.get<any, ColdChainData[]>('/api/v1/delivery/cold-chain'),
  createOrder: (data: Partial<DeliveryOrder>) => api.post('/api/v1/delivery/orders', data),
  updateOrder: (id: string, data: Partial<DeliveryOrder>) => api.put(`/api/v1/delivery/orders/${id}`, data),
};
