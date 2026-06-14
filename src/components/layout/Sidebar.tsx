import { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  MedicineBoxOutlined,
  ShoppingCartOutlined,
  DatabaseOutlined,
  CarOutlined,
  PayCircleOutlined,
  FileTextOutlined,
  SafetyOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { menuConfig } from '../../constants/menu-config';
import type { MenuItem } from '../../constants/menu-config';
import { useAuthStore } from '../../stores/auth-store';
import type { UserRole } from '../../stores/auth-store';

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  MedicineBoxOutlined: <MedicineBoxOutlined />,
  ShoppingCartOutlined: <ShoppingCartOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
  CarOutlined: <CarOutlined />,
  PayCircleOutlined: <PayCircleOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  SafetyOutlined: <SafetyOutlined />,
  BarChartOutlined: <BarChartOutlined />,
};

function filterMenuByRole(items: MenuItem[], role: UserRole): MenuItem[] {
  return items
    .filter((item) => {
      if (role === 'ADMIN') return true;
      if (item.children) {
        const filtered = filterMenuByRole(item.children, role);
        return filtered.length > 0;
      }
      if (item.roles) {
        return item.roles.includes(role);
      }
      return true;
    })
    .map((item) => {
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, role);
        return { ...item, children: filteredChildren.length > 0 ? filteredChildren : undefined };
      }
      return item;
    });
}

function convertMenuItems(items: MenuItem[]): MenuProps['items'] {
  return items.map((item) => ({
    key: item.key,
    icon: item.icon ? iconMap[item.icon] : undefined,
    label: item.label,
    children: item.children ? convertMenuItems(item.children) : undefined,
  }));
}

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  const filteredMenu = useMemo(() => {
    const role = user?.role || 'ADMIN';
    return filterMenuByRole(menuConfig, role);
  }, [user?.role]);

  const menuItems = useMemo(() => convertMenuItems(filteredMenu), [filteredMenu]);

  const selectedKeys = [location.pathname];

  const openKeys = useMemo(() => {
    const path = location.pathname;
    const parts = path.split('/').filter(Boolean);
    if (parts.length > 1) {
      return [`/${parts[0]}`];
    }
    return [];
  }, [location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
  };

  return (
    <Menu
      mode="inline"
      theme="dark"
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      items={menuItems}
      onClick={handleMenuClick}
      style={{
        height: '100%',
        borderRight: 0,
        background: 'transparent',
        paddingTop: 4,
      }}
    />
  );
}
