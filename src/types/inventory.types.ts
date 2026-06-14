import type { BaseEntity } from './common.types';
import type { AlertLevel, AlertType } from '../constants/alert-level';

export interface Inventory extends BaseEntity {
  orgId: string;
  orgName: string;
  drugId: string;
  drugName: string;
  batchNo: string;
  quantity: number;
  availableQty: number;
  lockedQty: number;
  expiryDate?: string;
  upperLimit: number;
  lowerLimit: number;
}

export interface InventoryAlert extends BaseEntity {
  orgId: string;
  orgName: string;
  drugId: string;
  drugName: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  message: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface InventoryTransfer extends BaseEntity {
  fromOrgId: string;
  fromOrgName: string;
  toOrgId: string;
  toOrgName: string;
  drugId: string;
  drugName: string;
  quantity: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  isSmartRecommended: boolean;
}

export interface ZeroInventoryConfig extends BaseEntity {
  villageOrgId: string;
  villageOrgName: string;
  hostOrgId: string;
  hostOrgName: string;
  hostMode: 'FULL_HOST' | 'PARTIAL_HOST';
  enabled: boolean;
}

export interface AutoReplenishment extends BaseEntity {
  orgId: string;
  orgName: string;
  drugId: string;
  drugName: string;
  suggestedQty: number;
  triggerType: 'THRESHOLD' | 'SCHEDULED';
  confidence: number;
  reason: string;
  confirmStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  confirmedBy?: string;
}
