---
title: Internationalization (i18n)
status: in_progress
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
- [ ] Install next-intl package
- [ ] Create src/i18n/config.ts with locale configuration
- [ ] Create messages/en.json with all UI strings
- [ ] Create messages/es.json with Spanish translations
- [ ] Wrap _app.tsx with NextIntlClientProvider
- [ ] Create LocaleSwitcher component
- [ ] Update Navigation to include locale switcher
- [ ] Extract hardcoded strings from landing page components
- [ ] Extract hardcoded strings from auth pages
- [ ] Add locale-aware routing (prefix-based)

## Acceptance
- User can switch between English and Spanish
- All UI text renders from translation files
- URL reflects locale (e.g., /es/marketplace)
- Default locale works without prefix