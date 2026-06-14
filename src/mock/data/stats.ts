import type { PurchaseStats, InventoryStats, DeliveryStats, PrescriptionStats } from '../../types/stats.types';
import { countyOrgList, townOrgList } from './orgs';
import { suppliers } from './suppliers';

const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06'];

export const purchaseStats: PurchaseStats[] = months.map((period) => ({
  period,
  totalAmount: 500000 + Math.floor(Math.random() * 300000),
  orderCount: 15 + Math.floor(Math.random() * 20),
  bySupplier: suppliers.slice(0, 6).map(s => ({
    name: s.name.slice(0, 6),
    amount: 50000 + Math.floor(Math.random() * 100000),
  })),
  byOrg: [...countyOrgList, ...townOrgList].map(o => ({
    name: o.name,
    amount: 30000 + Math.floor(Math.random() * 80000),
  })),
}));

export const inventoryStats: InventoryStats = {
  totalItems: 1200 + Math.floor(Math.random() * 300),
  alertCount: 25 + Math.floor(Math.random() * 15),
  nearExpiryCount: 40 + Math.floor(Math.random() * 20),
  byOrg: [...countyOrgList, ...townOrgList].map(o => ({
    name: o.name,
    total: 50 + Math.floor(Math.random() * 50),
    alert: Math.floor(Math.random() * 8),
  })),
};

export const deliveryStats: DeliveryStats[] = months.map(period => ({
  period,
  totalOrders: 20 + Math.floor(Math.random() * 30),
  onTimeRate: Number((0.85 + Math.random() * 0.13).toFixed(2)),
  exceptionRate: Number((0.02 + Math.random() * 0.08).toFixed(2)),
  avgDeliveryHours: Number((12 + Math.random() * 24).toFixed(1)),
}));

export const prescriptionStats: PrescriptionStats[] = months.map(period => ({
  period,
  totalCount: 200 + Math.floor(Math.random() * 300),
  reviewPassRate: Number((0.88 + Math.random() * 0.10).toFixed(2)),
  byOrg: [...countyOrgList, ...townOrgList].map(o => ({
    name: o.name,
    count: 30 + Math.floor(Math.random() * 80),
  })),
}));
