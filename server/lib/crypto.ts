import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const SALT_ROUNDS = 12;

// Get encryption key from environment (32 bytes for AES-256)
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required');
  }
  
  // Ensure the key is exactly 32 bytes for AES-256
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  
  return keyBuffer;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  try {
    return await bcrypt.hash(password, SALT_ROUNDS);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    return false;
  }
}

// Credential encryption/decryption
export function encryptCredentials(credentials: Record<string, any>): string {
  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(16); // 16 bytes IV for AES
    const cipher = crypto.createCipherGCM(ENCRYPTION_ALGORITHM, key, iv);
    
    const plaintext = JSON.stringify(credentials);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data
    const combined = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    return combined;
  } catch (error) {
    throw new Error('Failed to encrypt credentials');
  }
}

export function decryptCredentials(encryptedData: string): Record<string, any> {
  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipherGCM(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return JSON.parse(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt credentials');
  }
}

// API key validation
export function validateApiKey(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // Check for minimum length and complexity
  if (apiKey.length < 32) {
    return false;
  }
  
  // Check that it's not a common weak key
  const weakKeys = ['demo-key', 'test-key', 'development-key'];
  if (weakKeys.includes(apiKey.toLowerCase())) {
    return false;
  }
  
  return true;
}

// Secure random token generation
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Generate encryption key (for setup)
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Environment variable validation
export function validateEnvironmentSecurity(): string[] {
  const issues: string[] = [];
  
  // Check for required encryption key
  if (!process.env.ENCRYPTION_KEY) {
    issues.push('ENCRYPTION_KEY environment variable is missing');
  } else {
    try {
      getEncryptionKey();
    } catch (error) {
      issues.push('ENCRYPTION_KEY is invalid: ' + (error as Error).message);
    }
  }
  
  // Check for secure session secret
  if (!process.env.SESSION_SECRET) {
    issues.push('SESSION_SECRET environment variable is missing');
  } else if (process.env.SESSION_SECRET.length < 32) {
    issues.push('SESSION_SECRET is too short (minimum 32 characters)');
  }
  
  // Check for production database URL
  if (!process.env.DATABASE_URL) {
    issues.push('DATABASE_URL environment variable is missing');
  } else if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL.includes('localhost')) {
    issues.push('DATABASE_URL should not use localhost in production');
  }
  
  // Check API keys
  const apiKeys = ['OPENAI_API_KEY', 'CHITTYCHAIN_API_KEY', 'CHITTY_MCP_API_KEY'];
  apiKeys.forEach(key => {
    const value = process.env[key];
    if (value && !validateApiKey(value)) {
      issues.push(`${key} appears to be weak or invalid`);
    }
  });
  
  return issues;
}