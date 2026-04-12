import { NextRequest, NextResponse } from 'next/server'
import { upsertArtifactServer, readArtifacts } from '@/lib/server/artifactStore'

export async function GET() {
  return NextResponse.json(readArtifacts())
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const rec = upsertArtifactServer(body)
  return NextResponse.json(rec)
}


