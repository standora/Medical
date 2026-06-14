import type { BaseEntity } from './common.types';

export interface PurchasePlan extends BaseEntity {
  planNo: string;
  orgId: string;
  orgName: string;
  periodStart: string;
  periodEnd: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  items: PurchasePlanItem[];
  createdBy: string;
}

export interface PurchasePlanItem {
  drugId: string;
  drugName: string;
  requestedQty: number;
  suggestedQty?: number;
  isAiRecommended: boolean;
}

export interface PurchaseOrder extends BaseEntity {
  orderNo: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PLACED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  isOverdue: boolean;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  qualificationExpiry: string;
  ratingScore: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CentralizedProcurementStats extends BaseEntity {
  drugId: string;
  drugName: string;
  agreedQty: number;
  actualQty: number;
  executionRate: number;
  surplusAmount: number;
}
