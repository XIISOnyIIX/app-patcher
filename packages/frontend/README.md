# FoodDealSniper Frontend

A modern, responsive React application for discovering and tracking food delivery deals, built with Vite, TypeScript, Tailwind CSS, and DaisyUI.

## Features

### 🎨 UberEats-Inspired Design

- Clean, modern interface with card-based layouts
- Sticky navigation bar with search and notifications
- Featured deals section highlighting the best offers
- Grid-based deal cards with hover effects
- Modal overlays for detailed deal information

### 🔍 Advanced Filtering

- Filter by vendors (multi-select)
- Filter by categories (multi-select)
- Minimum discount percentage slider
- Maximum price filter
- Real-time search functionality
- Clear all filters with one click

### 📱 Fully Responsive

- Mobile-first design approach
- Responsive navigation with collapsible search
- Adaptive grid layouts for all screen sizes
- Mobile-optimized filter drawer

### 💫 Rich Features

- **Featured Deals**: Highlighted deals with special styling
- **Deal Cards**: Show vendor info, ratings, delivery time, pricing, and expiry countdown
- **Deal Modals**: Detailed view with full description, images, tags, and location availability
- **Loading States**: Elegant loading spinners with messages
- **Error States**: User-friendly error messages with retry functionality
- **Favorites**: Track favorite vendors (saved in local storage)
- **Notifications**: Alert system with unread count indicators

### 🏪 State Management (Zustand)

- **Deals Store**: Manages deals, featured deals, filters, and selected deal
- **User Store**: Handles user preferences with localStorage persistence
- **Alerts Store**: Manages notifications and alert states

### 🔌 Backend Integration

- RESTful API service layer
- Deals, preferences, and alerts endpoints
- Error handling with custom ApiError class
- Fallback to mock data when API is unavailable

### 🎯 TypeScript

- Fully typed components, stores, and services
- Type-safe API responses
- Comprehensive type definitions for all data models

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── DealCard.tsx
│   ├── DealModal.tsx
│   ├── ErrorMessage.tsx
│   ├── FeaturedDeals.tsx
│   ├── LoadingSpinner.tsx
│   ├── Navigation.tsx
│   └── VendorFilters.tsx
├── hooks/               # Custom React hooks
│   └── useDeals.ts
├── services/            # API service layer
│   ├── alertsService.ts
│   ├── api.ts
│   ├── dealsService.ts
│   └── preferencesService.ts
├── store/               # Zustand state stores
│   ├── alertsStore.ts
│   ├── dealsStore.ts
│   └── userStore.ts
├── types/               # TypeScript type definitions
│   └── index.ts
├── utils/               # Utility functions
│   └── formatters.ts
├── App.tsx              # Main application component
├── index.css            # Global styles and Tailwind imports
└── main.tsx             # Application entry point
```

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Component library built on Tailwind
- **Zustand** - Lightweight state management
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm (or npm/yarn)

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

The app will run on [http://localhost:5173](http://localhost:5173)

### Build

```bash
pnpm build
```

### Type Check

```bash
pnpm typecheck
```

### Lint

```bash
pnpm lint
```

### Format

```bash
pnpm format
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:4000
```

## Component Documentation

### DealCard

Displays a compact deal card with vendor info, pricing, discount badge, and expiry countdown.

**Props:**

- `deal: Deal` - The deal object
- `onClick: (deal: Deal) => void` - Click handler
- `isFavorite?: boolean` - Whether vendor is favorited
- `onToggleFavorite?: (dealId: string) => void` - Favorite toggle handler

### DealModal

Full-screen modal displaying detailed deal information.

**Props:**

- `deal: Deal | null` - The deal to display
- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler

### VendorFilters

Sidebar/drawer component for filtering deals.

**Props:**

- `vendors: string[]` - Available vendors
- `categories: string[]` - Available categories
- `filters: FilterOptions` - Current filter state
- `onFilterChange: (filters: Partial<FilterOptions>) => void` - Filter change handler
- `onClearFilters: () => void` - Clear filters handler

### FeaturedDeals

Horizontal scrollable section for featured deals.

**Props:**

- `deals: Deal[]` - Featured deals array
- `onDealClick: (deal: Deal) => void` - Deal click handler

### Navigation

Top navigation bar with search, notifications, and user menu.

**Props:**

- `onSearch: (query: string) => void` - Search handler

## API Integration

The frontend expects the following backend endpoints:

### Deals

- `GET /api/deals` - Get all deals (with optional filters)
- `GET /api/deals/featured` - Get featured deals
- `GET /api/deals/:id` - Get deal by ID
- `GET /api/vendors` - Get all vendors
- `GET /api/categories` - Get all categories

### Preferences

- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update preferences
- `POST /api/preferences/favorite-vendor` - Toggle favorite vendor
- `POST /api/preferences/favorite-category` - Toggle favorite category

### Alerts

- `GET /api/alerts` - Get all alerts
- `PUT /api/alerts/:id/read` - Mark alert as read
- `PUT /api/alerts/read-all` - Mark all alerts as read
- `DELETE /api/alerts/:id` - Delete alert

## Mock Data

When the backend is unavailable, the app automatically falls back to mock data with sample deals from various vendors. This ensures a smooth development experience and demonstrates all features.

## Styling Conventions

- Uses DaisyUI component classes for consistency
- Custom utilities in `index.css` for line-clamp and animations
- Responsive breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- Color scheme uses DaisyUI theme tokens for easy theme switching

## Future Enhancements

- Real-time deal updates with WebSockets
- Advanced sorting options (price, discount, expiry)
- Deal comparison feature
- User reviews and ratings
- Map view for deal locations
- Push notifications for new deals
- Deal sharing functionality
- Dark mode support
