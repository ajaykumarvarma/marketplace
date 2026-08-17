---
title: Two-Factor Authentication (2FA)
status: in_progress
priority: high
type: feature
tags: [security, 2fa, totp, auth]
created_by: agent
created_at: 2026-08-17T04:37:00Z
position: 26
---

## Notes
TOTP-based 2FA via authenticator apps. Uses speakeasy/qrcode for generation and verification. Essential for seller accounts and high-value transactions.

## Checklist
- [ ] Install speakeasy and qrcode packages
- [ ] Add 2FA setup flow (generate QR, verify code)
- [ ] Add 2FA verification to login
- [ ] Store encrypted 2FA secret in user metadata
- [ ] Add 2FA management in user settings

## Acceptance
- User can enable 2FA from settings
- QR code scans into Google Authenticator
- Login requires 2FA code after password
- User can disable 2FA with verification