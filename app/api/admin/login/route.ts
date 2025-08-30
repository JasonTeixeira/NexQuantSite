import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { getJwtSecretBytes } from "@/lib/auth-config"

// Demo users. Replace with DB lookup in production.
const USERS = [
  {
    id: "admin-001",
    email: "admin@nexural.com",
    password: "admin123",
    name: "NEXURAL Admin",
    role: "super_admin" as const,
    permissions: ["*"],
  },
  {
    id: "admin-002",
    email: "demo@nexural.com",
    password: "demo123",
    name: "Demo Admin",
    role: "admin" as const,
    permissions: ["dashboard.view", "users.view", "analytics.view", "content.view", "signals.view", "finance.view"],
  },
]

function randomId(prefix = "id"): string {
  const rnd =
    (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID?.()) ||
    `${prefix}_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
  return rnd
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string }
    const { email, password } = body || {}

    if (!email || !password) {
      return NextResponse.json({ success: false, message: "Email and password are required" }, { status: 400 })
    }

    const user = USERS.find((u) => u.email === email && u.password === password)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }

    const secret = getJwtSecretBytes()
    const now = Math.floor(Date.now() / 1000)
    const expiresIn = 30 * 60 // 30 minutes

    const sessionId = randomId("sid")

    const jwt = await new SignJWT({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: user.permissions,
      sessionId,
      iat: now,
      exp: now + expiresIn,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer("nexural-admin")
      .setAudience("nexural-admin")
      .sign(secret)

    const refreshToken = randomId("rt")
    const csrfToken = randomId("csrf")

    const res = NextResponse.json({
      success: true,
      token: jwt, // legacy shape
      tokens: {
        accessToken: jwt,
        refreshToken,
        csrfToken,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        sessionId,
        loginTime: new Date().toISOString(),
      },
      expiresIn,
    })

    // Optional: demo refresh cookie
    res.cookies.set("admin_access", jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 30 * 60,
    })

    res.cookies.set("admin_refresh", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })

    return res
  } catch (e: any) {
    console.error("Admin login error:", e)
    return NextResponse.json({ success: false, message: e?.message || "Internal server error" }, { status: 500 })
  }
}
