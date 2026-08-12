import { useEffect, useState } from 'react'

interface BookmarkletModalProps {
  open: boolean
  onClose: () => void
}

export default function BookmarkletModal({ open, onClose }: BookmarkletModalProps) {
  const [bookmarkletUrl, setBookmarkletUrl] = useState('')

  useEffect(() => {
    if (!open) return
    const origin = window.location.origin

    const rawCode = `javascript:(function(){const url=window.location.href;const origin='${origin}';let company='';let role='';let location='';let source='';if(url.includes('linkedin.com/jobs')){source='LinkedIn';const titleNode=document.querySelector('.job-details-jobs-unified-top-card__job-title');if(titleNode)role=titleNode.innerText.trim();const companyNode=document.querySelector('.job-details-jobs-unified-top-card__company-name');if(companyNode)company=companyNode.innerText.trim();if(!role){const altTitle=document.querySelector('h1');if(altTitle)role=altTitle.innerText.trim();}}else if(url.includes('indeed.com')){source='Indeed';const titleNode=document.querySelector('.jobsearch-JobInfoHeader-title');if(titleNode)role=titleNode.innerText.trim();const companyNode=document.querySelector('[data-testid="inlineHeader-companyName"]');if(companyNode)company=companyNode.innerText.trim();}else{role=document.title;}const searchParams=new URLSearchParams();searchParams.set('import','true');if(company)searchParams.set('company',company);if(role)searchParams.set('role',role);searchParams.set('url',url);if(source)searchParams.set('source',source);window.open(origin+'/?'+searchParams.toString(),'_blank');})();`

    setBookmarkletUrl(rawCode)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center animate-fade">
      <button
        type="button"
        className="absolute inset-0 bg-[hsl(var(--ink)/0.45)] backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-2xl surface p-6 animate-slide-up bg-[hsl(var(--card))] border border-border shadow-2xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              Bookmarklet Import
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Import jobs from anywhere with a single click.
            </p>
          </div>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="my-8 flex flex-col items-center">
          <p className="mb-4 font-semibold text-center text-foreground">
            1. Drag this button to your Bookmarks Bar:
          </p>
          <a
            href={bookmarkletUrl}
            className="px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all cursor-grab active:cursor-grabbing border-2 border-primary border-dashed"
            onClick={(e) => {
              // Prevent clicking the bookmarklet inside the app
              e.preventDefault()
              alert("Drag me to your bookmarks bar! Don't just click me.")
            }}
          >
            + Add to JobAppy
          </a>
        </div>

        <div className="mt-6 space-y-3 bg-muted/30 p-4 rounded-xl border border-border">
          <p className="font-semibold text-sm text-foreground">2. How to use it:</p>
          <ul className="list-decimal list-inside text-sm text-muted-foreground space-y-2">
            <li>Go to a job posting on LinkedIn or Indeed.</li>
            <li>Click the <strong>Add to JobAppy</strong> bookmark in your browser.</li>
            <li>A new tab will open with the job details pre-filled in your tracker!</li>
          </ul>
        </div>
        
        <div className="mt-4 text-xs text-muted-foreground text-center">
          * Note: If you don't see your bookmarks bar, press <strong>Cmd/Ctrl + Shift + B</strong>.
        </div>
      </div>
    </div>
  )
}
