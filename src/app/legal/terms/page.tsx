import type { Metadata } from "next";
import { LEGAL_ENTITY, TIERS } from "@/lib/product";

export const metadata: Metadata = { title: "Terms & Conditions" };

const LAST_UPDATED = "30 August 2026";

export default function TermsPage() {
  return (
    <>
      <h1>Terms &amp; Conditions</h1>
      <p className="prose-meta">Last updated: {LAST_UPDATED}</p>

      <p>
        These Terms &amp; Conditions (<strong>Terms</strong>) govern your access to and use of The Budget
        Calculator website and application (the <strong>App</strong>), operated by{" "}
        {LEGAL_ENTITY.businessName} (ABN {LEGAL_ENTITY.abn}) of {LEGAL_ENTITY.address}
        (<strong>we</strong>, <strong>us</strong> or <strong>our</strong>). By
        creating an account or using the App, you agree to be bound by these Terms. If you do not agree,
        do not use the App.
      </p>

      <h2>1. Who can use The Budget Calculator</h2>
      <p>
        You must be at least 18 years old and capable of entering into a binding contract to create an
        account. You are responsible for ensuring the information you provide is accurate and for keeping
        it up to date.
      </p>

      <h2>2. What The Budget Calculator is — and isn&rsquo;t</h2>
      <p>
        The Budget Calculator is a budgeting and money-visibility tool. It helps you see what has come in,
        what must be protected, what is safe to spend, and how to recover when things drift off course.
      </p>
      <p>
        <strong>The Budget Calculator is not a financial adviser, accountant, tax agent, bookkeeper or
        insolvency practitioner.</strong> Nothing in the App constitutes financial product advice, tax advice,
        accounting advice or legal advice under the Corporations Act 2001 (Cth) or any other law. The App
        provides general information and decision support only, based on the data you enter. You remain
        solely responsible for your financial decisions. Where a decision has material consequences, we
        recommend you seek advice from a licensed financial adviser, registered tax agent or accountant.
      </p>

      <h2>3. Your account</h2>
      <ul>
        <li>You must keep your login credentials confidential and notify us immediately of any unauthorised use of your account at {LEGAL_ENTITY.supportEmail}.</li>
        <li>You are responsible for all activity that occurs under your account.</li>
        <li>You may request export or deletion of your account and data at any time through Settings, or by contacting us.</li>
      </ul>

      <h2>4. Subscriptions and pricing</h2>
      <p>The Budget Calculator offers the following paid subscription tiers, billed in Australian Dollars (AUD):</p>
      <ul>
        {Object.values(TIERS).map((tier) => (
          <li key={tier.id}>
            <strong>{tier.label}</strong> — {tier.priceLabel}, billed monthly in advance.
          </li>
        ))}
      </ul>
      <ul>
        <li>Subscriptions automatically renew each billing period until cancelled.</li>
        <li>You can cancel at any time from Settings → Billing. Cancellation takes effect at the end of the current billing period; you retain access until then.</li>
        <li>We may change subscription pricing. We will give you at least 30 days&rsquo; notice of any price increase before it applies to your next billing cycle. Continuing to use the App after a price change takes effect means you accept the new price.</li>
        <li>Payments are processed securely by Stripe, Inc. We do not store your full card details. Accepted payment methods may include debit/credit cards, Apple Pay and Google Pay, as made available by Stripe in your region.</li>
      </ul>

      <h2>5. Refunds and your consumer guarantees</h2>
      <p>
        Nothing in these Terms excludes, restricts or modifies any consumer guarantee, right or remedy
        available to you under the Australian Consumer Law (Schedule 2 to the Competition and Consumer
        Act 2010 (Cth)) or other applicable law that cannot lawfully be excluded. Where our services fail
        to meet a consumer guarantee, you are entitled to remedies under that law.
      </p>
      <p>
        Outside of those guarantees, subscription fees already paid are generally non-refundable, except
        where required by law or where we agree to a refund at our discretion (for example, a billing
        error). To request a refund or raise a billing issue, contact {LEGAL_ENTITY.supportEmail}.
      </p>

      <h2>6. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use the App for any unlawful purpose or in breach of any applicable law;</li>
        <li>attempt to gain unauthorised access to the App, other accounts, or our systems;</li>
        <li>reverse engineer, scrape or interfere with the App&rsquo;s normal operation;</li>
        <li>upload data that is unlawful, defamatory or infringes another person&rsquo;s rights.</li>
      </ul>
      <p>We may suspend or terminate accounts that breach this section.</p>

      <h2>7. Your data</h2>
      <p>
        You own the financial data you enter into The Budget Calculator. We process it to provide the App to you, as
        described in our{" "}
        <a href="/legal/privacy">Privacy Policy</a>. Historical figures such as opening balances are
        treated as immutable records unless you deliberately correct them through a recorded correction
        flow — we do this so your history stays trustworthy.
      </p>

      <h2>8. Intellectual property</h2>
      <p>
        {LEGAL_ENTITY.trademarkNotice} The App, its design, the Budget Calculator gold-and-burgundy visual
        identity, and its underlying software are owned by or licensed to {LEGAL_ENTITY.businessName}. You
        may not copy, modify or redistribute any part of the App except as permitted by these Terms or by
        law.
      </p>

      <h2>9. Availability and changes</h2>
      <p>
        We aim to keep The Budget Calculator available at all times but do not guarantee uninterrupted access. We may
        update, modify or discontinue features of the App from time to time. Where practical, we will give
        reasonable notice of material changes that affect paid subscribers.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, and subject to section 5 above, our total liability to you
        arising out of or in connection with the App is limited, at our option, to resupplying the service
        or refunding the amount you paid for the subscription period in which the issue arose. We are not
        liable for indirect or consequential loss, including loss of profits or data, arising from your use
        of the App.
      </p>

      <h2>11. Termination</h2>
      <p>
        You may close your account at any time. We may suspend or terminate your account if you breach
        these Terms, or where required by law. On termination, your right to use the App ends, but these
        Terms continue to apply to anything that happened before termination.
      </p>

      <h2>12. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material changes, we will notify you (for
        example, by email or an in-app notice) before they take effect. Continued use of the App after
        changes take effect means you accept the updated Terms.
      </p>

      <h2>13. Governing law</h2>
      <p>
        These Terms are governed by the laws of Queensland, Australia. You submit to the non-exclusive
        jurisdiction of the courts of Queensland and the Commonwealth of Australia.
      </p>

      <h2>14. Contact us</h2>
      <p>
        {LEGAL_ENTITY.businessName}
        <br />
        ABN {LEGAL_ENTITY.abn}
        <br />
        {LEGAL_ENTITY.address}
        <br />
        Email: <a href={`mailto:${LEGAL_ENTITY.supportEmail}`}>{LEGAL_ENTITY.supportEmail}</a>
      </p>
    </>
  );
}
