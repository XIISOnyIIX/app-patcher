import { Deal } from '../types';
import { formatTimeRemaining } from '../utils';

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const timeRemaining = formatTimeRemaining(deal.expiresAt);
  const isExpiring = timeRemaining.includes('h') || timeRemaining.includes('m');

  return (
    <article className="card border border-base-300 bg-base-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <h3 className="card-title text-lg font-semibold">{deal.title}</h3>
          <div className="flex flex-col gap-1 items-end">
            <span className={`badge ${isExpiring ? 'badge-warning' : 'badge-accent'}`}>
              {timeRemaining}
            </span>
            <span className="badge badge-primary">{deal.discount}% OFF</span>
          </div>
        </div>

        <p className="text-sm opacity-80">{deal.description}</p>

        <div className="flex flex-wrap gap-2 mt-2">
          <span className="badge badge-outline">{deal.cuisine}</span>
          <span className="badge badge-outline">{deal.vendor}</span>
        </div>

        {deal.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {deal.tags.map((tag) => (
              <span key={tag} className="badge badge-sm badge-ghost">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="card-actions justify-end mt-3">
          <button className="btn btn-outline btn-sm">Track deal</button>
          <button className="btn btn-primary btn-sm">Get deal</button>
        </div>
      </div>
    </article>
  );
}
