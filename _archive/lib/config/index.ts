interface Config {
  api: {
    baseUrl: string
    timeout: number
    retries: number
  }
  auth: {
    sessionTimeout: number
    refreshThreshold: number
  }
  features: {
    liveTrading: boolean
    realTimeData: boolean
    notifications: boolean
    analytics: boolean
    darkMode: boolean
  }
  websocket: {
    url: string
    reconnectInterval: number
    maxReconnectAttempts: number
  }
  analytics: {
    id: string
    enabled: boolean
  }
  sentry: {
    dsn: string
    enabled: boolean
  }
  app: {
    version: string
    environment: string
  }
}

const getEnvVar = (key: string, defaultValue = ""): string => {
  if (typeof window !== "undefined") {
    return (window as any).__ENV__?.[key] || process.env[key] || defaultValue
  }
  return process.env[key] || defaultValue
}

const getBooleanEnv = (key: string, defaultValue = false): boolean => {
  const value = getEnvVar(key, defaultValue.toString())
  return value.toLowerCase() === "true"
}

const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = getEnvVar(key, defaultValue.toString())
  return Number.parseInt(value, 10) || defaultValue
}

export const config: Config = {
  api: {
    baseUrl: getEnvVar("NEXT_PUBLIC_API_URL", "http://localhost:3001/api"),
    timeout: getNumberEnv("NEXT_PUBLIC_API_TIMEOUT", 30000),
    retries: getNumberEnv("NEXT_PUBLIC_API_RETRIES", 3),
  },
  auth: {
    sessionTimeout: getNumberEnv("NEXT_PUBLIC_SESSION_TIMEOUT", 3600000), // 1 hour
    refreshThreshold: getNumberEnv("NEXT_PUBLIC_REFRESH_THRESHOLD", 300000), // 5 minutes
  },
  features: {
    liveTrading: getBooleanEnv("NEXT_PUBLIC_FEATURE_LIVE_TRADING", false),
    realTimeData: getBooleanEnv("NEXT_PUBLIC_FEATURE_REAL_TIME_DATA", true),
    notifications: getBooleanEnv("NEXT_PUBLIC_FEATURE_NOTIFICATIONS", true),
    analytics: getBooleanEnv("NEXT_PUBLIC_FEATURE_ANALYTICS", true),
    darkMode: getBooleanEnv("NEXT_PUBLIC_FEATURE_DARK_MODE", true),
  },
  websocket: {
    url: getEnvVar("NEXT_PUBLIC_WEBSOCKET_URL", "ws://localhost:3001/ws"),
    reconnectInterval: getNumberEnv("NEXT_PUBLIC_WS_RECONNECT_INTERVAL", 5000),
    maxReconnectAttempts: getNumberEnv("NEXT_PUBLIC_WS_MAX_RECONNECT", 10),
  },
  analytics: {
    id: getEnvVar("NEXT_PUBLIC_ANALYTICS_ID", ""),
    enabled: getBooleanEnv("NEXT_PUBLIC_ANALYTICS_ENABLED", false),
  },
  sentry: {
    dsn: getEnvVar("NEXT_PUBLIC_SENTRY_DSN", ""),
    enabled: getBooleanEnv("NEXT_PUBLIC_SENTRY_ENABLED", false),
  },
  app: {
    version: getEnvVar("NEXT_PUBLIC_APP_VERSION", "1.0.0"),
    environment: getEnvVar("NODE_ENV", "development"),
  },
}

// Feature flag helpers
export const isFeatureEnabled = (feature: keyof Config["features"]): boolean => {
  return config.features[feature]
}

export const isDevelopment = (): boolean => {
  return config.app.environment === "development"
}

export const isProduction = (): boolean => {
  return config.app.environment === "production"
}
