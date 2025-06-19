import { APIError } from '../../middleware/errorHandler';

export interface ServiceConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  timeout?: number;
}

export abstract class BaseServiceClient {
  protected config: ServiceConfig;
  protected serviceName: string;
  protected defaultTimeout = 30000; // 30 seconds

  constructor(serviceName: string, config: ServiceConfig = {}) {
    this.serviceName = serviceName;
    this.config = config;
  }

  protected async fetchWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackData: T,
    errorMessage?: string
  ): Promise<T> {
    try {
      return await apiCall();
    } catch (error) {
      console.error(`${this.serviceName} API error:`, error);
      
      if (process.env.NODE_ENV === 'production') {
        // In production, return fallback data
        return fallbackData;
      }
      
      // In development, throw the error for debugging
      throw new APIError(
        503,
        errorMessage || `${this.serviceName} service unavailable`,
        'SERVICE_UNAVAILABLE',
        { originalError: error }
      );
    }
  }

  protected async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.timeout || this.defaultTimeout
    );

    try {
      const response = await fetch(
        `${this.config.baseUrl}${endpoint}`,
        {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...this.getAuthHeaders(),
            ...options.headers,
          },
        }
      );

      clearTimeout(timeout);

      if (!response.ok) {
        throw new APIError(
          response.status,
          `${this.serviceName} API error: ${response.statusText}`,
          'API_ERROR'
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeout);
      
      if ((error as any).name === 'AbortError') {
        throw new APIError(
          408,
          `${this.serviceName} request timeout`,
          'TIMEOUT'
        );
      }
      
      throw error;
    }
  }

  protected abstract getAuthHeaders(): Record<string, string>;
  
  abstract testConnection(): Promise<boolean>;
}