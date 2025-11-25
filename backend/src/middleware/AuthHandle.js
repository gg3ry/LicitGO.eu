import UseDB from '../db/UseDB.js';
import DBconnection from '../db/connection.js';
import handleStatus from '../lang/HandleStatus.js';

export default async function SessionTokenMiddleware(req, res, next) {
    const sessionToken = req.cookies['session_token'];
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    if (!sessionToken) {
        return res.status(404).json({ message: handleStatus('1000', lang) });
    }
    const conn = await DBconnection.getConnection();
    const sql = 'SELECT * FROM sessions WHERE session_token = ?';
    const results = await UseDB(sql, [sessionToken]);
    if (results.length === 0) {
        return res.status(404).json({ message: handleStatus('1100', lang) });
    }
    const now = new Date();
    const expire = new Date(results[0].expires_at);
    if (now > expire) {
        return res.status(403).json({ message: handleStatus('1002', lang) });
    }
    req.session = results[0];
    conn.release();
    next();
}

export async function AdminPermissionMiddleware(req, res, next) {
    const sessionToken = req.cookies['session_token'];
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    if (!sessionToken) {
        return res.status(404).json({ message: handleStatus('1000', lang) });
    }
    const conn = await DBconnection.getConnection();
    const sql = 'SELECT type FROM users INNER JOIN sessions ON users.id = sessions.user_id WHERE sessions.session_token = ?';
    const results = await UseDB(sql, [sessionToken]);
    if (results.length === 0) {
        return res.status(404).json({ message: handleStatus('1100', lang) });
    }
    if (results[0].type !== 'admin' && results[0].type !== 'superadmin') {
        return res.status(401).json({ message: handleStatus('401', lang) });
    }
    conn.release();
    next();
}

export async function SuperAdminPermissionMiddleware(req, res, next) {
    const sessionToken = req.cookies['session_token'];
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    if (!sessionToken) {
        return res.status(404).json({ message: handleStatus('1000', lang) });
    }
    const conn = await DBconnection.getConnection();
    const sql = 'SELECT type FROM users INNER JOIN sessions ON users.id = sessions.user_id WHERE sessions.session_token = ?';
    const results = await UseDB(sql, [sessionToken]);
    if (results.length === 0) {
        return res.status(404).json({ message: handleStatus('1100', lang) });
    }
    if (results[0].type !== 'superadmin') {
        return res.status(401).json({ message: handleStatus('401', lang) });
    }
    conn.release();
    next();
}

export async function IsVerifiedMiddleware(req, res, next) {
    const sessionToken = req.cookies['session_token'];
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    if (!sessionToken) {
        return res.status(401).json({ message: handleStatus('1000', lang) });
    }
    const conn = await DBconnection.getConnection();
    const sql = 'SELECT type FROM users INNER JOIN sessions ON users.id = sessions.user_id WHERE sessions.session_token = ?';
    const results = await UseDB(sql, [sessionToken]);
    if (results.length === 0) {
        return res.status(403).json({ message: handleStatus('1100', lang) });
    }
    if (results[0].type === 'unverified') {
        return res.status(403).json({ message: handleStatus('1120', lang) });
    }
    if (results[0].type === 'suspended') {
        return res.status(403).json({ message: handleStatus('1103', lang) });
    }
    conn.release();
    next();
}