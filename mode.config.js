// mode.config.js - MANDATORY for all platforms
export const detectMode = () => {
  // 1. Check explicit environment variable
  if (process.env.CHITTY_MODE) return process.env.CHITTY_MODE;
  
  // 2. Check for ChittyOS integration
  if (process.env.CHITTYOS_INTEGRATION) return 'system';
  
  // 3. Check for system database pattern
  if (process.env.DATABASE_URL?.includes('shared-chitty')) return 'system';
  
  // 4. Check for AI executive access
  if (process.env.AI_EXECUTIVE_ACCESS) return 'system';
  
  // 5. Default to standalone
  return 'standalone';
};

export const getModeConfig = (mode) => {
  const configs = {
    standalone: {
      database: './chittyfinance.db',
      auth: 'local',
      features: ['basic-features'],
      aiIntegration: false,
      chainIntegration: 'optional'
    },
    system: {
      database: process.env.NEON_DATABASE_URL,
      auth: 'chittyos-sso',
      features: ['advanced-features', 'ai-agents', 'multi-tenant'],
      aiIntegration: true,
      chainIntegration: 'full'
    }
  };
  return configs[mode];
};