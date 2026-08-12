import { set, get, del } from 'idb-keyval'

export async function saveAttachmentFile(id: string, file: File): Promise<void> {
  await set(`attachment-${id}`, file)
}

export async function getAttachmentFile(id: string): Promise<File | undefined> {
  return await get(`attachment-${id}`)
}

export async function deleteAttachmentFile(id: string): Promise<void> {
  await del(`attachment-${id}`)
}
