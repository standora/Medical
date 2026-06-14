import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DrugCatalog } from '../types/drug.types';

interface CatalogState {
  catalogs: DrugCatalog[];
  loading: boolean;
  selectedCatalog: DrugCatalog | null;
  setCatalogs: (catalogs: DrugCatalog[]) => void;
  setLoading: (loading: boolean) => void;
  setSelectedCatalog: (catalog: DrugCatalog | null) => void;
  addCatalog: (catalog: DrugCatalog) => void;
  updateCatalog: (id: string, data: Partial<DrugCatalog>) => void;
  deleteCatalog: (id: string) => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set, get) => ({
      catalogs: [],
      loading: false,
      selectedCatalog: null,
      setCatalogs: (catalogs) => set({ catalogs }),
      setLoading: (loading) => set({ loading }),
      setSelectedCatalog: (selectedCatalog) => set({ selectedCatalog }),
      addCatalog: (catalog) => set({ catalogs: [...get().catalogs, catalog] }),
      updateCatalog: (id, data) =>
        set({
          catalogs: get().catalogs.map((c) =>
            c.id === id ? { ...c, ...data } : c,
          ),
        }),
      deleteCatalog: (id) =>
        set({ catalogs: get().catalogs.filter((c) => c.id !== id) }),
    }),
    {
      name: 'catalog-store',
      partialize: (state) =>
        Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== 'loading'),
        ) as CatalogState,
    },
  ),
);
