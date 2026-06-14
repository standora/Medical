import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Dropdown, Breadcrumb, Space, Avatar, Tag } from 'antd';
import { UserOutlined, LogoutOutlined, SwapOutlined, BellOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Badge, message } from 'antd';
import { useAuthStore } from '../../stores/auth-store';
import type { UserRole } from '../../stores/auth-store';
import { useInventoryStore } from '../../stores/alert.store';

const roleBadgeConfig: Record<UserRole, { label: string; color: string }> = {
  ADMIN: { label: '管理员', color: 'blue' },
  PHARMACIST: { label: '药师', color: 'green' },
  VILLAGE_DOCTOR: { label: '村医', color: 'orange' },
};

const { Header: AntHeader } = Layout;

const roleOptions: { key: UserRole; label: string }[] = [
  { key: 'ADMIN', label: '管理员' },
  { key: 'PHARMACIST', label: '药师' },
  { key: 'VILLAGE_DOCTOR', label: '村医' },
];

const breadcrumbNameMap: Record<string, string> = {
  '/dashboard': '首页总览',
  '/catalog': '统一用药目录',
  '/purchase': '统一采购',
  '/purchase/plan': '采购计划',
  '/purchase/order': '采购订单',
  '/purchase/centralized': '集采统计',
  '/inventory': '统一库存',
  '/inventory/overview': '库存总览',
  '/inventory/alert': '库存预警',
  '/inventory/transfer': '库存调剂',
  '/inventory/zero': '零库存托管',
  '/inventory/replenishment': '自动补货',
  '/delivery': '统一配送',
  '/delivery/list': '配送列表',
  '/delivery/track': '配送跟踪',
  '/delivery/cold-chain': '冷链监控',
  '/settlement': '统一结算',
  '/settlement/list': '结算列表',
  '/settlement/reconciliation': '对账管理',
  '/prescription': '处方流转',
  '/prescription/list': '处方列表',
  '/prescription/create': '开具处方',
  '/prescription/flow': '处方流转',
  '/quality': '药事质控',
  '/quality/interaction': '合理用药',
  '/quality/trace': '药品追溯',
  '/stats': '统计分析',
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchRole } = useAuthStore();
  const alertCount = useInventoryStore((s) => s.alertCount);

  const breadcrumbItems = (() => {
    const pathSnippets = location.pathname.split('/').filter(Boolean);
    const items = [{ title: '医共体智慧药房协同平台' }];
    let currentPath = '';
    for (const snippet of pathSnippets) {
      currentPath += `/${snippet}`;
      const name = breadcrumbNameMap[currentPath];
      if (name) {
        items.push({ title: name });
      }
    }
    return items;
  })();

  const roleMenuItems: MenuProps['items'] = roleOptions.map((opt) => ({
    key: opt.key,
    label: opt.label,
    icon: <SwapOutlined />,
  }));

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'role',
      label: '切换角色',
      icon: <SwapOutlined />,
      children: roleMenuItems,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    } else if (key === 'ADMIN' || key === 'PHARMACIST' || key === 'VILLAGE_DOCTOR') {
      const roleLabel = roleBadgeConfig[key as UserRole].label;
      switchRole(key as UserRole);
      message.info('已切换至' + roleLabel + '视角');
    }
  };

  return (
    <AntHeader
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--color-border, #E5E7EB)',
        height: 56,
        lineHeight: '56px',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
      }}
    >
      <Breadcrumb
        items={breadcrumbItems}
        style={{ color: 'var(--color-text-secondary, #6B7280)' }}
      />

      <Space size="middle">
        <Badge count={alertCount} size="small" offset={[0, 0]}>
          <BellOutlined
            style={{
              fontSize: 20,
              cursor: 'pointer',
              color: 'var(--color-text-secondary, #6B7280)',
              transition: 'color 0.2s',
            }}
            onClick={() => navigate('/inventory/alert')}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--color-primary, #3B82F6)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--color-text-secondary, #6B7280)'; }}
          />
        </Badge>

        {user && (
          <Tag color={roleBadgeConfig[user.role]?.color} style={{ marginRight: 0 }}>
            {roleBadgeConfig[user.role]?.label || user.role}
          </Tag>
        )}

        <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar
              size="small"
              icon={<UserOutlined />}
              style={{ backgroundColor: 'var(--color-primary, #3B82F6)' }}
            />
            <span style={{ color: 'var(--color-text, #1F2937)', fontWeight: 500 }}>
              {user?.name || '未登录'}
            </span>
          </Space>
        </Dropdown>
      </Space>
    </AntHeader>
  );
}
