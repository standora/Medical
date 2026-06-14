import api from './api';
import type { PaginatedResult, PaginatedQuery } from '../types/common.types';
import type { DrugCatalog } from '../types/drug.types';

export const catalogService = {
  getList: (params?: PaginatedQuery & { keyword?: string; catalogType?: string; status?: string }) =>
    api.get<any, PaginatedResult<DrugCatalog>>('/api/v1/catalogs', { params }),
  getById: (id: string) => api.get<any, DrugCatalog>(`/api/v1/catalogs/${id}`),
  create: (data: Partial<DrugCatalog>) => api.post('/api/v1/catalogs', data),
  updateStatus: (id: string, status: string) => api.put(`/api/v1/catalogs/${id}/status`, { status }),
  update: (id: string, data: Partial<DrugCatalog>) => api.put(`/api/v1/catalogs/${id}`, data),
  delete: (id: string) => api.delete(`/api/v1/catalogs/${id}`),
};
