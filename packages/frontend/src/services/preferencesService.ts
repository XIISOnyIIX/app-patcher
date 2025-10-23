import type { UserPreferences, ApiResponse } from '../types';
import { api } from './api';

export const preferencesService = {
  async getPreferences(): Promise<UserPreferences> {
    const response = await api.get<ApiResponse<UserPreferences>>('/api/preferences');
    return response.data;
  },

  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const response = await api.put<ApiResponse<UserPreferences>>('/api/preferences', preferences);
    return response.data;
  },

  async toggleFavoriteVendor(vendorId: string): Promise<UserPreferences> {
    const response = await api.post<ApiResponse<UserPreferences>>(
      '/api/preferences/favorite-vendor',
      {
        vendorId,
      },
    );
    return response.data;
  },

  async toggleFavoriteCategory(category: string): Promise<UserPreferences> {
    const response = await api.post<ApiResponse<UserPreferences>>(
      '/api/preferences/favorite-category',
      {
        category,
      },
    );
    return response.data;
  },
};
