import { ArrowRight, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Button from "../components/common/Button";

const navigation = [
  { label: "Discover", href: "/#home" },
  { label: "Events", href: "/#featured-events" },
  { label: "Categories", href: "/#categories" },
  { label: "For organizers", href: "/#for-organizers" },
];

export default function PublicLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <a
        className="sr-only z-[60] rounded bg-white p-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        href="#main-content"
      >
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-ink/5 bg-cream/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            aria-label="EventX home"
            className="font-display text-[2rem] font-extrabold leading-none tracking-tight text-ink"
            to="/"
          >
            Event<span className="text-eventx">X</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                className="text-xs font-bold text-ink/80 transition hover:text-eventx focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx"
                href={item.href}
                key={item.label}
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="hidden items-center gap-4 md:flex">
            <a
              className="px-2 py-2 text-xs font-bold text-ink transition hover:text-eventx focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx"
              href="/#account"
            >
              Sign in
            </a>
            <Button
              className="min-h-10 rounded-lg px-4 py-2 text-xs"
              onClick={() =>
                document.getElementById("featured-events")?.scrollIntoView({
                  behavior: "smooth",
                })
              }
            >
              Get tickets
              <ArrowRight aria-hidden="true" size={14} />
            </Button>
          </div>
          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="grid size-10 place-items-center rounded-lg border border-ink/10 md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            type="button"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {menuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="border-t border-ink/10 bg-cream px-5 py-4 md:hidden"
          >
            <div className="mx-auto flex max-w-[1440px] flex-col gap-1">
              {navigation.map((item) => (
                <a
                  className="rounded-lg px-3 py-3 text-sm font-bold text-ink hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-eventx"
                  href={item.href}
                  key={item.label}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <a
                className="rounded-lg px-3 py-3 text-sm font-bold text-ink hover:bg-black/5"
                href="/#account"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </a>
            </div>
          </nav>
        )}
      </header>
      {children}
    </>
  );
}