import { SignJWT, jwtVerify, type JWTPayload } from "jose"

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret")
const ISS = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
const AUD = "nexural-admin"

type AccessClaims = JWTPayload & {
  sub: string
  email: string
  role: string
  permissions: string[]
  sid: string // session id
}

type RefreshClaims = JWTPayload & {
  sub: string
  sid: string
  jti: string // refresh token id for rotation
}

export async function signAccessToken(claims: AccessClaims, expiresIn: string | number) {
  return await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISS)
    .setAudience(AUD)
    .setExpirationTime(expiresIn)
    .sign(SECRET)
}

export async function signRefreshToken(claims: RefreshClaims, expiresIn: string | number) {
  return await new SignJWT(claims)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISS)
    .setAudience(AUD)
    .setExpirationTime(expiresIn)
    .sign(SECRET)
}

export async function verifyAccess(token: string) {
  const { payload } = await jwtVerify(token, SECRET, { issuer: ISS, audience: AUD })
  return payload as AccessClaims
}

export async function verifyRefresh(token: string) {
  const { payload } = await jwtVerify(token, SECRET, { issuer: ISS, audience: AUD })
  return payload as RefreshClaims
}
