import express from "express";
import handleStatus from "../lang/HandleStatus.js";
import DBconnection from "../db/connection.js";
import UseDB from "../db/UseDB.js";
import argon2 from "argon2";

const router = express.Router();

router.post('/', async (req, res) => {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { usertag, password, email, fullnamem, mobile, gender, birthdate } = req.body;
    const hashedPassword = await argon2.hash(password);
    const sql = 'INSERT INTO users (usertag, password, email, fullname, mobile, gender, birthdate) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [usertag, hashedPassword, email, fullnamem, mobile, gender, birthdate];
    const result = await UseDB(sql, params);
    if (result.affectedRows === 1) {
        conn.release();
        return res.status(201).json({ message: handleStatus('201', lang), userId: result.insertId });
    } else {
        conn.release();
        return res.status(500).json({ message: handleStatus('500', lang) });
    }
});

export default router;