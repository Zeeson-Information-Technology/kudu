"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { site } from "../content/site";

export function Header() {
  const pathname = usePathname();
  const [facilityUrl, setFacilityUrl] = useState(
    process.env.NEXT_PUBLIC_FACILITY_APP_URL ?? "https://facility.kudu.health"
  );
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_FACILITY_APP_URL) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      setFacilityUrl("http://localhost:3001");
    } else {
      setFacilityUrl("https://facility.kudu.health");
    }
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand brand--mobile-hidden" aria-label={site.name}>
          <Image
            src="/brand/logo-lockup.png"
            alt={site.name}
            width={360}
            height={106}
            priority
            className="brand-mark-img"
          />
        </Link>

        <nav
          aria-label="Primary"
          className={`nav ${menuOpen ? "nav--open" : ""}`}
          id="primary-nav"
        >
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav__link"
              aria-current={pathname === item.href ? "page" : undefined}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="nav__cta">
            <a
              className="button facility-login"
              href={`${facilityUrl}/login`}
              data-tooltip="For registered health facilities and staff"
              target="_blank"
              rel="noreferrer"
            >
              Facility Login
            </a>
          </div>
        </nav>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="primary-nav"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className="menu-toggle__icon" aria-hidden="true">
            {menuOpen ? (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </span>
          <span className="menu-toggle__label">{menuOpen ? "Close" : "Menu"}</span>
        </button>
        <div className="header-cta">
          <a
            className="button facility-login"
            href={`${facilityUrl}/login`}
            data-tooltip="For registered health facilities and staff"
            target="_blank"
            rel="noreferrer"
          >
            Facility Login
          </a>
        </div>
      </div>
    </header>
  );
}
