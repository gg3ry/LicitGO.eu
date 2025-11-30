import dotenv from 'dotenv';
import crypt from 'crypto';
dotenv.config();
export default function Configuration() {
    const config = {
        port: process.env.PORT || 3030,
        db: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'licitgoeu',
            port: process.env.DB_PORT || 3306
        },
        encrypt: {
            algorithm: process.env.ENCRYPTION_ALGORITHM || 'aes-256-cbc',
            secretKey: process.env.ENCRYPTION_SECRET_KEY || crypt.randomBytes(32).toString('hex'),
            keyEncoding: process.env.ENCRYPTION_KEY_ENCODING || 'hex'
        },
        cookieSecret: process.env.COOKIE_SECRET || crypt.randomBytes(64).toString('hex')
    };
    return config;
}
export function emailConfig() {
    const emailSettings = {
        host: process.env.EMAIL_HOST || 'smtp.example.com',
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE || 'true',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@example.com',
            pass: process.env.EMAIL_PASS || 'your-email-password'
        }
    };
    return emailSettings;
}