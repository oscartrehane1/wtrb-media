"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navigationItems } from "@/content/site";
import { Wordmark } from "@/components/ui/wordmark";

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", menuOpen);
    return () => document.body.classList.remove("menu-open");
  }, [menuOpen]);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <header className={`site-header${scrolled || menuOpen ? " site-header--solid" : ""}`}>
      <div className="site-header__inner">
        <Link className="site-header__brand" href="#top" onClick={() => setMenuOpen(false)}>
          <Wordmark />
        </Link>

        <nav className="desktop-nav" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          className="menu-toggle"
          type="button"
          aria-controls="mobile-navigation"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
      </div>

      <div id="mobile-navigation" className={`mobile-nav${menuOpen ? " mobile-nav--open" : ""}`}>
        <nav aria-label="Mobile navigation">
          {navigationItems.map((item, index) => (
            <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}>
              <span aria-hidden="true">0{index + 1}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <p>Outdoor film and photography<br />from the UK, made anywhere.</p>
      </div>
    </header>
  );
}
