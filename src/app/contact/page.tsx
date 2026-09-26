import type { Metadata } from 'next';
import LegalPageLayout from '../../components/legal/LegalPageLayout';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact & Support · Prep by EVOLW',
  description: 'Get in touch with the Prep by EVOLW team for customer support, billing inquiries, enterprise requests, and technical issues.',
};

export default function ContactPage() {
  return (
    <LegalPageLayout
      title="Contact & Support"
      subtitle="We are here to assist you with learning pathways, career tools, billing inquiries, and technical issues."
      lastUpdated="September 2026"
      badge="Support"
    >
      <div className="legal-section">
        <h2>1. Support Channels &amp; Inquiries</h2>
        <p>
          Depending on the nature of your request, please reach out to the dedicated team below for fastest resolution:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', margin: '20px 0' }}>
          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>General &amp; Product Support</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Questions about curriculums, mock interviews, roadmaps, and account access.</p>
            <p style={{ margin: 0, fontWeight: 600 }}><a href="mailto:support@evolw.in" className="text-primary underline">support@evolw.in</a></p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>Billing &amp; Subscriptions</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Invoice queries, plan upgrades, Razorpay payment issues, and refund requests.</p>
            <p style={{ margin: 0, fontWeight: 600 }}><a href="mailto:billing@evolw.in" className="text-primary underline">billing@evolw.in</a></p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>Privacy &amp; Data Governance</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>DPDP compliance requests, data export requests, and deletion verification.</p>
            <p style={{ margin: 0, fontWeight: 600 }}><a href="mailto:privacy@evolw.in" className="text-primary underline">privacy@evolw.in</a></p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>Security &amp; Responsible Disclosure</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>Vulnerability disclosures and security incident reporting.</p>
            <p style={{ margin: 0, fontWeight: 600 }}><a href="mailto:security@evolw.in" className="text-primary underline">security@evolw.in</a></p>
          </div>
        </div>
      </div>

      <div className="legal-section">
        <h2>2. Response Times &amp; Operating Hours</h2>
        <p>
          Our technical and support team operates during standard business hours:
        </p>
        <ul>
          <li><strong>Standard Support Hours:</strong> Monday &ndash; Friday, 9:00 AM &ndash; 6:00 PM IST</li>
          <li><strong>First Response Time (General):</strong> Within 24&ndash;48 business hours</li>
          <li><strong>Billing &amp; Payment Disputes:</strong> Prioritized within 24 business hours</li>
          <li><strong>Critical Security Incidents:</strong> Triaged within 4 hours</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Self-Service Account &amp; Data Management</h2>
        <p>
          Before opening a support ticket, you can manage many account preferences directly in the application:
        </p>
        <ul>
          <li><strong>Billing Management:</strong> View subscription status, download invoices, or cancel renewals directly from your <Link href="/pricing" style={{ color: 'var(--primary-color, #2563eb)' }}>Billing &amp; Pricing Page</Link>.</li>
          <li><strong>Self-Service Data Deletion:</strong> Purge all career profile data, resume uploads, and interview records with one click on the <Link href="/data-deletion" style={{ color: 'var(--primary-color, #2563eb)' }}>Data Deletion &amp; Account Controls Page</Link>.</li>
          <li><strong>Local Browser Storage:</strong> Clear browser vault and offline state via <em>Settings &gt; Local Vault &gt; Clear All</em>.</li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>4. Corporate &amp; Legal Correspondence</h2>
        <p>
          For formal legal notices, regulatory filings, or physical postal correspondence:
        </p>
        <div className="legal-callout">
          <p><strong>Operating Entity:</strong> Evolw Technologies</p>
          <p><strong>Registered Office Address:</strong> Evolw Technologies, Bengaluru, Karnataka, India</p>
          <p><strong>Grievance Officer:</strong> Grievance Officer, Evolw Technologies (<a href="mailto:privacy@evolw.in" className="text-primary underline">privacy@evolw.in</a>)</p>
          <p><strong>Official Website:</strong> <a href="https://www.evolw.in" target="_blank" rel="noreferrer" className="text-primary underline">www.evolw.in</a></p>
        </div>
      </div>
    </LegalPageLayout>
  );
}
