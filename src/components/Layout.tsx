import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ThemeSwitch } from "./ThemeSwitch";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navigation />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}