"use client"

import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function ConditionalFooter() {
  const pathname = usePathname()
  
  // Don't show footer on testing-engine page
  if (pathname === '/testing-engine') {
    return null
  }
  
  return <Footer />
}
