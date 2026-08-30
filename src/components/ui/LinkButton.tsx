import Link, { LinkProps } from "next/link";
import { AnchorHTMLAttributes } from "react";
import { buttonClasses, type ButtonVariant } from "./Button";

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    variant?: ButtonVariant;
  };

export function LinkButton({ variant = "primary", className = "", ...props }: Props) {
  return <Link className={buttonClasses(variant, className)} {...props} />;
}
