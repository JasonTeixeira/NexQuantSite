import { NextResponse } from 'next/server'
import { generateMainSitemap } from '@/lib/seo/sitemap-generator'

export async function GET() {
  try {
    const sitemap = await generateMainSitemap(
      process.env.NEXT_PUBLIC_BASE_URL || 'https://nexuraltrading.com'
    )

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}