import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Inventory, InventoryAlert, ZeroInventoryConfig, AutoReplenishment } from '../types/inventory.types';

interface InventoryState {
  inventories: Inventory[];
  alerts: InventoryAlert[];
  zeroInventoryConfigs: ZeroInventoryConfig[];
  autoReplenishments: AutoReplenishment[];
  inventoryTransfers: any[];
  loading: boolean;
  setInventories: (inventories: Inventory[]) => void;
  setAlerts: (alerts: InventoryAlert[]) => void;
  setZeroInventoryConfigs: (configs: ZeroInventoryConfig[]) => void;
  setAutoReplenishments: (items: AutoReplenishment[]) => void;
  setLoading: (loading: boolean) => void;
  addAlert: (alert: InventoryAlert) => void;
  updateAlert: (id: string, data: Partial<InventoryAlert>) => void;
  addZeroInventoryConfig: (config: ZeroInventoryConfig) => void;
  updateZeroInventoryConfig: (id: string, data: Partial<ZeroInventoryConfig>) => void;
  deleteZeroInventoryConfig: (id: string) => void;
  updateAutoReplenishment: (id: string, data: Partial<AutoReplenishment>) => void;
  addInventoryTransfer: (transfer: any) => void;
  updateInventoryTransfer: (id: string, data: any) => void;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventories: [],
      alerts: [],
      zeroInventoryConfigs: [],
      autoReplenishments: [],
      inventoryTransfers: [],
      loading: false,
      setInventories: (inventories) => set({ inventories }),
      setAlerts: (alerts) => set({ alerts }),
      setZeroInventoryConfigs: (zeroInventoryConfigs) => set({ zeroInventoryConfigs }),
      setAutoReplenishments: (autoReplenishments) => set({ autoReplenishments }),
      setLoading: (loading) => set({ loading }),
      addAlert: (alert) => set({ alerts: [...get().alerts, alert] }),
      updateAlert: (id, data) =>
        set({
          alerts: get().alerts.map((a) =>
            a.id === id ? { ...a, ...data } : a,
          ),
        }),
      addZeroInventoryConfig: (config) =>
        set({ zeroInventoryConfigs: [...get().zeroInventoryConfigs, config] }),
      updateZeroInventoryConfig: (id, data) =>
        set({
          zeroInventoryConfigs: get().zeroInventoryConfigs.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          ),
        }),
      deleteZeroInventoryConfig: (id) =>
        set({
          zeroInventoryConfigs: get().zeroInventoryConfigs.filter((c) => c.id !== id),
        }),
      updateAutoReplenishment: (id, data) =>
        set({
          autoReplenishments: get().autoReplenishments.map((a) =>
            a.id === id ? { ...a, ...data } : a,
          ),
        }),
      addInventoryTransfer: (transfer) =>
        set({ inventoryTransfers: [...get().inventoryTransfers, transfer] }),
      updateInventoryTransfer: (id, data) =>
        set({
          inventoryTransfers: get().inventoryTransfers.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        }),
    }),
    {
      name: 'inventory-store',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== 'loading'),
        ) as InventoryState,
    },
  ),
);
