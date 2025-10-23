import { useEffect } from 'react';

import { useDealsStore } from '../store/dealsStore';

export const useDeals = () => {
  const {
    deals,
    featuredDeals,
    selectedDeal,
    filters,
    vendors,
    categories,
    isLoading,
    error,
    fetchDeals,
    fetchFeaturedDeals,
    fetchVendors,
    fetchCategories,
    setFilters,
    clearFilters,
    setSelectedDeal,
  } = useDealsStore();

  useEffect(() => {
    void fetchDeals();
    void fetchFeaturedDeals();
    void fetchVendors();
    void fetchCategories();
  }, [fetchDeals, fetchFeaturedDeals, fetchVendors, fetchCategories]);

  return {
    deals,
    featuredDeals,
    selectedDeal,
    filters,
    vendors,
    categories,
    isLoading,
    error,
    setFilters,
    clearFilters,
    setSelectedDeal,
    refetch: fetchDeals,
  };
};
