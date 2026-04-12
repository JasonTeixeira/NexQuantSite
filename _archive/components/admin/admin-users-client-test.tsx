"use client"

import { useState } from "react"

export default function AdminUsersClientTest() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <h1>Test Component</h1>
    </div>
  )
}
