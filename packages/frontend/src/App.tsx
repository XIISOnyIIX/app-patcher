import { useState, useEffect, useCallback } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { api } from './api';
import DealCard from './components/DealCard';
import FilterPanel from './components/FilterPanel';
import PreferencesModal from './components/PreferencesModal';
import SavedSearches from './components/SavedSearches';
import SearchBar from './components/SearchBar';
import { Deal, SearchFilters, SortOptions } from './types';

const USER_ID = 'demo-user';

export default function App() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [additionalFilters, setAdditionalFilters] = useState<SearchFilters>({});
  const [sortOptions, setSortOptions] = useState<SortOptions>({
    field: 'createdAt',
    order: 'desc',
  });
  const [showPreferences, setShowPreferences] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [availableVendors, setAvailableVendors] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const loadDeals = useCallback(async () => {
    setLoading(true);
    try {
      const combinedFilters = { ...searchFilters, ...additionalFilters };
      const data = await api.getDeals(combinedFilters, sortOptions);
      setDeals(data);
    } catch (error) {
      console.error('Failed to load deals:', error);
      toast.error('Failed to load deals');
    } finally {
      setLoading(false);
    }
  }, [searchFilters, additionalFilters, sortOptions]);

  const loadInitialData = useCallback(async () => {
    try {
      const [cuisines, vendors, tags] = await Promise.all([
        api.getCuisines(),
        api.getVendors(),
        api.getTags(),
      ]);
      setAvailableCuisines(cuisines);
      setAvailableVendors(vendors);
      setAvailableTags(tags);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  }, []);

  const connectToEvents = useCallback(() => {
    try {
      const eventSource = api.connectToEvents((event) => {
        if (event.type === 'connected') {
          console.log('Connected to live alerts');
        } else if (event.type === 'new-deal' && event.deal) {
          toast.info(`🎉 New deal: ${event.deal.title}`, {
            position: 'top-right',
            autoClose: 5000,
            onClick: () => loadDeals(),
          });
        } else if (event.type === 'deal-expiring' && event.deal) {
          toast.warning(`⏰ Deal expiring soon: ${event.deal.title}`, {
            position: 'top-right',
            autoClose: 5000,
          });
        }
      });

      return () => eventSource.close();
    } catch (error) {
      console.error('Failed to connect to events:', error);
    }
  }, [loadDeals]);

  useEffect(() => {
    loadInitialData();
    connectToEvents();
  }, [loadInitialData, connectToEvents]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const handleSearch = (text: string, tags: string[]) => {
    setSearchFilters({
      text: text || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };

  const handleLoadSavedSearch = (filters: SearchFilters, sort?: SortOptions) => {
    setSearchFilters({ text: filters.text, tags: filters.tags });
    setAdditionalFilters({
      cuisine: filters.cuisine,
      vendor: filters.vendor,
      minDiscount: filters.minDiscount,
      maxDiscount: filters.maxDiscount,
      expiresAfter: filters.expiresAfter,
      expiresBefore: filters.expiresBefore,
    });
    if (sort) setSortOptions(sort);
    setShowSidebar(false);
  };

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <header className="bg-base-100 shadow sticky top-0 z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">FoodDealSniper</h1>
          <div className="flex gap-2">
            <button className="btn btn-outline btn-sm" onClick={() => setShowSidebar(!showSidebar)}>
              {showSidebar ? 'Hide' : 'Show'} Filters
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowPreferences(true)}>
              Preferences
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        <div className="space-y-6">
          <SearchBar onSearch={handleSearch} availableTags={availableTags} />

          <div className="flex gap-2 items-center">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              className="select select-sm select-bordered"
              value={sortOptions.field}
              onChange={(e) =>
                setSortOptions({ ...sortOptions, field: e.target.value as SortOptions['field'] })
              }
            >
              <option value="createdAt">Newest</option>
              <option value="discount">Discount</option>
              <option value="expiresAt">Expiration</option>
              <option value="title">Name</option>
            </select>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() =>
                setSortOptions({
                  ...sortOptions,
                  order: sortOptions.order === 'asc' ? 'desc' : 'asc',
                })
              }
            >
              {sortOptions.order === 'asc' ? '↑' : '↓'}
            </button>
            <div className="ml-auto text-sm opacity-70">
              {deals.length} deal{deals.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {showSidebar && (
              <aside className="lg:col-span-1 space-y-6">
                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <FilterPanel
                      onFilterChange={setAdditionalFilters}
                      availableCuisines={availableCuisines}
                      availableVendors={availableVendors}
                    />
                  </div>
                </div>

                <div className="card bg-base-100 shadow">
                  <div className="card-body">
                    <SavedSearches
                      userId={USER_ID}
                      onLoadSearch={handleLoadSavedSearch}
                      currentFilters={{ ...searchFilters, ...additionalFilters }}
                      currentSort={sortOptions}
                    />
                  </div>
                </div>
              </aside>
            )}

            <div className={showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {loading ? (
                <div className="flex justify-center py-20">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : deals.length === 0 ? (
                <div className="card bg-base-100 shadow">
                  <div className="card-body text-center py-20">
                    <p className="text-lg opacity-70">No deals found matching your criteria</p>
                    <p className="text-sm opacity-50">Try adjusting your filters or search terms</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <PreferencesModal
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
        userId={USER_ID}
        availableCuisines={availableCuisines}
      />

      <ToastContainer theme="dark" />
    </div>
  );
}
