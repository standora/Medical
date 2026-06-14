import { DrugCatalogType } from '../types/drug.types';

export const DRUG_CATALOG_TYPE_LABELS: Record<DrugCatalogType, string> = {
  [DrugCatalogType.ESSENTIAL]: '国家基本药物',
  [DrugCatalogType.INSURANCE]: '医保目录药品',
  [DrugCatalogType.CENTRALIZED]: '集采药品',
  [DrugCatalogType.KEY_MONITOR]: '重点监控药品',
  [DrugCatalogType.ANTIBIOTIC]: '抗菌药物',
} as const;
