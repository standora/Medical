import type { SettlementOrder, Reconciliation } from '../../types/settlement.types';
import { orgs } from './orgs';
import { drugs } from './drugs';
import { nextId, randomDate, randomInt, randomItems } from '../utils';

const activeDrugs = drugs.filter(d => d.status === 'ACTIVE');

const settlementModes: SettlementOrder['settlementMode'][] = ['CENTRALIZED', 'INDEPENDENT'];
const settlementDimensions: SettlementOrder['settlementDimension'][] = ['PRODUCT', 'WAREHOUSE', 'SUPPLIER', 'PERIOD'];
const settlementStatuses: SettlementOrder['status'][] = ['PENDING', 'CONFIRMED', 'PAID'];

export const settlementOrders: SettlementOrder[] = Array.from({ length: 24 }, (_, i) => {
  const selectedDrugs = randomItems(activeDrugs, randomInt(3, 8));
  const orgList = randomItems(orgs, randomInt(1, 5));
  const items = selectedDrugs.flatMap(d =>
    orgList.map(org => {
      const qty = randomInt(10, 200);
      const price = randomInt(5, 150);
      return {
        drugId: d.id,
        drugName: d.tradeName,
        quantity: qty,
        unitPrice: price,
        amount: qty * price,
        orgId: org.id,
        orgName: org.name,
      };
    })
  );
  const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);

  return {
    id: nextId(),
    orderNo: `STL-2025-${String(i + 1).padStart(4, '0')}`,
    settlementMode: settlementModes[i % settlementModes.length],
    settlementDimension: settlementDimensions[i % settlementDimensions.length],
    period: `2025-${String((i % 6) + 1).padStart(2, '0')}`,
    totalAmount,
    status: settlementStatuses[i % settlementStatuses.length],
    items,
    createdAt: randomDate('2025-01-01', '2025-05-31') + ' 10:00:00',
    updatedAt: randomDate('2025-06-01', '2025-06-14') + ' 16:00:00',
  };
});

// 对账记录
const confirmStatuses: Reconciliation['confirmStatus'][] = ['PENDING', 'CONFIRMED', 'DISPUTED'];
const diffReasons = [
  '配送数量与订单不一致',
  '药品批号与约定不符',
  '价格调整未同步',
  '退货金额未扣除',
  '赠品未计入',
  '折扣计算差异',
];

export const reconciliations: Reconciliation[] = Array.from({ length: 18 }, (_, i) => ({
  id: nextId(),
  orderNo: `RCN-2025-${String(i + 1).padStart(4, '0')}`,
  diffAmount: randomInt(-5000, 5000),
  diffReason: diffReasons[i % diffReasons.length],
  confirmStatus: confirmStatuses[i % confirmStatuses.length],
  createdAt: randomDate('2025-02-01', '2025-06-01') + ' 11:00:00',
  updatedAt: randomDate('2025-06-01', '2025-06-14') + ' 14:00:00',
}));
