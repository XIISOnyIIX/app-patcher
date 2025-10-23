import type { Deal } from '../types';
import { formatPrice, formatDiscount, formatTimeRemaining } from '../utils/formatters';

interface FeaturedDealsProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
}

export default function FeaturedDeals({ deals, onDealClick }: FeaturedDealsProps) {
  if (deals.length === 0) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">🔥 Featured Deals</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal) => {
          const timeRemaining = formatTimeRemaining(deal.expiresAt);
          const isExpiringSoon = timeRemaining.includes('m') || timeRemaining.includes('Expired');

          return (
            <div
              key={deal.id}
              className="card cursor-pointer border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg transition-all hover:shadow-xl"
              onClick={() => onDealClick(deal)}
            >
              <figure className="relative h-48 overflow-hidden">
                {deal.imageUrl ? (
                  <img
                    src={deal.imageUrl}
                    alt={deal.title}
                    className="h-full w-full object-cover transition-transform hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-base-200 text-6xl">
                    🍔
                  </div>
                )}
                <div className="absolute left-2 top-2">
                  <div className="badge badge-secondary badge-lg font-bold shadow-lg">
                    {formatDiscount(deal.discountPercentage)}
                  </div>
                </div>
                <div className="absolute right-2 top-2">
                  <div className="badge badge-lg bg-base-100/90 shadow-lg">⭐ Featured</div>
                </div>
              </figure>

              <div className="card-body p-4">
                <h3 className="card-title text-lg">{deal.title}</h3>

                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{deal.vendor.name}</span>
                  <span className="opacity-60">•</span>
                  <span className="opacity-60">{deal.vendor.deliveryTime}</span>
                </div>

                <p className="line-clamp-2 text-sm opacity-70">{deal.description}</p>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(deal.discountedPrice)}
                    </span>
                    <span className="text-sm line-through opacity-60">
                      {formatPrice(deal.originalPrice)}
                    </span>
                  </div>
                  <span className={`badge ${isExpiringSoon ? 'badge-error' : 'badge-accent'}`}>
                    {timeRemaining}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
