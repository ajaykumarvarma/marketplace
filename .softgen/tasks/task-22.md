---
title: Global Keyboard Shortcuts
status: in_progress
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
- [ ] Create useKeyboardShortcuts hook with platform-aware key mapping
- [ ] Implement Cmd/Ctrl+K global command palette / search
- [ ] Add G+H (Go Home), G+M (Go Marketplace), G+C (Go Cart), G+O (Go Orders)
- [ ] Add ? key to open shortcuts help modal
- [ ] Add Escape to close modals and dropdowns
- [ ] Create KeyboardShortcutsHelp component
- [ ] Wire into app layout with useEffect listeners

## Acceptance
- Pressing Cmd/Ctrl+K focuses search or opens command palette
- Pressing G then M navigates to marketplace
- Pressing ? shows keyboard shortcuts help modal
- Shortcuts work on both macOS and Windows/Linux