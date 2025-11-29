import { create } from 'zustand';
import { assets as initialAssets } from './mockData';

export type Asset = typeof initialAssets[0];

interface AppState {
  assets: Asset[];
  addAsset: (asset: Asset) => void;
  deleteAsset: (id: string) => void;
  updateAsset: (id: string, updates: Partial<Asset>) => void;
}

export const useStore = create<AppState>((set) => ({
  assets: initialAssets,
  addAsset: (asset) => set((state) => ({ assets: [asset, ...state.assets] })),
  deleteAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id) })),
  updateAsset: (id, updates) => set((state) => ({
    assets: state.assets.map((a) => (a.id === id ? { ...a, ...updates } : a)),
  })),
}));
