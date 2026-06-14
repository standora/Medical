import type { Inventory, InventoryAlert, ZeroInventoryConfig, AutoReplenishment } from '../../types/inventory.types';
import { AlertLevel, AlertType } from '../../constants/alert-level';
import { orgs, villageOrgList, townOrgList } from './orgs';
import { drugs } from './drugs';
import { nextId, randomDate, randomInt, randomItem, randomItems } from '../utils';

const activeDrugs = drugs.filter(d => d.status === 'ACTIVE');

// 库存数据：每个机构50+药品库存项
export const inventories: Inventory[] = orgs.flatMap(org => {
  const orgDrugs = randomItems(activeDrugs, randomInt(50, 70));
  return orgDrugs.map((drug) => {
    const qty = randomInt(0, 500);
    const locked = randomInt(0, Math.floor(qty * 0.3));
    const upper = randomInt(200, 800);
    const lower = randomInt(10, 50);
    return {
      id: nextId(),
      orgId: org.id,
      orgName: org.name,
      drugId: drug.id,
      drugName: drug.tradeName,
      batchNo: `BN${randomInt(2025001, 2025999)}`,
      quantity: qty,
      availableQty: qty - locked,
      lockedQty: locked,
      expiryDate: randomDate('2025-07-01', '2027-12-31'),
      upperLimit: upper,
      lowerLimit: lower,
      createdAt: randomDate('2024-01-01', '2025-03-31') + ' 08:00:00',
      updatedAt: randomDate('2025-04-01', '2025-06-14') + ' 10:00:00',
    };
  });
});

// 库存预警项（25+）
const alertTypes: AlertType[] = [AlertType.UPPER_LIMIT, AlertType.LOWER_LIMIT, AlertType.NEAR_EXPIRY, AlertType.STOCKOUT_PREDICTION];
const alertLevels: AlertLevel[] = [AlertLevel.INFO, AlertLevel.WARNING, AlertLevel.CRITICAL];
const alertStatuses: InventoryAlert['status'][] = ['PENDING', 'ACKNOWLEDGED', 'RESOLVED'];
const alertMessages: Record<AlertType, string> = {
  [AlertType.UPPER_LIMIT]: '库存超过上限，请暂停采购',
  [AlertType.LOWER_LIMIT]: '库存低于下限，请及时补货',
  [AlertType.NEAR_EXPIRY]: '药品即将过期，请及时处理',
  [AlertType.STOCKOUT_PREDICTION]: '预计近期缺货，建议提前补货',
};

export const inventoryAlerts: InventoryAlert[] = Array.from({ length: 28 }, (_, i) => {
  const org = randomItem(orgs);
  const drug = randomItem(activeDrugs);
  const alertType = alertTypes[i % alertTypes.length];
  return {
    id: nextId(),
    orgId: org.id,
    orgName: org.name,
    drugId: drug.id,
    drugName: drug.tradeName,
    alertType,
    alertLevel: alertLevels[i % alertLevels.length],
    message: alertMessages[alertType],
    status: alertStatuses[i % alertStatuses.length],
    createdAt: randomDate('2025-05-01', '2025-06-14') + ' 08:00:00',
    updatedAt: randomDate('2025-06-01', '2025-06-14') + ' 16:00:00',
  };
});

// 零库存托管配置（15个村卫生室）
export const zeroInventoryConfigs: ZeroInventoryConfig[] = villageOrgList.map((village, i) => {
  const parentTown = townOrgList.find(t => t.id === village.parentId) || townOrgList[0];
  return {
    id: nextId(),
    villageOrgId: village.id,
    villageOrgName: village.name,
    hostOrgId: parentTown.id,
    hostOrgName: parentTown.name,
    hostMode: i % 3 === 0 ? 'FULL_HOST' as const : 'PARTIAL_HOST' as const,
    enabled: i < 13,
    createdAt: randomDate('2024-01-01', '2024-06-30') + ' 09:00:00',
    updatedAt: randomDate('2025-01-01', '2025-06-01') + ' 11:00:00',
  };
});

// 自动补货记录（12+）
const triggerTypes: AutoReplenishment['triggerType'][] = ['THRESHOLD', 'SCHEDULED'];
const confirmStatuses: AutoReplenishment['confirmStatus'][] = ['PENDING', 'CONFIRMED', 'REJECTED'];

export const autoReplenishments: AutoReplenishment[] = Array.from({ length: 15 }, (_, i) => {
  const org = randomItem(villageOrgList);
  const drug = randomItem(activeDrugs);
  return {
    id: nextId(),
    orgId: org.id,
    orgName: org.name,
    drugId: drug.id,
    drugName: drug.tradeName,
    suggestedQty: randomInt(20, 100),
    triggerType: triggerTypes[i % triggerTypes.length],
    confidence: Number((0.7 + Math.random() * 0.28).toFixed(2)),
    reason: i % 2 === 0 ? '库存低于安全阈值，AI建议补货' : '按周期补货计划触发',
    confirmStatus: confirmStatuses[i % confirmStatuses.length],
    confirmedBy: i % 3 === 0 ? `user-${String(randomInt(1, 10)).padStart(3, '0')}` : undefined,
    createdAt: randomDate('2025-05-01', '2025-06-14') + ' 07:00:00',
    updatedAt: randomDate('2025-06-01', '2025-06-14') + ' 12:00:00',
  };
});
