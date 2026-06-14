import { http, HttpResponse } from 'msw';
import { drugs } from './data/drugs';
import { orgs } from './data/orgs';
import { suppliers } from './data/suppliers';
import { purchaseOrders, purchasePlans, centralizedStats } from './data/purchase';
import { inventories, inventoryAlerts, zeroInventoryConfigs, autoReplenishments } from './data/inventory';
import { deliveryOrders, coldChainData } from './data/delivery';
import { settlementOrders, reconciliations } from './data/settlement';
import { prescriptions } from './data/prescription';
import { drugInteractionRules, drugTraces } from './data/quality';
import { purchaseStats, inventoryStats, deliveryStats, prescriptionStats } from './data/stats';
import { nextId, now, paginate } from './utils';
import type { InventoryTransfer } from '../types/inventory.types';

// 调拨单（初始为空，运行时动态添加）
const inventoryTransfers: InventoryTransfer[] = [];

export const handlers = [
  // ==================== 目录 ====================
  http.get('/api/v1/catalogs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 20);
    const keyword = url.searchParams.get('keyword') || '';
    const catalogType = url.searchParams.get('catalogType') || '';
    let filtered = drugs;
    if (keyword) filtered = filtered.filter(d => d.genericName.includes(keyword) || d.code.includes(keyword));
    if (catalogType) filtered = filtered.filter(d => d.catalogTypes.includes(catalogType as any));
    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),
  http.post('/api/v1/catalogs', async ({ request }) => {
    const body = await request.json() as any;
    const newDrug = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    drugs.push(newDrug);
    return HttpResponse.json(newDrug, { status: 201 });
  }),
  http.put('/api/v1/catalogs/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = drugs.findIndex(d => d.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    drugs[index] = { ...drugs[index], ...body, id: drugs[index].id, createdAt: drugs[index].createdAt, updatedAt: now() };
    return HttpResponse.json(drugs[index]);
  }),
  http.put('/api/v1/catalogs/:id/status', async ({ params, request }) => {
    const { id } = params;
    const { status } = await request.json() as { status: string };
    const index = drugs.findIndex(d => d.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    drugs[index] = { ...drugs[index], status: status as any, updatedAt: now() };
    return HttpResponse.json(drugs[index]);
  }),
  http.delete('/api/v1/catalogs/:id', ({ params }) => {
    const { id } = params;
    const index = drugs.findIndex(d => d.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    drugs.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // 机构
  http.get('/api/v1/orgs', () => HttpResponse.json(orgs)),

  // 供应商
  http.get('/api/v1/suppliers', () => HttpResponse.json(paginate(suppliers))),

  // ==================== 采购 ====================
  http.get('/api/v1/purchase/plans', () => HttpResponse.json(paginate(purchasePlans))),
  http.post('/api/v1/purchase/plans', async ({ request }) => {
    const body = await request.json() as any;
    const newPlan = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    purchasePlans.push(newPlan);
    return HttpResponse.json(newPlan, { status: 201 });
  }),
  http.put('/api/v1/purchase/plans/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = purchasePlans.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    purchasePlans[index] = { ...purchasePlans[index], ...body, id: purchasePlans[index].id, createdAt: purchasePlans[index].createdAt, updatedAt: now() };
    return HttpResponse.json(purchasePlans[index]);
  }),
  http.delete('/api/v1/purchase/plans/:id', ({ params }) => {
    const { id } = params;
    const index = purchasePlans.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    purchasePlans.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/purchase/orders', () => HttpResponse.json(paginate(purchaseOrders))),
  http.post('/api/v1/purchase/orders', async ({ request }) => {
    const body = await request.json() as any;
    const newOrder = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    purchaseOrders.push(newOrder);
    return HttpResponse.json(newOrder, { status: 201 });
  }),
  http.put('/api/v1/purchase/orders/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = purchaseOrders.findIndex(o => o.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    purchaseOrders[index] = { ...purchaseOrders[index], ...body, id: purchaseOrders[index].id, createdAt: purchaseOrders[index].createdAt, updatedAt: now() };
    return HttpResponse.json(purchaseOrders[index]);
  }),
  http.put('/api/v1/purchase/orders/:id/receive', ({ params }) => {
    const { id } = params;
    const index = purchaseOrders.findIndex(o => o.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    purchaseOrders[index] = { ...purchaseOrders[index], status: 'RECEIVED', updatedAt: now() };
    return HttpResponse.json(purchaseOrders[index]);
  }),
  http.get('/api/v1/purchase/centralized-procurement/stats', () => HttpResponse.json(centralizedStats)),

  // ==================== 库存 ====================
  http.get('/api/v1/inventory', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 20);
    const orgId = url.searchParams.get('orgId') || '';
    let filtered = inventories;
    if (orgId) filtered = filtered.filter(i => i.orgId === orgId);
    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),
  http.get('/api/v1/inventory/alerts', () => HttpResponse.json(paginate(inventoryAlerts))),
  http.put('/api/v1/inventory/alerts/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = inventoryAlerts.findIndex(a => a.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    inventoryAlerts[index] = { ...inventoryAlerts[index], ...body, id: inventoryAlerts[index].id, createdAt: inventoryAlerts[index].createdAt, updatedAt: now() };
    return HttpResponse.json(inventoryAlerts[index]);
  }),
  http.get('/api/v1/inventory/zero-inventory/status', () => HttpResponse.json(zeroInventoryConfigs)),
  http.post('/api/v1/inventory/zero-inventory/config', async ({ request }) => {
    const body = await request.json() as any;
    const newConfig = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    zeroInventoryConfigs.push(newConfig);
    return HttpResponse.json(newConfig, { status: 201 });
  }),
  http.put('/api/v1/inventory/zero-inventory/config/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = zeroInventoryConfigs.findIndex(c => c.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    zeroInventoryConfigs[index] = { ...zeroInventoryConfigs[index], ...body, id: zeroInventoryConfigs[index].id, createdAt: zeroInventoryConfigs[index].createdAt, updatedAt: now() };
    return HttpResponse.json(zeroInventoryConfigs[index]);
  }),
  http.delete('/api/v1/inventory/zero-inventory/config/:id', ({ params }) => {
    const { id } = params;
    const index = zeroInventoryConfigs.findIndex(c => c.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    zeroInventoryConfigs.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/inventory/auto-replenishment', () => HttpResponse.json(paginate(autoReplenishments))),
  http.put('/api/v1/inventory/auto-replenishment/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = autoReplenishments.findIndex(a => a.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    autoReplenishments[index] = { ...autoReplenishments[index], ...body, id: autoReplenishments[index].id, createdAt: autoReplenishments[index].createdAt, updatedAt: now() };
    return HttpResponse.json(autoReplenishments[index]);
  }),
  http.post('/api/v1/inventory/transfer', async ({ request }) => {
    const body = await request.json() as any;
    const newTransfer = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    inventoryTransfers.push(newTransfer);
    return HttpResponse.json(newTransfer, { status: 201 });
  }),
  http.put('/api/v1/inventory/transfer/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = inventoryTransfers.findIndex(t => t.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    inventoryTransfers[index] = { ...inventoryTransfers[index], ...body, id: inventoryTransfers[index].id, createdAt: inventoryTransfers[index].createdAt, updatedAt: now() };
    return HttpResponse.json(inventoryTransfers[index]);
  }),

  // ==================== 配送 ====================
  http.get('/api/v1/delivery/orders', () => HttpResponse.json(paginate(deliveryOrders))),
  http.post('/api/v1/delivery/orders', async ({ request }) => {
    const body = await request.json() as any;
    const newOrder = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    deliveryOrders.push(newOrder);
    return HttpResponse.json(newOrder, { status: 201 });
  }),
  http.put('/api/v1/delivery/orders/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = deliveryOrders.findIndex(o => o.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    deliveryOrders[index] = { ...deliveryOrders[index], ...body, id: deliveryOrders[index].id, createdAt: deliveryOrders[index].createdAt, updatedAt: now() };
    return HttpResponse.json(deliveryOrders[index]);
  }),
  http.get('/api/v1/delivery/cold-chain', () => HttpResponse.json(coldChainData)),

  // ==================== 结算 ====================
  http.get('/api/v1/settlement/orders', () => HttpResponse.json(paginate(settlementOrders))),
  http.put('/api/v1/settlement/orders/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = settlementOrders.findIndex(o => o.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    settlementOrders[index] = { ...settlementOrders[index], ...body, id: settlementOrders[index].id, createdAt: settlementOrders[index].createdAt, updatedAt: now() };
    return HttpResponse.json(settlementOrders[index]);
  }),
  http.get('/api/v1/settlement/reconciliation', () => HttpResponse.json(paginate(reconciliations))),
  http.put('/api/v1/settlement/reconciliation/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = reconciliations.findIndex(r => r.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    reconciliations[index] = { ...reconciliations[index], ...body, id: reconciliations[index].id, createdAt: reconciliations[index].createdAt, updatedAt: now() };
    return HttpResponse.json(reconciliations[index]);
  }),

  // ==================== 处方 ====================
  http.get('/api/v1/prescriptions', () => HttpResponse.json(paginate(prescriptions))),
  http.post('/api/v1/prescriptions', async ({ request }) => {
    const body = await request.json() as any;
    const newPrescription = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    prescriptions.push(newPrescription);
    return HttpResponse.json(newPrescription, { status: 201 });
  }),
  http.put('/api/v1/prescriptions/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    prescriptions[index] = { ...prescriptions[index], ...body, id: prescriptions[index].id, createdAt: prescriptions[index].createdAt, updatedAt: now() };
    return HttpResponse.json(prescriptions[index]);
  }),
  http.put('/api/v1/prescriptions/:id/review', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    prescriptions[index] = { ...prescriptions[index], reviewResult: body, updatedAt: now() };
    return HttpResponse.json(prescriptions[index]);
  }),
  http.delete('/api/v1/prescriptions/:id', ({ params }) => {
    const { id } = params;
    const index = prescriptions.findIndex(p => p.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    prescriptions.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),

  // ==================== 质控 ====================
  http.get('/api/v1/quality/rules', () => HttpResponse.json(paginate(drugInteractionRules))),
  http.post('/api/v1/quality/rules', async ({ request }) => {
    const body = await request.json() as any;
    const newRule = { ...body, id: nextId(), createdAt: now(), updatedAt: now() };
    drugInteractionRules.push(newRule);
    return HttpResponse.json(newRule, { status: 201 });
  }),
  http.put('/api/v1/quality/rules/:id', async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as any;
    const index = drugInteractionRules.findIndex(r => r.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    drugInteractionRules[index] = { ...drugInteractionRules[index], ...body, id: drugInteractionRules[index].id, createdAt: drugInteractionRules[index].createdAt, updatedAt: now() };
    return HttpResponse.json(drugInteractionRules[index]);
  }),
  http.delete('/api/v1/quality/rules/:id', ({ params }) => {
    const { id } = params;
    const index = drugInteractionRules.findIndex(r => r.id === id);
    if (index === -1) return HttpResponse.json({ error: 'Not found' }, { status: 404 });
    drugInteractionRules.splice(index, 1);
    return HttpResponse.json({ success: true });
  }),
  http.get('/api/v1/quality/traces', () => HttpResponse.json(drugTraces)),

  // 统计
  http.get('/api/v1/stats/purchase', () => HttpResponse.json(purchaseStats)),
  http.get('/api/v1/stats/inventory', () => HttpResponse.json(inventoryStats)),
  http.get('/api/v1/stats/delivery', () => HttpResponse.json(deliveryStats)),
  http.get('/api/v1/stats/prescription', () => HttpResponse.json(prescriptionStats)),
];
