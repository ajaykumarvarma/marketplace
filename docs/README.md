# TradeVault Documentation

Complete technical documentation for the TradeVault digital goods marketplace platform.

## Files

| File | Description |
|------|-------------|
| `01-overview.md` | Platform overview, tech stack, architecture |
| `02-features.md` | Complete feature list (buyer, seller, admin, public) |
| `03-database.md` | Database schema, tables, RLS policies, relationships |
| `04-environment-variables.md` | All env vars (frontend + backend) |
| `05-api-endpoints.md` | API routes, request/response examples |
| `06-components.md` | Key React components |
| `07-services.md` | Business logic services (auth, fraud, notifications) |
| `08-migration-to-python.md` | Step-by-step guide to migrate backend to Python/FastAPI |

## Quick Start

1. Set up environment variables (see `04-environment-variables.md`)
2. Connect Supabase (see `03-database.md` for schema)
3. Configure Stripe and Resend
4. Run `npm install` then `npm run dev`

## Support

For issues or questions, check the relevant documentation file above.