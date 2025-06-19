
import { Integration } from "@shared/schema";
import { FinancialData } from "./financialServices";
import { checkRateLimit, validateCredentials } from "./apiConfig";

interface CachedData {
  data: Partial<FinancialData>;
  timestamp: number;
  expiresAt: number;
}

// In-memory cache (in production, use Redis or similar)
const dataCache = new Map<string, CachedData>();

// Cache duration in milliseconds
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class DataFetcher {
  private static async makeAPIRequest(url: string, headers: Record<string, string>, retries = 3): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { headers });
        
        if (!response.ok) {
          if (response.status === 429 && attempt < retries) {
            // Rate limited, wait and retry
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            continue;
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        if (attempt === retries) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  static async fetchWithCache(
    integration: Integration,
    fetchFunction: (integration: Integration) => Promise<Partial<FinancialData>>
  ): Promise<Partial<FinancialData>> {
    const cacheKey = `${integration.serviceType}-${integration.id}`;
    const cached = dataCache.get(cacheKey);
    
    // Return cached data if valid
    if (cached && Date.now() < cached.expiresAt) {
      console.log(`Returning cached data for ${integration.serviceType}`);
      return cached.data;
    }
    
    // Check rate limits
    if (!checkRateLimit(integration.serviceType)) {
      console.log(`Rate limit exceeded for ${integration.serviceType}, using cached data`);
      return cached?.data || {};
    }
    
    // Validate credentials
    if (!validateCredentials(integration.serviceType, integration.credentials || {})) {
      console.log(`Invalid credentials for ${integration.serviceType}`);
      return {};
    }
    
    try {
      console.log(`Fetching fresh data for ${integration.serviceType}`);
      const data = await fetchFunction(integration);
      
      // Cache the result
      dataCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + CACHE_DURATION
      });
      
      return data;
    } catch (error) {
      console.error(`Error fetching data for ${integration.serviceType}:`, error);
      
      // Return cached data if available, even if expired
      if (cached) {
        console.log(`Returning stale cached data for ${integration.serviceType}`);
        return cached.data;
      }
      
      return {};
    }
  }

  static clearCache(integrationId?: number): void {
    if (integrationId) {
      // Clear cache for specific integration
      for (const [key] of dataCache) {
        if (key.includes(`-${integrationId}`)) {
          dataCache.delete(key);
        }
      }
    } else {
      // Clear all cache
      dataCache.clear();
    }
  }

  static getCacheStats(): { totalEntries: number; activeEntries: number } {
    const now = Date.now();
    let activeEntries = 0;
    
    for (const [key, cached] of dataCache) {
      if (now < cached.expiresAt) {
        activeEntries++;
      } else {
        dataCache.delete(key); // Cleanup expired entries
      }
    }
    
    return {
      totalEntries: dataCache.size,
      activeEntries
    };
  }
}

// Webhook handler for real-time updates
export async function handleWebhook(serviceType: string, payload: any): Promise<void> {
  console.log(`Received webhook from ${serviceType}:`, payload);
  
  // Clear cache for this service to force fresh data fetch
  for (const [key] of dataCache) {
    if (key.startsWith(serviceType)) {
      dataCache.delete(key);
    }
  }
  
  // Process webhook payload based on service type
  switch (serviceType) {
    case 'stripe':
      await handleStripeWebhook(payload);
      break;
    case 'quickbooks':
      await handleQuickBooksWebhook(payload);
      break;
    // Add more webhook handlers as needed
  }
}

async function handleStripeWebhook(payload: any): Promise<void> {
  // Process Stripe webhook events
  const event = payload.type;
  
  switch (event) {
    case 'charge.succeeded':
    case 'invoice.payment_succeeded':
    case 'customer.subscription.created':
      console.log(`Processing Stripe event: ${event}`);
      // Trigger data refresh for affected users
      break;
  }
}

async function handleQuickBooksWebhook(payload: any): Promise<void> {
  // Process QuickBooks webhook events
  console.log('Processing QuickBooks webhook');
  // Trigger data refresh for affected users
}
