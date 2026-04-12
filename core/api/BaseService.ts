/**
 * 🔧 BASE SERVICE
 * Foundation class for all API service implementations
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * Configuration interface for service initialization
 */
export interface ServiceConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
  withCredentials?: boolean;
}

/**
 * Base service class that provides common functionality for API services
 */
export abstract class BaseService {
  protected client: AxiosInstance;
  protected isInitialized: boolean = false;

  /**
   * Creates a new service instance
   * @param config Service configuration
   */
  constructor(config: ServiceConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
      withCredentials: config.withCredentials || false,
    });

    this.setupInterceptors();
    this.isInitialized = true;
  }

  /**
   * Set up request and response interceptors
   */
  protected setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      async (config) => {
        // Get token or apply other auth logic
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Standard error handling
        this.handleRequestError(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Get authentication token for requests
   * Override in derived classes as needed
   */
  protected async getAuthToken(): Promise<string | null> {
    return null;
  }

  /**
   * Handle request errors in a standardized way
   * @param error Error from Axios
   */
  protected handleRequestError(error: any): void {
    const status = error?.response?.status;
    const data = error?.response?.data;
    
    // Log error details
    console.error(`API Error [${status}]:`, data || error.message);

    // Implement specific error handling (can be overridden)
    if (status === 401) {
      // Handle unauthorized (e.g., redirect to login)
      console.warn('Unauthorized access, authentication required');
    } else if (status === 403) {
      // Handle forbidden
      console.warn('Forbidden access, insufficient permissions');
    } else if (status === 404) {
      // Handle not found
      console.warn('Resource not found');
    } else if (status >= 500) {
      // Handle server errors
      console.error('Server error occurred');
    }
  }

  /**
   * Perform a GET request
   * @param url Endpoint URL
   * @param config Optional Axios config
   * @returns Promise with response data
   */
  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.get(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a POST request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional Axios config
   * @returns Promise with response data
   */
  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.post(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a PUT request
   * @param url Endpoint URL
   * @param data Request body
   * @param config Optional Axios config
   * @returns Promise with response data
   */
  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.put(url, data, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Perform a DELETE request
   * @param url Endpoint URL
   * @param config Optional Axios config
   * @returns Promise with response data
   */
  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.client.delete(url, config);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if service is available
   * @returns Promise with health check result
   */
  public async checkHealth(): Promise<{ status: string; version?: string }> {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('Service health check failed:', error);
      return { status: 'error', version: 'unknown' };
    }
  }
}
