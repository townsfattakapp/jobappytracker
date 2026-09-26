import Link from 'next/link'
import { notFound } from 'next/navigation'
import JobEditor from '../../../../components/admin/JobEditor'
import { PageHeader, Pill, formatDateTime, statusTone } from '../../../../components/admin/ui'
import { requireAdminPage } from '../../../../lib/server/adminPage'
import { listAudit } from '../../../../lib/server/audit'
import { allActiveCompanies, allActiveSources, getJob } from '../../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage('jobs_editor', 'support')
  const { id } = await params
  const [job, companies, sources, audit] = await Promise.all([getJob(id, { publicOnly: false }), allActiveCompanies(), allActiveSources(), listAudit({ entityId: id, pageSize: 10 })])
  if (!job) notFound()
  return (
    <>
      <PageHeader
        title={job.title}
        description={`${job.company.name} · created ${formatDateTime(job.createdAt)} · last verified ${formatDateTime(job.lastVerifiedAt)}`}
        actions={
          <>
            <Pill tone={statusTone(job.status)}>{job.status}</Pill>
            <Link href="/admin/jobs" className="btn btn-ghost btn-sm">
              All jobs
            </Link>
          </>
        }
      />
      <JobEditor companies={companies} sources={sources} job={job} />
      <section className="admin-section" aria-label="Change history">
        <h2 className="admin-section-title">Change history</h2>
        {audit.items.length === 0 ? (
          <div className="admin-card text-sm text-muted-foreground">No changes recorded.</div>
        ) : (
          <ul className="admin-list">
            {audit.items.map((entry) => (
              <li key={entry.id} className="admin-list-item">
                <code className="admin-code">{entry.action}</code>
                <span className="text-muted-foreground">
                  {entry.actor?.email ?? 'system'} · {formatDateTime(entry.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
