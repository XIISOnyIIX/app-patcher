import type { Deal } from '../types';
import { formatPrice, formatDiscount, formatTimeRemaining } from '../utils/formatters';

interface DealCardProps {
  deal: Deal;
  onClick: (deal: Deal) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (dealId: string) => void;
}

export default function DealCard({ deal, onClick, isFavorite, onToggleFavorite }: DealCardProps) {
  const timeRemaining = formatTimeRemaining(deal.expiresAt);
  const isExpiringSoon = timeRemaining.includes('m') || timeRemaining.includes('Expired');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.(deal.id);
  };

  return (
    <article
      className="card cursor-pointer border border-base-300 bg-base-100 shadow-sm transition-all hover:shadow-md"
      onClick={() => onClick(deal)}
    >
      <figure className="relative h-48 overflow-hidden bg-base-200">
        {deal.imageUrl ? (
          <img
            src={deal.imageUrl}
            alt={deal.title}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl">🍔</div>
        )}
        <div className="absolute right-2 top-2">
          <button
            className={`btn btn-circle btn-sm ${isFavorite ? 'btn-primary' : 'btn-ghost bg-base-100/80'}`}
            onClick={handleFavoriteClick}
          >
            {isFavorite ? '❤️' : '🤍'}
          </button>
        </div>
        <div className="absolute left-2 top-2">
          <div className="badge badge-secondary font-bold">
            {formatDiscount(deal.discountPercentage)}
          </div>
        </div>
      </figure>

      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-base">{deal.title}</h3>
          <span className={`badge badge-sm ${isExpiringSoon ? 'badge-error' : 'badge-accent'}`}>
            {timeRemaining}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <div className="avatar">
            <div className="w-6 rounded-full">
              {deal.vendor.logo ? (
                <img src={deal.vendor.logo} alt={deal.vendor.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral text-xs text-neutral-content">
                  {deal.vendor.name[0]}
                </div>
              )}
            </div>
          </div>
          <span className="font-medium">{deal.vendor.name}</span>
          <span className="opacity-60">•</span>
          <span className="opacity-60">{deal.vendor.deliveryTime}</span>
        </div>

        <div className="flex flex-wrap gap-1">
          {deal.vendor.cuisine.slice(0, 2).map((cuisine) => (
            <span key={cuisine} className="badge badge-ghost badge-sm">
              {cuisine}
            </span>
          ))}
        </div>

        <p className="line-clamp-2 text-sm opacity-70">{deal.description}</p>

        <div className="card-actions items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-primary">
              {formatPrice(deal.discountedPrice)}
            </span>
            <span className="text-sm text-base-content/50 line-through">
              {formatPrice(deal.originalPrice)}
            </span>
          </div>
          <button className="btn btn-primary btn-sm">View Deal</button>
        </div>
      </div>
    </article>
  );
}
