import type { Metadata } from 'next'
import LegalPageLayout from '../../components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Refund & Cancellation Policy · Prep by EVOLW',
  description: 'Policy regarding subscription cancellations, one-time passes, refund eligibility, and payment reversals.',
}

export default function RefundPage() {
  return (
    <LegalPageLayout
      title="Refund &amp; Cancellation Policy"
      subtitle="Clear and fair terms regarding pass duration, subscription cancellations, and refund eligibility."
      lastUpdated="September 2026"
      badge="Billing & Payments"
    >
      <section className="legal-section">
        <h2>1. Overview and Nature of Digital Services</h2>
        <p>
          Prep by EVOLW provides immediate digital access to learning content, interactive curriculum roadmaps, AI mock interview modules, and job discovery tools upon successful payment.
        </p>
        <p>
          Because digital access is granted instantly and irrevocably upon transaction completion, our cancellation and refund policies are structured to be transparent and fair to both the learner and the platform.
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Fixed-Duration Passes (One-Time Payment)</h2>
        <ul>
          <li>
            <strong>No Auto-Renewal:</strong> Fixed passes (such as our 90-day or 180-day passes) are one-time payments. They do not store recurring mandates, and your payment method will never be billed automatically.
          </li>
          <li>
            <strong>Expiry:</strong> Access remains fully active throughout the purchased duration and automatically transitions to the free tier upon expiry unless you choose to buy another pass.
          </li>
          <li>
            <strong>Stacking:</strong> Purchasing an additional pass while an active pass exists adds the new duration to the end of your current active period.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>3. Recurring Subscriptions (Monthly or Annual)</h2>
        <ul>
          <li>
            <strong>Cancellation Anytime:</strong> If you are subscribed to a recurring plan, you may cancel your auto-renewal at any time through the Billing section of the platform or by contacting support.
          </li>
          <li>
            <strong>Access to Period End:</strong> When you cancel a recurring subscription, your access remains active until the end of your currently paid billing period. You will not be charged for subsequent billing cycles.
          </li>
          <li>
            <strong>No Partial-Period Proration:</strong> Except where required by applicable law, we do not provide partial refunds or pro-rated credits for unused days within a billing period that has already begun.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>4. Refund Eligibility and Exceptions</h2>
        <p>We provide full or partial refunds under the following specific circumstances:</p>
        <ul>
          <li>
            <strong>Duplicate or Erroneous Charges:</strong> If you were charged more than once for the same transaction due to a technical error or gateway glitch, we will refund the duplicate payment immediately upon notification.
          </li>
          <li>
            <strong>Technical Failure to Deliver Access:</strong> If a payment succeeded but our platform failed to provision your plan entitlements within 24 hours, and our technical support is unable to resolve the issue, you are entitled to a full refund.
          </li>
          <li>
            <strong>Cooling-off Period:</strong> Requests submitted within 48 hours of purchase with zero mock interview usage may be considered for a courtesy refund on a case-by-case basis.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>5. How to Request a Refund</h2>
        <p>To request a refund or dispute a charge:</p>
        <ol>
          <li>
            Send an email to our billing support team at{' '}
            <a href="mailto:billing@evolw.in" className="text-primary underline">billing@evolw.in</a> (or <a href="mailto:support@evolw.in" className="text-primary underline">support@evolw.in</a>).
          </li>
          <li>Include your registered email address, date of transaction, and the Razorpay payment or order ID from your receipt.</li>
          <li>State the reason for your request clearly.</li>
        </ol>
      </section>

      <section className="legal-section">
        <h2>6. Processing Time and Method</h2>
        <p>
          Approved refunds are processed through our payment gateway (Razorpay) back to the original payment source (UPI, debit/credit card, or net banking account).
        </p>
        <p>
          Depending on your issuing bank, the refunded funds typically reflect in your account within <strong>5 to 7 business days</strong> from the date of approval.
        </p>
      </section>
    </LegalPageLayout>
  )
}
