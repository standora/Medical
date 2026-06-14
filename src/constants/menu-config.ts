import type { UserRole } from '../stores/auth-store';

export interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  children?: MenuItem[];
  roles?: UserRole[];
}

export const menuConfig: MenuItem[] = [
  { key: '/dashboard', label: '首页总览', icon: 'DashboardOutlined', roles: ['ADMIN', 'PHARMACIST', 'VILLAGE_DOCTOR'] },
  { key: '/catalog', label: '统一用药目录', icon: 'MedicineBoxOutlined', roles: ['ADMIN'] },
  {
    key: '/purchase', label: '统一采购', icon: 'ShoppingCartOutlined', roles: ['ADMIN'],
    children: [
      { key: '/purchase/plan', label: '采购计划', roles: ['ADMIN'] },
      { key: '/purchase/order', label: '采购订单', roles: ['ADMIN'] },
      { key: '/purchase/centralized', label: '集采统计', roles: ['ADMIN'] },
    ],
  },
  {
    key: '/inventory', label: '统一库存', icon: 'DatabaseOutlined', roles: ['ADMIN', 'PHARMACIST', 'VILLAGE_DOCTOR'],
    children: [
      { key: '/inventory/overview', label: '库存总览', roles: ['ADMIN'] },
      { key: '/inventory/alert', label: '库存预警', roles: ['ADMIN'] },
      { key: '/inventory/transfer', label: '库存调剂', roles: ['ADMIN'] },
      { key: '/inventory/zero', label: '零库存托管', roles: ['ADMIN', 'VILLAGE_DOCTOR'] },
      { key: '/inventory/replenishment', label: '自动补货', roles: ['ADMIN', 'PHARMACIST'] },
    ],
  },
  {
    key: '/delivery', label: '统一配送', icon: 'CarOutlined', roles: ['ADMIN'],
    children: [
      { key: '/delivery/list', label: '配送列表', roles: ['ADMIN'] },
      { key: '/delivery/track', label: '配送跟踪', roles: ['ADMIN'] },
      { key: '/delivery/cold-chain', label: '冷链监控', roles: ['ADMIN'] },
    ],
  },
  {
    key: '/settlement', label: '统一结算', icon: 'PayCircleOutlined', roles: ['ADMIN'],
    children: [
      { key: '/settlement/list', label: '结算列表', roles: ['ADMIN'] },
      { key: '/settlement/reconciliation', label: '对账管理', roles: ['ADMIN'] },
    ],
  },
  {
    key: '/prescription', label: '处方流转', icon: 'FileTextOutlined', roles: ['ADMIN', 'PHARMACIST', 'VILLAGE_DOCTOR'],
    children: [
      { key: '/prescription/list', label: '处方列表', roles: ['ADMIN', 'PHARMACIST'] },
      { key: '/prescription/create', label: '开具处方', roles: ['ADMIN', 'VILLAGE_DOCTOR'] },
      { key: '/prescription/flow', label: '处方流转', roles: ['ADMIN'] },
    ],
  },
  {
    key: '/quality', label: '药事质控', icon: 'SafetyOutlined', roles: ['ADMIN'],
    children: [
      { key: '/quality/interaction', label: '合理用药', roles: ['ADMIN'] },
      { key: '/quality/trace', label: '药品追溯', roles: ['ADMIN'] },
    ],
  },
  { key: '/stats', label: '统计分析', icon: 'BarChartOutlined', roles: ['ADMIN'] },
];
