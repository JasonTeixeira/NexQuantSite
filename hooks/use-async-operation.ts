"use client"

import { useState, useCallback } from "react"

interface AsyncOperationState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

interface UseAsyncOperationReturn<T> extends AsyncOperationState<T> {
  execute: (operation: () => Promise<T>) => Promise<T>
  reset: () => void
}

export function useAsyncOperation<T = any>(): UseAsyncOperationReturn<T> {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T> => {
    setState((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const result = await operation()
      setState({ data: result, loading: false, error: null })
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error")
      setState((prev) => ({ ...prev, loading: false, error: err }))
      throw err
    }
  }, [])

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  return {
    ...state,
    execute,
    reset,
  }
}

export function useAsyncOperations() {
  const [operations, setOperations] = useState<Record<string, AsyncOperationState<any>>>({})

  const execute = useCallback(async (key: string, operation: () => Promise<any>): Promise<any> => {
    setOperations((prev) => ({
      ...prev,
      [key]: { data: null, loading: true, error: null },
    }))

    try {
      const result = await operation()
      setOperations((prev) => ({
        ...prev,
        [key]: { data: result, loading: false, error: null },
      }))
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error("Unknown error")
      setOperations((prev) => ({
        ...prev,
        [key]: { data: null, loading: false, error: err },
      }))
      throw err
    }
  }, [])

  const getOperation = useCallback(
    (key: string) => {
      return operations[key] || { data: null, loading: false, error: null }
    },
    [operations],
  )

  const reset = useCallback((key?: string) => {
    if (key) {
      setOperations((prev) => {
        const { [key]: _, ...rest } = prev
        return rest
      })
    } else {
      setOperations({})
    }
  }, [])

  return { execute, getOperation, reset, operations }
}
