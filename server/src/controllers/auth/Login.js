import argon from 'argon2';

import configs from '../../configs/Configs.js';
import encrypt from '../../utilities/Encrypt.js';
import DB from '../../database/DB.js';

export default async function LoginController(req, res) {
    const conn = await DB.pool.getConnection();
    const lang = req.cookies.language || 'en';
    const { identifier, password, keeplogin } = req.body;
    const selectQuery = 'SELECT usertoken, passwordhash FROM users WHERE email = ? OR usertag = ? OR mobile = ?';
    const encryptedIdentifier = encrypt(identifier);
    const selectParams = [encryptedIdentifier, identifier, encryptedIdentifier];
    const rows = await DB.use(selectQuery, selectParams);
    if (rows.length === 0) {
        conn.release();
        return res.status(404).send(lang === 'hu' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.');
    }
    const passwordhash = rows[0].passwordhash;
    const validPassword = await argon.verify(passwordhash, password);
    if (!validPassword) {
        conn.release();
        return res.status(401).send(lang === 'hu' ? 'Hibás felhasználónév vagy jelszó.' : 'Invalid identifier or password.');
    }
    const token = jwt.sign({ usertoken: rows[0].usertoken }, configs.jwt.secret, {
        expiresIn: keeplogin ? '30d' : '1d',
    });
    conn.release();
    res.cookie('auth', token, { httpOnly: true, maxAge: keeplogin ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 });
    return res.status(200).send(lang === 'hu' ? 'Sikeres bejelentkezés.' : 'Login successful.');
}