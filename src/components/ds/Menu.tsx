import { useEffect, useRef, useState, type ReactNode } from "react";

export interface MenuItem {
  label: string;
  onSelect?: () => void;
  href?: string;
  icon?: ReactNode;
}

interface MenuProps {
  trigger: ReactNode;
  items: MenuItem[];
  align?: "left" | "right";
}

/**
 * Accessible dropdown menu. Opens on trigger click, closes on outside click
 * or Escape. Uses design-system tokens; every item has hover + focus states.
 */
export function Menu({ trigger, items, align = "right" }: MenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative inline-block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="ds-btn ds-btn-ghost"
      >
        {trigger}
      </button>

      <div
        role="menu"
        data-open={open ? "true" : "false"}
        className={`ds-menu top-full mt-2 ${align === "right" ? "right-0" : "left-0"}`}
      >
        {items.map((it, i) => {
          const content = (
            <>
              {it.icon}
              <span>{it.label}</span>
            </>
          );
          return it.href ? (
            <a key={i} href={it.href} role="menuitem" className="ds-menu-item">
              {content}
            </a>
          ) : (
            <button
              key={i}
              type="button"
              role="menuitem"
              className="ds-menu-item w-full text-left"
              onClick={() => {
                it.onSelect?.();
                setOpen(false);
              }}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
