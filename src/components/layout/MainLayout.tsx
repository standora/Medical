import { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth-store';
import { useInventoryStore } from '../../stores/alert.store';
import Sidebar from './Sidebar';
import Header from './Header';
import RouteGuard from '../common/RouteGuard';

const { Sider, Content } = Layout;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const fetchAlertCount = useInventoryStore((s) => s.fetchAlertCount);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAlertCount();
    }
  }, [isAuthenticated, fetchAlertCount]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        width={220}
        style={{
          background: '#0B1A33',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0B3D91, #1D4ED8)',
            fontWeight: 600,
            fontSize: collapsed ? 14 : 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            color: '#fff',
            letterSpacing: 1,
          }}
        >
          {collapsed ? '智慧药房' : '医共体智慧药房协同平台'}
        </div>
        <Sidebar />
      </Sider>
      <Layout style={{ background: 'var(--color-bg-layout, #F9FAFB)' }}>
        <Header />
        <Content
          style={{
            margin: 16,
            padding: 24,
            background: 'var(--color-bg-container, #FFFFFF)',
            borderRadius: 'var(--radius-lg, 12px)',
            overflow: 'auto',
          }}
        >
          <div className="page-transition-wrapper">
            <RouteGuard>
              <Outlet />
            </RouteGuard>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
