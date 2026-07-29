import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "quiet";
type Size = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

const variantClass: Record<Variant, string> = {
  primary: "ds-btn ds-btn-primary",
  ghost: "ds-btn ds-btn-ghost",
  quiet: "ds-btn ds-btn-quiet",
};

const sizeStyle: Record<Size, string> = {
  sm: "text-[0.68rem] px-4 py-2",
  md: "",
  lg: "text-[0.82rem] px-8 py-5",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", iconLeft, iconRight, className = "", children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`${variantClass[variant]} ${sizeStyle[size]} ${className}`.trim()}
      {...rest}
    >
      {iconLeft}
      <span>{children}</span>
      {iconRight}
    </button>
  );
});
