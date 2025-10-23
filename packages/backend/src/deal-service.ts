import { dataStore } from './data-store';
import { Deal, SearchFilters, SortOptions } from './types';

export class DealService {
  searchAndFilter(filters: SearchFilters = {}, sort?: SortOptions): Deal[] {
    let results = dataStore.getDeals();

    if (filters.text) {
      const searchText = filters.text.toLowerCase();
      results = results.filter(
        (deal) =>
          deal.title.toLowerCase().includes(searchText) ||
          deal.description.toLowerCase().includes(searchText) ||
          deal.vendor.toLowerCase().includes(searchText),
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((deal) =>
        filters.tags!.some((tag) => deal.tags.includes(tag.toLowerCase())),
      );
    }

    if (filters.cuisine && filters.cuisine.length > 0) {
      results = results.filter((deal) => filters.cuisine!.includes(deal.cuisine));
    }

    if (filters.vendor && filters.vendor.length > 0) {
      results = results.filter((deal) => filters.vendor!.includes(deal.vendor));
    }

    if (filters.minDiscount !== undefined) {
      results = results.filter((deal) => deal.discount >= filters.minDiscount!);
    }

    if (filters.maxDiscount !== undefined) {
      results = results.filter((deal) => deal.discount <= filters.maxDiscount!);
    }

    if (filters.expiresAfter) {
      results = results.filter((deal) => deal.expiresAt >= filters.expiresAfter!);
    }

    if (filters.expiresBefore) {
      results = results.filter((deal) => deal.expiresAt <= filters.expiresBefore!);
    }

    if (sort) {
      results.sort((a, b) => {
        let aVal: string | number | Date;
        let bVal: string | number | Date;

        switch (sort.field) {
          case 'discount':
            aVal = a.discount;
            bVal = b.discount;
            break;
          case 'expiresAt':
            aVal = a.expiresAt.getTime();
            bVal = b.expiresAt.getTime();
            break;
          case 'createdAt':
            aVal = a.createdAt.getTime();
            bVal = b.createdAt.getTime();
            break;
          case 'title':
            aVal = a.title.toLowerCase();
            bVal = b.title.toLowerCase();
            break;
          default:
            return 0;
        }

        if (sort.order === 'asc') {
          return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        } else {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
      });
    }

    return results;
  }

  getAvailableCuisines(): string[] {
    const cuisines = new Set(dataStore.getDeals().map((d) => d.cuisine));
    return Array.from(cuisines).sort();
  }

  getAvailableVendors(): string[] {
    const vendors = new Set(dataStore.getDeals().map((d) => d.vendor));
    return Array.from(vendors).sort();
  }

  getAvailableTags(): string[] {
    const tags = new Set(dataStore.getDeals().flatMap((d) => d.tags));
    return Array.from(tags).sort();
  }
}

export const dealService = new DealService();
