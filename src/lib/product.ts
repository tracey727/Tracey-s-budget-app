// Genevieve App™ Budget Builder — product contract constants.
// Single source of truth for tiers, pricing and legal identity.

export const BRAND = {
  name: "Genevieve App™ Budget Builder",
  shortName: "Genevieve",
  tagline: "Know what is safe. Protect what matters. See what comes next.",
} as const;

export const LEGAL_ENTITY = {
  businessName: "Genevieve App",
  abn: "36 530 564 761",
  address: "PO Box 475, Labrador QLD 4275, Australia",
  supportEmail: "tracey@genevievapp.com.au",
  trademarkNotice: "Genevieve App™ is a trademark pending registration in Australia.",
} as const;

export type TierId = "PERSONAL" | "PROFESSIONAL";

export const TIERS: Record<
  TierId,
  {
    id: TierId;
    label: string;
    priceAud: number;
    priceLabel: string;
    stripePriceEnvVar: "STRIPE_PRICE_PERSONAL" | "STRIPE_PRICE_PROFESSIONAL";
    description: string;
    features: string[];
  }
> = {
  PERSONAL: {
    id: "PERSONAL",
    label: "Personal",
    priceAud: 9.99,
    priceLabel: "$9.99 AUD / month",
    stripePriceEnvVar: "STRIPE_PRICE_PERSONAL",
    description: "For managing day-to-day life with confidence.",
    features: [
      "Safe-to-Spend, the hero number",
      "Bills protection & payday planning",
      "Spending intelligence (Essential / Worth It / Unsure / Waste)",
      "Subscriptions & annual cost view",
      "Savings goals with verified progress",
      "Forecasting & early warnings",
      "Green / Yellow / Red / Recovery status",
    ],
  },
  PROFESSIONAL: {
    id: "PROFESSIONAL",
    label: "Professional",
    priceAud: 24.99,
    priceLabel: "$24.99 AUD / month",
    stripePriceEnvVar: "STRIPE_PRICE_PROFESSIONAL",
    description: "Everything in Personal, extended for sole traders and business owners.",
    features: [
      "Everything in Personal",
      "Business operating accounts & cash-flow view",
      "Operating cost & supplier subscription review",
      "Scenario planning for income/cost changes",
      "Business continuity & recovery view",
      "Enhanced exports for your accountant or adviser",
    ],
  },
};

// Practice Savings & Revenue Protection Command (blueprint phases 12-18).
// Default labour-value rate used only for *ranking/estimating* patterns and
// released staff time in dollars (see labourValueOfMinutes). This is a
// placeholder assumption — a real deployment should make it configurable
// per practice/role rather than a hardcoded constant.
export const DEFAULT_LABOUR_RATE_AUD_PER_HOUR = 55;

export const NOT_ADVICE_DISCLAIMER =
  "Genevieve supports decisions and visibility. It does not replace regulated accounting, tax, financial advice or insolvency advice.";
