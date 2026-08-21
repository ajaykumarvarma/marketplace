# TradeVault — Feature Documentation

## Public Pages

### Landing Page (`/`)
- SEO-optimized hero with value proposition
- Live stats ticker (total sales, active users, products)
- Trust signals (escrow, verification, support)
- **Dynamic testimonials** — pulled from real buyer reviews in database
- Category browsing
- Top sellers section
- How It Works section
- CTA section

### Marketplace (`/marketplace`)
- **Server-side search + pagination** with URL params for shareable links
- Category filtering
- Price range filtering
- Sort by (featured, price low/high, newest)
- Product cards with image, price, seller info, stock, delivery time
- Add to cart
- Skeleton loading states

### Product Detail (`/marketplace/[id]`)
- Full product info with image gallery
- Seller info with verification badge
- Stock and delivery time
- **Review system** — buyer ratings with comments
- **Review voting** — thumbs up/down on each review
- Add to cart / Add to wishlist
- Related products
- SEO meta tags per product

### Seller Profile (`/sellers/[id]`)
- Seller bio, avatar, join date
- **Real sales volume** and revenue (from database)
- **Dynamic rating** calculated from reviews
- Product listings grid
- **Buyer reviews** with voting
- About section with verification status

### Categories (`/categories`)
- Browse all categories
- Category-specific product listings

## Buyer Features

### Authentication (`/auth/*`)
- Email/password registration and login
- OAuth (Google, GitHub, etc. via Supabase Auth)
- Password reset
- Role-based access (buyer, seller, admin)

### Cart (`/cart`)
- Add/remove items
- Quantity adjustment
- Price calculations
- Persistent via React Context

### Checkout (`/checkout`)
- **Stripe Checkout** integration
- **Promo code** support with validation
- Discount calculation
- Platform fee (2%)
- Fraud risk scoring before payment
- Escrow protection messaging

### Orders (`/orders`, `/orders/[id]`)
- Order history list
- Order detail with status timeline
- **File downloads** for delivered orders
- Delivery confirmation + escrow release
- **Post-purchase feedback** — rate product and seller service
- Chat with seller

### Wishlist (`/wishlist`)
- Save products for later
- Remove items
- Move to cart
- Auth-gated access

### Reviews
- Leave review after order completion
- Rate product quality (1-5 stars)
- Rate seller service (1-5 stars)
- Written comment

### Referrals (`/referrals`)
- Referral code generation
- Referral tracking

### Settings (`/settings/*`)
- 2FA setup
- Notification preferences

## Seller Features

### Seller Dashboard (`/seller/dashboard`)
- **Orders tab** — view all orders, fulfill paid orders
- **Products tab** — manage listings, edit, delete
- **Reviews tab** — **moderate reviews** (approve/hide)
- **Analytics tab** — sales charts, top products, revenue stats
- Add new product (`/seller/products/new`)

### Order Fulfillment
- **Fulfill Order** modal for paid orders
- Upload delivery files (license keys, accounts, etc.)
- Enter delivery text/instructions
- Buyer notification on fulfillment
- Order status changes: `paid` → `delivered` → `completed`

### Subscription (`/seller/subscription`)
- Seller plan management

## Admin Features

### Admin Dashboard (`/admin/dashboard`)
- User management table
- Fraud alerts review
- Platform analytics
- Moderation tools

### Backups (`/admin/backups`)
- Database backup management

### Fraud Detection (`/admin/fraud`)
- Review fraud logs
- Velocity check results
- Risk scores

## Communication

### Notifications
- **Real-time** in-app notification bell
- Types: order, message, fraud, system, delivery
- Mark as read
- Triggered by: new orders, delivery, reviews, system events

### Chat (`/chat`)
- Buyer-seller messaging
- Order-contextual conversations

### Email System
- **Order confirmation** — buyer receives after payment
- **Seller notification** — new order alert
- **Delivery confirmation** — buyer receives on fulfillment
- **Follow-up email** — 3 days after delivery, asks for feedback
- All emails use **React Email** professional templates

## Security

### Fraud Detection
- Device fingerprinting
- IP address tracking
- Velocity checks (rapid purchases)
- Risk score calculation (0-100)
- Auto-block high risk (score ≥ 70)
- Auto-hold medium risk (score ≥ 40)

### 2FA
- TOTP-based two-factor authentication
- Setup via QR code

### Rate Limiting
- IP-based rate limiting on sensitive endpoints
- Checkout, email, API calls protected

## SEO

- Dynamic `<title>` and `<meta>` per page
- JSON-LD structured data
- Open Graph images
- Sitemap.xml
- Robots.txt