import type { BaseEntity } from './common.types';

export interface DrugInteractionRule extends BaseEntity {
  ruleType: 'CONTRAINDICATION' | 'DOSAGE' | 'DUPLICATE' | 'THERAPY';
  drugCombination: string[];
  interceptLevel: 'WARNING' | 'BLOCK';
  message: string;
  enabled: boolean;
}

export interface DrugTrace extends BaseEntity {
  traceCode: string;
  drugId: string;
  drugName: string;
  nodes: DrugTraceNode[];
}

export interface DrugTraceNode {
  node: string;
  timestamp: string;
  operator: string;
  location: string;
}
