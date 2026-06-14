import api from './api';
import type { PaginatedResult } from '../types/common.types';
import type { Prescription } from '../types/prescription.types';

export const prescriptionService = {
  getList: () => api.get<any, PaginatedResult<Prescription>>('/api/v1/prescriptions'),
  create: (data: Partial<Prescription>) => api.post('/api/v1/prescriptions', data),
  submit: (id: string) => api.put(`/api/v1/prescriptions/${id}`, { status: 'SUBMITTED' }),
  review: (id: string, data: any) => api.put(`/api/v1/prescriptions/${id}/review`, data),
  deletePrescription: (id: string) => api.delete(`/api/v1/prescriptions/${id}`),
};
