import type { Metadata } from "next";
import { LEGAL_ENTITY } from "@/lib/product";

export const metadata: Metadata = { title: "Privacy Policy" };

const LAST_UPDATED = "30 August 2026";

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p className="prose-meta">Last updated: {LAST_UPDATED}</p>

      <p>
        {LEGAL_ENTITY.businessName} (ABN {LEGAL_ENTITY.abn}) (<strong>we</strong>, <strong>us</strong>) is
        committed to protecting your privacy in accordance with the Privacy Act 1988 (Cth) and the
        Australian Privacy Principles (APPs). This Privacy Policy explains how we collect, use, store and
        disclose your personal information when you use The Budget Calculator (the <strong>App</strong>).
      </p>
      <p>
        We design The Budget Calculator for privacy by default: we collect only what is needed to run the
        App&rsquo;s budgeting features, and we do not use your financial data for advertising.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you give us</h3>
      <ul>
        <li>Account details: name, email address, and a securely hashed password.</li>
        <li>
          Financial information you choose to enter: accounts, balances, bills, transactions, income,
          pay cycles, savings goals and recovery notes. This is provided by you for the App to work —
          we do not connect to your bank without your explicit action, and any such connection would only
          ever be added with clear consent and disclosure.
        </li>
        <li>Correspondence: messages you send to our support address.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>Device and usage information (browser type, device type, general diagnostics) to keep the App secure and working correctly.</li>
        <li>Authentication and security logs (e.g. sign-in timestamps) to protect your account.</li>
      </ul>
      <h3>Payment information</h3>
      <p>
        Subscription payments are processed by Stripe, Inc. We never receive or store your full card
        number. Stripe collects and processes payment details under its own privacy policy, available at{" "}
        <a href="https://stripe.com/au/privacy" target="_blank" rel="noreferrer">
          stripe.com/au/privacy
        </a>
        .
      </p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To provide, maintain and improve the App&rsquo;s budgeting, forecasting and recovery features.</li>
        <li>To create and manage your account and subscription.</li>
        <li>To communicate with you about your account, billing, or material changes to the App.</li>
        <li>To detect, prevent and investigate fraud, unauthorised access or misuse.</li>
        <li>To comply with our legal obligations.</li>
      </ul>
      <p>
        We do not sell your personal information, and we do not use your financial data to serve
        advertising or to manipulate your spending decisions.
      </p>

      <h2>3. Who we share information with</h2>
      <p>We disclose personal information only where necessary to run the App:</p>
      <ul>
        <li><strong>Stripe, Inc.</strong> — payment processing and subscription billing.</li>
        <li><strong>Neon, Inc.</strong> — our database hosting provider, which stores your account and financial data.</li>
        <li><strong>Cloudflare, Inc.</strong> — our application hosting provider.</li>
        <li>Law enforcement or regulators, where required by law.</li>
        <li>A successor entity, if {LEGAL_ENTITY.businessName} is involved in a merger, acquisition or sale of assets — you would be notified of any change in ownership or use of your personal information.</li>
      </ul>

      <h2>4. Overseas disclosure</h2>
      <p>
        Some of our service providers (including Stripe, Neon and Cloudflare) store or process data on
        infrastructure located outside Australia, including in the United States. Where personal
        information is disclosed overseas, we take reasonable steps to ensure it is handled consistently
        with the Australian Privacy Principles, including relying on our providers&rsquo; contractual and
        security commitments.
      </p>

      <h2>5. Data security</h2>
      <p>
        We use industry-standard safeguards to protect your information, including encrypted connections
        (HTTPS/TLS), hashed passwords, least-privilege database access, and audit logging of material data
        changes. No system is completely secure, and we encourage you to use a strong, unique password.
      </p>

      <h2>6. Data retention and deletion</h2>
      <p>
        We retain your account and financial data for as long as your account is active. You can request
        export or deletion of your data at any time from Settings, or by emailing{" "}
        {LEGAL_ENTITY.supportEmail}. We will delete or de-identify your personal information within a
        reasonable time after a deletion request, unless we are required to retain it by law (for example,
        financial record-keeping obligations).
      </p>

      <h2>7. Access and correction</h2>
      <p>
        Under APP 12 and APP 13, you have the right to request access to the personal information we hold
        about you, and to request correction if it is inaccurate, out of date or incomplete. Most of this
        you can view and correct yourself directly in the App. For anything else, contact{" "}
        {LEGAL_ENTITY.supportEmail}.
      </p>

      <h2>8. Cookies</h2>
      <p>
        We use essential cookies/local storage strictly necessary to keep you signed in and to remember
        your preferences. We do not use third-party advertising cookies.
      </p>

      <h2>9. Children</h2>
      <p>The Budget Calculator is not directed at, and must not be used by, anyone under the age of 18.</p>

      <h2>10. Complaints</h2>
      <p>
        If you have a concern about how we&rsquo;ve handled your personal information, please contact us
        first at {LEGAL_ENTITY.supportEmail} so we can investigate. If you are not satisfied with our
        response, you may lodge a complaint with the Office of the Australian Information Commissioner
        (OAIC) at{" "}
        <a href="https://www.oaic.gov.au" target="_blank" rel="noreferrer">
          oaic.gov.au
        </a>
        .
      </p>

      <h2>11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be notified to you
        through the App or by email before they take effect.
      </p>

      <h2>12. Contact us</h2>
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
