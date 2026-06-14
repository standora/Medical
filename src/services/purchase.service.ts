import api from './api';
import type { PaginatedResult } from '../types/common.types';
import type { PurchasePlan, PurchaseOrder, CentralizedProcurementStats } from '../types/purchase.types';

export const purchaseService = {
  getPlans: () => api.get<any, PaginatedResult<PurchasePlan>>('/api/v1/purchase/plans'),
  getOrders: () => api.get<any, PaginatedResult<PurchaseOrder>>('/api/v1/purchase/orders'),
  getCentralizedStats: () => api.get<any, CentralizedProcurementStats[]>('/api/v1/purchase/centralized-procurement/stats'),
  createPlan: (data: Partial<PurchasePlan>) => api.post('/api/v1/purchase/plans', data),
  updatePlan: (id: string, data: Partial<PurchasePlan>) => api.put(`/api/v1/purchase/plans/${id}`, data),
  deletePlan: (id: string) => api.delete(`/api/v1/purchase/plans/${id}`),
  createOrder: (data: Partial<PurchaseOrder>) => api.post('/api/v1/purchase/orders', data),
  updateOrder: (id: string, data: Partial<PurchaseOrder>) => api.put(`/api/v1/purchase/orders/${id}`, data),
  receiveOrder: (id: string) => api.put(`/api/v1/purchase/orders/${id}/receive`),
};
