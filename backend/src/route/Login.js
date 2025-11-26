import express from 'express';
import handleStatus from '../lang/HandleStatus.js';
import DBconnection from '../db/connection.js';
import UseDB from '../db/UseDB.js';
import argon2 from 'argon2';
import CookieParser from 'cookie-parser';
import crypto from 'crypto';


const router = express.Router();

router.get('/', async (req, res) => {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { userinfo, password } = req.query;
    const sql = 'SELECT id, password FROM users WHERE usertag = ? OR email = ? OR mobile = ?';
    const params = [userinfo, userinfo, userinfo];
    const rows = await UseDB(sql, params);
    if (rows.length === 0) {
        conn.release();
        return res.status(401).json({ message: handleStatus('1100', lang) });
    }
    const user = rows[0];
    const passwordMatch = await argon2.verify(user.password, password);
    if (!passwordMatch) {
        conn.release();
        return res.status(401).json({ message: handleStatus('1101', lang) });
    }
    await UseDB('UPDATE users SET lastlogin = NOW() WHERE id = ?', [user.id]);
    const sessiontoken = crypto.randomBytes(64).toString('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    await UseDB('INSERT INTO sessions (userid, token, createdat, expiresat) VALUES (?, ?, ?, ?)', [user.id, sessiontoken, now, expiresAt]);
    res.cookie('auth', )
    res.cookie('session_token', sessiontoken, { httpOnly: true, expires: expiresAt });
    conn.release();
    return res.status(100).json({ message: handleStatus('100', lang) });
});

export default router;