import crypto from 'crypto';
import configs from '../configs/Configs.js';

const encryptionkey = configs.encryption.secretKey;
const algorithm = configs.encryption.algorithm;
const keyEncoding = configs.encryption.keyEncoding;

export function encryptData(data) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionkey, keyEncoding), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

export function decryptData(data) {
    const textParts = data.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(encryptionkey, keyEncoding), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export default { encryptData, decryptData }