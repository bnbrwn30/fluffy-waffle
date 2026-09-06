import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium " +
  "transition-[background-color,color,border-color,transform] duration-[var(--dur-fast)] " +
  "[transition-timing-function:var(--ease)] active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-accent-solid text-fg hover:bg-accent-hover",
  ghost:
    "border border-line text-fg hover:border-accent hover:text-accent bg-transparent",
};

export default function Button({
  href,
  variant = "primary",
  children,
  className,
  ...rest
}: {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className">) {
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...rest}
    >
      {children}
    </Link>
  );
}
