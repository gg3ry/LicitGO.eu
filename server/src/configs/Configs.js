import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.resolve(__dirname, './.env') });

export default {
    server: {
        port: process.env.PORT || 3000,
        domain: process.env.DOMAIN || 'localhost'
    },
    db: {
        host: process.env.DBHOST || 'localhost',
        user: process.env.DBUSER || 'root',
        password: process.env.DBPASSWORD || '',
        name: process.env.DBNAME || 'licitgo',
        port: process.env.DBPORT || 3306,
    },
    cookieSecret: process.env.COOKIESECRET || crypto.randomBytes(32).toString('hex'),
    jwtSecret: process.env.JWTSECRET || crypto.randomBytes(32).toString('hex'),
    email: {
        host: process.env.EMAILHOST || 'smtp.example.com',
        port: process.env.EMAILPORT || 587,
        user: process.env.EMAILUSER || 'user@example.com',
        pass: process.env.EMAILPASS || 'password',
    },
    encryption: {
        algorithm: process.env.ENCRYPTIONALGORITHM || 'aes-256-cbc',
        secretKey: process.env.ENCRYPTIONSECRET_KEY || crypto.randomBytes(32).toString('hex'),
        keyEncoding: process.env.ENCRYPTIONKEYENCODING || 'utf8',
    },
    baseadmin: {
        usertag: process.env.BASEADMIN_USERTAG || 'admin',
        email: process.env.BASEADMIN_EMAIL || 'admin@example.com',
        fullname: process.env.BASEADMIN_FULLNAME || 'Administrator',
        password: process.env.BASEADMIN_PASSWORD || 'adminpassword',
        gender: process.env.BASEADMIN_GENDER || 'male',
        birthdate: process.env.BASEADMIN_BIRTHDATE || '1990-01-01',
        mobile: process.env.BASEADMIN_MOBILE || '+0000000000',
    }
};