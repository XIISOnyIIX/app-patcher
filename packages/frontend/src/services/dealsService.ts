import type { Deal, ApiResponse, FilterOptions } from '../types';
import { api } from './api';

export const dealsService = {
  async getDeals(filters?: FilterOptions): Promise<Deal[]> {
    const params = new URLSearchParams();
    if (filters?.vendors?.length) {
      params.append('vendors', filters.vendors.join(','));
    }
    if (filters?.categories?.length) {
      params.append('categories', filters.categories.join(','));
    }
    if (filters?.minDiscount) {
      params.append('minDiscount', filters.minDiscount.toString());
    }
    if (filters?.maxPrice) {
      params.append('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.searchQuery) {
      params.append('search', filters.searchQuery);
    }

    const queryString = params.toString();
    const endpoint = `/api/deals${queryString ? `?${queryString}` : ''}`;

    const response = await api.get<ApiResponse<Deal[]>>(endpoint);
    return response.data;
  },

  async getFeaturedDeals(): Promise<Deal[]> {
    const response = await api.get<ApiResponse<Deal[]>>('/api/deals/featured');
    return response.data;
  },

  async getDealById(id: string): Promise<Deal> {
    const response = await api.get<ApiResponse<Deal>>(`/api/deals/${id}`);
    return response.data;
  },

  async getVendors(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/api/vendors');
    return response.data;
  },

  async getCategories(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>('/api/categories');
    return response.data;
  },
};
