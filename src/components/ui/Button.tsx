import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "secondary"
  | "accent"
  | "outline"
  | "ghost"
  | "onOverlay";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-primary-hover",
  secondary: "bg-secondary text-on-secondary hover:bg-secondary-hover",
  accent: "bg-accent text-on-accent hover:bg-accent-hover",
  outline:
    "border border-border bg-transparent text-on-background hover:bg-muted hover:text-on-muted",
  ghost: "bg-transparent text-primary hover:bg-muted",
  onOverlay:
    "border border-on-overlay/40 bg-on-overlay/10 text-on-overlay backdrop-blur-sm hover:bg-on-overlay/20",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

type StyleProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
};

export function buttonClasses({
  variant = "primary",
  size = "md",
  className,
}: StyleProps = {}): string {
  return cn(base, variants[variant], sizes[size], className);
}

/** A `<button>`. For navigation use `ButtonLink`. */
export function Button({
  variant,
  size,
  className,
  children,
  ...rest
}: StyleProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClasses({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

/** A `next/link` styled as a button. */
export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  onClick,
}: StyleProps & {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={buttonClasses({ variant, size, className })}
    >
      {children}
    </Link>
  );
}
