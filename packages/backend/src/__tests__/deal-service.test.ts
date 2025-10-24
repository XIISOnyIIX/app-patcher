import { DealService } from '../deal-service';

describe('DealService', () => {
  let dealService: DealService;

  beforeEach(() => {
    dealService = new DealService();
  });

  describe('searchAndFilter', () => {
    it('should return all deals when no filters applied', () => {
      const deals = dealService.searchAndFilter({});
      expect(deals.length).toBeGreaterThan(0);
    });

    it('should filter deals by text search', () => {
      const deals = dealService.searchAndFilter({ text: 'sushi' });
      expect(deals.length).toBeGreaterThan(0);
      deals.forEach((deal) => {
        const searchText = `${deal.title} ${deal.description}`.toLowerCase();
        expect(searchText).toContain('sushi');
      });
    });

    it('should filter deals by cuisine', () => {
      const deals = dealService.searchAndFilter({ cuisine: ['Japanese'] });
      expect(deals.length).toBeGreaterThan(0);
      deals.forEach((deal) => {
        expect(deal.cuisine).toBe('Japanese');
      });
    });

    it('should filter deals by vendor', () => {
      const deals = dealService.searchAndFilter({ vendor: ['Sakura Downtown'] });
      expect(deals.length).toBeGreaterThan(0);
      deals.forEach((deal) => {
        expect(deal.vendor).toBe('Sakura Downtown');
      });
    });

    it('should filter deals by minimum discount', () => {
      const minDiscount = 30;
      const deals = dealService.searchAndFilter({ minDiscount });
      expect(deals.length).toBeGreaterThan(0);
      deals.forEach((deal) => {
        expect(deal.discount).toBeGreaterThanOrEqual(minDiscount);
      });
    });

    it('should filter deals by maximum discount', () => {
      const maxDiscount = 30;
      const deals = dealService.searchAndFilter({ maxDiscount });
      expect(deals.length).toBeGreaterThan(0);
      deals.forEach((deal) => {
        expect(deal.discount).toBeLessThanOrEqual(maxDiscount);
      });
    });

    it('should filter deals by discount range', () => {
      const minDiscount = 20;
      const maxDiscount = 50;
      const deals = dealService.searchAndFilter({ minDiscount, maxDiscount });
      deals.forEach((deal) => {
        expect(deal.discount).toBeGreaterThanOrEqual(minDiscount);
        expect(deal.discount).toBeLessThanOrEqual(maxDiscount);
      });
    });

    it('should filter deals by tags', () => {
      const deals = dealService.searchAndFilter({ tags: ['sushi'] });
      deals.forEach((deal) => {
        expect(deal.tags).toContain('sushi');
      });
    });

    it('should combine multiple filters', () => {
      const deals = dealService.searchAndFilter({
        cuisine: ['Japanese'],
        minDiscount: 30,
      });
      deals.forEach((deal) => {
        expect(deal.cuisine).toBe('Japanese');
        expect(deal.discount).toBeGreaterThanOrEqual(30);
      });
    });
  });

  describe('sorting', () => {
    it('should sort deals by discount descending', () => {
      const deals = dealService.searchAndFilter(
        {},
        { field: 'discount', order: 'desc' }
      );
      for (let i = 0; i < deals.length - 1; i++) {
        expect(deals[i].discount).toBeGreaterThanOrEqual(deals[i + 1].discount);
      }
    });

    it('should sort deals by discount ascending', () => {
      const deals = dealService.searchAndFilter(
        {},
        { field: 'discount', order: 'asc' }
      );
      for (let i = 0; i < deals.length - 1; i++) {
        expect(deals[i].discount).toBeLessThanOrEqual(deals[i + 1].discount);
      }
    });

    it('should sort deals by expiration date', () => {
      const deals = dealService.searchAndFilter(
        {},
        { field: 'expiresAt', order: 'asc' }
      );
      for (let i = 0; i < deals.length - 1; i++) {
        expect(deals[i].expiresAt.getTime()).toBeLessThanOrEqual(
          deals[i + 1].expiresAt.getTime()
        );
      }
    });

    it('should sort deals by creation date', () => {
      const deals = dealService.searchAndFilter(
        {},
        { field: 'createdAt', order: 'desc' }
      );
      for (let i = 0; i < deals.length - 1; i++) {
        expect(deals[i].createdAt.getTime()).toBeGreaterThanOrEqual(
          deals[i + 1].createdAt.getTime()
        );
      }
    });
  });

  describe('getAvailableCuisines', () => {
    it('should return unique list of cuisines', () => {
      const cuisines = dealService.getAvailableCuisines();
      expect(cuisines.length).toBeGreaterThan(0);
      const uniqueCuisines = new Set(cuisines);
      expect(uniqueCuisines.size).toBe(cuisines.length);
    });
  });

  describe('getAvailableVendors', () => {
    it('should return unique list of vendors', () => {
      const vendors = dealService.getAvailableVendors();
      expect(vendors.length).toBeGreaterThan(0);
      const uniqueVendors = new Set(vendors);
      expect(uniqueVendors.size).toBe(vendors.length);
    });
  });

  describe('getAvailableTags', () => {
    it('should return unique list of tags', () => {
      const tags = dealService.getAvailableTags();
      expect(tags.length).toBeGreaterThan(0);
      const uniqueTags = new Set(tags);
      expect(uniqueTags.size).toBe(tags.length);
    });
  });
});
