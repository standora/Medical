import type { BaseEntity } from './common.types';

export interface SettlementOrder extends BaseEntity {
  orderNo: string;
  settlementMode: 'CENTRALIZED' | 'INDEPENDENT';
  settlementDimension: 'PRODUCT' | 'WAREHOUSE' | 'SUPPLIER' | 'PERIOD';
  period: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  items: SettlementItem[];
}

export interface SettlementItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  orgId: string;
  orgName: string;
}

export interface Reconciliation extends BaseEntity {
  orderNo: string;
  diffAmount: number;
  diffReason: string;
  confirmStatus: 'PENDING' | 'CONFIRMED' | 'DISPUTED';
}
