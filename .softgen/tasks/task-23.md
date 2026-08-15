---
title: Internationalization (i18n)
status: done
priority: high
type: feature
tags: [i18n, localization, next-intl, multi-language]
created_by: agent
created_at: 2026-08-15T09:00:00Z
position: 23
---

## Notes
Add internationalization support using next-intl for Next.js page router. Start with English as default, Spanish as second language. All user-facing text should be translatable via JSON message files.

## Checklist
- [x] Install next-intl package
- [x] Create src/i18n/config.ts with locale configuration
- [x] Create messages/en.json with all UI strings
- [x] Create messages/es.json with Spanish translations
- [x] Wrap _app.tsx with NextIntlClientProvider
- [x] Create LocaleSwitcher component
- [x] Update Navigation to include locale switcher
- [x] Extract hardcoded strings from landing page components
- [x] Extract hardcoded strings from auth pages
- [x] Add locale-aware routing (prefix-based)

## Acceptance
- User can switch between English and Spanish
- All UI text renders from translation files
- URL reflects locale (e.g., /es/marketplace)
- Default locale works without prefix