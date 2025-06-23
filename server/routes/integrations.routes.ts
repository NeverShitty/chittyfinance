import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { ZapierClient } from '../lib/services/ZapierClient';
import { PlaidClient } from '../lib/services/PlaidClient';
import { db } from '../lib/db';
import { integrations } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { APIError } from '../middleware/errorHandler';

const router = Router();

// Get all integrations for the authenticated user
router.get('/integrations', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const userIntegrations = await db
      .select()
      .from(integrations)
      .where(eq(integrations.userId, userId));

    res.json({
      success: true,
      data: userIntegrations
    });
  } catch (error) {
    throw new APIError(500, 'Failed to fetch integrations', 'DATABASE_ERROR');
  }
});

// Zapier integration endpoints
router.post('/integrations/zapier/connect', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { webhookUrl, apiKey } = req.body;
    if (!webhookUrl || !apiKey) {
      throw new APIError(400, 'webhookUrl and apiKey are required', 'INVALID_REQUEST');
    }

    const zapierClient = new ZapierClient({ 
      apiKey,
      baseUrl: webhookUrl 
    });

    const isConnected = await zapierClient.testConnection();
    
    // Store or update integration
    const existingIntegration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.userId, userId),
        eq(integrations.serviceType, 'zapier')
      ))
      .limit(1);

    if (existingIntegration.length > 0) {
      await db
        .update(integrations)
        .set({
          connected: isConnected,
          credentials: { webhookUrl, apiKey },
          lastSynced: new Date()
        })
        .where(eq(integrations.id, existingIntegration[0].id));
    } else {
      await db.insert(integrations).values({
        userId,
        serviceType: 'zapier',
        name: 'Zapier Automation',
        description: 'Connect ChittyFinance to 5000+ apps with Zapier',
        connected: isConnected,
        credentials: { webhookUrl, apiKey },
        lastSynced: new Date()
      });
    }

    res.json({
      success: true,
      data: { connected: isConnected }
    });
  } catch (error) {
    console.error('Zapier connection error:', error);
    throw new APIError(500, 'Failed to connect Zapier integration', 'INTEGRATION_ERROR');
  }
});

router.post('/integrations/zapier/webhook', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { event, data } = req.body;
    if (!event || !data) {
      throw new APIError(400, 'event and data are required', 'INVALID_REQUEST');
    }

    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.userId, userId),
        eq(integrations.serviceType, 'zapier'),
        eq(integrations.connected, true)
      ))
      .limit(1);

    if (integration.length === 0) {
      throw new APIError(404, 'Zapier integration not found or not connected', 'INTEGRATION_NOT_FOUND');
    }

    const credentials = integration[0].credentials as { webhookUrl: string; apiKey: string };
    const zapierClient = new ZapierClient({
      apiKey: credentials.apiKey,
      baseUrl: credentials.webhookUrl
    });

    await zapierClient.sendWebhook(event, data);

    res.json({
      success: true,
      data: { message: 'Webhook sent successfully' }
    });
  } catch (error) {
    console.error('Zapier webhook error:', error);
    throw new APIError(500, 'Failed to send Zapier webhook', 'WEBHOOK_ERROR');
  }
});

// Plaid integration endpoints
router.post('/integrations/plaid/connect', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { clientId, secret, environment = 'sandbox' } = req.body;
    if (!clientId || !secret) {
      throw new APIError(400, 'clientId and secret are required', 'INVALID_REQUEST');
    }

    const plaidClient = new PlaidClient({
      clientId,
      secret,
      environment: environment as 'sandbox' | 'development' | 'production'
    });

    const isConnected = await plaidClient.testConnection();
    
    if (isConnected) {
      const linkToken = await plaidClient.createLinkToken(userId.toString());
      
      // Store or update integration
      const existingIntegration = await db
        .select()
        .from(integrations)
        .where(and(
          eq(integrations.userId, userId),
          eq(integrations.serviceType, 'plaid')
        ))
        .limit(1);

      if (existingIntegration.length > 0) {
        await db
          .update(integrations)
          .set({
            connected: isConnected,
            credentials: { clientId, secret, environment },
            lastSynced: new Date()
          })
          .where(eq(integrations.id, existingIntegration[0].id));
      } else {
        await db.insert(integrations).values({
          userId,
          serviceType: 'plaid',
          name: 'Plaid Banking',
          description: 'Connect bank accounts and credit cards via Plaid',
          connected: isConnected,
          credentials: { clientId, secret, environment },
          lastSynced: new Date()
        });
      }

      res.json({
        success: true,
        data: { 
          connected: isConnected,
          linkToken: linkToken.link_token
        }
      });
    } else {
      res.json({
        success: false,
        error: {
          code: 'CONNECTION_FAILED',
          message: 'Failed to connect to Plaid'
        }
      });
    }
  } catch (error) {
    console.error('Plaid connection error:', error);
    throw new APIError(500, 'Failed to connect Plaid integration', 'INTEGRATION_ERROR');
  }
});

router.post('/integrations/plaid/exchange-token', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { publicToken } = req.body;
    if (!publicToken) {
      throw new APIError(400, 'publicToken is required', 'INVALID_REQUEST');
    }

    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.userId, userId),
        eq(integrations.serviceType, 'plaid'),
        eq(integrations.connected, true)
      ))
      .limit(1);

    if (integration.length === 0) {
      throw new APIError(404, 'Plaid integration not found or not connected', 'INTEGRATION_NOT_FOUND');
    }

    const credentials = integration[0].credentials as { 
      clientId: string; 
      secret: string; 
      environment: 'sandbox' | 'development' | 'production' 
    };
    
    const plaidClient = new PlaidClient(credentials);
    const tokenData = await plaidClient.exchangePublicToken(publicToken);

    // Update integration with access token
    await db
      .update(integrations)
      .set({
        credentials: {
          ...credentials,
          accessToken: tokenData.access_token,
          itemId: tokenData.item_id
        },
        lastSynced: new Date()
      })
      .where(eq(integrations.id, integration[0].id));

    res.json({
      success: true,
      data: { 
        message: 'Token exchanged successfully',
        itemId: tokenData.item_id
      }
    });
  } catch (error) {
    console.error('Plaid token exchange error:', error);
    throw new APIError(500, 'Failed to exchange Plaid token', 'TOKEN_EXCHANGE_ERROR');
  }
});

router.get('/integrations/plaid/accounts', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.userId, userId),
        eq(integrations.serviceType, 'plaid'),
        eq(integrations.connected, true)
      ))
      .limit(1);

    if (integration.length === 0) {
      throw new APIError(404, 'Plaid integration not found or not connected', 'INTEGRATION_NOT_FOUND');
    }

    const credentials = integration[0].credentials as { 
      clientId: string; 
      secret: string; 
      environment: 'sandbox' | 'development' | 'production';
      accessToken?: string;
    };

    if (!credentials.accessToken) {
      throw new APIError(400, 'Plaid access token not found. Please complete the Link flow.', 'MISSING_ACCESS_TOKEN');
    }

    const plaidClient = new PlaidClient(credentials);
    const accounts = await plaidClient.getAccounts(credentials.accessToken);

    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    console.error('Plaid accounts error:', error);
    throw new APIError(500, 'Failed to fetch Plaid accounts', 'ACCOUNTS_ERROR');
  }
});

router.get('/integrations/plaid/transactions', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate as string) : new Date();

    const integration = await db
      .select()
      .from(integrations)
      .where(and(
        eq(integrations.userId, userId),
        eq(integrations.serviceType, 'plaid'),
        eq(integrations.connected, true)
      ))
      .limit(1);

    if (integration.length === 0) {
      throw new APIError(404, 'Plaid integration not found or not connected', 'INTEGRATION_NOT_FOUND');
    }

    const credentials = integration[0].credentials as { 
      clientId: string; 
      secret: string; 
      environment: 'sandbox' | 'development' | 'production';
      accessToken?: string;
    };

    if (!credentials.accessToken) {
      throw new APIError(400, 'Plaid access token not found. Please complete the Link flow.', 'MISSING_ACCESS_TOKEN');
    }

    const plaidClient = new PlaidClient(credentials);
    const transactions = await plaidClient.getTransactions(credentials.accessToken, start, end);

    res.json({
      success: true,
      data: transactions
    });
  } catch (error) {
    console.error('Plaid transactions error:', error);
    throw new APIError(500, 'Failed to fetch Plaid transactions', 'TRANSACTIONS_ERROR');
  }
});

// Disconnect integration
router.delete('/integrations/:serviceType', requireAuth, async (req, res) => {
  try {
    const userId = req.session?.userId;
    if (!userId) {
      throw new APIError(401, 'Authentication required', 'UNAUTHORIZED');
    }

    const { serviceType } = req.params;
    if (!['zapier', 'plaid'].includes(serviceType)) {
      throw new APIError(400, 'Invalid service type', 'INVALID_SERVICE_TYPE');
    }

    await db
      .update(integrations)
      .set({
        connected: false,
        credentials: null,
        lastSynced: null
      })
      .where(and(
        eq(integrations.userId, userId),
        eq(integrations.serviceType, serviceType)
      ));

    res.json({
      success: true,
      data: { message: `${serviceType} integration disconnected successfully` }
    });
  } catch (error) {
    console.error('Integration disconnect error:', error);
    throw new APIError(500, 'Failed to disconnect integration', 'DISCONNECT_ERROR');
  }
});

export default router;