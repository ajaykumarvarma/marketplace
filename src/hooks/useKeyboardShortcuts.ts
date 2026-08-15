import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";

type ShortcutHandler = (e: KeyboardEvent) => void;

interface Shortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  handler: ShortcutHandler;
  description: string;
  scope?: string;
}

const isMac = typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
  
  if (shortcut.ctrlKey && !cmdOrCtrl) return false;
  if (shortcut.metaKey && !cmdOrCtrl) return false;
  if (shortcut.shiftKey && !e.shiftKey) return false;
  if (shortcut.altKey && !e.altKey) return false;
  
  return e.key.toLowerCase() === shortcut.key.toLowerCase();
}

export function useKeyboardShortcuts(shortcuts: Shortcut[]) {
  const router = useRouter();
  const keyBuffer = useRef<string[]>([]);
  const bufferTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs, textareas, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow Escape to close modals even when typing
        if (e.key === "Escape") {
          const modal = document.querySelector('[role="dialog"]');
          if (modal) {
            const closeBtn = modal.querySelector('[data-close-modal]') as HTMLElement;
            closeBtn?.click();
          }
        }
        return;
      }

      // Handle chord sequences (G + letter for navigation)
      if (e.key.toLowerCase() === "g" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        keyBuffer.current = ["g"];
        if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
        bufferTimeout.current = setTimeout(() => {
          keyBuffer.current = [];
        }, 800);
        return;
      }

      if (keyBuffer.current[0] === "g" && e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        keyBuffer.current = [];
        if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
        
        const navMap: Record<string, string> = {
          h: "/",
          m: "/marketplace",
          c: "/cart",
          o: "/orders",
          s: "/sell",
          d: "/seller/dashboard",
          a: "/admin/dashboard",
          p: "/help",
        };
        
        if (navMap[e.key.toLowerCase()]) {
          e.preventDefault();
          router.push(navMap[e.key.toLowerCase()]);
          return;
        }
      }

      // Handle direct shortcuts
      for (const shortcut of shortcuts) {
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault();
          shortcut.handler(e);
          return;
        }
      }

      // Global Escape handler
      if (e.key === "Escape") {
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const closeBtn = modal.querySelector('[data-close-modal]') as HTMLElement;
          closeBtn?.click();
        }
        
        // Close dropdowns
        const dropdowns = document.querySelectorAll('[data-state="open"]');
        dropdowns.forEach((d) => {
          const trigger = d.querySelector('[data-radix-collection-item]') as HTMLElement;
          trigger?.click();
        });
      }
    },
    [shortcuts, router]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (bufferTimeout.current) clearTimeout(bufferTimeout.current);
    };
  }, [handleKeyDown]);
}

export function getShortcutLabel(shortcut: Omit<Shortcut, "handler">): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey || shortcut.metaKey) parts.push(isMac ? "⌘" : "Ctrl");
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push(isMac ? "⌥" : "Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join("+");
}

export type { Shortcut };