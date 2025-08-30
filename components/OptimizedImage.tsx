"use client"

import Image from "next/image"
import { useState } from "react"
import { useImageOptimization } from "@/lib/image-optimization-system"
import { Skeleton } from "@/components/ui/skeleton"

interface OptimizedImageProps {
  src: string
  alt: string
  type?: "hero" | "card" | "thumbnail" | "avatar"
  priority?: boolean
  className?: string
  width?: number
  height?: number
  quality?: number
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  type = "card",
  priority = false,
  className = "",
  width,
  height,
  quality = 80,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const { getOptimizedProps } = useImageOptimization()

  const optimizedProps = getOptimizedProps(src, alt, type, {
    quality,
  })

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }

  if (hasError) {
    return (
      <div className={`bg-gray-200 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">Failed to load image</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && <Skeleton className="absolute inset-0 z-10" />}
      <Image
        {...optimizedProps}
        priority={priority}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"}`}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  )
}
