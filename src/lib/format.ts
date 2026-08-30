const aud = new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" });

/** Accepts plain numbers/strings, or Prisma's Decimal (has toString()). */
export function formatMoney(value: number | string | { toString(): string }): string {
  const num = typeof value === "number" ? value : Number(value.toString());
  return aud.format(num);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", year: "numeric" }).format(d);
}
