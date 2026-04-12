/**
 * SEO Schema Markup Generator - Professional Grade
 * Generates structured data for rich snippets and search engine understanding
 */

export interface Organization {
  name: string
  url: string
  logo: string
  description: string
  contactPoint: {
    telephone: string
    email: string
    contactType: string
    availableLanguage: string[]
  }
  sameAs: string[]
  address?: {
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    addressCountry: string
  }
}

export interface WebSite {
  name: string
  url: string
  description: string
  potentialAction?: {
    target: string
    query: string
  }
}

export interface Article {
  headline: string
  description: string
  author: {
    name: string
    type: 'Person' | 'Organization'
    url?: string
  }
  publisher: {
    name: string
    logo: string
  }
  datePublished: string
  dateModified?: string
  image?: string[]
  articleSection: string
  wordCount?: number
  readingTime?: string
}

export interface Product {
  name: string
  description: string
  brand: {
    name: string
  }
  category: string
  offers: {
    price: string
    priceCurrency: string
    availability: 'InStock' | 'OutOfStock' | 'PreOrder'
    url: string
    priceValidUntil?: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
    bestRating?: number
    worstRating?: number
  }
  image?: string[]
}

export interface Service {
  name: string
  description: string
  provider: {
    name: string
    url: string
  }
  serviceType: string
  areaServed: string | string[]
  offers?: {
    price: string
    priceCurrency: string
    url: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}

export interface FAQPage {
  questions: {
    question: string
    answer: string
  }[]
}

export interface Course {
  name: string
  description: string
  provider: {
    name: string
    url: string
  }
  courseCode?: string
  educationalLevel: string
  teaches: string[]
  timeRequired: string
  totalTime: string
  coursePrerequisites?: string[]
  offers?: {
    price: string
    priceCurrency: string
    category: 'Free' | 'Paid'
  }
}

export interface JobPosting {
  title: string
  description: string
  hiringOrganization: {
    name: string
    url: string
    logo?: string
  }
  jobLocation: {
    addressLocality: string
    addressRegion: string
    addressCountry: string
  }
  datePosted: string
  validThrough: string
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACTOR' | 'TEMPORARY' | 'INTERN'
  baseSalary?: {
    currency: string
    value: {
      minValue: number
      maxValue: number
      unitText: 'YEAR' | 'MONTH' | 'HOUR'
    }
  }
  qualifications?: string[]
  responsibilities?: string[]
  benefits?: string[]
}

// Nexural Trading specific schemas
export const NEXURAL_ORGANIZATION: Organization = {
  name: 'Nexural Trading',
  url: 'https://nexuraltrading.com',
  logo: 'https://nexuraltrading.com/logo.png',
  description: 'Advanced AI-powered trading platform democratizing institutional-grade trading strategies for retail traders worldwide.',
  contactPoint: {
    telephone: '+1-555-123-4567',
    email: 'support@nexuraltrading.com',
    contactType: 'Customer Service',
    availableLanguage: ['English']
  },
  sameAs: [
    'https://twitter.com/nexuraltrading',
    'https://linkedin.com/company/nexural-trading',
    'https://facebook.com/nexuraltrading',
    'https://youtube.com/nexuraltrading'
  ]
}

export const NEXURAL_WEBSITE: WebSite = {
  name: 'Nexural Trading Platform',
  url: 'https://nexuraltrading.com',
  description: 'AI-powered trading platform with automated bots, real-time signals, and comprehensive market analysis.',
  potentialAction: {
    target: 'https://nexuraltrading.com/search?q={search_term_string}',
    query: 'required name=search_term_string'
  }
}

// Schema generators
export const generateOrganizationSchema = (org: Organization) => ({
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: org.name,
  url: org.url,
  logo: org.logo,
  description: org.description,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: org.contactPoint.telephone,
    email: org.contactPoint.email,
    contactType: org.contactPoint.contactType,
    availableLanguage: org.contactPoint.availableLanguage
  },
  sameAs: org.sameAs,
  ...(org.address && {
    address: {
      '@type': 'PostalAddress',
      streetAddress: org.address.streetAddress,
      addressLocality: org.address.addressLocality,
      addressRegion: org.address.addressRegion,
      postalCode: org.address.postalCode,
      addressCountry: org.address.addressCountry
    }
  })
})

export const generateWebSiteSchema = (website: WebSite) => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: website.name,
  url: website.url,
  description: website.description,
  ...(website.potentialAction && {
    potentialAction: {
      '@type': 'SearchAction',
      target: website.potentialAction.target,
      'query-input': website.potentialAction.query
    }
  })
})

export const generateArticleSchema = (article: Article) => ({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: article.headline,
  description: article.description,
  author: {
    '@type': article.author.type,
    name: article.author.name,
    ...(article.author.url && { url: article.author.url })
  },
  publisher: {
    '@type': 'Organization',
    name: article.publisher.name,
    logo: {
      '@type': 'ImageObject',
      url: article.publisher.logo
    }
  },
  datePublished: article.datePublished,
  dateModified: article.dateModified || article.datePublished,
  ...(article.image && { image: article.image }),
  articleSection: article.articleSection,
  ...(article.wordCount && { wordCount: article.wordCount }),
  ...(article.readingTime && { timeRequired: article.readingTime })
})

export const generateProductSchema = (product: Product) => ({
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: product.name,
  description: product.description,
  brand: {
    '@type': 'Brand',
    name: product.brand.name
  },
  category: product.category,
  offers: {
    '@type': 'Offer',
    price: product.offers.price,
    priceCurrency: product.offers.priceCurrency,
    availability: `https://schema.org/${product.offers.availability}`,
    url: product.offers.url,
    ...(product.offers.priceValidUntil && { priceValidUntil: product.offers.priceValidUntil })
  },
  ...(product.aggregateRating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
      bestRating: product.aggregateRating.bestRating || 5,
      worstRating: product.aggregateRating.worstRating || 1
    }
  }),
  ...(product.image && { image: product.image })
})

export const generateServiceSchema = (service: Service) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  provider: {
    '@type': 'Organization',
    name: service.provider.name,
    url: service.provider.url
  },
  serviceType: service.serviceType,
  areaServed: service.areaServed,
  ...(service.offers && {
    offers: {
      '@type': 'Offer',
      price: service.offers.price,
      priceCurrency: service.offers.priceCurrency,
      url: service.offers.url
    }
  }),
  ...(service.aggregateRating && {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: service.aggregateRating.ratingValue,
      reviewCount: service.aggregateRating.reviewCount
    }
  })
})

export const generateFAQSchema = (faqPage: FAQPage) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqPage.questions.map(qa => ({
    '@type': 'Question',
    name: qa.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: qa.answer
    }
  }))
})

export const generateCourseSchema = (course: Course) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: course.name,
  description: course.description,
  provider: {
    '@type': 'Organization',
    name: course.provider.name,
    url: course.provider.url
  },
  ...(course.courseCode && { courseCode: course.courseCode }),
  educationalLevel: course.educationalLevel,
  teaches: course.teaches,
  timeRequired: course.timeRequired,
  totalTime: course.totalTime,
  ...(course.coursePrerequisites && { coursePrerequisites: course.coursePrerequisites }),
  ...(course.offers && {
    offers: {
      '@type': 'Offer',
      price: course.offers.price,
      priceCurrency: course.offers.priceCurrency,
      category: course.offers.category
    }
  })
})

export const generateJobPostingSchema = (job: JobPosting) => ({
  '@context': 'https://schema.org',
  '@type': 'JobPosting',
  title: job.title,
  description: job.description,
  hiringOrganization: {
    '@type': 'Organization',
    name: job.hiringOrganization.name,
    url: job.hiringOrganization.url,
    ...(job.hiringOrganization.logo && { logo: job.hiringOrganization.logo })
  },
  jobLocation: {
    '@type': 'Place',
    address: {
      '@type': 'PostalAddress',
      addressLocality: job.jobLocation.addressLocality,
      addressRegion: job.jobLocation.addressRegion,
      addressCountry: job.jobLocation.addressCountry
    }
  },
  datePosted: job.datePosted,
  validThrough: job.validThrough,
  employmentType: job.employmentType,
  ...(job.baseSalary && {
    baseSalary: {
      '@type': 'MonetaryAmount',
      currency: job.baseSalary.currency,
      value: {
        '@type': 'QuantitativeValue',
        minValue: job.baseSalary.value.minValue,
        maxValue: job.baseSalary.value.maxValue,
        unitText: job.baseSalary.value.unitText
      }
    }
  }),
  ...(job.qualifications && { qualifications: job.qualifications }),
  ...(job.responsibilities && { responsibilities: job.responsibilities }),
  ...(job.benefits && { benefits: job.benefits })
})

// Page-specific schema generators
export const generateHomepageSchema = () => {
  return [
    generateOrganizationSchema(NEXURAL_ORGANIZATION),
    generateWebSiteSchema(NEXURAL_WEBSITE),
    generateServiceSchema({
      name: 'AI Trading Platform',
      description: 'Automated trading platform powered by artificial intelligence',
      provider: {
        name: 'Nexural Trading',
        url: 'https://nexuraltrading.com'
      },
      serviceType: 'Financial Technology Service',
      areaServed: 'Worldwide',
      offers: {
        price: '0',
        priceCurrency: 'USD',
        url: 'https://nexuraltrading.com/pricing'
      },
      aggregateRating: {
        ratingValue: 4.8,
        reviewCount: 2547
      }
    })
  ]
}

export const generateBlogSchema = (articles: Article[]) => {
  return articles.map(article => generateArticleSchema(article))
}

export const generateHelpCenterSchema = (questions: { question: string, answer: string }[]) => {
  return [generateFAQSchema({ questions })]
}

export const generatePricingSchema = () => {
  const plans = [
    {
      name: 'Free Plan',
      description: 'Get started with basic trading tools and features',
      brand: { name: 'Nexural Trading' },
      category: 'Trading Software',
      offers: {
        price: '0',
        priceCurrency: 'USD',
        availability: 'InStock' as const,
        url: 'https://nexuraltrading.com/register'
      }
    },
    {
      name: 'Premium Plan',
      description: 'Advanced trading tools with real-time data and automation',
      brand: { name: 'Nexural Trading' },
      category: 'Trading Software',
      offers: {
        price: '49.99',
        priceCurrency: 'USD',
        availability: 'InStock' as const,
        url: 'https://nexuraltrading.com/pricing'
      },
      aggregateRating: {
        ratingValue: 4.9,
        reviewCount: 1247
      }
    },
    {
      name: 'Professional Plan',
      description: 'Complete trading suite for professional traders',
      brand: { name: 'Nexural Trading' },
      category: 'Trading Software',
      offers: {
        price: '199.99',
        priceCurrency: 'USD',
        availability: 'InStock' as const,
        url: 'https://nexuraltrading.com/pricing'
      },
      aggregateRating: {
        ratingValue: 4.95,
        reviewCount: 892
      }
    }
  ]

  return plans.map(plan => generateProductSchema(plan))
}

// Utility functions
export const injectSchemaMarkup = (schemas: any[]): string => {
  return schemas.map(schema => 
    `<script type="application/ld+json">${JSON.stringify(schema, null, 2)}</script>`
  ).join('\n')
}

export const validateSchema = (schema: any): { valid: boolean, errors: string[] } => {
  const errors: string[] = []

  if (!schema['@context']) {
    errors.push('Missing @context')
  }

  if (!schema['@type']) {
    errors.push('Missing @type')
  }

  // Basic validation for common required fields
  if (schema['@type'] === 'Organization' && !schema.name) {
    errors.push('Organization schema missing name')
  }

  if (schema['@type'] === 'Article' && (!schema.headline || !schema.author)) {
    errors.push('Article schema missing required fields (headline, author)')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Export pre-configured schemas for easy use
export const COMMON_SCHEMAS = {
  organization: generateOrganizationSchema(NEXURAL_ORGANIZATION),
  website: generateWebSiteSchema(NEXURAL_WEBSITE),
  homepage: generateHomepageSchema(),
  pricing: generatePricingSchema()
}

// Export for testing
export const __testing__ = {
  validateSchema,
  injectSchemaMarkup
}


