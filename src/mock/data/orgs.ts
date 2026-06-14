import type { Organization } from '../../types/org.types';
import { OrgLevel } from '../../types/org.types';
import { nextId, randomDate } from '../utils';

const countyHospitals = [
  { name: '县人民医院', code: 'ORG-COUNTY-001', address: '城关镇人民路1号', phone: '0570-6012345' },
  { name: '县中医院', code: 'ORG-COUNTY-002', address: '城关镇健康路88号', phone: '0570-6023456' },
];

const townHealthCenters = [
  { name: '城关镇卫生院', code: 'ORG-TOWN-001', address: '城关镇中心街12号', phone: '0570-6100001' },
  { name: '太平镇卫生院', code: 'ORG-TOWN-002', address: '太平镇太平路56号', phone: '0570-6200001' },
  { name: '白鹤镇卫生院', code: 'ORG-TOWN-003', address: '白鹤镇白鹤大道33号', phone: '0570-6300001' },
  { name: '石桥镇卫生院', code: 'ORG-TOWN-004', address: '石桥镇石桥路78号', phone: '0570-6400001' },
  { name: '龙亭镇卫生院', code: 'ORG-TOWN-005', address: '龙亭镇龙亭路99号', phone: '0570-6500001' },
];

const villageClinics = [
  // 城关镇
  { name: '城关镇东门村卫生室', code: 'ORG-VILLAGE-001', townIdx: 0 },
  { name: '城关镇南门村卫生室', code: 'ORG-VILLAGE-002', townIdx: 0 },
  { name: '城关镇北门村卫生室', code: 'ORG-VILLAGE-003', townIdx: 0 },
  // 太平镇
  { name: '太平镇太平村卫生室', code: 'ORG-VILLAGE-004', townIdx: 1 },
  { name: '太平镇永安村卫生室', code: 'ORG-VILLAGE-005', townIdx: 1 },
  { name: '太平镇新民村卫生室', code: 'ORG-VILLAGE-006', townIdx: 1 },
  // 白鹤镇
  { name: '白鹤镇白鹤村卫生室', code: 'ORG-VILLAGE-007', townIdx: 2 },
  { name: '白鹤镇鹤溪村卫生室', code: 'ORG-VILLAGE-008', townIdx: 2 },
  { name: '白鹤镇云山村卫生室', code: 'ORG-VILLAGE-009', townIdx: 2 },
  // 石桥镇
  { name: '石桥镇石桥村卫生室', code: 'ORG-VILLAGE-010', townIdx: 3 },
  { name: '石桥镇河湾村卫生室', code: 'ORG-VILLAGE-011', townIdx: 3 },
  { name: '石桥镇青山村卫生室', code: 'ORG-VILLAGE-012', townIdx: 3 },
  // 龙亭镇
  { name: '龙亭镇龙亭村卫生室', code: 'ORG-VILLAGE-013', townIdx: 4 },
  { name: '龙亭镇亭头村卫生室', code: 'ORG-VILLAGE-014', townIdx: 4 },
  { name: '龙亭镇金溪村卫生室', code: 'ORG-VILLAGE-015', townIdx: 4 },
];

const countyOrgs: Organization[] = countyHospitals.map((h) => ({
  id: nextId(),
  code: h.code,
  name: h.name,
  level: OrgLevel.COUNTY,
  parentId: undefined,
  address: h.address,
  contactPhone: h.phone,
  status: 'ACTIVE',
  createdAt: randomDate('2023-01-01', '2023-06-30') + ' 08:00:00',
  updatedAt: randomDate('2024-01-01', '2025-06-01') + ' 10:30:00',
}));

const townOrgs: Organization[] = townHealthCenters.map((t) => ({
  id: nextId(),
  code: t.code,
  name: t.name,
  level: OrgLevel.TOWN,
  parentId: countyOrgs[0].id,
  address: t.address,
  contactPhone: t.phone,
  status: 'ACTIVE',
  createdAt: randomDate('2023-01-01', '2023-06-30') + ' 09:00:00',
  updatedAt: randomDate('2024-01-01', '2025-06-01') + ' 11:00:00',
}));

const villageOrgs: Organization[] = villageClinics.map((v) => ({
  id: nextId(),
  code: v.code,
  name: v.name,
  level: OrgLevel.VILLAGE,
  parentId: townOrgs[v.townIdx].id,
  address: v.name.replace('卫生室', '村'),
  contactPhone: `0570-66${String(villageClinics.indexOf(v) + 1).padStart(4, '0')}`,
  status: 'ACTIVE',
  createdAt: randomDate('2023-03-01', '2023-09-30') + ' 10:00:00',
  updatedAt: randomDate('2024-03-01', '2025-06-01') + ' 14:00:00',
}));

export const orgs: Organization[] = [...countyOrgs, ...townOrgs, ...villageOrgs];

export const countyOrgList = countyOrgs;
export const townOrgList = townOrgs;
export const villageOrgList = villageOrgs;
