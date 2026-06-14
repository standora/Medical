import api from './api';
import type { PaginatedResult } from '../types/common.types';
import type { Inventory, InventoryAlert, ZeroInventoryConfig, AutoReplenishment } from '../types/inventory.types';

export const inventoryService = {
  getList: (params?: { orgId?: string; page?: number; pageSize?: number }) =>
    api.get<any, PaginatedResult<Inventory>>('/api/v1/inventory', { params }),
  getAlerts: () => api.get<any, PaginatedResult<InventoryAlert>>('/api/v1/inventory/alerts'),
  getZeroInventoryConfigs: () => api.get<any, ZeroInventoryConfig[]>('/api/v1/inventory/zero-inventory/status'),
  getAutoReplenishments: () => api.get<any, PaginatedResult<AutoReplenishment>>('/api/v1/inventory/auto-replenishment'),
  updateAlert: (id: string, data: Partial<InventoryAlert>) => api.put(`/api/v1/inventory/alerts/${id}`, data),
  createZeroInventoryConfig: (data: Partial<ZeroInventoryConfig>) => api.post('/api/v1/inventory/zero-inventory/config', data),
  updateZeroInventoryConfig: (id: string, data: Partial<ZeroInventoryConfig>) => api.put(`/api/v1/inventory/zero-inventory/config/${id}`, data),
  deleteZeroInventoryConfig: (id: string) => api.delete(`/api/v1/inventory/zero-inventory/config/${id}`),
  updateAutoReplenishment: (id: string, data: Partial<AutoReplenishment>) => api.put(`/api/v1/inventory/auto-replenishment/${id}`, data),
  createTransfer: (data: any) => api.post('/api/v1/inventory/transfer', data),
  updateTransfer: (id: string, data: any) => api.put(`/api/v1/inventory/transfer/${id}`, data),
};
