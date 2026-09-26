import Link from 'next/link'
import JobEditor from '../../../../components/admin/JobEditor'
import { EmptyState, PageHeader } from '../../../../components/admin/ui'
import { requireAdminPage } from '../../../../lib/server/adminPage'
import { allActiveCompanies, allActiveSources } from '../../../../lib/server/jobs'

export const dynamic = 'force-dynamic'

export default async function NewJobPage() {
  await requireAdminPage('jobs_editor')
  const [companies, sources] = await Promise.all([allActiveCompanies(), allActiveSources()])
  return (
    <>
      <PageHeader title="Add a job" description="Enter the listing exactly as the company published it. Keep the original application link." />
      {companies.length === 0 ? (
        <EmptyState
          title="Add a company first"
          description="Every job belongs to a company so learners always see who is hiring."
          action={
            <Link href="/admin/companies" className="btn btn-primary btn-sm">
              Go to companies
            </Link>
          }
        />
      ) : (
        <JobEditor companies={companies} sources={sources} />
      )}
    </>
  )
}
