import { useState } from 'react';

import type { FilterOptions } from '../types';

interface VendorFiltersProps {
  vendors: string[];
  categories: string[];
  filters: FilterOptions;
  onFilterChange: (filters: Partial<FilterOptions>) => void;
  onClearFilters: () => void;
}

export default function VendorFilters({
  vendors,
  categories,
  filters,
  onFilterChange,
  onClearFilters,
}: VendorFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVendor = (vendor: string) => {
    const newVendors = filters.vendors.includes(vendor)
      ? filters.vendors.filter((v) => v !== vendor)
      : [...filters.vendors, vendor];
    onFilterChange({ vendors: newVendors });
  };

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ categories: newCategories });
  };

  const hasActiveFilters =
    filters.vendors.length > 0 ||
    filters.categories.length > 0 ||
    filters.minDiscount !== undefined ||
    filters.maxPrice !== undefined;

  return (
    <>
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button className="btn btn-outline btn-sm" onClick={() => setIsOpen(!isOpen)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          Filters {hasActiveFilters && `(${filters.vendors.length + filters.categories.length})`}
        </button>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={onClearFilters}>
            Clear all
          </button>
        )}
      </div>

      <aside className={`${isOpen ? 'block' : 'hidden'} space-y-6 lg:block`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <button className="btn btn-ghost btn-sm hidden lg:flex" onClick={onClearFilters}>
              Clear all
            </button>
          )}
        </div>

        <div className="form-control space-y-2">
          <label className="label">
            <span className="label-text font-medium">Min Discount %</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={filters.minDiscount || 0}
            className="range range-primary range-sm"
            onChange={(e) => onFilterChange({ minDiscount: Number(e.target.value) })}
          />
          <div className="flex justify-between text-xs opacity-70">
            <span>0%</span>
            <span className="font-bold">{filters.minDiscount || 0}%</span>
            <span>100%</span>
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium">Max Price</span>
          </label>
          <input
            type="number"
            placeholder="No limit"
            className="input input-bordered input-sm"
            value={filters.maxPrice || ''}
            onChange={(e) =>
              onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })
            }
          />
        </div>

        <div className="divider"></div>

        <div>
          <h4 className="mb-3 font-medium">Categories</h4>
          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-sm opacity-60">No categories available</p>
            ) : (
              categories.map((category) => (
                <label key={category} className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={filters.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  <span className="label-text">{category}</span>
                </label>
              ))
            )}
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <h4 className="mb-3 font-medium">Vendors</h4>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {vendors.length === 0 ? (
              <p className="text-sm opacity-60">No vendors available</p>
            ) : (
              vendors.map((vendor) => (
                <label key={vendor} className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={filters.vendors.includes(vendor)}
                    onChange={() => toggleVendor(vendor)}
                  />
                  <span className="label-text">{vendor}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
