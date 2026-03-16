import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const KEY_LENGTH = 64;

export function hashPassword(plainPassword: string): string {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH).toString('hex');
  return `${salt}:${derivedKey}`;
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  const [salt, persistedKey] = storedHash.split(':');
  if (!salt || !persistedKey) {
    return false;
  }

  const derivedKey = scryptSync(plainPassword, salt, KEY_LENGTH);
  const persistedBuffer = Buffer.from(persistedKey, 'hex');

  if (persistedBuffer.length !== derivedKey.length) {
    return false;
  }

  return timingSafeEqual(derivedKey, persistedBuffer);
}
