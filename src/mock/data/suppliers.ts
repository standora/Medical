import type { Supplier } from '../../types/purchase.types';
import { nextId, randomDate, randomFloat } from '../utils';

const supplierNames = [
  '扬子江药业集团有限公司',
  '江苏恒瑞医药股份有限公司',
  '石药集团有限公司',
  '华北制药股份有限公司',
  '齐鲁制药有限公司',
  '正大天晴药业集团股份有限公司',
  '云南白药集团股份有限公司',
  '华润三九医药股份有限公司',
  '同仁堂股份有限公司',
  '广州白云山医药集团股份有限公司',
  '步长制药股份有限公司',
  '以岭药业股份有限公司',
  '康美药业股份有限公司',
  '天士力医药集团股份有限公司',
  '济川药业集团有限公司',
  '贵州百灵企业集团制药股份有限公司',
  '香雪制药股份有限公司',
  '桂林三金药业股份有限公司',
  '江中药业股份有限公司',
  '太极集团有限公司',
  '仁和药业股份有限公司',
  '哈药集团股份有限公司',
];

export const suppliers: Supplier[] = supplierNames.map((name, i) => ({
  id: nextId(),
  code: `SUP-${String(i + 1).padStart(4, '0')}`,
  name,
  qualificationExpiry: randomDate('2025-06-01', '2027-12-31'),
  ratingScore: randomFloat(3.5, 5.0, 1),
  status: i < 2 ? 'INACTIVE' as const : 'ACTIVE' as const,
  createdAt: randomDate('2022-01-01', '2023-12-31') + ' 09:00:00',
  updatedAt: randomDate('2024-01-01', '2025-06-01') + ' 14:00:00',
}));
