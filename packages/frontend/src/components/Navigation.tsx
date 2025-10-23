import { useAlertsStore } from '../store/alertsStore';
import { useUserStore } from '../store/userStore';

interface NavigationProps {
  onSearch: (query: string) => void;
}

export default function Navigation({ onSearch }: NavigationProps) {
  const { unreadCount } = useAlertsStore();
  const { preferences } = useUserStore();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  return (
    <header className="sticky top-0 z-50 bg-base-100 shadow-md">
      <div className="navbar mx-auto max-w-7xl px-4">
        <div className="flex-1">
          <a href="/" className="btn btn-ghost text-xl font-bold normal-case">
            🍔 FoodDealSniper
          </a>
        </div>

        <div className="flex-none gap-2">
          <div className="form-control hidden md:block">
            <input
              type="text"
              placeholder="Search deals..."
              className="input input-bordered w-64"
              onChange={handleSearchChange}
            />
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-circle btn-ghost">
              <div className="indicator">
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
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="badge indicator-item badge-primary badge-sm">{unreadCount}</span>
                )}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li className="menu-title">
                <span>Notifications</span>
              </li>
              {unreadCount === 0 ? (
                <li className="disabled">
                  <a>No new alerts</a>
                </li>
              ) : (
                <li>
                  <a>View all alerts ({unreadCount})</a>
                </li>
              )}
            </ul>
          </div>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="avatar btn btn-circle btn-ghost">
              <div className="w-10 rounded-full bg-neutral text-neutral-content">
                <span className="text-xl">👤</span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu dropdown-content menu-sm z-[1] mt-3 w-52 rounded-box bg-base-100 p-2 shadow"
            >
              <li className="menu-title">
                <span>Account</span>
              </li>
              <li>
                <a>Preferences</a>
              </li>
              <li>
                <a>Favorites ({preferences?.favoriteVendors.length || 0})</a>
              </li>
              <li>
                <a className="text-error">Logout</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="form-control block px-4 pb-3 md:hidden">
        <input
          type="text"
          placeholder="Search deals..."
          className="input input-bordered w-full"
          onChange={handleSearchChange}
        />
      </div>
    </header>
  );
}
