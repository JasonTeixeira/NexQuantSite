import { NextResponse } from "next/server"
import { verifyAccess } from "@/lib/auth-tokens"

export async function POST(req: Request) {
  try {
    const auth = req.headers.get("authorization") || req.headers.get("Authorization")
    if (!auth || !auth.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Missing token" }, { status: 401 })
    }
    const token = auth.slice("Bearer ".length)
    const payload = await verifyAccess(token)

    return NextResponse.json({
      success: true,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        sessionId: payload.sid,
      },
      exp: payload.exp,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
  }
}
