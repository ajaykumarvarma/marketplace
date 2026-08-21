# TradeVault — Key Components

## Layout
- `Layout.tsx` — Main app wrapper with navigation and footer
- `Navigation.tsx` — Top nav with search, cart, auth, notifications
- `Footer.tsx` — Site footer with links

## Landing Sections
- `HeroSection.tsx` — Hero banner with CTA
- `TrustSignalsSection.tsx` — Stats and trust badges
- `TestimonialsSection.tsx` — Dynamic reviews carousel (fetches from DB)
- `CategoriesSection.tsx` — Category grid
- `TopSellersSection.tsx` — Top sellers showcase
- `HowItWorksSection.tsx` — Process explanation
- `CTASection.tsx` — Final call-to-action

## Marketplace
- `SearchFilters.tsx` — Search bar, category pills, sort dropdown
- `MarketplaceSkeleton.tsx` — Loading skeleton for product grid

## Product
- `WishlistButton.tsx` — Heart icon toggle for wishlist
- `FileUploader.tsx` — Drag-and-drop file upload for seller delivery

## Seller Dashboard
- `SalesChart.tsx` — Revenue over time chart
- `TopProductsChart.tsx` — Best-selling products chart
- `RevenueStats.tsx` — Revenue summary cards

## Chat
- `ChatWindow.tsx` — Buyer-seller messaging interface

## Notifications
- `NotificationBell.tsx` — Dropdown with unread count and mark-as-read

## Auth
- `AuthContext.tsx` — Auth state management
- `CartContext.tsx` — Cart state management

## Email Templates (React Email)
- `OrderConfirmation.tsx` — Buyer payment confirmation
- `SellerNotification.tsx` — New order alert for seller
- `DeliveryConfirmation.tsx` — Order delivered notification
- `FollowUpEmail.tsx` — 3-day follow-up asking for feedback

## Utilities
- `ErrorBoundary.tsx` — React error boundary
- `SEO.tsx` — Dynamic meta tags and JSON-LD
- `KeyboardShortcutsHelp.tsx` — Keyboard shortcut modal
- `LocaleSwitcher.tsx` — Language switcher