export interface PurchaseStats {
  period: string;
  totalAmount: number;
  orderCount: number;
  bySupplier: { name: string; amount: number }[];
  byOrg: { name: string; amount: number }[];
}

export interface InventoryStats {
  totalItems: number;
  alertCount: number;
  nearExpiryCount: number;
  byOrg: { name: string; total: number; alert: number }[];
}

export interface DeliveryStats {
  period: string;
  totalOrders: number;
  onTimeRate: number;
  exceptionRate: number;
  avgDeliveryHours: number;
}

export interface PrescriptionStats {
  period: string;
  totalCount: number;
  reviewPassRate: number;
  byOrg: { name: string; count: number }[];
}
