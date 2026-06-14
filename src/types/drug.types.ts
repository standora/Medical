import type { BaseEntity } from './common.types';

export const DrugCatalogType = {
  ESSENTIAL: 'ESSENTIAL',
  INSURANCE: 'INSURANCE',
  CENTRALIZED: 'CENTRALIZED',
  KEY_MONITOR: 'KEY_MONITOR',
  ANTIBIOTIC: 'ANTIBIOTIC',
} as const;

export type DrugCatalogType = (typeof DrugCatalogType)[keyof typeof DrugCatalogType];

export interface DrugCatalog extends BaseEntity {
  code: string;
  genericName: string;
  tradeName: string;
  dosageForm: string;
  specification: string;
  manufacturer: string;
  catalogTypes: DrugCatalogType[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CatalogOrgRelation extends BaseEntity {
  catalogId: string;
  orgId: string;
  permissionLevel: 'FULL' | 'PARTIAL' | 'VIEW_ONLY';
}

export interface CatalogChangeApproval extends BaseEntity {
  catalogId: string;
  changeType: 'ADD' | 'REMOVE' | 'MODIFY';
  changeContent: Record<string, unknown>;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver?: string;
}
