/**
 * 🌐 Global Providers Component
 * Wraps the application with all necessary context providers
 */

"use client"

import React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AccessibilityProvider } from "@/components/ui/accessibility-provider"
import { AuthProvider } from "@/lib/auth/auth-context"
import { ToastProvider } from "@/hooks/use-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <ToastProvider>
        <AccessibilityProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </AccessibilityProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
