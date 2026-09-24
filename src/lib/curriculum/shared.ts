import { setSharedTracks } from './registry'

export async function loadSharedTracks() {
  try {
    const res = await fetch('/api/curriculum')
    if (res.ok) {
      const tracks = await res.json()
      // Mapping the DB format to the CurriculumTrack format using data property
      const mappedTracks = tracks.map((t: any) => ({
        ...t.data,
        id: t.id,
        title: t.title,
        family: t.family,
        ownerId: t.ownerId,
        status: t.status,
        version: t.version,
      }))
      setSharedTracks(mappedTracks)
    }
  } catch (error) {
    console.error('Failed to load shared tracks:', error)
  }
}
