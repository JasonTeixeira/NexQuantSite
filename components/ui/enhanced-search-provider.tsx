"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"

interface SearchContext {
  searchHistory: string[]
  addToHistory: (query: string) => void
  clearHistory: () => void
  aiSuggestions: string[]
  getAISuggestions: (query: string) => Promise<void>
  semanticSearch: (query: string) => Promise<any[]>
  savedSearches: SavedSearch[]
  saveSearch: (query: string, filters: any) => void
  deleteSavedSearch: (id: string) => void
}

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: any
  createdAt: Date
}

const SearchContext = createContext<SearchContext | undefined>(undefined)

export function EnhancedSearchProvider({ children }: { children: React.ReactNode }) {
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [aiSuggestions, setAISuggestions] = useState<string[]>([])
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([])

  // Load from localStorage on mount
  useEffect(() => {
    const history = localStorage.getItem("search-history")
    const saved = localStorage.getItem("saved-searches")

    if (history) setSearchHistory(JSON.parse(history))
    if (saved) setSavedSearches(JSON.parse(saved))
  }, [])

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return

    setSearchHistory((prev) => {
      const updated = [query, ...prev.filter((q) => q !== query)].slice(0, 10)
      localStorage.setItem("search-history", JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    setSearchHistory([])
    localStorage.removeItem("search-history")
  }, [])

  const getAISuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setAISuggestions([])
      return
    }

    // Simulate AI-powered suggestions
    const suggestions = [
      `${query} strategy optimization`,
      `${query} risk management`,
      `${query} backtesting results`,
      `${query} market analysis`,
      `advanced ${query} techniques`,
    ]

    setAISuggestions(suggestions)
  }, [])

  const semanticSearch = useCallback(async (query: string) => {
    // Simulate semantic search with AI embeddings
    // In production, this would call your AI search API
    return []
  }, [])

  const saveSearch = useCallback((query: string, filters: any) => {
    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: query || "Untitled Search",
      query,
      filters,
      createdAt: new Date(),
    }

    setSavedSearches((prev) => {
      const updated = [newSearch, ...prev].slice(0, 20)
      localStorage.setItem("saved-searches", JSON.stringify(updated))
      return updated
    })
  }, [])

  const deleteSavedSearch = useCallback((id: string) => {
    setSavedSearches((prev) => {
      const updated = prev.filter((s) => s.id !== id)
      localStorage.setItem("saved-searches", JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <SearchContext.Provider
      value={{
        searchHistory,
        addToHistory,
        clearHistory,
        aiSuggestions,
        getAISuggestions,
        semanticSearch,
        savedSearches,
        saveSearch,
        deleteSavedSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  )
}

export function useEnhancedSearch() {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error("useEnhancedSearch must be used within EnhancedSearchProvider")
  }
  return context
}
