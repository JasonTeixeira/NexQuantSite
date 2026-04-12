"use client"

import Head from "next/head"
import { useEffect } from "react"
import { analytics, getAnalyticsScripts, DEFAULT_ANALYTICS_CONFIG } from "@/lib/seo/analytics"
import { injectSchemaMarkup } from "@/lib/seo/schema-markup"

interface SEOHeadProps {
  title?: string
  description?: string
  keywords?: string[]
  canonicalUrl?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product' | 'profile'
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  schemas?: any[]
  noIndex?: boolean
  structuredData?: any[]
  additionalMetaTags?: Array<{
    name?: string
    property?: string
    content: string
  }>
}

export default function SEOHead({
  title,
  description,
  keywords = [],
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  schemas = [],
  noIndex = false,
  structuredData = [],
  additionalMetaTags = []
}: SEOHeadProps) {
  
  // Initialize analytics on component mount
  useEffect(() => {
    analytics.init()
  }, [])

  const fullTitle = title ? `${title} | Nexural Trading Platform` : 'Nexural Trading - AI-Powered Trading Platform'
  const metaDescription = description || 'Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis. Join thousands of successful traders maximizing profits with cutting-edge neural network technology.'
  const keywordsString = keywords.length > 0 ? keywords.join(', ') : 'AI trading, cryptocurrency, trading bots, market analysis, automated trading, trading signals, neural networks, algorithmic trading'

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nexuraltrading.com'
  const fullCanonicalUrl = canonicalUrl ? `${baseUrl}${canonicalUrl}` : baseUrl
  const fullOgImage = ogImage ? (ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`) : `${baseUrl}/og-image.jpg`

  // Combine all schemas
  const allSchemas = [...schemas, ...structuredData]

  return (
    <>
      <Head>
        {/* Basic Meta Tags */}
        <title>{fullTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywordsString} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={fullCanonicalUrl} />
        
        {/* Robots */}
        {noIndex ? (
          <meta name="robots" content="noindex, nofollow" />
        ) : (
          <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        )}

        {/* Open Graph */}
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content={ogType} />
        <meta property="og:url" content={fullCanonicalUrl} />
        <meta property="og:image" content={fullOgImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Nexural Trading" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card */}
        <meta name="twitter:card" content={twitterCard} />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={fullOgImage} />
        <meta name="twitter:creator" content="@nexuraltrading" />
        <meta name="twitter:site" content="@nexuraltrading" />

        {/* Additional Meta Tags */}
        {additionalMetaTags.map((tag, index) => (
          <meta
            key={index}
            {...(tag.name ? { name: tag.name } : {})}
            {...(tag.property ? { property: tag.property } : {})}
            content={tag.content}
          />
        ))}

        {/* Favicon and App Icons */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#000000" />
        <meta name="msapplication-TileColor" content="#000000" />
        
        {/* DNS Prefetch for Performance */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />

        {/* Preconnect for Critical Third Party Origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />

        {/* Analytics Scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {DEFAULT_ANALYTICS_CONFIG.googleAnalytics?.enabled && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${DEFAULT_ANALYTICS_CONFIG.googleAnalytics.measurementId}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${DEFAULT_ANALYTICS_CONFIG.googleAnalytics.measurementId}', {
                        anonymize_ip: ${DEFAULT_ANALYTICS_CONFIG.googleAnalytics.anonymizeIp},
                        cookie_consent: ${DEFAULT_ANALYTICS_CONFIG.googleAnalytics.cookieConsent}
                      });
                    `,
                  }}
                />
              </>
            )}

            {/* Google Tag Manager */}
            {DEFAULT_ANALYTICS_CONFIG.googleTagManager?.enabled && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                    })(window,document,'script','dataLayer','${DEFAULT_ANALYTICS_CONFIG.googleTagManager.containerId}');
                  `,
                }}
              />
            )}

            {/* Facebook Pixel */}
            {DEFAULT_ANALYTICS_CONFIG.facebookPixel?.enabled && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${DEFAULT_ANALYTICS_CONFIG.facebookPixel.pixelId}');
                    fbq('track', 'PageView');
                  `,
                }}
              />
            )}

            {/* Hotjar */}
            {DEFAULT_ANALYTICS_CONFIG.hotjar?.enabled && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(h,o,t,j,a,r){
                        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                        h._hjSettings={hjid:${DEFAULT_ANALYTICS_CONFIG.hotjar.siteId},hjsv:${DEFAULT_ANALYTICS_CONFIG.hotjar.version}};
                        a=o.getElementsByTagName('head')[0];
                        r=o.createElement('script');r.async=1;
                        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                        a.appendChild(r);
                    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
                  `,
                }}
              />
            )}
          </>
        )}
      </Head>

      {/* Structured Data / Schema Markup */}
      {allSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(allSchemas.length === 1 ? allSchemas[0] : allSchemas)
          }}
        />
      )}
    </>
  )
}

// Helper components for common page types
export const HomePageSEO = () => {
  const { generateHomepageSchema } = require('@/lib/seo/schema-markup')
  
  return (
    <SEOHead
      title="AI-Powered Trading Platform"
      description="Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis. Join thousands of successful traders maximizing profits with cutting-edge neural network technology."
      keywords={['AI trading', 'automated trading', 'trading bots', 'market analysis', 'trading signals', 'algorithmic trading', 'neural networks', 'cryptocurrency trading', 'forex trading', 'stock trading']}
      canonicalUrl="/"
      schemas={generateHomepageSchema()}
    />
  )
}

export const BlogSEO = ({ 
  title, 
  description, 
  publishedDate, 
  modifiedDate, 
  authorName, 
  tags = [] 
}: {
  title: string
  description: string
  publishedDate: string
  modifiedDate?: string
  authorName: string
  tags?: string[]
}) => {
  const { generateArticleSchema } = require('@/lib/seo/schema-markup')
  
  const schema = generateArticleSchema({
    headline: title,
    description,
    author: {
      name: authorName,
      type: 'Person'
    },
    publisher: {
      name: 'Nexural Trading',
      logo: 'https://nexuraltrading.com/logo.png'
    },
    datePublished: publishedDate,
    dateModified: modifiedDate || publishedDate,
    articleSection: 'Trading',
    tags
  })

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={tags}
      ogType="article"
      schemas={[schema]}
      additionalMetaTags={[
        { property: 'article:published_time', content: publishedDate },
        { property: 'article:modified_time', content: modifiedDate || publishedDate },
        { property: 'article:author', content: authorName },
        { property: 'article:section', content: 'Trading' },
        ...tags.map(tag => ({ property: 'article:tag', content: tag }))
      ]}
    />
  )
}

export const ProductSEO = ({ 
  name, 
  description, 
  price, 
  currency, 
  availability = 'InStock' 
}: {
  name: string
  description: string
  price: string
  currency: string
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
}) => {
  const { generateProductSchema } = require('@/lib/seo/schema-markup')
  
  const schema = generateProductSchema({
    name,
    description,
    brand: { name: 'Nexural Trading' },
    category: 'Trading Software',
    offers: {
      price,
      priceCurrency: currency,
      availability,
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://nexuraltrading.com'
    }
  })

  return (
    <SEOHead
      title={name}
      description={description}
      ogType="product"
      schemas={[schema]}
      additionalMetaTags={[
        { property: 'product:price:amount', content: price },
        { property: 'product:price:currency', content: currency },
        { property: 'product:availability', content: availability }
      ]}
    />
  )
}

export const FAQSEO = ({ questions }: { questions: Array<{ question: string, answer: string }> }) => {
  const { generateFAQSchema } = require('@/lib/seo/schema-markup')
  
  const schema = generateFAQSchema({ questions })

  return (
    <SEOHead
      title="Frequently Asked Questions"
      description="Find answers to common questions about Nexural Trading platform, features, pricing, and support."
      keywords={['FAQ', 'help', 'support', 'questions', 'answers', 'trading platform']}
      schemas={[schema]}
    />
  )
}


