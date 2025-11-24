import dotenv from 'dotenv';
dotenv.config();
export default function Configuration() {
    const dbsettings = {
        port: process.env.PORT || 3000,
        db: {
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'licitgoeu',
            port: process.env.DB_PORT || 3306
        },
        jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
        jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h'
    };
    return dbsettings;
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