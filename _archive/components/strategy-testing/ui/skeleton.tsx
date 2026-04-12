"use client"

import React from 'react'

export function AppSkeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#1a1a25] ${className}`} />
}

export function AppSkeletonCard() {
  return (
    <div className="p-3 rounded border border-[#2a2a3e] bg-[#15151f]">
      <AppSkeleton className="h-4 w-1/3 mb-2" />
      <div className="grid grid-cols-3 gap-2">
        <AppSkeleton className="h-4 w-full" />
        <AppSkeleton className="h-4 w-full" />
        <AppSkeleton className="h-4 w-full" />
      </div>
      <AppSkeleton className="h-7 w-20 mt-3" />
    </div>
  )
}

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
