import type { BaseEntity } from './common.types';

export interface DeliveryOrder extends BaseEntity {
  orderNo: string;
  deliveryType: 'TO_HOSPITAL' | 'TO_VILLAGE' | 'TO_HOME';
  status: 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION' | 'CANCELLED';
  logisticsProvider: string;
  fromOrgName: string;
  toOrgName: string;
  items: DeliveryItem[];
  tracks: DeliveryTrack[];
}

export interface DeliveryItem {
  drugId: string;
  drugName: string;
  quantity: number;
  batchNo: string;
}

export interface DeliveryTrack {
  location: string;
  timestamp: string;
  status: string;
  isException: boolean;
}

export interface ColdChainData {
  timestamp: string;
  temperature: number;
  humidity: number;
  isAbnormal: boolean;
}
