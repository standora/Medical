import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useAuthStore } from '../../stores/auth-store';
import type { UserRole } from '../../stores/auth-store';

const roleRouteMap: Record<UserRole, string[]> = {
  ADMIN: [
    '/dashboard', '/catalog',
    '/purchase/plan', '/purchase/order', '/purchase/centralized',
    '/inventory/overview', '/inventory/alert', '/inventory/transfer',
    '/inventory/zero', '/inventory/replenishment',
    '/delivery/list', '/delivery/track', '/delivery/cold-chain',
    '/settlement/list', '/settlement/reconciliation',
    '/prescription/list', '/prescription/create', '/prescription/flow',
    '/quality/interaction', '/quality/trace',
    '/stats',
  ],
  PHARMACIST: [
    '/dashboard',
    '/prescription/list',
    '/inventory/replenishment',
  ],
  VILLAGE_DOCTOR: [
    '/dashboard',
    '/prescription/create',
    '/inventory/zero',
  ],
};

function isPathAllowed(pathname: string, allowedRoutes: string[]): boolean {
  if (pathname === '/' || pathname === '') return true;
  return allowedRoutes.some((route) => pathname.startsWith(route));
}

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;

    const allowedRoutes = roleRouteMap[user.role];
    if (!isPathAllowed(location.pathname, allowedRoutes)) {
      message.warning('当前角色无权访问该页面');
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, user, navigate]);

  return <>{children}</>;
}
