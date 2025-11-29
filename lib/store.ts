import { create } from 'zustand';
import { assets as initialAssets } from './mockData';
import type { Asset } from './types';

interface AppState {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
}

export const useStore = create<AppState>((set) => ({
  assets: initialAssets as Asset[],
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  deleteAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map((a) => 
      a.id === id 
        ? { ...a, ...updates, updatedAt: new Date().toISOString() } 
        : a
    ),
  })),
}));

// Re-export Asset type for convenience
export type { Asset };
