"use client"
import { useEffect, useState } from "react"
import { useAccessibility } from "./accessibility-provider"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog"
import { Button } from "./button"
import { Badge } from "./badge"

interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  category?: string
}

interface KeyboardShortcutsProps {
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcuts({ shortcuts }: KeyboardShortcutsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { announceToScreenReader } = useAccessibility()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts dialog with ?
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setIsOpen(true)
        announceToScreenReader("Keyboard shortcuts dialog opened")
        return
      }

      // Execute shortcuts
      shortcuts.forEach((shortcut) => {
        const keys = shortcut.key.toLowerCase().split("+")
        const isCtrlOrCmd = keys.includes("ctrl") || keys.includes("cmd")
        const isShift = keys.includes("shift")
        const isAlt = keys.includes("alt")
        const mainKey = keys[keys.length - 1]

        const ctrlPressed = e.ctrlKey || e.metaKey
        const shiftPressed = e.shiftKey
        const altPressed = e.altKey

        if (
          e.key.toLowerCase() === mainKey &&
          ctrlPressed === isCtrlOrCmd &&
          shiftPressed === isShift &&
          altPressed === isAlt
        ) {
          e.preventDefault()
          shortcut.action()
          announceToScreenReader(`Executed ${shortcut.description}`)
        }
      })
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts, announceToScreenReader])

  const groupedShortcuts = shortcuts.reduce(
    (acc, shortcut) => {
      const category = shortcut.category || "General"
      if (!acc[category]) acc[category] = []
      acc[category].push(shortcut)
      return acc
    },
    {} as Record<string, KeyboardShortcut[]>,
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="sr-only focus:not-sr-only">
          Keyboard Shortcuts (?)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold mb-3">{category}</h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Press{" "}
              <Badge variant="outline" className="font-mono">
                ?
              </Badge>{" "}
              to open this dialog
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
