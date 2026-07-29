import { useEffect, useState, type ReactNode } from "react";

export interface NavItem {
  label: string;
  href: string;
  active?: boolean;
}

interface NavbarProps {
  brand: ReactNode;
  items: NavItem[];
  cta?: ReactNode;
}

/**
 * Fixed editorial navbar. Transparent at top; on scroll (>24px) it acquires
 * a blurred moss backdrop and a hairline gold-tinted divider.
 */
export function Navbar({ brand, items, cta }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={`ds-navbar ${scrolled ? "ds-navbar-scrolled" : ""}`}>
      <div className="flex items-center gap-3">{brand}</div>

      <ul className="hidden md:flex items-center gap-8">
        {items.map((it) => (
          <li key={it.href}>
            <a href={it.href} className="ds-nav-link" data-active={it.active ? "true" : "false"}>
              {it.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="hidden md:block">{cta}</div>

      <button
        type="button"
        aria-label="Menu"
        aria-expanded={openMobile}
        onClick={() => setOpenMobile((v) => !v)}
        className="md:hidden ds-btn ds-btn-ghost px-3 py-2"
      >
        <span className="sr-only">Menu</span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none" aria-hidden>
          <path d="M0 1h18M0 6h18M0 11h18" stroke="currentColor" strokeWidth="1" />
        </svg>
      </button>

      {openMobile && (
        <div className="ds-menu md:hidden right-4 top-full mt-2" data-open="true">
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className="ds-menu-item"
              onClick={() => setOpenMobile(false)}
            >
              {it.label}
            </a>
          ))}
          {cta && <div className="pt-2 mt-2 border-t border-ivory/10">{cta}</div>}
        </div>
      )}
    </nav>
  );
}
