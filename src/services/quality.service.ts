import api from './api';
import type { PaginatedResult } from '../types/common.types';
import type { DrugInteractionRule, DrugTrace } from '../types/quality.types';

export const qualityService = {
  getRules: () => api.get<any, PaginatedResult<DrugInteractionRule>>('/api/v1/quality/rules'),
  getTraces: () => api.get<any, DrugTrace[]>('/api/v1/quality/traces'),
  createRule: (data: Partial<DrugInteractionRule>) => api.post('/api/v1/quality/rules', data),
  updateRule: (id: string, data: Partial<DrugInteractionRule>) => api.put(`/api/v1/quality/rules/${id}`, data),
  deleteRule: (id: string) => api.delete(`/api/v1/quality/rules/${id}`),
};
