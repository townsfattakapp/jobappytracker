import type { Metadata } from 'next'
import LegalPageLayout from '../../components/legal/LegalPageLayout'

export const metadata: Metadata = {
  title: 'Terms of Service · Prep by EVOLW',
  description: 'Terms and conditions governing the use of Prep by EVOLW, curriculum access, subscriptions, and platform services.',
}

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Terms of Service"
      subtitle="The contract governing your access and use of the Prep by EVOLW platform."
      lastUpdated="September 2026"
      badge="Agreement"
    >
      <section className="legal-section">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By creating an account, accessing, or using Prep by EVOLW (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and our Privacy Policy. If you do not agree to these Terms, you must not access or use the Service.
        </p>
        <p>
          The Service is provided by <strong>Evolw Technologies</strong> (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;).
        </p>
      </section>

      <section className="legal-section">
        <h2>2. Description of the Service</h2>
        <p>
          Prep by EVOLW is an educational and productivity platform designed to help software engineers prepare for technical interviews. The platform provides curriculum roadmaps, interactive workspaces, coding exercises, system design blueprints, mock interview practice, and job discovery tools.
        </p>
        <p>
          <strong>No Guarantee of Employment:</strong> Prep by EVOLW is strictly a preparatory learning tool. We do not guarantee that using the platform will result in job offers, interviews, salary increases, or successful employment outcomes. Any readiness metrics or preparation blueprints provided are purely informational.
        </p>
      </section>

      <section className="legal-section">
        <h2>3. Account Registration and Security</h2>
        <ul>
          <li>You must provide accurate, current, and complete information during registration.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
          <li>You must immediately notify us of any unauthorized use or security breach involving your account.</li>
          <li>Accounts are non-transferable and may not be shared between multiple individuals.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>4. Acceptable Use Policy</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use automated tools, scrapers, bots, or scripts to harvest data, catalog postings, or curriculum content from the Service without express written permission.</li>
          <li>Circumvent, disable, or tamper with security features, authentication limiters, entitlement gates, or rate-limiting controls.</li>
          <li>Attempt to decompile, reverse-engineer, or disassemble any portion of the platform code or proprietary algorithms.</li>
          <li>Upload malicious files, exploit payloads, or content that infringes upon third-party intellectual property rights.</li>
          <li>Use the platform to distribute spam, unauthorized outreach messages, or conduct credential stuffing.</li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>5. Intellectual Property Rights</h2>
        <p>
          All curriculum outlines, task structures, quiz questions, system design exercises, software code, visual design, and branding are the proprietary property of the Company or its licensors.
        </p>
        <p>
          You are granted a limited, personal, revocable, non-exclusive, non-transferable license to access and use the educational content for your own individual study. You may not resell, republish, syndicate, or create derivative commercial courses from our curriculum.
        </p>
      </section>

      <section className="legal-section">
        <h2>6. Plans, Payments, and Billing</h2>
        <ul>
          <li>
            <strong>Plans and Passes:</strong> We offer free access tiers, fixed-duration passes, and recurring subscription plans as described on our <a href="/pricing" className="text-primary underline">Pricing Page</a>.
          </li>
          <li>
            <strong>Payments:</strong> All payments are processed through authorized payment gateway partners (such as Razorpay). Prices are listed in INR (Indian Rupees) inclusive of applicable taxes unless stated otherwise.
          </li>
          <li>
            <strong>Cancellations and Expiry:</strong> Fixed-duration passes expire automatically at the conclusion of the stated period without auto-renewal. Recurring subscriptions may be cancelled at any time through the Billing settings; cancellation takes effect at the end of the current billing cycle.
          </li>
          <li>
            <strong>Refunds:</strong> All purchases are governed by our <a href="/refund" className="text-primary underline">Refund &amp; Cancellation Policy</a>.
          </li>
        </ul>
      </section>

      <section className="legal-section">
        <h2>7. Disclaimer of Warranties and Limitation of Liability</h2>
        <p>
          THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
        </p>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT SHALL THE COMPANY BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, SPECIAL, OR EXEMPLARY DAMAGES ARISING OUT OF YOUR USE OR INABILITY TO USE THE SERVICE. OUR TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID BY YOU TO THE COMPANY IN THE THREE (3) MONTHS PRECEDING THE CLAIM.
        </p>
      </section>

      <section className="legal-section">
        <h2>8. Governing Law and Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute, claim, or proceeding arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the competent courts in Bengaluru, Karnataka, India.
        </p>
      </section>

      <section className="legal-section">
        <h2>9. Contact for Legal Notices</h2>
        <p>
          Formal notices regarding these Terms should be sent to:
        </p>
        <div className="legal-callout">
          <p><strong>Entity:</strong> Evolw Technologies</p>
          <p><strong>Legal Department:</strong> <a href="mailto:legal@evolw.in" className="text-primary underline">legal@evolw.in</a></p>
          <p><strong>Address:</strong> Evolw Technologies, Bengaluru, Karnataka, India</p>
        </div>
      </section>
    </LegalPageLayout>
  )
}
