import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export const encrypt = (text) => {
  try {
    if (!process.env.ENCRYPTION_KEY) {
      console.error('[ENCRYPTION] ENCRYPTION_KEY is not defined in environment variables!');
      throw new Error('ENCRYPTION_KEY is not configured');
    }
    
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + authTag.toString('hex') + encrypted;
  } catch (error) {
    console.error('[ENCRYPTION] Encryption failed:', error.message);
    throw error;
  }
};

export const decrypt = (encryptedData) => {
  try {
    if (!encryptedData || encryptedData.length < (IV_LENGTH + AUTH_TAG_LENGTH) * 2) {
      return encryptedData || '';
    }
    
    const iv = Buffer.from(encryptedData.slice(0, IV_LENGTH * 2), 'hex');
    const authTag = Buffer.from(
      encryptedData.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2),
      'hex'
    );
    const encrypted = encryptedData.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);
    
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.log('[ENCRYPTION] Decryption failed, returning original message:', error.message);
    return encryptedData;
  }
};
