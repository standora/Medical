import type { BaseEntity } from './common.types';

export interface Prescription extends BaseEntity {
  prescriptionNo: string;
  orgId: string;
  orgName: string;
  doctorName: string;
  patientName: string;
  patientId: string;
  prescriptionType: 'WESTERN' | 'CHINESE';
  status: 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'REVIEW_PASSED' | 'REVIEW_REJECTED' | 'DISPENSING' | 'DISPENSED' | 'DELIVERING' | 'COMPLETED' | 'CANCELLED';
  items: PrescriptionItem[];
  reviewResult?: PrescriptionReview;
  flowRecords: PrescriptionFlowRecord[];
}

export interface PrescriptionItem {
  drugId: string;
  drugName: string;
  dosage: string;
  usage: string;
  frequency: string;
  days: number;
}

export interface PrescriptionReview {
  reviewType: 'SYSTEM' | 'MANUAL';
  result: 'PASSED' | 'REJECTED';
  opinion: string;
  rejectedRules?: string[];
}

export interface PrescriptionFlowRecord {
  node: string;
  timestamp: string;
  operator: string;
  status: string;
}
