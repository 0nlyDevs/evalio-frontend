"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, Search, Trophy, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV = [
  { href: "/dashboard", label: "Hackathons", icon: Trophy },
  { href: "/search", label: "Search", icon: Search },
] as const;

export function Topbar() {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname.startsWith("/dashboard") || pathname.startsWith("/hackathon") || pathname.startsWith("/project")
      : pathname.startsWith(href);

  return (
    <header
      className="sticky top-0 z-40 transition-[background,box-shadow] duration-200"
      style={{
        background: scrolled ? "color-mix(in srgb, var(--paper) 92%, transparent)" : "transparent",
        backdropFilter: scrolled ? "blur(8px)" : undefined,
        borderBottom: scrolled ? "2px solid var(--ink)" : "2px solid transparent",
      }}
    >
      <div className="h-16 px-4 sm:px-6 max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="Evalio home">
          <Logo />
          <span className="text-lg font-bold tracking-tight">Evalio</span>
          <span className="hidden md:inline chip bg-yellow/60 ml-1">AI jury</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 rounded-full border-2 border-ink bg-card p-1 shadow-[var(--shadow-hard-sm)]" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className="relative px-4 py-1.5 text-sm font-semibold rounded-full flex items-center gap-2"
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <Icon size={15} aria-hidden className="relative" style={{ color: active ? "var(--yellow)" : undefined }} />
                <span className="relative" style={{ color: active ? "var(--paper)" : undefined }}>
                  {label}
                </span>
              </Link>
            );
          })}
        </nav>

        <button
          className="sm:hidden btn btn-sm"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="sm:hidden overflow-hidden border-t-2 border-ink bg-paper"
            aria-label="Mobile"
          >
            <div className="px-4 py-3 flex flex-col gap-2">
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`btn justify-start ${isActive(href) ? "btn-dark" : ""}`}
                >
                  <Icon size={16} aria-hidden /> {label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
