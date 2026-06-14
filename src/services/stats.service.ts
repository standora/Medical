import api from './api';
import type { PurchaseStats, InventoryStats, DeliveryStats, PrescriptionStats } from '../types/stats.types';

export const statsService = {
  getPurchaseStats: () => api.get<any, PurchaseStats>('/api/v1/stats/purchase'),
  getInventoryStats: () => api.get<any, InventoryStats>('/api/v1/stats/inventory'),
  getDeliveryStats: () => api.get<any, DeliveryStats>('/api/v1/stats/delivery'),
  getPrescriptionStats: () => api.get<any, PrescriptionStats>('/api/v1/stats/prescription'),
};
