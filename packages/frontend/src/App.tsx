import { useEffect, useState } from 'react';

import DealCard from './components/DealCard';
import DealModal from './components/DealModal';
import ErrorMessage from './components/ErrorMessage';
import FeaturedDeals from './components/FeaturedDeals';
import LoadingSpinner from './components/LoadingSpinner';
import Navigation from './components/Navigation';
import VendorFilters from './components/VendorFilters';
import { useDeals } from './hooks/useDeals';
import { useAlertsStore } from './store/alertsStore';
import { useUserStore } from './store/userStore';
import type { Deal } from './types';

export default function App() {
  const {
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
    refetch,
  } = useDeals();

  const { preferences, fetchPreferences } = useUserStore();
  const { fetchAlerts } = useAlertsStore();
  const [mockDeals, setMockDeals] = useState<Deal[]>([]);
  const [showMockData, setShowMockData] = useState(false);

  useEffect(() => {
    void fetchPreferences();
    void fetchAlerts();

    const generateMockDeals = (): Deal[] => {
      const mockVendors = [
        {
          id: '1',
          name: 'Sakura Sushi',
          logo: '',
          rating: 4.5,
          deliveryTime: '25-35 min',
          cuisine: ['Japanese', 'Sushi'],
        },
        {
          id: '2',
          name: "Mario's Pizza",
          logo: '',
          rating: 4.7,
          deliveryTime: '20-30 min',
          cuisine: ['Italian', 'Pizza'],
        },
        {
          id: '3',
          name: 'Taco Fiesta',
          logo: '',
          rating: 4.3,
          deliveryTime: '15-25 min',
          cuisine: ['Mexican', 'Tacos'],
        },
        {
          id: '4',
          name: 'Golden Dragon',
          logo: '',
          rating: 4.6,
          deliveryTime: '30-40 min',
          cuisine: ['Chinese', 'Asian'],
        },
        {
          id: '5',
          name: 'Burger Haven',
          logo: '',
          rating: 4.4,
          deliveryTime: '20-30 min',
          cuisine: ['American', 'Burgers'],
        },
      ];

      return [
        {
          id: '1',
          title: 'Half-price Sushi Platters',
          description:
            'Tonight only at Sakura Downtown — online orders get 50% off family packs. Perfect for sharing!',
          vendor: mockVendors[0],
          category: 'Japanese',
          originalPrice: 45.99,
          discountedPrice: 22.99,
          discountPercentage: 50,
          imageUrl: '',
          expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
          isFeatured: true,
          tags: ['Popular', 'Family Pack'],
          minOrder: 15,
          deliveryFee: 2.99,
          availableAt: ['Downtown', 'Westside'],
        },
        {
          id: '2',
          title: 'Free Delivery on Pizza Orders',
          description:
            'Get your favorite pizza delivered free! No minimum order required. Limited time offer.',
          vendor: mockVendors[1],
          category: 'Italian',
          originalPrice: 18.99,
          discountedPrice: 18.99,
          discountPercentage: 0,
          imageUrl: '',
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          isFeatured: true,
          tags: ['Free Delivery'],
          deliveryFee: 0,
          availableAt: ['All Locations'],
        },
        {
          id: '3',
          title: 'Taco Tuesday Special',
          description: '3 tacos for the price of 2! Choose from all our signature varieties.',
          vendor: mockVendors[2],
          category: 'Mexican',
          originalPrice: 12.99,
          discountedPrice: 8.66,
          discountPercentage: 33,
          imageUrl: '',
          expiresAt: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
          isFeatured: false,
          tags: ['Quick Bite'],
          minOrder: 5,
          deliveryFee: 1.99,
          availableAt: ['North End', 'South Bay'],
        },
        {
          id: '4',
          title: 'Lunch Combo Deal',
          description: 'Choose any 2 entrees with fried rice and egg roll. Best value for lunch!',
          vendor: mockVendors[3],
          category: 'Chinese',
          originalPrice: 24.99,
          discountedPrice: 17.49,
          discountPercentage: 30,
          imageUrl: '',
          expiresAt: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          isFeatured: false,
          tags: ['Lunch Special', 'Combo'],
          minOrder: 10,
          deliveryFee: 2.49,
          availableAt: ['Downtown', 'East Side'],
        },
        {
          id: '5',
          title: 'Buy 1 Get 1 Burgers',
          description:
            'Order any signature burger and get a second one free! Valid on all premium burgers.',
          vendor: mockVendors[4],
          category: 'American',
          originalPrice: 28.98,
          discountedPrice: 14.49,
          discountPercentage: 50,
          imageUrl: '',
          expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
          isFeatured: true,
          tags: ['BOGO', 'Best Seller'],
          minOrder: 12,
          deliveryFee: 2.99,
          availableAt: ['All Locations'],
        },
        {
          id: '6',
          title: 'Late Night Sushi Rolls',
          description: '40% off all specialty rolls after 9 PM. Fresh ingredients, amazing prices!',
          vendor: mockVendors[0],
          category: 'Japanese',
          originalPrice: 32.99,
          discountedPrice: 19.79,
          discountPercentage: 40,
          imageUrl: '',
          expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          isFeatured: false,
          tags: ['Late Night'],
          minOrder: 15,
          deliveryFee: 3.49,
          availableAt: ['Downtown'],
        },
      ];
    };

    const mock = generateMockDeals();
    setMockDeals(mock);

    if (deals.length === 0 && !isLoading && !error) {
      setShowMockData(true);
    }
  }, [deals.length, isLoading, error, fetchPreferences, fetchAlerts]);

  const handleSearchChange = (query: string) => {
    setFilters({ searchQuery: query });
  };

  const handleDealClick = (deal: Deal) => {
    setSelectedDeal(deal);
  };

  const handleModalClose = () => {
    setSelectedDeal(null);
  };

  const isFavoriteVendor = (vendorId: string) => {
    return preferences?.favoriteVendors.includes(vendorId) || false;
  };

  const displayDeals = showMockData ? mockDeals : deals;
  const displayFeaturedDeals = showMockData ? mockDeals.filter((d) => d.isFeatured) : featuredDeals;

  const allVendors = showMockData
    ? Array.from(new Set(mockDeals.map((d) => d.vendor.name)))
    : vendors;
  const allCategories = showMockData
    ? Array.from(new Set(mockDeals.map((d) => d.category)))
    : categories;

  return (
    <div className="min-h-screen bg-base-200 text-base-content">
      <Navigation onSearch={handleSearchChange} />

      <main className="mx-auto max-w-7xl px-4 py-8">
        {error && !showMockData && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={refetch} />
          </div>
        )}

        {showMockData && (
          <div className="alert alert-info mb-6 shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="h-6 w-6 shrink-0 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Showing sample data. Connect to the backend API to see real deals!</span>
          </div>
        )}

        <FeaturedDeals deals={displayFeaturedDeals} onDealClick={handleDealClick} />

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <VendorFilters
            vendors={allVendors}
            categories={allCategories}
            filters={filters}
            onFilterChange={setFilters}
            onClearFilters={clearFilters}
          />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold">All Deals</h2>
              <p className="text-sm opacity-70">{displayDeals.length} deals found</p>
            </div>

            {isLoading && !showMockData ? (
              <LoadingSpinner size="lg" message="Loading deals..." />
            ) : displayDeals.length === 0 ? (
              <div className="rounded-xl border border-dashed border-base-300 bg-base-100 p-12 text-center">
                <p className="mb-2 text-lg font-semibold">No deals found</p>
                <p className="text-sm opacity-70">
                  Try adjusting your filters or check back later for new deals
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {displayDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onClick={handleDealClick}
                    isFavorite={isFavoriteVendor(deal.vendor.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <DealModal deal={selectedDeal} isOpen={!!selectedDeal} onClose={handleModalClose} />
    </div>
  );
}
