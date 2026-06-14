import type { BaseEntity } from './common.types';

export const OrgLevel = {
  COUNTY: 'COUNTY',
  TOWN: 'TOWN',
  VILLAGE: 'VILLAGE',
} as const;

export type OrgLevel = (typeof OrgLevel)[keyof typeof OrgLevel];

export interface Organization extends BaseEntity {
  code: string;
  name: string;
  level: OrgLevel;
  parentId?: string;
  address?: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
