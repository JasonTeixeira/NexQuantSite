/**
 * 🔍 SEO Schema Markup
 * Generates structured data for search engines
 */

/**
 * Generate schema markup for the homepage
 * Following Google's structured data guidelines
 */
export function generateHomepageSchema() {
  const schemas = [
    // Organization schema
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Nexural Trading",
      "url": "https://nexuraltrading.com",
      "logo": "https://nexuraltrading.com/logo.png",
      "sameAs": [
        "https://twitter.com/nexuraltrading",
        "https://linkedin.com/company/nexuraltrading",
        "https://facebook.com/nexuraltrading"
      ],
      "description": "Advanced AI trading platform with automated bots, real-time signals, and comprehensive market analysis powered by neural networks.",
      "foundingDate": "2023",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Francisco",
        "addressRegion": "CA",
        "addressCountry": "US"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer support",
        "email": "support@nexuraltrading.com"
      }
    },
    
    // WebSite schema
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "url": "https://nexuraltrading.com",
      "name": "Nexural Trading Platform",
      "description": "AI-powered trading platform for cryptocurrency, forex, and stock markets",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://nexuraltrading.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    
    // SoftwareApplication schema
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Nexural Trading Platform",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web, Windows, macOS, iOS, Android",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
        "description": "Free trial with premium subscription options"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "1250"
      }
    },
    
    // BreadcrumbList schema
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://nexuraltrading.com"
        }
      ]
    }
  ];
  
  return schemas;
}

/**
 * Generate schema markup for a trading strategy page
 */
export function generateStrategySchema(strategy: {
  id: string;
  name: string;
  description: string;
  performance: {
    winRate: number;
    profitFactor: number;
    averageReturn: number;
    reviewCount: number;
    ratingValue: number;
  };
  creator: {
    name: string;
    url: string;
  };
  dateCreated: string;
  dateModified: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": strategy.name,
    "description": strategy.description,
    "url": `https://nexuraltrading.com/strategies/${strategy.id}`,
    "brand": {
      "@type": "Brand",
      "name": "Nexural Trading"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": strategy.performance.ratingValue.toString(),
      "reviewCount": strategy.performance.reviewCount.toString(),
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Person",
      "name": strategy.creator.name,
      "url": strategy.creator.url
    },
    "dateCreated": strategy.dateCreated,
    "dateModified": strategy.dateModified
  };
}

/**
 * Generate schema markup for a blog post
 */
export function generateBlogPostSchema(post: {
  title: string;
  description: string;
  slug: string;
  author: {
    name: string;
    url: string;
  };
  datePublished: string;
  dateModified: string;
  image: string;
  tags: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://nexuraltrading.com/blog/${post.slug}`
    },
    "headline": post.title,
    "description": post.description,
    "image": post.image,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "url": post.author.url
    },
    "publisher": {
      "@type": "Organization",
      "name": "Nexural Trading",
      "logo": {
        "@type": "ImageObject",
        "url": "https://nexuraltrading.com/logo.png"
      }
    },
    "datePublished": post.datePublished,
    "dateModified": post.dateModified,
    "keywords": post.tags.join(", ")
  };
}
