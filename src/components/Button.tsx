import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

const BASE =
  "inline-flex min-h-[54px] cursor-pointer items-center justify-center rounded px-7 py-3 font-body text-[22px] tracking-[0.06em] text-fg hover:brightness-115";

const VARIANTS = {
  primary: "bg-blood",
  secondary: "border border-line bg-panel",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof VARIANTS;
  href?: string;
};

export default function Button({
  variant = "secondary",
  href,
  className,
  ...props
}: ButtonProps) {
  const classes = twMerge(BASE, VARIANTS[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes}>
        {props.children}
      </Link>
    );
  }

  return <button className={classes} {...props} />;
}
