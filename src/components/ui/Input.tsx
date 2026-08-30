import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = "", ...props }, ref) {
    return (
      <input
        ref={ref}
        className={`w-full rounded-xl border border-border bg-charcoal px-4 py-3 text-ivory placeholder:text-muted focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold ${className}`}
        {...props}
      />
    );
  },
);
