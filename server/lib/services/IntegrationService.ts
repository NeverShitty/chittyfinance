import { storage } from "../../storage";
import { seedDefaultIntegrations } from "../integrationSeeder";
import type { User } from "@shared/schema";

export class IntegrationService {
  async getIntegrations(user: User) {
    return await storage.getIntegrations(user.id);
  }

  async seedNewIntegrationsForUser(user: User) {
    const existingIntegrations = await storage.getIntegrations(user.id);
    const existingServiceTypes = new Set(existingIntegrations.map(i => i.serviceType));
    
    const newIntegrations = [
      {
        serviceType: 'stripe',
        name: 'Stripe',
        description: 'Payment processing platform',
        connected: true
      },
      {
        serviceType: 'quickbooks',
        name: 'QuickBooks',
        description: 'Accounting software',
        connected: true
      },
      {
        serviceType: 'xero',
        name: 'Xero',
        description: 'International accounting platform',
        connected: true
      },
      {
        serviceType: 'brex',
        name: 'Brex',
        description: 'Corporate expense management',
        connected: true
      },
      {
        serviceType: 'gusto',
        name: 'Gusto',
        description: 'Payroll and benefits platform',
        connected: true
      },
      {
        serviceType: 'wavapps',
        name: 'Wave Apps',
        description: 'Accounting and payroll software',
        connected: true
      },
      {
        serviceType: 'doorloop',
        name: 'DoorLoop',
        description: 'Property management software',
        connected: true
      }
    ];

    for (const integration of newIntegrations) {
      if (!existingServiceTypes.has(integration.serviceType)) {
        await storage.createIntegration({
          userId: user.id,
          ...integration
        });
      }
    }
  }

  async disconnectIntegration(user: User, serviceType: string) {
    return await storage.deleteIntegration(user.id, serviceType);
  }
}

export const integrationService = new IntegrationService();