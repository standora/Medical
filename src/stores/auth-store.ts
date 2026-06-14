import { create } from 'zustand';

export type UserRole = 'ADMIN' | 'PHARMACIST' | 'VILLAGE_DOCTOR';

export interface UserInfo {
  id: string;
  name: string;
  role: UserRole;
  orgId?: string;
  orgName?: string;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: '管理员',
  PHARMACIST: '药师',
  VILLAGE_DOCTOR: '村医',
};

const roleUsers: Record<UserRole, UserInfo> = {
  ADMIN: { id: 'user-001', name: '系统管理员', role: 'ADMIN' },
  PHARMACIST: { id: 'user-002', name: '张药师', role: 'PHARMACIST', orgId: '1', orgName: '县人民医院' },
  VILLAGE_DOCTOR: { id: 'user-003', name: '李村医', role: 'VILLAGE_DOCTOR', orgId: '8', orgName: '城关镇东门村卫生室' },
};

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  getRoleLabel: (role: UserRole) => string;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  login: (role) => {
    set({ user: roleUsers[role], isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  switchRole: (role) => {
    set({ user: roleUsers[role] });
  },
  getRoleLabel: (role) => roleLabels[role],
}));
