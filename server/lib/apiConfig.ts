
export interface APICredentials {
  [key: string]: any;
  apiKey?: string;
  secretKey?: string;
  accessToken?: string;
  refreshToken?: string;
  companyId?: string;
  clientId?: string;
  clientSecret?: string;
}

export interface ServiceConfig {
  name: string;
  baseUrl: string;
  requiredCredentials: string[];
  rateLimits?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export const SERVICE_CONFIGS: Record<string, ServiceConfig> = {
  mercury_bank: {
    name: 'Mercury Bank',
    baseUrl: 'https://api.mercury.com/api/v1',
    requiredCredentials: ['apiKey']
  },
  stripe: {
    name: 'Stripe',
    baseUrl: 'https://api.stripe.com/v1',
    requiredCredentials: ['secretKey'],
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 1000
    }
  },
  quickbooks: {
    name: 'QuickBooks',
    baseUrl: 'https://sandbox-quickbooks.api.intuit.com/v3',
    requiredCredentials: ['accessToken', 'companyId'],
    rateLimits: {
      requestsPerMinute: 100,
      requestsPerHour: 500
    }
  },
  xero: {
    name: 'Xero',
    baseUrl: 'https://api.xero.com/api.xro/2.0',
    requiredCredentials: ['accessToken', 'tenantId']
  },
  brex: {
    name: 'Brex',
    baseUrl: 'https://platform.brexapis.com',
    requiredCredentials: ['accessToken']
  },
  plaid: {
    name: 'Plaid',
    baseUrl: 'https://production.plaid.com',
    requiredCredentials: ['clientId', 'clientSecret', 'accessToken']
  }
};

// Rate limiting helper
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(serviceType: string): boolean {
  const config = SERVICE_CONFIGS[serviceType];
  if (!config?.rateLimits) return true;

  const key = `${serviceType}-minute`;
  const now = Date.now();
  const minute = Math.floor(now / 60000);
  
  const current = rateLimitStore.get(key);
  if (!current || current.resetTime !== minute) {
    rateLimitStore.set(key, { count: 1, resetTime: minute });
    return true;
  }
  
  if (current.count >= config.rateLimits.requestsPerMinute) {
    return false;
  }
  
  current.count++;
  return true;
}

export function validateCredentials(serviceType: string, credentials: APICredentials): boolean {
  const config = SERVICE_CONFIGS[serviceType];
  if (!config) return false;
  
  return config.requiredCredentials.every(field => 
    credentials[field] && typeof credentials[field] === 'string'
  );
}
