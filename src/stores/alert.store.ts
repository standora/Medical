import { create } from 'zustand';

interface InventoryState {
  alertCount: number;
  setAlertCount: (count: number) => void;
  fetchAlertCount: () => Promise<void>;
}

export const useInventoryStore = create<InventoryState>()((set) => ({
  alertCount: 0,
  setAlertCount: (count) => set({ alertCount: count }),
  fetchAlertCount: async () => {
    try {
      const res = await fetch('/api/v1/inventory/alerts');
      const data = await res.json();
      const pendingCount = (data.items ?? []).filter(
        (item: { status: string }) => item.status === 'PENDING',
      ).length;
      set({ alertCount: pendingCount });
    } catch {
      set({ alertCount: 0 });
    }
  },
}));
