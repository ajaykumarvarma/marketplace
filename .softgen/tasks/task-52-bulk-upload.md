---
title: Bulk Product Upload via CSV
status: in_progress
priority: urgent
type: feature
tags: [bulk-upload, csv, seller-onboarding, scaling]
created_by: agent
created_at: 2026-08-25T14:32:00Z
position: 2
---

## Notes
Critical for seller acquisition. Sellers with large inventories need CSV import instead of one-by-one creation.

## Checklist
- [x] Add "Bulk Upload" button to seller dashboard
- [x] CSV upload modal with template download
- [x] Parse and validate CSV rows
- [x] Batch insert products
- [x] Show success/error summary
- [x] Handle auto-delivery stock keys per product

## Acceptance
- Seller uploads CSV with 50+ products
- All valid products created in one batch
- Errors show which rows failed and why
- Template CSV available for download