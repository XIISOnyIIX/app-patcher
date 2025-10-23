import type { Deal } from '../types';
import { formatPrice, formatDiscount, formatTimeRemaining } from '../utils/formatters';

interface DealModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function DealModal({ deal, isOpen, onClose }: DealModalProps) {
  if (!deal || !isOpen) return null;

  const timeRemaining = formatTimeRemaining(deal.expiresAt);
  const savings = deal.originalPrice - deal.discountedPrice;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-3xl">
        <form method="dialog">
          <button
            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>

        <div className="relative mb-4 h-64 overflow-hidden rounded-lg bg-base-200">
          {deal.imageUrl ? (
            <img src={deal.imageUrl} alt={deal.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-8xl">🍔</div>
          )}
          <div className="absolute left-4 top-4">
            <div className="badge badge-secondary badge-lg font-bold">
              {formatDiscount(deal.discountPercentage)}
            </div>
          </div>
        </div>

        <h3 className="mb-4 text-2xl font-bold">{deal.title}</h3>

        <div className="mb-4 flex items-center gap-3">
          <div className="avatar">
            <div className="w-12 rounded-full">
              {deal.vendor.logo ? (
                <img src={deal.vendor.logo} alt={deal.vendor.name} />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral text-neutral-content">
                  {deal.vendor.name[0]}
                </div>
              )}
            </div>
          </div>
          <div>
            <p className="font-bold">{deal.vendor.name}</p>
            <p className="text-sm opacity-70">
              ⭐ {deal.vendor.rating} • {deal.vendor.deliveryTime}
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {deal.vendor.cuisine.map((cuisine) => (
            <span key={cuisine} className="badge badge-outline">
              {cuisine}
            </span>
          ))}
          {deal.tags.map((tag) => (
            <span key={tag} className="badge badge-ghost">
              {tag}
            </span>
          ))}
        </div>

        <div className="divider"></div>

        <div className="mb-4">
          <h4 className="mb-2 font-semibold">Description</h4>
          <p className="opacity-80">{deal.description}</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-base-200 p-4">
            <p className="text-sm opacity-70">Original Price</p>
            <p className="text-xl font-bold line-through">{formatPrice(deal.originalPrice)}</p>
          </div>
          <div className="rounded-lg bg-primary/10 p-4">
            <p className="text-sm opacity-70">Deal Price</p>
            <p className="text-xl font-bold text-primary">{formatPrice(deal.discountedPrice)}</p>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-success/10 p-4 text-center">
          <p className="text-sm font-medium">You save {formatPrice(savings)}!</p>
        </div>

        {deal.minOrder && (
          <div className="mb-4">
            <p className="text-sm opacity-70">Minimum order: {formatPrice(deal.minOrder)}</p>
          </div>
        )}

        {deal.deliveryFee !== undefined && (
          <div className="mb-4">
            <p className="text-sm opacity-70">
              Delivery fee: {deal.deliveryFee === 0 ? 'FREE' : formatPrice(deal.deliveryFee)}
            </p>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-semibold text-error">⏰ Expires in {timeRemaining}</p>
        </div>

        {deal.availableAt.length > 0 && (
          <div className="mb-4">
            <h4 className="mb-2 text-sm font-semibold">Available at:</h4>
            <div className="flex flex-wrap gap-2">
              {deal.availableAt.map((location) => (
                <span key={location} className="badge">
                  📍 {location}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
          <button className="btn btn-primary">Order Now</button>
        </div>
      </div>

      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
