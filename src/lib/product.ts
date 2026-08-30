// The Budget Calculator — product contract constants.
// Single source of truth for tiers, pricing and legal identity.
//
// The app is branded "The Budget Calculator". It is built and operated by
// the business "Genevieve App" (see LEGAL_ENTITY) — that name appears only
// in legal/ownership contexts (Terms, Privacy, billing, copyright), never
// as the product name shown to users.

export const BRAND = {
  name: "The Budget Calculator",
  shortName: "Budget Calculator",
  tagline: "Know what is safe. Protect what matters. See what comes next.",
} as const;

export const LEGAL_ENTITY = {
  businessName: "Genevieve App",
  abn: "36 530 564 761",
  address: "PO Box 475, Labrador QLD 4275, Australia",
  supportEmail: "tracey@genevievapp.com.au",
  trademarkNotice: "The Budget Calculator™ is a trademark pending registration in Australia.",
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

export const NOT_ADVICE_DISCLAIMER =
  "The Budget Calculator supports decisions and visibility. It does not replace regulated accounting, tax, financial advice or insolvency advice.";
