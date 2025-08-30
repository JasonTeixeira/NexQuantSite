/**
 * JWT secret resolution with safe fallbacks for preview/dev.
 * Order:
 * 1) process.env.JWT_SECRET
 * 2) process.env.ENCRYPTION_MASTER_KEY
 * 3) Memoized runtime-generated secret (per process) or static fallback
 *
 * Note: Use ONLY on the server (Route Handlers / Server Actions).
 */

let FALLBACK_SECRET: Uint8Array | undefined
let WARNED = false

function warnOnce(message: string) {
  if (!WARNED) {
    // eslint-disable-next-line no-console
    console.warn(message)
    WARNED = true
  }
}

export function getJwtSecretBytes(): Uint8Array {
  const enc = new TextEncoder()

  if (typeof process !== "undefined" && process.env?.JWT_SECRET && process.env.JWT_SECRET.trim().length > 0) {
    return enc.encode(process.env.JWT_SECRET)
  }

  if (
    typeof process !== "undefined" &&
    process.env?.ENCRYPTION_MASTER_KEY &&
    process.env.ENCRYPTION_MASTER_KEY.trim().length > 0
  ) {
    // Good enough for HS256 HMAC; no need to hash here in the sandbox.
    warnOnce("[admin] Using ENCRYPTION_MASTER_KEY as JWT secret fallback. Set JWT_SECRET for production.")
    return enc.encode(process.env.ENCRYPTION_MASTER_KEY)
  }

  if (!FALLBACK_SECRET) {
    if (typeof globalThis !== "undefined" && globalThis.crypto?.getRandomValues) {
      const arr = new Uint8Array(32) // 256-bit
      globalThis.crypto.getRandomValues(arr)
      FALLBACK_SECRET = arr
    } else {
      // Static fallback if Web Crypto is unavailable
      FALLBACK_SECRET = enc.encode("nexural-admin-dev-fallback-secret-please-set-JWT_SECRET")
    }
    warnOnce("[admin] Using runtime-generated JWT secret fallback. Set JWT_SECRET for production.")
  }

  return FALLBACK_SECRET
}
