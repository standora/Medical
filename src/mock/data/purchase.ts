import type { PurchasePlan, PurchaseOrder, PurchaseOrderItem, CentralizedProcurementStats } from '../../types/purchase.types';
import { orgs } from './orgs';
import { drugs } from './drugs';
import { suppliers } from './suppliers';
import { nextId, randomDate, randomInt, randomItem, randomItems } from '../utils';

const activeDrugs = drugs.filter(d => d.status === 'ACTIVE');
const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE');
const townAndCountyOrgs = orgs.filter(o => o.level !== 'VILLAGE');

// 采购计划
const planStatuses: PurchasePlan['status'][] = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'];

export const purchasePlans: PurchasePlan[] = Array.from({ length: 20 }, (_, i) => {
  const org = randomItem(townAndCountyOrgs);
  const selectedDrugs = randomItems(activeDrugs, randomInt(3, 8));
  const periodStart = randomDate('2025-01-01', '2025-06-01');
  const periodEnd = randomDate('2025-07-01', '2025-12-31');
  return {
    id: nextId(),
    planNo: `PLAN-2025-${String(i + 1).padStart(4, '0')}`,
    orgId: org.id,
    orgName: org.name,
    periodStart,
    periodEnd,
    status: planStatuses[i % planStatuses.length],
    items: selectedDrugs.map(d => ({
      drugId: d.id,
      drugName: d.tradeName,
      requestedQty: randomInt(50, 500),
      suggestedQty: randomInt(60, 600),
      isAiRecommended: Math.random() > 0.5,
    })),
    createdBy: `user-${String(randomInt(1, 20)).padStart(3, '0')}`,
    createdAt: randomDate('2025-01-01', '2025-05-31') + ' 09:00:00',
    updatedAt: randomDate('2025-06-01', '2025-06-14') + ' 10:00:00',
  };
});

// 采购订单
const orderStatuses: PurchaseOrder['status'][] = [
  'PENDING_REVIEW', 'APPROVED', 'PLACED', 'SHIPPED', 'RECEIVED', 'CANCELLED',
];

export const purchaseOrders: PurchaseOrder[] = Array.from({ length: 55 }, (_, i) => {
  const supplier = randomItem(activeSuppliers);
  const selectedDrugs = randomItems(activeDrugs, randomInt(2, 6));
  const items: PurchaseOrderItem[] = selectedDrugs.map(d => {
    const qty = randomInt(20, 300);
    const price = randomInt(5, 200);
    return { drugId: d.id, drugName: d.tradeName, quantity: qty, unitPrice: price, amount: qty * price };
  });
  const totalAmount = items.reduce((sum, it) => sum + it.amount, 0);
  const status = orderStatuses[i % orderStatuses.length];
  return {
    id: nextId(),
    orderNo: `PO-2025-${String(i + 1).padStart(4, '0')}`,
    supplierId: supplier.id,
    supplierName: supplier.name,
    totalAmount,
    status,
    isOverdue: status === 'PLACED' || status === 'PENDING_REVIEW' ? Math.random() > 0.7 : false,
    items,
    createdAt: randomDate('2025-01-01', '2025-05-31') + ' 10:00:00',
    updatedAt: randomDate('2025-06-01', '2025-06-14') + ' 15:00:00',
  };
});

// 集中采购统计
export const centralizedStats: CentralizedProcurementStats[] = activeDrugs
  .filter(d => d.catalogTypes.includes('CENTRALIZED' as any))
  .slice(0, 30)
  .map((d) => {
    const agreed = randomInt(100, 1000);
    const actual = randomInt(Math.floor(agreed * 0.6), agreed);
    return {
      id: nextId(),
      drugId: d.id,
      drugName: d.tradeName,
      agreedQty: agreed,
      actualQty: actual,
      executionRate: Number(((actual / agreed) * 100).toFixed(1)),
      surplusAmount: (agreed - actual) * randomInt(5, 50),
      createdAt: randomDate('2025-01-01', '2025-03-31') + ' 08:00:00',
      updatedAt: randomDate('2025-04-01', '2025-06-01') + ' 10:00:00',
    };
  });
