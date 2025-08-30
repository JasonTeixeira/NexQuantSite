"use client"
import { cn } from "@/lib/utils"

interface SkipLink {
  href: string
  label: string
}

const defaultSkipLinks: SkipLink[] = [
  { href: "#main-content", label: "Skip to main content" },
  { href: "#navigation", label: "Skip to navigation" },
  { href: "#footer", label: "Skip to footer" },
]

interface SkipLinksProps {
  links?: SkipLink[]
  className?: string
}

export function SkipLinks({ links = defaultSkipLinks, className }: SkipLinksProps) {
  return (
    <div className={cn("skip-links", className)}>
      {links.map((link, index) => (
        <a
          key={index}
          href={link.href}
          className="absolute left-0 top-0 z-[9999] -translate-y-full transform bg-primary px-4 py-2 text-primary-foreground transition-transform focus:translate-y-0"
          onFocus={(e) => {
            e.currentTarget.scrollIntoView({ behavior: "smooth", block: "center" })
          }}
        >
          {link.label}
        </a>
      ))}
    </div>
  )
}
