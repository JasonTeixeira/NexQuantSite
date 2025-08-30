"use client"

import { useState } from "react"
import { Search, Filter, Zap } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import AdvancedSearch from "./advanced-search"

interface AdvancedSearchButtonProps {
  className?: string
  variant?: 'floating' | 'inline'
  initialQuery?: string
}

export default function AdvancedSearchButton({ 
  className = "", 
  variant = 'inline',
  initialQuery = ""
}: AdvancedSearchButtonProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  if (variant === 'floating') {
    return (
      <>
        {/* Floating Search Button */}
        <div className={`fixed top-6 right-6 z-40 ${className}`}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setIsSearchOpen(true)}
              className="w-12 h-12 rounded-full bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/30 p-0"
            >
              <Search className="w-6 h-6" />
            </Button>
          </motion.div>

          {/* Pulse animation */}
          <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20 pointer-events-none" />
        </div>

        <AdvancedSearch 
          isOpen={isSearchOpen} 
          onClose={() => setIsSearchOpen(false)}
          initialQuery={initialQuery}
        />
      </>
    )
  }

  // Inline variant
  return (
    <>
      <Button
        onClick={() => setIsSearchOpen(true)}
        className={`bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 ${className}`}
      >
        <Search className="w-4 h-4 mr-2" />
        Advanced Search
        <Filter className="w-4 h-4 ml-2" />
      </Button>

      <AdvancedSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)}
        initialQuery={initialQuery}
      />
    </>
  )
}
