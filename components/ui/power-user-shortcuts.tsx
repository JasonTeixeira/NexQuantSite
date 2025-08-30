"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAccessibility } from "./accessibility-provider"

interface PowerUserShortcut {
  key: string
  description: string
  action: () => void
  category: string
  global?: boolean
}

export function PowerUserShortcuts() {
  const router = useRouter()
  const { announceToScreenReader } = useAccessibility()
  const [commandPalette, setCommandPalette] = useState(false)
  const [searchMode, setSearchMode] = useState(false)

  const shortcuts: PowerUserShortcut[] = [
    // Navigation
    { key: "g h", description: "Go to Home", action: () => router.push("/"), category: "Navigation", global: true },
    {
      key: "g d",
      description: "Go to Dashboard",
      action: () => router.push("/dashboard"),
      category: "Navigation",
      global: true,
    },
    {
      key: "g s",
      description: "Go to Strategies",
      action: () => router.push("/strategy-lab"),
      category: "Navigation",
      global: true,
    },
    {
      key: "g l",
      description: "Go to Learning",
      action: () => router.push("/learning"),
      category: "Navigation",
      global: true,
    },

    // Search & Commands
    {
      key: "ctrl+k",
      description: "Open Command Palette",
      action: () => setCommandPalette(true),
      category: "Commands",
      global: true,
    },
    {
      key: "ctrl+/",
      description: "Focus Search",
      action: () => setSearchMode(true),
      category: "Commands",
      global: true,
    },
    { key: "ctrl+shift+p", description: "Open Advanced Search", action: () => {}, category: "Commands", global: true },

    // Quick Actions
    {
      key: "n",
      description: "New Strategy",
      action: () => router.push("/strategy-lab/new"),
      category: "Actions",
      global: true,
    },
    { key: "ctrl+n", description: "New Document", action: () => {}, category: "Actions", global: true },
    { key: "ctrl+s", description: "Save Current", action: () => toast.success("Saved!"), category: "Actions" },
    { key: "ctrl+z", description: "Undo", action: () => {}, category: "Actions" },
    { key: "ctrl+y", description: "Redo", action: () => {}, category: "Actions" },

    // View Controls
    {
      key: "f",
      description: "Toggle Fullscreen",
      action: () => {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          document.documentElement.requestFullscreen()
        }
      },
      category: "View",
      global: true,
    },
    { key: "ctrl+shift+d", description: "Toggle Dark Mode", action: () => {}, category: "View", global: true },
    { key: "ctrl+shift+f", description: "Toggle Focus Mode", action: () => {}, category: "View", global: true },

    // Data & Analytics
    {
      key: "r",
      description: "Refresh Data",
      action: () => {
        toast.success("Data refreshed!")
        window.location.reload()
      },
      category: "Data",
      global: true,
    },
    {
      key: "ctrl+shift+r",
      description: "Hard Refresh",
      action: () => window.location.reload(),
      category: "Data",
      global: true,
    },
    { key: "e", description: "Export Data", action: () => toast.info("Export started"), category: "Data" },

    // Help & Support
    { key: "?", description: "Show Keyboard Shortcuts", action: () => {}, category: "Help", global: true },
    {
      key: "ctrl+shift+h",
      description: "Open Help Center",
      action: () => router.push("/help"),
      category: "Help",
      global: true,
    },
    { key: "ctrl+shift+c", description: "Contact Support", action: () => {}, category: "Help", global: true },
  ]

  useEffect(() => {
    let keySequence = ""
    let sequenceTimer: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const key = e.key.toLowerCase()
      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey
      const alt = e.altKey

      // Build key combination string
      let combination = ""
      if (ctrl) combination += "ctrl+"
      if (shift) combination += "shift+"
      if (alt) combination += "alt+"
      combination += key

      // Handle single key sequences (like "g h")
      if (!ctrl && !shift && !alt && key.match(/[a-z]/)) {
        keySequence += key

        // Clear sequence after 1 second
        clearTimeout(sequenceTimer)
        sequenceTimer = setTimeout(() => {
          keySequence = ""
        }, 1000)

        // Check for sequence matches
        const sequenceShortcut = shortcuts.find((s) => s.key === keySequence)
        if (sequenceShortcut) {
          e.preventDefault()
          sequenceShortcut.action()
          announceToScreenReader(`Executed: ${sequenceShortcut.description}`)
          keySequence = ""
          return
        }
      } else {
        // Reset sequence for modifier combinations
        keySequence = ""
      }

      // Check for direct key combination matches
      const shortcut = shortcuts.find((s) => s.key === combination)
      if (shortcut) {
        e.preventDefault()
        shortcut.action()
        announceToScreenReader(`Executed: ${shortcut.description}`)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      clearTimeout(sequenceTimer)
    }
  }, [router, announceToScreenReader])

  return null // This component only handles keyboard events
}
