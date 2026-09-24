import { useState, useEffect } from 'react'

export default function CurriculumStudio() {
  const [tracks, setTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/curriculum/admin')
      .then(res => {
        if (!res.ok) throw new Error('Forbidden')
        return res.json()
      })
      .then(data => {
        setTracks(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-4">Loading Curriculum Studio...</div>
  if (error) return <div className="p-4 text-destructive">Error: {error}</div>

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-foreground">Curriculum Studio (Admin)</h2>
      <div className="surface rounded-xl border border-border p-4">
        <table className="w-full text-left text-sm">
          <thead>
            <tr>
              <th className="pb-2">ID</th>
              <th className="pb-2">Title</th>
              <th className="pb-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {tracks.map(t => (
              <tr key={t.id} className="border-t border-border/50">
                <td className="py-2">{t.id}</td>
                <td className="py-2">{t.title}</td>
                <td className="py-2">{t.status}</td>
              </tr>
            ))}
            {tracks.length === 0 && (
              <tr>
                <td colSpan={3} className="py-4 text-muted-foreground">No tracks found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
