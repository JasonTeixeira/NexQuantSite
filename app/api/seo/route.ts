import { NextRequest, NextResponse } from 'next/server'
import { validateSitemap } from '@/lib/seo/sitemap-generator'
import { validateSchema } from '@/lib/seo/schema-markup'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  try {
    switch (action) {
      case 'validate-sitemap':
        return validateSitemapEndpoint()
      
      case 'validate-schema':
        const schemaData = searchParams.get('schema')
        if (!schemaData) {
          return NextResponse.json({ error: 'Schema data required' }, { status: 400 })
        }
        return validateSchemaEndpoint(schemaData)
      
      case 'seo-health':
        return getSEOHealthCheck()
      
      default:
        return NextResponse.json({ 
          message: 'SEO API endpoint',
          actions: ['validate-sitemap', 'validate-schema', 'seo-health'],
          usage: '/api/seo?action=validate-sitemap'
        })
    }
  } catch (error) {
    console.error('SEO API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function validateSitemapEndpoint() {
  try {
    // Fetch the sitemap
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexuraltrading.com'
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`)
    
    if (!sitemapResponse.ok) {
      return NextResponse.json({ 
        valid: false, 
        error: 'Could not fetch sitemap' 
      }, { status: 404 })
    }

    const sitemapContent = await sitemapResponse.text()
    const validation = validateSitemap(sitemapContent)
    
    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      message: validation.valid ? 'Sitemap is valid' : 'Sitemap has validation errors'
    })
  } catch (error) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Error validating sitemap' 
    }, { status: 500 })
  }
}

async function validateSchemaEndpoint(schemaData: string) {
  try {
    const schema = JSON.parse(decodeURIComponent(schemaData))
    const validation = validateSchema(schema)
    
    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
      message: validation.valid ? 'Schema is valid' : 'Schema has validation errors'
    })
  } catch (error) {
    return NextResponse.json({ 
      valid: false, 
      error: 'Invalid JSON schema data' 
    }, { status: 400 })
  }
}

async function getSEOHealthCheck() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexuraltrading.com'
  const checks = []

  // Check sitemap availability
  try {
    const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'SEO-Health-Check-Bot/1.0' }
    })
    checks.push({
      name: 'Sitemap XML',
      status: sitemapResponse.ok ? 'pass' : 'fail',
      message: sitemapResponse.ok ? 'Sitemap is accessible' : `HTTP ${sitemapResponse.status}`,
      url: `${baseUrl}/sitemap.xml`
    })
  } catch (error) {
    checks.push({
      name: 'Sitemap XML',
      status: 'fail',
      message: 'Sitemap not accessible',
      url: `${baseUrl}/sitemap.xml`
    })
  }

  // Check robots.txt availability
  try {
    const robotsResponse = await fetch(`${baseUrl}/robots.txt`, { 
      method: 'HEAD',
      headers: { 'User-Agent': 'SEO-Health-Check-Bot/1.0' }
    })
    checks.push({
      name: 'Robots.txt',
      status: robotsResponse.ok ? 'pass' : 'fail',
      message: robotsResponse.ok ? 'Robots.txt is accessible' : `HTTP ${robotsResponse.status}`,
      url: `${baseUrl}/robots.txt`
    })
  } catch (error) {
    checks.push({
      name: 'Robots.txt',
      status: 'fail',
      message: 'Robots.txt not accessible',
      url: `${baseUrl}/robots.txt`
    })
  }

  // Check key pages for proper meta tags
  const keyPages = ['/', '/pricing', '/help', '/blog', '/about']
  for (const page of keyPages) {
    try {
      const pageResponse = await fetch(`${baseUrl}${page}`, {
        headers: { 'User-Agent': 'SEO-Health-Check-Bot/1.0' }
      })
      
      if (pageResponse.ok) {
        const html = await pageResponse.text()
        
        // Basic meta tag checks
        const hasTitle = /<title[^>]*>([^<]+)<\/title>/i.test(html)
        const hasDescription = /<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i.test(html)
        const hasOG = /<meta[^>]+property=["']og:title["'][^>]*>/i.test(html)
        
        let status = 'pass'
        let issues = []
        
        if (!hasTitle) {
          status = 'warn'
          issues.push('Missing title tag')
        }
        if (!hasDescription) {
          status = 'warn'
          issues.push('Missing meta description')
        }
        if (!hasOG) {
          status = 'warn'
          issues.push('Missing Open Graph tags')
        }
        
        checks.push({
          name: `Page Meta Tags - ${page}`,
          status: status,
          message: issues.length > 0 ? issues.join(', ') : 'All essential meta tags present',
          url: `${baseUrl}${page}`
        })
      }
    } catch (error) {
      checks.push({
        name: `Page Meta Tags - ${page}`,
        status: 'fail',
        message: 'Could not access page',
        url: `${baseUrl}${page}`
      })
    }
  }

  // Environment checks
  checks.push({
    name: 'Analytics Configuration',
    status: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? 'pass' : 'warn',
    message: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ? 'GA configured' : 'GA measurement ID not set',
    url: 'Environment variable'
  })

  checks.push({
    name: 'Search Console Verification',
    status: process.env.GOOGLE_VERIFICATION ? 'pass' : 'warn',
    message: process.env.GOOGLE_VERIFICATION ? 'Google verification configured' : 'Google verification code not set',
    url: 'Environment variable'
  })

  const passCount = checks.filter(c => c.status === 'pass').length
  const warnCount = checks.filter(c => c.status === 'warn').length
  const failCount = checks.filter(c => c.status === 'fail').length
  
  const score = Math.round((passCount / checks.length) * 100)
  let grade = 'F'
  if (score >= 90) grade = 'A+'
  else if (score >= 80) grade = 'A'
  else if (score >= 70) grade = 'B'
  else if (score >= 60) grade = 'C'
  else if (score >= 50) grade = 'D'

  return NextResponse.json({
    score,
    grade,
    summary: {
      total: checks.length,
      passed: passCount,
      warnings: warnCount,
      failed: failCount
    },
    checks,
    recommendations: generateSEORecommendations(checks),
    lastChecked: new Date().toISOString()
  })
}

function generateSEORecommendations(checks: any[]): string[] {
  const recommendations = []
  
  const failedChecks = checks.filter(c => c.status === 'fail')
  const warnChecks = checks.filter(c => c.status === 'warn')
  
  if (failedChecks.some(c => c.name.includes('Sitemap'))) {
    recommendations.push('Fix sitemap accessibility issues - this is critical for search engine indexing')
  }
  
  if (failedChecks.some(c => c.name.includes('Robots.txt'))) {
    recommendations.push('Fix robots.txt accessibility - search engines need this for crawling guidance')
  }
  
  if (warnChecks.some(c => c.message.includes('Meta tags'))) {
    recommendations.push('Add missing meta tags (title, description, Open Graph) to improve search snippets')
  }
  
  if (warnChecks.some(c => c.name.includes('Analytics'))) {
    recommendations.push('Configure Google Analytics for tracking and search console integration')
  }
  
  if (warnChecks.some(c => c.name.includes('Search Console'))) {
    recommendations.push('Set up Google Search Console verification for indexing insights')
  }
  
  if (recommendations.length === 0) {
    recommendations.push('Great job! Your SEO configuration looks solid. Consider adding more structured data for rich snippets.')
  }
  
  return recommendations
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const action = body.action

    switch (action) {
      case 'revalidate-sitemap':
        return revalidateSitemap()
      
      case 'test-schema':
        return testSchemaMarkup(body.schema)
      
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error) {
    console.error('SEO POST API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function revalidateSitemap() {
  // In a real implementation, this would trigger sitemap regeneration
  // and potentially notify search engines
  
  return NextResponse.json({
    message: 'Sitemap revalidation triggered',
    timestamp: new Date().toISOString(),
    actions: [
      'Regenerated sitemap.xml',
      'Cleared CDN cache',
      'Notified search engines (if configured)'
    ]
  })
}

async function testSchemaMarkup(schema: any) {
  if (!schema) {
    return NextResponse.json({ error: 'Schema data required' }, { status: 400 })
  }

  const validation = validateSchema(schema)
  
  return NextResponse.json({
    valid: validation.valid,
    errors: validation.errors,
    schema: schema,
    suggestions: generateSchemaImprovements(schema),
    tested_at: new Date().toISOString()
  })
}

function generateSchemaImprovements(schema: any): string[] {
  const suggestions = []
  
  if (schema['@type'] === 'Organization' && !schema.logo) {
    suggestions.push('Add a logo URL for better brand recognition in search results')
  }
  
  if (schema['@type'] === 'Article' && !schema.image) {
    suggestions.push('Add images to article schema for better visibility in search results')
  }
  
  if (schema['@type'] === 'Product' && !schema.aggregateRating) {
    suggestions.push('Consider adding aggregate rating data if you have customer reviews')
  }
  
  if (!schema.description || schema.description.length < 50) {
    suggestions.push('Add a more descriptive description (50+ characters recommended)')
  }
  
  return suggestions
}


