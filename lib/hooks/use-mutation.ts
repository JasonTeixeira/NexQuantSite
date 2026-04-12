"use client"

import { useState, useCallback } from "react"
import { apiClient, type ApiError, type ApiResponse } from "@/lib/api/client"

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: ApiError, variables: TVariables) => void
  onSettled?: (data: TData | null, error: ApiError | null, variables: TVariables) => void
}

interface UseMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>
  mutateAsync: (variables: TVariables) => Promise<TData>
  data: TData | null
  error: ApiError | null
  isLoading: boolean
  isError: boolean
  isSuccess: boolean
  reset: () => void
}

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>,
  options: UseMutationOptions<TData, TVariables> = {},
): UseMutationResult<TData, TVariables> {
  const [data, setData] = useState<TData | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { onSuccess, onError, onSettled } = options

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setIsLoading(false)
  }, [])

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await mutationFn(variables)
        const responseData = response.data

        setData(responseData)
        onSuccess?.(responseData, variables)
        onSettled?.(responseData, null, variables)

        return responseData
      } catch (err) {
        const apiError = err as ApiError
        setError(apiError)
        onError?.(apiError, variables)
        onSettled?.(null, apiError, variables)
        throw apiError
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, onSuccess, onError, onSettled],
  )

  return {
    mutate,
    mutateAsync: mutate,
    data,
    error,
    isLoading,
    isError: !!error,
    isSuccess: !!data && !error,
    reset,
  }
}

// Specialized mutation hooks for common operations
export function useCreateMutation<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, TVariables>((variables) => apiClient.post<TData>(endpoint, variables), options)
}

export function useUpdateMutation<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, TVariables>((variables) => apiClient.put<TData>(endpoint, variables), options)
}

export function useDeleteMutation<TData = any, TVariables = any>(
  endpoint: string,
  options?: UseMutationOptions<TData, TVariables>,
) {
  return useMutation<TData, TVariables>((variables) => apiClient.delete<TData>(endpoint), options)
}
