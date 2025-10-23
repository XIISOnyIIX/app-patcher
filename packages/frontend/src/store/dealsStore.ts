import { create } from 'zustand';

import { dealsService } from '../services/dealsService';
import type { Deal, FilterOptions } from '../types';

interface DealsState {
  deals: Deal[];
  featuredDeals: Deal[];
  selectedDeal: Deal | null;
  filters: FilterOptions;
  vendors: string[];
  categories: string[];
  isLoading: boolean;
  error: string | null;

  fetchDeals: () => Promise<void>;
  fetchFeaturedDeals: () => Promise<void>;
  fetchVendors: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  setSelectedDeal: (deal: Deal | null) => void;
}

const initialFilters: FilterOptions = {
  vendors: [],
  categories: [],
  minDiscount: undefined,
  maxPrice: undefined,
  searchQuery: '',
};

export const useDealsStore = create<DealsState>((set, get) => ({
  deals: [],
  featuredDeals: [],
  selectedDeal: null,
  filters: initialFilters,
  vendors: [],
  categories: [],
  isLoading: false,
  error: null,

  fetchDeals: async () => {
    set({ isLoading: true, error: null });
    try {
      const deals = await dealsService.getDeals(get().filters);
      set({ deals, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch deals',
        isLoading: false,
      });
    }
  },

  fetchFeaturedDeals: async () => {
    try {
      const featuredDeals = await dealsService.getFeaturedDeals();
      set({ featuredDeals });
    } catch (error) {
      console.error('Failed to fetch featured deals:', error);
    }
  },

  fetchVendors: async () => {
    try {
      const vendors = await dealsService.getVendors();
      set({ vendors });
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    }
  },

  fetchCategories: async () => {
    try {
      const categories = await dealsService.getCategories();
      set({ categories });
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
    get().fetchDeals();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().fetchDeals();
  },

  setSelectedDeal: (deal) => {
    set({ selectedDeal: deal });
  },
}));
