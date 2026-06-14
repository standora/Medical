import api from './api';
import type { PaginatedResult } from '../types/common.types';
import type { SettlementOrder, Reconciliation } from '../types/settlement.types';

export const settlementService = {
  getOrders: () => api.get<any, PaginatedResult<SettlementOrder>>('/api/v1/settlement/orders'),
  getReconciliations: () => api.get<any, PaginatedResult<Reconciliation>>('/api/v1/settlement/reconciliation'),
  updateOrder: (id: string, data: Partial<SettlementOrder>) => api.put(`/api/v1/settlement/orders/${id}`, data),
  updateReconciliation: (id: string, data: Partial<Reconciliation>) => api.put(`/api/v1/settlement/reconciliation/${id}`, data),
};
