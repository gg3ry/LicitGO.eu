import crypto from 'crypto';
import configure from '../configs/configure.js';

const { algorithm: ALGORITHM, secretKey: SECRET_KEY, keyEncoding: KEY_ENCODING } = configure().encrypt;


function getKeyBuffer() {
  return Buffer.from(SECRET_KEY, KEY_ENCODING);
}

export function encryptString(text) {
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]).toString('hex');

  if (ALGORITHM.toLowerCase().includes('gcm')) {
    const tag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${tag}:${encrypted}`;
  }

  return `${iv.toString('hex')}:${encrypted}`;
}

export function decryptString(encryptedText) {
  const key = getKeyBuffer();
  const parts = encryptedText.split(':');

  if (ALGORITHM.toLowerCase().includes('gcm')) {
    if (parts.length < 3) throw new Error('Invalid payload');
    const iv = Buffer.from(parts.shift(), 'hex');
    const tag = Buffer.from(parts.shift(), 'hex');
    const encryptedData = parts.join(':');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedData, 'hex')),
      decipher.final()
    ]).toString('utf8');
    return decrypted;
  }

  if (parts.length < 2) throw new Error('Invalid payload');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encryptedData = parts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'hex')),
    decipher.final()
  ]).toString('utf8');
  return decrypted;
}