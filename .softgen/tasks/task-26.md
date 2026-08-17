---
title: Two-Factor Authentication (2FA)
status: done
priority: high
type: feature
tags: [security, 2fa, auth, totp]
created_by: agent
created_at: 2026-08-17T04:49:48Z
position: 26
---

## Notes
TOTP-based two-factor authentication using speakeasy and QR codes.

## Checklist
- [x] Create settings/2fa.tsx page with setup/verify/disable flow
- [x] Install speakeasy and react-qr-code
- [x] Add 2FA fields to profiles table
- [x] Add refreshProfile to AuthContext

## Acceptance
- User can enable 2FA by scanning QR code
- User receives backup codes
- 2FA works with Google Authenticator
- Login requires 2FA code after password
- User can disable 2FA with verification