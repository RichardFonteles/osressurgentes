import { forwardRef, type HTMLAttributes, type ReactNode } from "react";

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  interactive?: boolean;
  eyebrow?: ReactNode;
  title?: ReactNode;
  children?: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { interactive = false, eyebrow, title, children, className = "", ...rest },
  ref,
) {
  const cls = `ds-card ${interactive ? "ds-card-interactive" : ""} ${className}`.trim();
  return (
    <div ref={ref} className={cls} {...rest}>
      {eyebrow && <span className="label-eyebrow">{eyebrow}</span>}
      {title && <h3 className="text-display text-2xl text-ivory">{title}</h3>}
      {children && <div className="text-sm leading-relaxed text-ivory/75">{children}</div>}
    </div>
  );
});
