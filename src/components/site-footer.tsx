import Link from "next/link";
import { Disc3, Instagram, MessageCircle, Send } from "lucide-react";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-white/10 bg-bg/60 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 md:grid-cols-4">
        <div>
          <p className="text-lg font-semibold tracking-[0.1em] text-accentSoft">VEYRA</p>
          <p className="mt-2 text-sm text-textMuted">Premium game discovery and ratings platform.</p>
          <p className="mt-4 text-xs text-textMuted">Discover top titles, track community sentiment, and explore game feeds in one place.</p>
          <p className="mt-3 text-xs text-textMuted">Support: hazyhazyhazy816@gmail.com</p>
        </div>

        <div>
          <p className="text-sm font-medium text-text">Explore</p>
          <div className="mt-3 space-y-2 text-sm text-textMuted">
            <Link href="/" className="block transition hover:text-text">
              Home
            </Link>
            <Link href="/search" className="block transition hover:text-text">
              Browse
            </Link>
            <Link href="/profile" className="block transition hover:text-text">
              Profile
            </Link>
            <Link href="/signin" className="block transition hover:text-text">
              Sign In
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text">Legal</p>
          <div className="mt-3 space-y-2 text-sm text-textMuted">
            <a href="#" className="block transition hover:text-text">
              Privacy
            </a>
            <a href="#" className="block transition hover:text-text">
              Terms
            </a>
            <a href="#" className="block transition hover:text-text">
              Cookies
            </a>
            <a href="#" className="block transition hover:text-text">
              Contact
            </a>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-text">Community</p>
          <div className="mt-3 space-y-2 text-sm text-textMuted">
            <a href="https://instagram.com/xHazyBruh" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-text">
              <Instagram className="h-4 w-4" />
              Instagram
            </a>
            <a href="https://discord.gg/veyra" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-text">
              <MessageCircle className="h-4 w-4" />
              Discord
            </a>
            <a href="https://x.com/veyra" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-text">
              <Send className="h-4 w-4" />
              X
            </a>
            <a href="https://reddit.com/r/veyra" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition hover:text-text">
              <Disc3 className="h-4 w-4" />
              Reddit
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 text-xs text-textMuted">
          <p>© {year} Veyra. All rights reserved.</p>
          <p>Built for players. Updated daily.</p>
        </div>
      </div>
    </footer>
  );
}