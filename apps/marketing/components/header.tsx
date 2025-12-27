"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "../content/site";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" aria-label={site.name}>
          <Image
            src="/brand/logo-lockup.png"
            alt={site.name}
            width={360}
            height={106}
            priority
            className="brand-mark-img"
          />
        </Link>

        <nav aria-label="Primary" className="nav">
          {site.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="nav__link"
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
