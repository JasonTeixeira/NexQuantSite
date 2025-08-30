"use client"

import { useState, useEffect, useCallback } from "react"
import { apiClient, type ApiError } from "@/lib/api/client"

interface UseApiOptions<T> {
  initialData?: T
  enabled?: boolean
  refetchOnMount?: boolean
  refetchInterval?: number
  onSuccess?: (data: T) => void
  onError?: (error: ApiError) => void
}

interface UseApiResult<T> {
  data: T | null
  error: ApiError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  refetch: () => Promise<void>
  mutate: (newData: T) => void
}

export function useApi<T>(endpoint: string, options: UseApiOptions<T> = {}): UseApiResult<T> {
  const { initialData = null, enabled = true, refetchOnMount = true, refetchInterval, onSuccess, onError } = options

  const [data, setData] = useState<T | null>(initialData)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiClient.get<T>(endpoint)
      setData(response.data)
      onSuccess?.(response.data)
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError)
      onError?.(apiError)
    } finally {
      setIsLoading(false)
    }
  }, [endpoint, enabled, onSuccess, onError])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  useEffect(() => {
    if (refetchOnMount) {
      fetchData()
    }
  }, [fetchData, refetchOnMount])

  useEffect(() => {
    if (refetchInterval && enabled) {
      const interval = setInterval(fetchData, refetchInterval)
      return () => clearInterval(interval)
    }
  }, [fetchData, refetchInterval, enabled])

  return {
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    refetch: fetchData,
    mutate,
  }
}

// Specialized hooks for different data types
export function useUserData() {
  return useApi("/user/profile", {
    refetchOnMount: true,
  })
}

export function useTradingSignals() {
  return useApi("/trading/signals", {
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnMount: true,
  })
}

export function usePortfolio() {
  return useApi("/trading/portfolio", {
    refetchInterval: 60000, // Refetch every minute
    refetchOnMount: true,
  })
}

export function useLearningProgress() {
  return useApi("/learning/progress", {
    refetchOnMount: true,
  })
}
