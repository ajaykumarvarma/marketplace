import { useState } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { useKeyboardShortcuts, type Shortcut } from "@/hooks/useKeyboardShortcuts";
import { useRouter } from "next/router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface LayoutProps {
  children: React.ReactNode;
}

const shortcuts: Shortcut[] = [
  { key: "k", ctrlKey: true, handler: () => {}, description: "Focus search" },
  { key: "h", ctrlKey: true, handler: () => {}, description: "Go to Home" },
  { key: "m", ctrlKey: true, handler: () => {}, description: "Go to Marketplace" },
  { key: "c", ctrlKey: true, handler: () => {}, description: "Go to Cart" },
  { key: "o", ctrlKey: true, handler: () => {}, description: "Go to Orders" },
  { key: "?", handler: () => {}, description: "Show keyboard shortcuts" },
];

function formatShortcut(shortcut: Shortcut): string {
  const parts: string[] = [];
  if (shortcut.ctrlKey) parts.push("Ctrl");
  if (shortcut.metaKey) parts.push("⌘");
  if (shortcut.shiftKey) parts.push("Shift");
  if (shortcut.altKey) parts.push("Alt");
  parts.push(shortcut.key.toUpperCase());
  return parts.join("+");
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const [helpOpen, setHelpOpen] = useState(false);

  useKeyboardShortcuts([
    {
      key: "k",
      ctrlKey: true,
      handler: () => {
        const searchInput = document.querySelector('[data-search="true"]') as HTMLElement;
        searchInput?.focus();
      },
      description: "Focus search",
    },
    {
      key: "h",
      ctrlKey: true,
      handler: () => router.push("/"),
      description: "Go to Home",
    },
    {
      key: "m",
      ctrlKey: true,
      handler: () => router.push("/marketplace"),
      description: "Go to Marketplace",
    },
    {
      key: "c",
      ctrlKey: true,
      handler: () => router.push("/cart"),
      description: "Go to Cart",
    },
    {
      key: "o",
      ctrlKey: true,
      handler: () => router.push("/orders"),
      description: "Go to Orders",
    },
    {
      key: "?",
      handler: () => setHelpOpen(true),
      description: "Show keyboard shortcuts",
    },
  ]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-muted-foreground" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1">
            {shortcuts.map((s) => (
              <div
                key={s.key}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <span className="text-sm text-muted-foreground">{s.description}</span>
                <kbd className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted border border-border font-mono text-xs text-foreground">
                  {formatShortcut(s)}
                </kbd>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">Esc</kbd> to close this dialog.
          </p>
        </DialogContent>
      </Dialog>
    </div>
  );
}