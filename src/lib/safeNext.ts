/**
 * Phase 6 P14.b — Internal-path validator for OAuth-return `next` params.
 *
 * Both SignIn (write-site) and AuthCallback (read-site) use this to prevent
 * open-redirect via a crafted `?next=` URL. We parse the candidate against
 * the current origin and accept ONLY when the resolved URL stays on-origin.
 * That handles encoded bypasses, backslash variants, and control-character
 * smuggling that a naive string check would miss.
 */
export function isSafeNext(candidate: unknown): candidate is string {
  if (typeof candidate !== 'string' || candidate.length === 0) return false;
  // Must look like an internal path. A bare `/` is allowed.
  if (!candidate.startsWith('/')) return false;
  // Reject protocol-relative + Windows-style backslash variants early — `new URL`
  // would otherwise resolve `//evil.com` against the current scheme.
  if (candidate.startsWith('//') || candidate.startsWith('/\\')) return false;
  try {
    const resolved = new URL(candidate, window.location.origin);
    return resolved.origin === window.location.origin;
  } catch {
    return false;
  }
}

/** Returns `next` if it's safe, otherwise the fallback (defaults to `/`). */
export function pickSafeNext(candidate: unknown, fallback = '/'): string {
  return isSafeNext(candidate) ? candidate : fallback;
}
