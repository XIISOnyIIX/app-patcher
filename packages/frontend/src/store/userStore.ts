import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { preferencesService } from '../services/preferencesService';
import type { UserPreferences } from '../types';

interface UserState {
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;

  fetchPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<UserPreferences>) => Promise<void>;
  toggleFavoriteVendor: (vendorId: string) => Promise<void>;
  toggleFavoriteCategory: (category: string) => Promise<void>;
}

const defaultPreferences: UserPreferences = {
  favoriteVendors: [],
  favoriteCategories: [],
  notificationsEnabled: true,
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      preferences: defaultPreferences,
      isLoading: false,
      error: null,

      fetchPreferences: async () => {
        set({ isLoading: true, error: null });
        try {
          const preferences = await preferencesService.getPreferences();
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch preferences',
            isLoading: false,
            preferences: defaultPreferences,
          });
        }
      },

      updatePreferences: async (newPreferences) => {
        set({ isLoading: true, error: null });
        try {
          const preferences = await preferencesService.updatePreferences(newPreferences);
          set({ preferences, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update preferences',
            isLoading: false,
          });
        }
      },

      toggleFavoriteVendor: async (vendorId) => {
        try {
          const preferences = await preferencesService.toggleFavoriteVendor(vendorId);
          set({ preferences });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to toggle favorite vendor',
          });
        }
      },

      toggleFavoriteCategory: async (category) => {
        try {
          const preferences = await preferencesService.toggleFavoriteCategory(category);
          set({ preferences });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to toggle favorite category',
          });
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ preferences: state.preferences }),
    },
  ),
);
