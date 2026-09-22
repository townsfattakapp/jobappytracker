import { NextResponse, type NextRequest } from 'next/server'

/**
 * The marketing site lives at "/" and the product at "/app". Anyone with a
 * session cookie, or who has used the app on this device before, goes
 * straight to the product.
 */
export function proxy(request: NextRequest) {
  const cookies = request.cookies
  const signedIn = cookies.has('authjs.session-token') || cookies.has('__Secure-authjs.session-token')
  const returning = cookies.get('prep-returning')?.value === '1'
  if ((signedIn || returning) && !request.nextUrl.searchParams.has('home')) {
    return NextResponse.redirect(new URL('/app', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
