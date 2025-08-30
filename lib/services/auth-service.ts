import { apiClient } from "@/lib/api/client"
import { useUserStore } from "@/lib/stores/user-store"

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  name: string
  acceptTerms: boolean
}

export interface AuthResponse {
  user: any
  token: string
  refreshToken: string
  expiresIn: number
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials)

    // Store tokens
    apiClient.setAuthToken(response.data.token, credentials.rememberMe)

    // Update user store
    const userStore = useUserStore.getState()
    userStore.setUser(response.data.user)

    return response.data
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/register", data)

    // Store tokens
    apiClient.setAuthToken(response.data.token, false)

    // Update user store
    const userStore = useUserStore.getState()
    userStore.setUser(response.data.user)

    return response.data
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post("/auth/logout")
    } catch (error) {
      console.warn("Logout request failed:", error)
    } finally {
      // Clear tokens and user data
      apiClient.removeAuthToken()
      const userStore = useUserStore.getState()
      userStore.clearUser()
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/auth/refresh")

    // Update token
    apiClient.setAuthToken(response.data.token, true)

    return response.data
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/forgot-password", { email })
    return response.data
  }

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/reset-password", {
      token,
      password,
    })
    return response.data
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/verify-email", { token })
    return response.data
  }

  async getCurrentUser(): Promise<any> {
    const response = await apiClient.get("/auth/me")

    // Update user store
    const userStore = useUserStore.getState()
    userStore.setUser(response.data as any)

    return response.data
  }

  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.put("/auth/profile", data)

    // Update user store
    const userStore = useUserStore.getState()
    userStore.updateUser(response.data)

    return response.data
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/change-password", {
      currentPassword,
      newPassword,
    })
    return response.data
  }

  async enable2FA(): Promise<{ qrCode: string; secret: string }> {
    const response = await apiClient.post<{ qrCode: string; secret: string }>("/auth/2fa/enable")
    return response.data
  }

  async verify2FA(token: string): Promise<{ backupCodes: string[] }> {
    const response = await apiClient.post<{ backupCodes: string[] }>("/auth/2fa/verify", { token })
    return response.data
  }

  async disable2FA(token: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/auth/2fa/disable", { token })
    return response.data
  }
}

export const authService = new AuthService()
