import { ButtonHTMLAttributes, forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-ink hover:bg-gold-light disabled:bg-gold/50 font-semibold shadow-[0_0_0_1px_rgba(201,162,39,0.4)]",
  secondary:
    "bg-transparent border border-border text-ivory hover:border-gold hover:text-gold disabled:opacity-50",
  ghost: "bg-transparent text-muted hover:text-ivory disabled:opacity-50",
};

export function buttonClasses(variant: ButtonVariant = "primary", className = ""): string {
  return `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`;
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }
>(function Button({ variant = "primary", className = "", ...props }, ref) {
  return <button ref={ref} className={buttonClasses(variant, className)} {...props} />;
});
