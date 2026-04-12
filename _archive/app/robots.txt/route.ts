import { NextResponse } from "next/server"
import { generateRobotsTxt } from "@/lib/seo/sitemap-generator"

export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexuraltrading.com'
    const robotsContent = generateRobotsTxt({
      baseUrl,
      sitemapUrl: `${baseUrl}/sitemap.xml`,
      disallowPaths: [
        '/admin/*',
        '/api/*',
        '/dashboard/*', 
        '/profile/*',
        '/_next/*',
        '/static/*',
        '/*.json',
        '/*_buildManifest.js',
        '/*_ssgManifest.js'
      ],
      allowPaths: [
        '/api/auth/login',
        '/api/auth/register'
      ],
      crawlDelay: 1
    })

    return new NextResponse(robotsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    })
  } catch (error) {
    console.error("Error generating robots.txt:", error)
    return new NextResponse("Error generating robots.txt", { status: 500 })
  }
}
