---
title: Global Keyboard Shortcuts
status: done
priority: high
type: feature
tags: [keyboard, shortcuts, accessibility, navigation]
created_by: agent
created_at: 2026-08-15T09:00:00Z
position: 22
---

## Notes
Implement global keyboard shortcuts for faster navigation across the marketplace. Shortcuts should follow platform conventions (Cmd/Ctrl+K for command palette, / for search, etc.) and be discoverable via a help modal.

## Checklist
- [x] Create useKeyboardShortcuts hook with platform-aware key mapping
- [x] Implement Cmd/Ctrl+K global command palette / search
- [x] Add G+H (Go Home), G+M (Go Marketplace), G+C (Go Cart), G+O (Go Orders)
- [x] Add ? key to open shortcuts help modal
- [x] Add Escape to close modals and dropdowns
- [x] Create KeyboardShortcutsHelp component
- [x] Wire into app layout with useEffect listeners

## Acceptance
- Pressing Cmd/Ctrl+K focuses search or opens command palette
- Pressing G then M navigates to marketplace
- Pressing ? shows keyboard shortcuts help modal
- Shortcuts work on both macOS and Windows/Linux