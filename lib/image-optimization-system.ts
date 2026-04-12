"use client"

import { useEffect, useState, useCallback } from "react"

interface ImageOptimizationOptions {
  width?: number
  height?: number
  quality?: number
  format?: "webp" | "avif" | "jpeg" | "png" | "auto"
  fit?: "cover" | "contain" | "fill" | "inside" | "outside"
  position?: "center" | "top" | "bottom" | "left" | "right"
  blur?: number
  sharpen?: boolean
  grayscale?: boolean
  progressive?: boolean
}

interface ResponsiveImageConfig {
  breakpoints: number[]
  sizes: string
  formats: string[]
  quality: number
}

export class ImageOptimizationSystem {
  private readonly defaultQuality = 80
  private readonly supportedFormats = ["webp", "avif", "jpeg", "png"]
  private readonly maxWidth = 3840
  private readonly maxHeight = 2160

  // Generate optimized image URL
  generateOptimizedUrl(src: string, options: ImageOptimizationOptions = {}): string {
    const {
      width,
      height,
      quality = this.defaultQuality,
      format = "auto",
      fit = "cover",
      position = "center",
      blur,
      sharpen = false,
      grayscale = false,
      progressive = true,
    } = options

    // Validate dimensions
    const validWidth = width ? Math.min(width, this.maxWidth) : undefined
    const validHeight = height ? Math.min(height, this.maxHeight) : undefined

    const params = new URLSearchParams()

    if (validWidth) params.set("w", validWidth.toString())
    if (validHeight) params.set("h", validHeight.toString())
    params.set("q", quality.toString())

    if (format !== "auto") params.set("f", format)
    if (fit !== "cover") params.set("fit", fit)
    if (position !== "center") params.set("pos", position)
    if (blur) params.set("blur", blur.toString())
    if (sharpen) params.set("sharpen", "1")
    if (grayscale) params.set("grayscale", "1")
    if (progressive) params.set("progressive", "1")

    // In production, this would integrate with a service like Cloudinary or custom image service
    return `${src}?${params.toString()}`
  }

  // Generate responsive image srcSet
  generateResponsiveSrcSet(
    src: string,
    config: ResponsiveImageConfig,
  ): {
    srcSet: string
    sizes: string
    sources: Array<{ srcSet: string; type: string; sizes: string }>
  } {
    const { breakpoints, sizes, formats, quality } = config

    // Generate srcSet for each format
    const sources = formats.map((format) => {
      const srcSet = breakpoints
        .map((width) => {
          const url = this.generateOptimizedUrl(src, { width, quality, format: format as any })
          return `${url} ${width}w`
        })
        .join(", ")

      return {
        srcSet,
        type: `image/${format}`,
        sizes,
      }
    })

    // Default srcSet (usually JPEG)
    const defaultSrcSet = breakpoints
      .map((width) => {
        const url = this.generateOptimizedUrl(src, { width, quality, format: "jpeg" })
        return `${url} ${width}w`
      })
      .join(", ")

    return {
      srcSet: defaultSrcSet,
      sizes,
      sources,
    }
  }

  // Generate picture element HTML
  generatePictureElement(src: string, alt: string, config: ResponsiveImageConfig): string {
    const { srcSet, sizes, sources } = this.generateResponsiveSrcSet(src, config)

    const sourceElements = sources
      .map((source) => `<source srcset="${source.srcSet}" type="${source.type}" sizes="${source.sizes}">`)
      .join("\n    ")

    return `<picture>
    ${sourceElements}
    <img src="${this.generateOptimizedUrl(src, { width: 800, quality: config.quality })}" 
         srcset="${srcSet}" 
         sizes="${sizes}" 
         alt="${alt}"
         loading="lazy"
         decoding="async">
</picture>`
  }

  // Lazy loading implementation
  generateLazyLoadingAttributes(
    src: string,
    options: ImageOptimizationOptions = {},
  ): {
    src: string
    dataSrc: string
    srcSet?: string
    dataSrcSet?: string
    loading: string
    decoding: string
  } {
    const optimizedSrc = this.generateOptimizedUrl(src, options)
    const placeholderSrc = this.generateOptimizedUrl(src, {
      ...options,
      width: 20,
      quality: 20,
      blur: 10,
    })

    return {
      src: placeholderSrc,
      dataSrc: optimizedSrc,
      loading: "lazy",
      decoding: "async",
    }
  }

  // Generate blur placeholder (LQIP - Low Quality Image Placeholder)
  generateBlurPlaceholder(src: string): string {
    return this.generateOptimizedUrl(src, {
      width: 20,
      height: 20,
      quality: 20,
      blur: 10,
    })
  }

  // Calculate optimal image dimensions based on container
  calculateOptimalDimensions(
    containerWidth: number,
    containerHeight: number,
    imageAspectRatio: number,
    devicePixelRatio = 1,
  ): { width: number; height: number } {
    const scaledWidth = containerWidth * devicePixelRatio
    const scaledHeight = containerHeight * devicePixelRatio

    // Calculate dimensions maintaining aspect ratio
    let width = scaledWidth
    let height = scaledWidth / imageAspectRatio

    if (height > scaledHeight) {
      height = scaledHeight
      width = scaledHeight * imageAspectRatio
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    }
  }

  // Preload critical images
  preloadCriticalImages(images: Array<{ src: string; options?: ImageOptimizationOptions }>): void {
    if (typeof document === "undefined") return

    images.forEach(({ src, options = {} }) => {
      const link = document.createElement("link")
      link.rel = "preload"
      link.as = "image"
      link.href = this.generateOptimizedUrl(src, options)

      // Add responsive preload if width is specified
      if (options.width) {
        const srcSet = [480, 768, 1024, 1200]
          .filter((w) => w <= (options.width || Number.POSITIVE_INFINITY))
          .map((w) => `${this.generateOptimizedUrl(src, { ...options, width: w })} ${w}w`)
          .join(", ")

        if (srcSet) {
          link.setAttribute("imagesrcset", srcSet)
          link.setAttribute("imagesizes", "(max-width: 768px) 100vw, 50vw")
        }
      }

      document.head.appendChild(link)
    })
  }

  // Image format detection and fallback
  detectOptimalFormat(): string {
    if (typeof window === "undefined") return "jpeg"

    // Check for AVIF support
    const avifSupport = document.createElement("canvas").toDataURL("image/avif").indexOf("data:image/avif") === 0
    if (avifSupport) return "avif"

    // Check for WebP support
    const webpSupport = document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0
    if (webpSupport) return "webp"

    return "jpeg"
  }

  // Generate image optimization report
  generateOptimizationReport(images: Array<{ src: string; currentSize: number; options?: ImageOptimizationOptions }>): {
    totalSavings: number
    optimizedImages: Array<{
      src: string
      originalSize: number
      optimizedSize: number
      savings: number
      savingsPercent: number
    }>
    recommendations: string[]
  } {
    let totalOriginalSize = 0
    let totalOptimizedSize = 0
    const recommendations: string[] = []

    const optimizedImages = images.map(({ src, currentSize, options = {} }) => {
      totalOriginalSize += currentSize

      // Estimate optimized size (simplified calculation)
      const qualityReduction = (100 - (options.quality || this.defaultQuality)) / 100
      const formatReduction = options.format === "webp" ? 0.25 : options.format === "avif" ? 0.35 : 0
      const dimensionReduction = options.width ? Math.min(options.width / 1920, 1) : 1

      const optimizedSize = Math.round(
        currentSize * (1 - qualityReduction) * (1 - formatReduction) * dimensionReduction,
      )

      totalOptimizedSize += optimizedSize

      const savings = currentSize - optimizedSize
      const savingsPercent = (savings / currentSize) * 100

      return {
        src,
        originalSize: currentSize,
        optimizedSize,
        savings,
        savingsPercent,
      }
    })

    const totalSavings = totalOriginalSize - totalOptimizedSize

    // Generate recommendations
    if (totalSavings > totalOriginalSize * 0.3) {
      recommendations.push("Significant optimization potential detected. Implement image optimization.")
    }

    const largeImages = optimizedImages.filter((img) => img.originalSize > 500000) // 500KB
    if (largeImages.length > 0) {
      recommendations.push(`${largeImages.length} images are larger than 500KB. Consider resizing or compressing.`)
    }

    const unoptimizedFormats = optimizedImages.filter(
      (img) => img.src.match(/\.(png|jpg|jpeg)$/i) && !img.src.includes("optimized"),
    )
    if (unoptimizedFormats.length > 0) {
      recommendations.push("Consider using modern formats like WebP or AVIF for better compression.")
    }

    return {
      totalSavings,
      optimizedImages,
      recommendations,
    }
  }
}

export const imageOptimizer = new ImageOptimizationSystem()

// Common responsive image configurations
export const responsiveConfigs = {
  hero: {
    breakpoints: [480, 768, 1024, 1200, 1920],
    sizes: "100vw",
    formats: ["avif", "webp", "jpeg"],
    quality: 85,
  },

  card: {
    breakpoints: [300, 400, 500, 600],
    sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
    formats: ["avif", "webp", "jpeg"],
    quality: 80,
  },

  thumbnail: {
    breakpoints: [150, 200, 300],
    sizes: "150px",
    formats: ["avif", "webp", "jpeg"],
    quality: 75,
  },

  avatar: {
    breakpoints: [50, 100, 150, 200],
    sizes: "(max-width: 768px) 50px, 100px",
    formats: ["avif", "webp", "jpeg"],
    quality: 85,
  },
}

// React hook for image optimization
export function useImageOptimization() {
  const [isSupported, setIsSupported] = useState(false)
  const [optimalFormat, setOptimalFormat] = useState<string>("jpeg")

  useEffect(() => {
    setOptimalFormat(imageOptimizer.detectOptimalFormat())
    setIsSupported(typeof window !== "undefined" && "IntersectionObserver" in window)
  }, [])

  const getOptimizedProps = useCallback(
    (
      src: string,
      alt: string,
      type: keyof typeof responsiveConfigs = "card",
      options: ImageOptimizationOptions = {},
    ) => {
      const config = responsiveConfigs[type]
      const { srcSet, sizes, sources } = imageOptimizer.generateResponsiveSrcSet(src, {
        ...config,
        formats: [optimalFormat, "jpeg"],
      })

      return {
        src: imageOptimizer.generateOptimizedUrl(src, { ...options, format: optimalFormat as any }),
        srcSet,
        sizes,
        alt,
        loading: options.width && options.width > 800 ? ("eager" as const) : ("lazy" as const),
        decoding: "async" as const,
        placeholder: "blur" as const,
        blurDataURL: imageOptimizer.generateBlurPlaceholder(src),
      }
    },
    [optimalFormat],
  )

  const preloadImage = useCallback((src: string, options?: ImageOptimizationOptions) => {
    imageOptimizer.preloadCriticalImages([{ src, options }])
  }, [])

  return {
    getOptimizedProps,
    preloadImage,
    isSupported,
    optimalFormat,
  }
}

// Intersection observer for lazy loading
export class LazyImageLoader {
  private observer: IntersectionObserver | null = null
  private images: Set<HTMLImageElement> = new Set()

  constructor() {
    if (typeof window !== "undefined" && "IntersectionObserver" in window) {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement
              this.loadImage(img)
              this.observer?.unobserve(img)
              this.images.delete(img)
            }
          })
        },
        {
          rootMargin: "50px 0px",
          threshold: 0.01,
        },
      )
    }
  }

  observe(img: HTMLImageElement): void {
    if (this.observer && img.dataset.src) {
      this.images.add(img)
      this.observer.observe(img)
    }
  }

  private loadImage(img: HTMLImageElement): void {
    if (img.dataset.src) {
      img.src = img.dataset.src
      img.removeAttribute("data-src")
    }
    if (img.dataset.srcset) {
      img.srcset = img.dataset.srcset
      img.removeAttribute("data-srcset")
    }
    img.classList.add("loaded")
  }

  disconnect(): void {
    this.observer?.disconnect()
    this.images.clear()
  }
}

export const lazyImageLoader = new LazyImageLoader()
