import { NextResponse } from "next/server"
import crypto from "crypto"
import { verifyRefresh, signAccessToken, signRefreshToken } from "@/lib/auth-tokens"
import { consumeRefresh, allowRefresh } from "@/lib/refresh-store"

export async function POST(req: Request) {
  try {
    const cookie =
      (await (req as any).cookies?.get?.("admin_refresh"))?.value || getCookieFromHeader(req, "admin_refresh")
    if (!cookie) {
      return NextResponse.json({ success: false, message: "Missing refresh token" }, { status: 401 })
    }

    const payload = await verifyRefresh(cookie)
    // Validate jti and rotation
    const consumed = consumeRefresh(payload.jti)
    if (!consumed) {
      return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 401 })
    }

    const accessToken = await signAccessToken(
      {
        sub: payload.sub,
        email: "", // optional; not required for verification
        role: "", // keep empty if not needed; client keeps user in localStorage
        permissions: [], // client keeps user permissions
        sid: payload.sid,
      },
      "15m",
    )

    // Rotate refresh token
    const newJti = crypto.randomUUID()
    const newRefresh = await signRefreshToken({ sub: payload.sub, sid: payload.sid, jti: newJti }, "7d")
    const nextPayload = JSON.parse(Buffer.from(newRefresh.split(".")[1], "base64").toString("utf8"))
    allowRefresh(newJti, payload.sub, payload.sid, nextPayload.exp)

    const res = NextResponse.json({ success: true, token: accessToken })
    res.cookies.set("admin_refresh", newRefresh, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    })
    return res
  } catch (e: any) {
    return NextResponse.json({ success: false, message: "Invalid refresh token" }, { status: 401 })
  }
}

function getCookieFromHeader(req: Request, name: string) {
  const cookieHeader = req.headers.get("cookie")
  if (!cookieHeader) return null
  const parts = cookieHeader.split(";").map((p) => p.trim())
  for (const p of parts) {
    if (p.startsWith(name + "=")) return p.slice(name.length + 1)
  }
  return null
}
