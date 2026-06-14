import React, { Suspense } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { Result, Button } from 'antd';
import MainLayout from '../components/layout/MainLayout';
import { Spin } from 'antd';

const LazyLoad = (Component: React.LazyExoticComponent<React.FC>) => (
  <Suspense fallback={<div style={{ textAlign: 'center', padding: 48 }}><Spin size="large" /></div>}>
    <Component />
  </Suspense>
);

function RouteErrorBoundary() {
  const error = useRouteError() as Error;
  return (
    <Result
      status="error"
      title="页面加载失败"
      subTitle={error?.message || '发生了未知错误'}
      extra={[
        <Button key="home" type="primary" onClick={() => window.location.href = '/'}>
          返回首页
        </Button>,
      ]}
    />
  );
}

const LoginPage = React.lazy(() => import('../pages/login/LoginPage'));
const DashboardPage = React.lazy(() => import('../pages/dashboard/DashboardPage'));
const CatalogListPage = React.lazy(() => import('../pages/catalog/CatalogListPage'));
const PurchasePlanPage = React.lazy(() => import('../pages/purchase/PurchasePlanPage'));
const PurchaseOrderPage = React.lazy(() => import('../pages/purchase/PurchaseOrderPage'));
const CentralizedStatsPage = React.lazy(() => import('../pages/purchase/CentralizedStatsPage'));
const InventoryOverviewPage = React.lazy(() => import('../pages/inventory/InventoryOverviewPage'));
const InventoryAlertPage = React.lazy(() => import('../pages/inventory/InventoryAlertPage'));
const InventoryTransferPage = React.lazy(() => import('../pages/inventory/InventoryTransferPage'));
const ZeroInventoryPage = React.lazy(() => import('../pages/inventory/ZeroInventoryPage'));
const AutoReplenishmentPage = React.lazy(() => import('../pages/inventory/AutoReplenishmentPage'));
const DeliveryListPage = React.lazy(() => import('../pages/delivery/DeliveryListPage'));
const DeliveryTrackPage = React.lazy(() => import('../pages/delivery/DeliveryTrackPage'));
const ColdChainPage = React.lazy(() => import('../pages/delivery/ColdChainPage'));
const SettlementListPage = React.lazy(() => import('../pages/settlement/SettlementListPage'));
const ReconciliationPage = React.lazy(() => import('../pages/settlement/ReconciliationPage'));
const PrescriptionListPage = React.lazy(() => import('../pages/prescription/PrescriptionListPage'));
const PrescriptionCreatePage = React.lazy(() => import('../pages/prescription/PrescriptionCreatePage'));
const PrescriptionFlowPage = React.lazy(() => import('../pages/prescription/PrescriptionFlowPage'));
const DrugInteractionPage = React.lazy(() => import('../pages/quality/DrugInteractionPage'));
const DrugTracePage = React.lazy(() => import('../pages/quality/DrugTracePage'));
const StatsPage = React.lazy(() => import('../pages/stats/StatsPage'));

export const router = createBrowserRouter(
  [
    {
      path: '/login',
    element: LazyLoad(LoginPage),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: LazyLoad(DashboardPage), errorElement: <RouteErrorBoundary /> },
      { path: 'catalog', element: LazyLoad(CatalogListPage), errorElement: <RouteErrorBoundary /> },
      { path: 'purchase/plan', element: LazyLoad(PurchasePlanPage), errorElement: <RouteErrorBoundary /> },
      { path: 'purchase/order', element: LazyLoad(PurchaseOrderPage), errorElement: <RouteErrorBoundary /> },
      { path: 'purchase/centralized', element: LazyLoad(CentralizedStatsPage), errorElement: <RouteErrorBoundary /> },
      { path: 'inventory/overview', element: LazyLoad(InventoryOverviewPage), errorElement: <RouteErrorBoundary /> },
      { path: 'inventory/alert', element: LazyLoad(InventoryAlertPage), errorElement: <RouteErrorBoundary /> },
      { path: 'inventory/transfer', element: LazyLoad(InventoryTransferPage), errorElement: <RouteErrorBoundary /> },
      { path: 'inventory/zero', element: LazyLoad(ZeroInventoryPage), errorElement: <RouteErrorBoundary /> },
      { path: 'inventory/replenishment', element: LazyLoad(AutoReplenishmentPage), errorElement: <RouteErrorBoundary /> },
      { path: 'delivery/list', element: LazyLoad(DeliveryListPage), errorElement: <RouteErrorBoundary /> },
      { path: 'delivery/track', element: LazyLoad(DeliveryTrackPage), errorElement: <RouteErrorBoundary /> },
      { path: 'delivery/cold-chain', element: LazyLoad(ColdChainPage), errorElement: <RouteErrorBoundary /> },
      { path: 'settlement/list', element: LazyLoad(SettlementListPage), errorElement: <RouteErrorBoundary /> },
      { path: 'settlement/reconciliation', element: LazyLoad(ReconciliationPage), errorElement: <RouteErrorBoundary /> },
      { path: 'prescription/list', element: LazyLoad(PrescriptionListPage), errorElement: <RouteErrorBoundary /> },
      { path: 'prescription/create', element: LazyLoad(PrescriptionCreatePage), errorElement: <RouteErrorBoundary /> },
      { path: 'prescription/flow', element: LazyLoad(PrescriptionFlowPage), errorElement: <RouteErrorBoundary /> },
      { path: 'quality/interaction', element: LazyLoad(DrugInteractionPage), errorElement: <RouteErrorBoundary /> },
      { path: 'quality/trace', element: LazyLoad(DrugTracePage), errorElement: <RouteErrorBoundary /> },
      { path: 'stats', element: LazyLoad(StatsPage), errorElement: <RouteErrorBoundary /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
],
  { basename: import.meta.env.PROD ? '/Medical/' : '/' },
);
