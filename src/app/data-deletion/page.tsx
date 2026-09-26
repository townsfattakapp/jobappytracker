import type { Metadata } from 'next';
import LegalPageLayout from '../../components/legal/LegalPageLayout';

export const metadata: Metadata = {
  title: 'Data Deletion & Account Controls · Prep by EVOLW',
  description: 'Understand how Prep by EVOLW stores your information, how to export your records, and how to execute self-service or permanent data deletion.',
};

export default function DataDeletionPage() {
  return (
    <LegalPageLayout
      title="Data Deletion &amp; Account Controls"
      subtitle="Transparency, data portability, and complete learner control over your career records, learning progress, and personal data."
      lastUpdated="September 2026"
      badge="Data Controls"
    >
      <div className="legal-section">
        <h2>1. Our Data Minimization Commitment</h2>
        <p>
          Prep by EVOLW adheres to data minimization principles. We only collect the information necessary to provide curriculum tracking, career roadmap generation, interview simulations, and job-application workflows. You maintain absolute ownership of your career assets and can purge them at any time.
        </p>
      </div>

      <div className="legal-section">
        <h2>2. Data Categories Stored</h2>
        <p>The platform maintains three distinct categories of data:</p>
        <ul>
          <li>
            <strong>Account Identity:</strong> Your authentication email, display name, password hash (if using email sign-in), and subscription billing status.
          </li>
          <li>
            <strong>Career OS &amp; Application Data:</strong> Uploaded resume files, parsed resume work history, AI-generated match analyses, customized job preparation plans, job application notes, and outreach message drafts.
          </li>
          <li>
            <strong>Local Browser Vault Data:</strong> Offline-first learning state, topic completions, custom code editor drafts, and local UI preferences stored strictly within your browser&apos;s <code>localStorage</code> and IndexedDB.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>3. Self-Service Deletion Options</h2>
        <p>You can execute granular data deletion immediately without waiting for support intervention:</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>Option A: Purge Career OS &amp; Resume Data (Instant)</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
              Removes all uploaded resumes, extracted skill analyses, outreach contact lists, target job preparation plans, and career preference records. Your core login account and learning progress remain intact.
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>How to execute:</strong> Navigate to <em>Settings &gt; Career OS Data &gt; Delete Career Data</em>, type <code>DELETE</code>, and confirm. This immediately executes a hard delete across our server database tables.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>Option B: Clear Local Browser Vault &amp; Cache</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
              Deletes all offline cache, in-browser notes, code editor snippets, and un-synced topic checkpoints stored on your current device.
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>How to execute:</strong> Navigate to <em>Settings &gt; Local Vault &gt; Clear All</em>, or use your browser&apos;s native &ldquo;Clear Site Data&rdquo; feature.
            </p>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color, #e2e8f0)', background: 'var(--card-bg, #ffffff)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', color: 'var(--primary-color, #2563eb)' }}>Option C: Complete Account Termination &amp; Cascading Deletion</h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '0.9rem' }}>
              Permanently drops your user record, authentication credentials, curriculum roadmap progress, Career OS records, and active subscription associations.
            </p>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>How to execute:</strong> Send an account closure request to <a href="mailto:privacy@evolw.in" className="text-primary underline">privacy@evolw.in</a> from your registered email address. Account deletion requests are confirmed and executed within 5 business days.
            </p>
          </div>
        </div>
      </div>

      <div className="legal-section">
        <h2>4. Data Retention &amp; Legal Exceptions</h2>
        <p>
          When a deletion request is completed, your personal and career data is permanently wiped from active production databases. However, certain records are subject to statutory retention limits:
        </p>
        <ul>
          <li>
            <strong>Financial &amp; Tax Records:</strong> In accordance with Indian tax laws (GST Act, Income Tax Act) and payment partner requirements (Razorpay), transaction receipts, invoice IDs, and payment references are retained for 7 years pursuant to statutory regulations.
          </li>
          <li>
            <strong>Security &amp; Abuse Logs:</strong> Ephemeral server access logs, firewall telemetry, and abuse mitigation records are retained for up to 90 days for fraud and DDoS prevention before automatic purging.
          </li>
          <li>
            <strong>Aggregated Industry Benchmarks:</strong> De-identified, anonymized aggregate metrics (such as difficulty percentiles) that contain no personal identifiers cannot be retroactively edited.
          </li>
        </ul>
      </div>

      <div className="legal-section">
        <h2>5. Data Portability (Exporting Your Data)</h2>
        <p>
          You have the right to obtain a portable copy of your data at any time:
        </p>
        <ul>
          <li><strong>Curriculum &amp; Notes Export:</strong> Download full JSON or Markdown archives of your learning checkpoints and customized code solutions via <em>Settings &gt; Data Export</em>.</li>
          <li><strong>Uploaded Resumes:</strong> Retrieve your original uploaded PDF documents directly from the Resume Workspace.</li>
        </ul>
      </div>
    </LegalPageLayout>
  );
}
