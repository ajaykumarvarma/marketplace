---
title: Digital File Delivery System
status: done
priority: high
type: feature
tags: [files, delivery, storage, supabase]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 25
---

## Notes
Secure digital file upload and delivery for sellers. Uses Supabase Storage with 100MB limit.

## Checklist
- [x] Create FileUploader component with Supabase Storage
- [x] Add order_files table for tracking deliveries
- [x] Integrate into seller/products/new.tsx
- [x] Add delivery_method to orders table

## Acceptance
- Sellers can upload files up to 100MB
- Files are linked to product/order on purchase
- Buyers can download after delivery confirmation
- Downloads are tracked and limited per order
- Files expire after reasonable time