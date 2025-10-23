import { useState, useEffect } from 'react';

import { SearchFilters } from '../types';

interface FilterPanelProps {
  onFilterChange: (filters: SearchFilters) => void;
  availableCuisines: string[];
  availableVendors: string[];
}

export default function FilterPanel({
  onFilterChange,
  availableCuisines,
  availableVendors,
}: FilterPanelProps) {
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [maxDiscount, setMaxDiscount] = useState<number>(100);
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    const filters: SearchFilters = {
      cuisine: selectedCuisines.length > 0 ? selectedCuisines : undefined,
      vendor: selectedVendors.length > 0 ? selectedVendors : undefined,
      minDiscount: minDiscount > 0 ? minDiscount : undefined,
      maxDiscount: maxDiscount < 100 ? maxDiscount : undefined,
      expiresAfter: !showExpired ? new Date().toISOString() : undefined,
    };
    onFilterChange(filters);
  }, [selectedCuisines, selectedVendors, minDiscount, maxDiscount, showExpired, onFilterChange]);

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine],
    );
  };

  const toggleVendor = (vendor: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendor) ? prev.filter((v) => v !== vendor) : [...prev, vendor],
    );
  };

  const resetFilters = () => {
    setSelectedCuisines([]);
    setSelectedVendors([]);
    setMinDiscount(0);
    setMaxDiscount(100);
    setShowExpired(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button className="btn btn-sm btn-ghost" onClick={resetFilters}>
          Reset All
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label">
            <span className="label-text font-medium">Cuisine</span>
          </label>
          <div className="space-y-2">
            {availableCuisines.map((cuisine) => (
              <label key={cuisine} className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedCuisines.includes(cuisine)}
                  onChange={() => toggleCuisine(cuisine)}
                />
                <span className="text-sm">{cuisine}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Vendor</span>
          </label>
          <div className="space-y-2">
            {availableVendors.map((vendor) => (
              <label key={vendor} className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedVendors.includes(vendor)}
                  onChange={() => toggleVendor(vendor)}
                />
                <span className="text-sm">{vendor}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <label className="label">
            <span className="label-text font-medium">Discount Range</span>
          </label>
          <div className="space-y-2">
            <div className="flex gap-2 items-center">
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={minDiscount}
                onChange={(e) => setMinDiscount(Number(e.target.value))}
                min="0"
                max="100"
              />
              <span>%</span>
              <span>to</span>
              <input
                type="number"
                className="input input-sm input-bordered w-20"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(Number(e.target.value))}
                min="0"
                max="100"
              />
              <span>%</span>
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div>
          <label className="cursor-pointer flex items-center gap-2">
            <input
              type="checkbox"
              className="checkbox"
              checked={showExpired}
              onChange={(e) => setShowExpired(e.target.checked)}
            />
            <span className="label-text">Show expired deals</span>
          </label>
        </div>
      </div>
    </div>
  );
}
