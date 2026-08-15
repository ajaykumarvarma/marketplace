import { useState } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useKeyboardShortcuts, getShortcutLabel, type Shortcut } from "@/hooks/useKeyboardShortcuts";
import { useRouter } from "next/router";

const shortcuts: Shortcut[] = [
  {
    key: "k",
    ctrlKey: true,
    description: "Open search / command palette",
    handler: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLElement;
      searchInput?.focus();
    },
  },
  {
    key: "/",
    description: "Focus search",
    handler: () => {
      const searchInput = document.querySelector('input[type="search"]') as HTMLElement;
      searchInput?.focus();
    },
  },
  {
    key: "?",
    description: "Show keyboard shortcuts",
    handler: () => {},
  },
  {
    key: "Escape",
    description: "Close modal or dropdown",
    handler: () => {},
  },
];

const navShortcuts = [
  { keys: "G then H", description: "Go to Home" },
  { keys: "G then M", description: "Go to Marketplace" },
  { keys: "G then C", description: "Go to Cart" },
  { keys: "G then O", description: "Go to Orders" },
  { keys: "G then S", description: "Go to Sell page" },
  { keys: "G then D", description: "Go to Seller Dashboard" },
  { keys: "G then A", description: "Go to Admin Panel" },
  { keys: "G then P", description: "Go to Help" },
];

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const allShortcuts: Shortcut[] = [
    ...shortcuts,
    {
      key: "?",
      description: "Show keyboard shortcuts",
      handler: () => setOpen(true),
    },
  ];

  useKeyboardShortcuts(allShortcuts);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="hidden md:flex border-border hover:border-primary/30"
          aria-label="Keyboard shortcuts"
          title="Keyboard shortcuts (?)"
        >
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg" data-close-modal>
        <DialogHeader>
          <DialogTitle className="font-display">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <section>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Navigation</h3>
            <div className="flex flex-col gap-2">
              {navShortcuts.map((s) => (
                <div key={s.keys} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">{s.description}</span>
                  <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono text-xs text-foreground">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">Actions</h3>
            <div className="flex flex-col gap-2">
              {shortcuts.slice(0, 3).map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm text-foreground/70">{s.description}</span>
                  <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono text-xs text-foreground">
                    {getShortcutLabel(s)}
                  </kbd>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-display text-sm font-semibold text-foreground mb-3">General</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70">Close modal or dropdown</span>
                <kbd className="px-2 py-1 rounded bg-muted border border-border font-mono text-xs text-foreground">
                  Escape
                </kbd>
              </div>
            </div>
          </section>

          <p className="text-xs text-foreground/50 pt-2 border-t border-border">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">?</kbd>{" "}
            from anywhere to open this dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}