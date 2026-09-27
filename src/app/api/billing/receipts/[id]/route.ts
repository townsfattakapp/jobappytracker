import { auth } from '../../../../../lib/auth'
import { getReceipt, receiptHtml } from '../../../../../lib/server/receipts'

export const dynamic = 'force-dynamic'

/** Printable receipt page; only the buyer can open it. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return new Response('Sign in first.', { status: 401, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  const { id } = await ctx.params
  const receipt = await getReceipt(session.user.id, id)
  if (!receipt) return new Response('Receipt not found.', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } })
  return new Response(receiptHtml(receipt), { status: 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store' } })
}
