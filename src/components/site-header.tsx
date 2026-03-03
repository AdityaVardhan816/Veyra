import Link from "next/link";
import { Search } from "lucide-react";
import { AuthControls } from "@/components/auth-controls";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-bg/70 shadow-[0_10px_30px_rgba(2,4,10,0.45)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-[0.12em] text-accentSoft transition hover:text-white">
          VEYRA
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-textMuted md:flex">
          <Link href="/" className="transition hover:text-text">Home</Link>
          <Link href="/search" className="transition hover:text-text">Browse</Link>
          <Link href="/profile" className="transition hover:text-text">Profile</Link>
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-panel/80 px-4 py-2 text-sm text-text transition hover:border-accent/50 hover:bg-panelSoft"
          >
            <Search className="h-4 w-4" />
            Search
          </Link>
        </nav>
        <AuthControls />
      </div>
    </header>
  );
}
