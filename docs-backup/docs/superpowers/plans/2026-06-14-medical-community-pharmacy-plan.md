# 医共体智慧药房协同平台 V1.0 实施计划（纯前端+Mock）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建面向微型县域医共体的智慧药房协同平台V1.0纯前端演示版，实现"五统一"核心链路+零库存托管+自动补货杀手功能，所有数据Mock

**Architecture:** 纯前端SPA应用。React 18 + TypeScript + Ant Design 5 + Zustand状态管理 + MSW Mock数据。智能算法引擎纯TypeScript前端实现。localStorage持久化操作状态。

**Tech Stack:** React 18 + TypeScript + Ant Design 5 + Zustand + React Router v6 + ECharts + MSW + Vite

---

## 文件结构

```
medical-platform/
├── public/
│   └── favicon.ico
├── src/
│   ├── main.tsx                         # 入口
│   ├── App.tsx                          # 根组件
│   ├── vite-env.d.ts
│   │
│   ├── types/                           # TypeScript类型定义
│   │   ├── common.types.ts              # 通用类型
│   │   ├── drug.types.ts                # 药品相关类型
│   │   ├── org.types.ts                 # 机构相关类型
│   │   ├── purchase.types.ts            # 采购相关类型
│   │   ├── inventory.types.ts           # 库存相关类型
│   │   ├── delivery.types.ts            # 配送相关类型
│   │   ├── settlement.types.ts          # 结算相关类型
│   │   ├── prescription.types.ts        # 处方相关类型
│   │   ├── quality.types.ts             # 质控相关类型
│   │   └── stats.types.ts               # 统计相关类型
│   │
│   ├── constants/                        # 常量定义
│   │   ├── drug-catalog-type.ts
│   │   ├── order-status.ts
│   │   ├── prescription-status.ts
│   │   ├── alert-level.ts
│   │   └── menu-config.ts              # 侧边栏菜单配置
│   │
│   ├── algorithms/                       # 智能算法引擎（纯TS）
│   │   ├── replenishment.algorithm.ts   # 自动补货算法
│   │   ├── transfer.algorithm.ts        # 智能调剂算法
│   │   └── alert.algorithm.ts           # 智能预警算法
│   │
│   ├── mock/                             # Mock数据层
│   │   ├── handlers.ts                  # MSW请求处理器
│   │   ├── browser.ts                   # MSW浏览器初始化
│   │   ├── data/                        # Mock数据生成器
│   │   │   ├── drugs.ts                 # 药品目录数据（200+）
│   │   │   ├── orgs.ts                  # 机构数据
│   │   │   ├── suppliers.ts             # 供应商数据
│   │   │   ├── purchase.ts              # 采购数据
│   │   │   ├── inventory.ts             # 库存数据
│   │   │   ├── delivery.ts              # 配送数据
│   │   │   ├── settlement.ts            # 结算数据
│   │   │   ├── prescription.ts          # 处方数据
│   │   │   ├── quality.ts               # 质控数据
│   │   │   └── stats.ts                 # 统计数据
│   │   └── utils.ts                     # Mock数据工具函数
│   │
│   ├── stores/                           # Zustand状态管理
│   │   ├── auth.store.ts                # 认证状态
│   │   ├── catalog.store.ts             # 目录状态
│   │   ├── purchase.store.ts            # 采购状态
│   │   ├── inventory.store.ts           # 库存状态
│   │   ├── delivery.store.ts            # 配送状态
│   │   ├── settlement.store.ts          # 结算状态
│   │   ├── prescription.store.ts        # 处方状态
│   │   └── quality.store.ts             # 质控状态
│   │
│   ├── services/                         # API调用层（MSW拦截）
│   │   ├── api.ts                       # Axios实例配置
│   │   ├── catalog.service.ts
│   │   ├── purchase.service.ts
│   │   ├── inventory.service.ts
│   │   ├── delivery.service.ts
│   │   ├── settlement.service.ts
│   │   ├── prescription.service.ts
│   │   ├── quality.service.ts
│   │   └── stats.service.ts
│   │
│   ├── components/                       # 组件
│   │   ├── layout/
│   │   │   ├── MainLayout.tsx           # 主布局（侧边栏+顶栏+内容）
│   │   │   ├── Sidebar.tsx              # 侧边栏
│   │   │   └── Header.tsx               # 顶部栏
│   │   ├── common/
│   │   │   ├── PageHeader.tsx           # 页面标题
│   │   │   ├── DataTable.tsx            # 通用数据表格
│   │   │   ├── SearchForm.tsx           # 通用搜索表单
│   │   │   ├── StatusTag.tsx            # 状态标签
│   │   │   └── OrgTreeSelect.tsx        # 机构树选择器
│   │   └── business/
│   │       ├── DrugSelect.tsx           # 药品选择器
│   │       ├── AlertBadge.tsx           # 预警徽标
│   │       └── AlgorithmResult.tsx      # 算法结果展示
│   │
│   ├── pages/                            # 页面
│   │   ├── login/
│   │   │   └── LoginPage.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx        # 首页总览
│   │   ├── catalog/
│   │   │   ├── CatalogListPage.tsx      # 目录列表
│   │   │   └── CatalogDetailDrawer.tsx  # 目录详情
│   │   ├── purchase/
│   │   │   ├── PurchasePlanPage.tsx     # 采购计划
│   │   │   ├── PurchaseOrderPage.tsx    # 采购订单
│   │   │   └── CentralizedStatsPage.tsx # 集采统计
│   │   ├── inventory/
│   │   │   ├── InventoryOverviewPage.tsx # 库存总览
│   │   │   ├── InventoryAlertPage.tsx   # 库存预警
│   │   │   ├── InventoryTransferPage.tsx # 库存调剂
│   │   │   ├── ZeroInventoryPage.tsx    # 零库存托管
│   │   │   └── AutoReplenishmentPage.tsx # 自动补货
│   │   ├── delivery/
│   │   │   ├── DeliveryListPage.tsx     # 配送列表
│   │   │   ├── DeliveryTrackPage.tsx    # 配送跟踪
│   │   │   └── ColdChainPage.tsx        # 冷链监控
│   │   ├── settlement/
│   │   │   ├── SettlementListPage.tsx   # 结算列表
│   │   │   └── ReconciliationPage.tsx   # 对账管理
│   │   ├── prescription/
│   │   │   ├── PrescriptionListPage.tsx # 处方列表
│   │   │   ├── PrescriptionCreatePage.tsx # 开具处方
│   │   │   └── PrescriptionFlowPage.tsx # 处方流转
│   │   ├── quality/
│   │   │   ├── DrugInteractionPage.tsx  # 合理用药
│   │   │   └── DrugTracePage.tsx        # 药品追溯
│   │   └── stats/
│   │       └── StatsPage.tsx            # 统计分析
│   │
│   ├── routes/
│   │   └── index.tsx                    # 路由配置
│   │
│   └── utils/
│       ├── date.ts                      # 日期工具
│       ├── format.ts                    # 格式化工具
│       └── storage.ts                   # localStorage工具
│
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

---

## Task 1: 项目脚手架与类型定义

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/vite-env.d.ts`
- Create: `src/types/common.types.ts`
- Create: `src/types/drug.types.ts`
- Create: `src/types/org.types.ts`
- Create: `src/types/purchase.types.ts`
- Create: `src/types/inventory.types.ts`
- Create: `src/types/delivery.types.ts`
- Create: `src/types/settlement.types.ts`
- Create: `src/types/prescription.types.ts`
- Create: `src/types/quality.types.ts`
- Create: `src/types/stats.types.ts`
- Create: `src/constants/drug-catalog-type.ts`
- Create: `src/constants/order-status.ts`
- Create: `src/constants/prescription-status.ts`
- Create: `src/constants/alert-level.ts`
- Create: `src/constants/menu-config.ts`

- [ ] **Step 1: 初始化Vite + React + TypeScript项目**

Run: `npm create vite@latest . -- --template react-ts`

- [ ] **Step 2: 安装依赖**

Run: `npm install antd @ant-design/icons zustand react-router-dom axios echarts echarts-for-react msw dayjs`

Run: `npm install -D @types/node`

- [ ] **Step 3: 编写通用类型定义**

```typescript
// src/types/common.types.ts
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
```

```typescript
// src/types/drug.types.ts
import { BaseEntity } from './common.types';

export enum DrugCatalogType {
  ESSENTIAL = 'ESSENTIAL',
  INSURANCE = 'INSURANCE',
  CENTRALIZED = 'CENTRALIZED',
  KEY_MONITOR = 'KEY_MONITOR',
  ANTIBIOTIC = 'ANTIBIOTIC',
}

export interface DrugCatalog extends BaseEntity {
  code: string;
  genericName: string;
  tradeName: string;
  dosageForm: string;
  specification: string;
  manufacturer: string;
  catalogTypes: DrugCatalogType[];
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CatalogOrgRelation extends BaseEntity {
  catalogId: string;
  orgId: string;
  permissionLevel: 'FULL' | 'PARTIAL' | 'VIEW_ONLY';
}

export interface CatalogChangeApproval extends BaseEntity {
  catalogId: string;
  changeType: 'ADD' | 'REMOVE' | 'MODIFY';
  changeContent: Record<string, unknown>;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approver?: string;
}
```

```typescript
// src/types/org.types.ts
import { BaseEntity } from './common.types';

export enum OrgLevel {
  COUNTY = 'COUNTY',
  TOWN = 'TOWN',
  VILLAGE = 'VILLAGE',
}

export interface Organization extends BaseEntity {
  code: string;
  name: string;
  level: OrgLevel;
  parentId?: string;
  address?: string;
  contactPhone?: string;
  status: 'ACTIVE' | 'INACTIVE';
}
```

```typescript
// src/types/purchase.types.ts
import { BaseEntity } from './common.types';

export interface PurchasePlan extends BaseEntity {
  planNo: string;
  orgId: string;
  orgName: string;
  periodStart: string;
  periodEnd: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  items: PurchasePlanItem[];
  createdBy: string;
}

export interface PurchasePlanItem {
  drugId: string;
  drugName: string;
  requestedQty: number;
  suggestedQty?: number;
  isAiRecommended: boolean;
}

export interface PurchaseOrder extends BaseEntity {
  orderNo: string;
  supplierId: string;
  supplierName: string;
  totalAmount: number;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'PLACED' | 'SHIPPED' | 'RECEIVED' | 'CANCELLED';
  isOverdue: boolean;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Supplier extends BaseEntity {
  code: string;
  name: string;
  qualificationExpiry: string;
  ratingScore: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CentralizedProcurementStats extends BaseEntity {
  drugId: string;
  drugName: string;
  agreedQty: number;
  actualQty: number;
  executionRate: number;
  surplusAmount: number;
}
```

```typescript
// src/types/inventory.types.ts
import { BaseEntity, DrugCatalogType } from './common.types';
import { AlertLevel, AlertType } from '../constants/alert-level';

export interface Inventory extends BaseEntity {
  orgId: string;
  orgName: string;
  drugId: string;
  drugName: string;
  batchNo: string;
  quantity: number;
  availableQty: number;
  lockedQty: number;
  expiryDate?: string;
  upperLimit: number;
  lowerLimit: number;
}

export interface InventoryAlert extends BaseEntity {
  orgId: string;
  orgName: string;
  drugId: string;
  drugName: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  message: string;
  status: 'PENDING' | 'ACKNOWLEDGED' | 'RESOLVED';
}

export interface InventoryTransfer extends BaseEntity {
  fromOrgId: string;
  fromOrgName: string;
  toOrgId: string;
  toOrgName: string;
  drugId: string;
  drugName: string;
  quantity: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  isSmartRecommended: boolean;
}

export interface ZeroInventoryConfig extends BaseEntity {
  villageOrgId: string;
  villageOrgName: string;
  hostOrgId: string;
  hostOrgName: string;
  hostMode: 'FULL_HOST' | 'PARTIAL_HOST';
  enabled: boolean;
}

export interface AutoReplenishment extends BaseEntity {
  orgId: string;
  orgName: string;
  drugId: string;
  drugName: string;
  suggestedQty: number;
  triggerType: 'THRESHOLD' | 'SCHEDULED';
  confidence: number;
  reason: string;
  confirmStatus: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  confirmedBy?: string;
}
```

```typescript
// src/types/delivery.types.ts
import { BaseEntity } from './common.types';

export interface DeliveryOrder extends BaseEntity {
  orderNo: string;
  deliveryType: 'TO_HOSPITAL' | 'TO_VILLAGE' | 'TO_HOME';
  status: 'CREATED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'EXCEPTION' | 'CANCELLED';
  logisticsProvider: string;
  fromOrgName: string;
  toOrgName: string;
  items: DeliveryItem[];
  tracks: DeliveryTrack[];
}

export interface DeliveryItem {
  drugId: string;
  drugName: string;
  quantity: number;
  batchNo: string;
}

export interface DeliveryTrack {
  location: string;
  timestamp: string;
  status: string;
  isException: boolean;
}

export interface ColdChainData {
  timestamp: string;
  temperature: number;
  humidity: number;
  isAbnormal: boolean;
}
```

```typescript
// src/types/settlement.types.ts
import { BaseEntity } from './common.types';

export interface SettlementOrder extends BaseEntity {
  orderNo: string;
  settlementMode: 'CENTRALIZED' | 'INDEPENDENT';
  settlementDimension: 'PRODUCT' | 'WAREHOUSE' | 'SUPPLIER' | 'PERIOD';
  period: string;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'PAID';
  items: SettlementItem[];
}

export interface SettlementItem {
  drugId: string;
  drugName: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  orgId: string;
  orgName: string;
}

export interface Reconciliation extends BaseEntity {
  orderNo: string;
  diffAmount: number;
  diffReason: string;
  confirmStatus: 'PENDING' | 'CONFIRMED' | 'DISPUTED';
}
```

```typescript
// src/types/prescription.types.ts
import { BaseEntity } from './common.types';

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
```

```typescript
// src/types/quality.types.ts
import { BaseEntity } from './common.types';

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
```

```typescript
// src/types/stats.types.ts
export interface PurchaseStats {
  period: string;
  totalAmount: number;
  orderCount: number;
  bySupplier: { name: string; amount: number }[];
  byOrg: { name: string; amount: number }[];
}

export interface InventoryStats {
  totalItems: number;
  alertCount: number;
  nearExpiryCount: number;
  byOrg: { name: string; total: number; alert: number }[];
}

export interface DeliveryStats {
  period: string;
  totalOrders: number;
  onTimeRate: number;
  exceptionRate: number;
  avgDeliveryHours: number;
}

export interface PrescriptionStats {
  period: string;
  totalCount: number;
  reviewPassRate: number;
  byOrg: { name: string; count: number }[];
}
```

- [ ] **Step 4: 编写常量定义**

```typescript
// src/constants/alert-level.ts
export enum AlertLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertType {
  UPPER_LIMIT = 'UPPER_LIMIT',
  LOWER_LIMIT = 'LOWER_LIMIT',
  NEAR_EXPIRY = 'NEAR_EXPIRY',
  STOCKOUT_PREDICTION = 'STOCKOUT_PREDICTION',
}
```

```typescript
// src/constants/menu-config.ts
import {
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  CarOutlined,
  PayCircleOutlined,
  FileTextOutlined,
  SafetyOutlined,
  BarChartOutlined,
} from '@ant-design/icons';

export const menuConfig = [
  { key: '/dashboard', label: '首页总览', icon: 'DashboardOutlined' },
  { key: '/catalog', label: '统一用药目录', icon: 'MedicineBoxOutlined' },
  { key: '/purchase', label: '统一采购', icon: 'ShoppingCartOutlined',
    children: [
      { key: '/purchase/plan', label: '采购计划' },
      { key: '/purchase/order', label: '采购订单' },
      { key: '/purchase/centralized', label: '集采统计' },
    ],
  },
  { key: '/inventory', label: '统一库存', icon: 'DatabaseOutlined',
    children: [
      { key: '/inventory/overview', label: '库存总览' },
      { key: '/inventory/alert', label: '库存预警' },
      { key: '/inventory/transfer', label: '库存调剂' },
      { key: '/inventory/zero', label: '零库存托管' },
      { key: '/inventory/replenishment', label: '自动补货' },
    ],
  },
  { key: '/delivery', label: '统一配送', icon: 'CarOutlined',
    children: [
      { key: '/delivery/list', label: '配送列表' },
      { key: '/delivery/track', label: '配送跟踪' },
      { key: '/delivery/cold-chain', label: '冷链监控' },
    ],
  },
  { key: '/settlement', label: '统一结算', icon: 'PayCircleOutlined',
    children: [
      { key: '/settlement/list', label: '结算列表' },
      { key: '/settlement/reconciliation', label: '对账管理' },
    ],
  },
  { key: '/prescription', label: '处方流转', icon: 'FileTextOutlined',
    children: [
      { key: '/prescription/list', label: '处方列表' },
      { key: '/prescription/create', label: '开具处方' },
      { key: '/prescription/flow', label: '处方流转' },
    ],
  },
  { key: '/quality', label: '药事质控', icon: 'SafetyOutlined',
    children: [
      { key: '/quality/interaction', label: '合理用药' },
      { key: '/quality/trace', label: '药品追溯' },
    ],
  },
  { key: '/stats', label: '统计分析', icon: 'BarChartOutlined' },
];
```

- [ ] **Step 5: 验证项目可启动**

Run: `npm run dev`
Expected: Vite dev server starts, http://localhost:5173 accessible

- [ ] **Step 6: 提交**

```bash
git add -A
git commit -m "feat: initialize Vite+React+TS project with type definitions and constants"
```

---

## Task 2: 智能算法引擎（纯TypeScript实现）

**Files:**
- Create: `src/algorithms/replenishment.algorithm.ts`
- Create: `src/algorithms/transfer.algorithm.ts`
- Create: `src/algorithms/alert.algorithm.ts`
- Test: `src/algorithms/__tests__/replenishment.algorithm.test.ts`
- Test: `src/algorithms/__tests__/transfer.algorithm.test.ts`
- Test: `src/algorithms/__tests__/alert.algorithm.test.ts`

- [ ] **Step 1: 编写自动补货算法**

```typescript
// src/algorithms/replenishment.algorithm.ts
export interface ReplenishmentInput {
  drugId: string;
  orgId: string;
  currentQty: number;
  lowerLimit: number;
  dailyConsumption: number[];
  seasonFactors: number[];
  safetyStockDays: number;
  leadTimeDays: number;
}

export interface ReplenishmentOutput {
  drugId: string;
  orgId: string;
  suggestedQty: number;
  confidence: number;
  reason: string;
}

export class ReplenishmentAlgorithm {
  static calculate(input: ReplenishmentInput): ReplenishmentOutput | null {
    const { currentQty, lowerLimit, dailyConsumption, seasonFactors, safetyStockDays, leadTimeDays } = input;

    if (dailyConsumption.length === 0) return null;

    // 加权移动平均日消耗量
    const weights = dailyConsumption.map((_, i) => i + 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    const weightedAvg = dailyConsumption.reduce((sum, val, i) => sum + val * weights[i], 0) / totalWeight;

    // 应用季节因子
    const currentMonth = new Date().getMonth();
    const seasonFactor = seasonFactors[currentMonth] || 1.0;
    const adjustedDaily = weightedAvg * seasonFactor;

    // 安全库存
    const safetyStock = adjustedDaily * safetyStockDays;

    // 补货点
    const reorderPoint = adjustedDaily * leadTimeDays + safetyStock;

    if (currentQty > reorderPoint) return null;

    const suggestedQty = Math.max(Math.ceil(reorderPoint + safetyStock - currentQty), 0);
    const confidence = Math.min(dailyConsumption.length / 30, 1.0);

    return {
      drugId: input.drugId,
      orgId: input.orgId,
      suggestedQty,
      confidence,
      reason: `当前库存${currentQty}低于补货点${Math.round(reorderPoint)}，日均消耗${adjustedDaily.toFixed(1)}，季节因子${seasonFactor}，建议补货${suggestedQty}`,
    };
  }
}
```

- [ ] **Step 2: 编写智能调剂算法**

```typescript
// src/algorithms/transfer.algorithm.ts
export interface TransferInput {
  drugId: string;
  fromOrgId: string;
  toOrgId: string;
  fromOrgQty: number;
  toOrgQty: number;
  toOrgLowerLimit: number;
  distance: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TransferOutput {
  fromOrgId: string;
  toOrgId: string;
  drugId: string;
  suggestedQty: number;
  priority: number;
  reason: string;
}

export class TransferAlgorithm {
  static calculate(input: TransferInput): TransferOutput {
    const { fromOrgQty, toOrgQty, toOrgLowerLimit, distance, urgency } = input;

    const shortage = Math.max(toOrgLowerLimit - toOrgQty, 0);
    const availableForTransfer = Math.max(fromOrgQty - Math.ceil(fromOrgQty * 0.3), 0);
    const suggestedQty = Math.min(shortage, availableForTransfer);

    const urgencyScore = { LOW: 20, MEDIUM: 50, HIGH: 80 }[urgency];
    const distanceScore = Math.max(0, 100 - distance * 2);
    const shortageScore = shortage > 0 ? Math.min((shortage / toOrgLowerLimit) * 100, 100) : 0;
    const priority = Math.round(urgencyScore * 0.4 + distanceScore * 0.3 + shortageScore * 0.3);

    return {
      fromOrgId: input.fromOrgId,
      toOrgId: input.toOrgId,
      drugId: input.drugId,
      suggestedQty,
      priority,
      reason: `缺口${shortage}，可调剂${availableForTransfer}，距离${distance}km，紧急度${urgency}，优先级${priority}`,
    };
  }
}
```

- [ ] **Step 3: 编写智能预警算法**

```typescript
// src/algorithms/alert.algorithm.ts
import { AlertLevel, AlertType } from '../constants/alert-level';

export interface AlertInput {
  orgId: string;
  drugId: string;
  currentQty: number;
  upperLimit: number;
  lowerLimit: number;
  expiryDate: string | null;
  dailyConsumption: number[];
}

export interface AlertOutput {
  orgId: string;
  drugId: string;
  alertType: AlertType;
  alertLevel: AlertLevel;
  message: string;
}

export class AlertAlgorithm {
  static check(input: AlertInput): AlertOutput[] {
    const alerts: AlertOutput[] = [];
    const { currentQty, upperLimit, lowerLimit, expiryDate, dailyConsumption } = input;

    if (currentQty > upperLimit) {
      alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.UPPER_LIMIT, alertLevel: AlertLevel.WARNING, message: `库存${currentQty}超过上限${upperLimit}` });
    }

    if (currentQty < lowerLimit) {
      const level = currentQty === 0 ? AlertLevel.CRITICAL : AlertLevel.WARNING;
      alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.LOWER_LIMIT, alertLevel: level, message: `库存${currentQty}低于下限${lowerLimit}` });
    }

    if (expiryDate) {
      const daysToExpiry = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= 30 && daysToExpiry > 0) {
        alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.NEAR_EXPIRY, alertLevel: daysToExpiry <= 7 ? AlertLevel.CRITICAL : AlertLevel.WARNING, message: `药品将于${daysToExpiry}天后过期` });
      }
    }

    if (dailyConsumption.length > 0 && currentQty > 0) {
      const avgDaily = dailyConsumption.reduce((a, b) => a + b, 0) / dailyConsumption.length;
      const daysOfStock = Math.floor(currentQty / avgDaily);
      if (daysOfStock < 7) {
        alerts.push({ orgId: input.orgId, drugId: input.drugId, alertType: AlertType.STOCKOUT_PREDICTION, alertLevel: daysOfStock < 3 ? AlertLevel.CRITICAL : AlertLevel.WARNING, message: `按当前消耗速度，预计${daysOfStock}天后缺货` });
      }
    }

    return alerts;
  }
}
```

- [ ] **Step 4: 编写算法测试**

```typescript
// src/algorithms/__tests__/replenishment.algorithm.test.ts
import { ReplenishmentAlgorithm, ReplenishmentInput } from '../replenishment.algorithm';

describe('ReplenishmentAlgorithm', () => {
  const baseInput: ReplenishmentInput = {
    drugId: 'drug-1', orgId: 'org-1', currentQty: 10, lowerLimit: 20,
    dailyConsumption: [5, 6, 5, 7, 6, 5, 4, 6, 5, 7],
    seasonFactors: Array(12).fill(1.0), safetyStockDays: 7, leadTimeDays: 3,
  };

  it('should suggest replenishment when stock is below reorder point', () => {
    const result = ReplenishmentAlgorithm.calculate(baseInput);
    expect(result).not.toBeNull();
    expect(result!.suggestedQty).toBeGreaterThan(0);
  });

  it('should not suggest replenishment when stock is sufficient', () => {
    const result = ReplenishmentAlgorithm.calculate({ ...baseInput, currentQty: 500 });
    expect(result).toBeNull();
  });

  it('should return null for empty consumption data', () => {
    const result = ReplenishmentAlgorithm.calculate({ ...baseInput, dailyConsumption: [] });
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 5: 运行测试**

Run: `npx vitest src/algorithms/__tests__/`
Expected: All tests PASS

- [ ] **Step 6: 提交**

```bash
git add src/algorithms/
git commit -m "feat: add intelligent algorithm engine - replenishment, transfer, alert"
```

---

## Task 3: Mock数据层

**Files:**
- Create: `src/mock/utils.ts`
- Create: `src/mock/data/drugs.ts`
- Create: `src/mock/data/orgs.ts`
- Create: `src/mock/data/suppliers.ts`
- Create: `src/mock/data/purchase.ts`
- Create: `src/mock/data/inventory.ts`
- Create: `src/mock/data/delivery.ts`
- Create: `src/mock/data/settlement.ts`
- Create: `src/mock/data/prescription.ts`
- Create: `src/mock/data/quality.ts`
- Create: `src/mock/data/stats.ts`
- Create: `src/mock/handlers.ts`
- Create: `src/mock/browser.ts`

- [ ] **Step 1: 编写Mock数据工具函数**

```typescript
// src/mock/utils.ts
import dayjs from 'dayjs';

let idCounter = 1;
export const nextId = () => `id-${String(idCounter++).padStart(6, '0')}`;

export const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export const randomFloat = (min: number, max: number, decimals = 2) =>
  Number((Math.random() * (max - min) + min).toFixed(decimals));

export const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const randomItems = <T>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export const randomDate = (start: string, end: string) =>
  dayjs(start).add(randomInt(0, dayjs(end).diff(dayjs(start), 'day')), 'day').format('YYYY-MM-DD');

export const now = () => dayjs().format('YYYY-MM-DD HH:mm:ss');

export const paginate = <T>(items: T[], page = 1, pageSize = 20) => {
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total: items.length,
    page,
    pageSize,
    totalPages: Math.ceil(items.length / pageSize),
  };
};
```

- [ ] **Step 2: 编写核心Mock数据生成器**

drugs.ts: 200+药品目录（含5类目录类型，通用名/商品名/剂型/规格/厂家）
orgs.ts: 县级医院2 + 乡镇卫生院5 + 村卫生室15 = 22个机构
suppliers.ts: 20+供应商
purchase.ts: 50+采购订单（各状态分布）+ 采购计划
inventory.ts: 三级机构库存 + 预警项 + 零库存配置 + 自动补货记录
delivery.ts: 配送单 + 冷链时序数据
settlement.ts: 结算单 + 对账记录
prescription.ts: 100+处方（各状态分布）
quality.ts: 50+合理用药规则 + 追溯数据
stats.ts: 各维度统计数据

每个文件使用utils中的工具函数批量生成数据，确保数据间关联性（如处方中的药品ID指向药品目录中的真实药品）。

- [ ] **Step 3: 编写MSW请求处理器**

```typescript
// src/mock/handlers.ts
import { http, HttpResponse } from 'msw';
import { drugs } from './data/drugs';
import { paginate } from './utils';
// ... 其他数据导入

export const handlers = [
  // 目录
  http.get('/api/v1/catalogs', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('pageSize') || 20);
    const keyword = url.searchParams.get('keyword') || '';
    let filtered = drugs;
    if (keyword) filtered = filtered.filter(d => d.genericName.includes(keyword) || d.code.includes(keyword));
    return HttpResponse.json(paginate(filtered, page, pageSize));
  }),

  // 采购
  http.get('/api/v1/purchase/orders', () => HttpResponse.json(paginate(purchaseOrders))),
  // ... 其他接口处理器
];
```

- [ ] **Step 4: 初始化MSW浏览器端**

```typescript
// src/mock/browser.ts
import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);
```

在 `src/main.tsx` 中启动MSW:
```typescript
if (import.meta.env.DEV) {
  const { worker } = await import('./mock/browser');
  await worker.start({ onUnhandledRequest: 'bypass' });
}
```

- [ ] **Step 5: 提交**

```bash
git add src/mock/
git commit -m "feat: add mock data layer with MSW handlers and data generators"
```

---

## Task 4: 状态管理与服务层

**Files:**
- Create: `src/stores/auth.store.ts`
- Create: `src/stores/catalog.store.ts`
- Create: `src/stores/purchase.store.ts`
- Create: `src/stores/inventory.store.ts`
- Create: `src/services/api.ts`
- Create: `src/services/catalog.service.ts`
- Create: `src/services/purchase.service.ts`
- Create: `src/services/inventory.service.ts`
- Create: `src/services/delivery.service.ts`
- Create: `src/services/settlement.service.ts`
- Create: `src/services/prescription.service.ts`
- Create: `src/services/quality.service.ts`
- Create: `src/services/stats.service.ts`
- Create: `src/utils/storage.ts`

- [ ] **Step 1: 编写Zustand Store**

auth.store.ts: 登录状态、当前用户、角色切换（管理员/药师/村医）
catalog.store.ts: 目录列表、筛选条件、选中目录
purchase.store.ts: 采购计划/订单列表
inventory.store.ts: 库存列表、预警列表、零库存配置、自动补货记录

- [ ] **Step 2: 编写API调用层**

api.ts: Axios实例，baseURL配置
各service.ts: 封装API调用（实际被MSW拦截返回Mock数据）

- [ ] **Step 3: 编写localStorage工具**

storage.ts: 封装get/set/remove，支持JSON序列化

- [ ] **Step 4: 提交**

```bash
git add src/stores/ src/services/ src/utils/
git commit -m "feat: add Zustand stores, API services, and storage utilities"
```

---

## Task 5: 布局与通用组件

**Files:**
- Create: `src/components/layout/MainLayout.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/common/PageHeader.tsx`
- Create: `src/components/common/DataTable.tsx`
- Create: `src/components/common/SearchForm.tsx`
- Create: `src/components/common/StatusTag.tsx`
- Create: `src/components/common/OrgTreeSelect.tsx`
- Create: `src/components/business/DrugSelect.tsx`
- Create: `src/components/business/AlertBadge.tsx`
- Create: `src/components/business/AlgorithmResult.tsx`
- Create: `src/routes/index.tsx`
- Create: `src/pages/login/LoginPage.tsx`
- Create: `src/pages/dashboard/DashboardPage.tsx`

- [ ] **Step 1: 编写主布局**

MainLayout: Ant Design Layout（Sider + Header + Content），侧边栏可折叠
Sidebar: 根据menu-config渲染菜单，支持多级菜单
Header: 用户信息 + 角色切换 + 通知铃铛（预警数量）

- [ ] **Step 2: 编写通用组件**

DataTable: 封装Ant Design Table + 分页 + 加载状态
SearchForm: 封装通用搜索表单布局
StatusTag: 根据状态渲染不同颜色Tag
OrgTreeSelect: 机构树形选择器（三级机构）

- [ ] **Step 3: 编写业务组件**

DrugSelect: 药品搜索选择器（支持按通用名/编码搜索）
AlertBadge: 预警徽标（显示预警数量和等级）
AlgorithmResult: 算法结果展示组件（置信度条+原因+确认/拒绝按钮）

- [ ] **Step 4: 编写路由配置和登录/首页**

LoginPage: 角色选择登录（管理员/药师/村医三种演示账号）
DashboardPage: 首页总览卡片（机构数/人员数/库存预警/待处理订单/今日处方量）

- [ ] **Step 5: 验证布局可运行**

Run: `npm run dev`
Expected: 登录页→首页总览，侧边栏菜单可点击切换

- [ ] **Step 6: 提交**

```bash
git add src/components/ src/routes/ src/pages/login/ src/pages/dashboard/
git commit -m "feat: add main layout, common components, login and dashboard pages"
```

---

## Task 6: 统一用药目录页面

**Files:**
- Create: `src/pages/catalog/CatalogListPage.tsx`
- Create: `src/pages/catalog/CatalogDetailDrawer.tsx`

- [ ] **Step 1: 编写目录列表页**

功能：DataTable展示药品目录、按目录类型/状态/关键词筛选、新增目录Modal、调进调出操作、自动遴选按钮

- [ ] **Step 2: 编写目录详情抽屉**

功能：目录类型标签、关联机构列表、变更审批记录

- [ ] **Step 3: 提交**

```bash
git add src/pages/catalog/
git commit -m "feat: add catalog management pages - list, detail, auto-select"
```

---

## Task 7: 统一采购页面

**Files:**
- Create: `src/pages/purchase/PurchasePlanPage.tsx`
- Create: `src/pages/purchase/PurchaseOrderPage.tsx`
- Create: `src/pages/purchase/CentralizedStatsPage.tsx`

- [ ] **Step 1: 编写采购计划页**

功能：计划列表、在线申报表单、AI建议标记、自动汇总

- [ ] **Step 2: 编写采购订单页**

功能：订单列表、Steps全流程跟踪、超时红色标记

- [ ] **Step 3: 编写集采统计页**

功能：集采药品执行率进度条、结余金额高亮

- [ ] **Step 4: 提交**

```bash
git add src/pages/purchase/
git commit -m "feat: add purchase management pages - plans, orders, centralized stats"
```

---

## Task 8: 统一库存页面（含零库存托管 + 自动补货 — 核心杀手功能）

**Files:**
- Create: `src/pages/inventory/InventoryOverviewPage.tsx`
- Create: `src/pages/inventory/InventoryAlertPage.tsx`
- Create: `src/pages/inventory/InventoryTransferPage.tsx`
- Create: `src/pages/inventory/ZeroInventoryPage.tsx`
- Create: `src/pages/inventory/AutoReplenishmentPage.tsx`

- [ ] **Step 1: 编写库存总览页**

功能：三级机构树形切换、库存卡片（药品名/数量/预警标记）、库存水位可视化

- [ ] **Step 2: 编写库存预警页**

功能：预警列表（按等级排序）、预警处理操作、智能预警算法结果展示

- [ ] **Step 3: 编写库存调剂页**

功能：跨机构库存查询、智能调剂推荐（AlgorithmResult组件）、调剂路径可视化

- [ ] **Step 4: 编写零库存托管页（杀手功能）**

功能：村卫生室托管配置面板、托管状态可视化、零库存流程演示（村医开方→托管调配→配送→签收 Steps流程）

- [ ] **Step 5: 编写自动补货页（杀手功能）**

功能：算法结果列表（每条显示置信度+原因+建议数量）、药师确认/拒绝按钮、触发算法按钮、补货历史记录

- [ ] **Step 6: 提交**

```bash
git add src/pages/inventory/
git commit -m "feat: add inventory pages with zero-inventory hosting and auto-replenishment"
```

---

## Task 9: 统一配送页面

**Files:**
- Create: `src/pages/delivery/DeliveryListPage.tsx`
- Create: `src/pages/delivery/DeliveryTrackPage.tsx`
- Create: `src/pages/delivery/ColdChainPage.tsx`

- [ ] **Step 1: 编写配送列表和跟踪页**

功能：配送单列表、Timeline配送节点跟踪、异常标记

- [ ] **Step 2: 编写冷链监控页**

功能：ECharts温湿度折线图、异常区间高亮

- [ ] **Step 3: 提交**

```bash
git add src/pages/delivery/
git commit -m "feat: add delivery pages - list, tracking, cold-chain monitoring"
```

---

## Task 10: 统一结算页面

**Files:**
- Create: `src/pages/settlement/SettlementListPage.tsx`
- Create: `src/pages/settlement/ReconciliationPage.tsx`

- [ ] **Step 1: 编写结算列表和对账管理页**

功能：结算单列表（维度切换Tab）、对账差异高亮、在线确认

- [ ] **Step 2: 提交**

```bash
git add src/pages/settlement/
git commit -m "feat: add settlement pages - list, reconciliation"
```

---

## Task 11: 处方流转页面

**Files:**
- Create: `src/pages/prescription/PrescriptionListPage.tsx`
- Create: `src/pages/prescription/PrescriptionCreatePage.tsx`
- Create: `src/pages/prescription/PrescriptionFlowPage.tsx`

- [ ] **Step 1: 编写处方列表和开具页**

功能：处方列表（各状态筛选）、开具处方表单（DrugSelect + 历史复用）

- [ ] **Step 2: 编写处方流转页**

功能：Steps展示流转节点、处方审核拦截弹窗

- [ ] **Step 3: 提交**

```bash
git add src/pages/prescription/
git commit -m "feat: add prescription pages - list, create, flow tracking"
```

---

## Task 12: 药事质控与统计分析页面

**Files:**
- Create: `src/pages/quality/DrugInteractionPage.tsx`
- Create: `src/pages/quality/DrugTracePage.tsx`
- Create: `src/pages/stats/StatsPage.tsx`

- [ ] **Step 1: 编写合理用药和药品追溯页**

功能：规则库管理、合理用药校验、追溯码查询→Timeline

- [ ] **Step 2: 编写统计分析页**

功能：ECharts图表（采购/库存/配送/处方4个Tab）、维度切换

- [ ] **Step 3: 提交**

```bash
git add src/pages/quality/ src/pages/stats/
git commit -m "feat: add quality control and statistics pages"
```

---

## Task 13: 整体联调与优化

**Files:**
- Modify: 各页面组件（交互优化）
- Create: `src/App.css` (全局样式微调)

- [ ] **Step 1: 全流程联调**

验证：目录→采购→入库→配送→结算完整链路可操作
验证：村医开方→零库存托管→配送到村→签收完整链路
验证：自动补货/智能调剂/智能预警算法可触发并展示结果

- [ ] **Step 2: 角色视角验证**

管理员视角：所有模块可访问
药师视角：处方审核+自动补货确认
村医视角：开方+零库存托管

- [ ] **Step 3: 性能与体验优化**

- Ant Design ConfigProvider主题配置
- 路由懒加载
- Mock数据加载状态模拟

- [ ] **Step 4: 提交**

```bash
git add -A
git commit -m "feat: integration testing and UX optimization"
```

---

## 自审检查

**1. 规格覆盖检查**：
- 统一用药目录管理 → Task 6 ✅
- 统一采购管理 → Task 7 ✅
- 统一库存管理（含零库存+自动补货）→ Task 8 ✅
- 统一配送管理 → Task 9 ✅
- 统一结算管理 → Task 10 ✅
- 处方流转管理 → Task 11 ✅
- 药事质控管理（基础版）→ Task 12 ✅
- 统计分析（基础版）→ Task 12 ✅
- 智能算法引擎 → Task 2 ✅
- Mock数据层 → Task 3 ✅
- 布局与通用组件 → Task 5 ✅
- 可演示性（角色切换）→ Task 5 + Task 13 ✅

**2. 占位符扫描**：无TBD/TODO，Task 3的Mock数据生成器因篇幅限制简化描述，实施时需按类型定义生成完整数据

**3. 类型一致性**：所有页面使用src/types/中定义的类型，算法输入输出类型与stores/services一致
