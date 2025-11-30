import UseDB from "../../database/UseDB.js";
import DBconnection from "../../database/connection.js";
import handleStatus from "../../languages/HandleStatus.js";
import argon2 from "argon2";
import crypto from "crypto";
import { encryptString } from "../../utilities/Encryption.js";

export default async (req, res) => {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { userinfo, password } = req.body;
    const sql = 'SELECT id, password FROM users WHERE usertag = ? OR email = ? OR mobile = ?';
    const encryptedInfo = encryptString(String(userinfo || ''));
    const params = [userinfo, encryptedInfo, encryptedInfo];
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
    let attempts = 0;
    for (let i = 0; i < 16; i++) {
        var sessiontoken = crypto.randomBytes(64).toString('hex');
        const existingSession = await UseDB('SELECT * FROM sessions WHERE token = ?', [sessiontoken]);
        if (existingSession.length === 0) {
            break;
        }
        attempts++;
    }
    if (attempts === 16) {
        conn.release();
        return res.status(500).json({ message: handleStatus('500', lang) });
    }
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    await UseDB('INSERT INTO sessions (userid, token, createdat, expiresat) VALUES (?, ?, ?, ?)', [user.id, sessiontoken, now, expiresAt]);
    res.cookie('sessiontoken', sessiontoken, { httpOnly: true, expires: expiresAt });
    conn.release();
    return res.status(100).json({ message: handleStatus('100', lang) });
}