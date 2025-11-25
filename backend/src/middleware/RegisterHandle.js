import DBconnection from "../db/connection.js";
import UseDB from "../db/UseDB.js";
import handleStatus from "../lang/HandleStatus.js";
import ObjectLength from "../util/ObjectLength.js";
import RegexUtil from "../util/RegexUtil.js";

export default async function RegisterMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { usertag, password, email, fullnamem, mobile, gender, birthdate } = req.body;
    if (ObjectLength(req.body, 6) === -1) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1204', lang) });
    }
    if (ObjectLength(req.body, 6) === 1) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1205', lang) });
    }
    if (!usertag || !password || !email || !fullnamem || !mobile || !gender || !birthdate) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1201', lang) });
    }
    const isUserTagUsed = await UseDB('SELECT COUNT(*) AS count FROM users WHERE usertag = ?', [usertag]);
    if (isUserTagUsed[0].count > 0) {
        conn.release();
        return res.status(409).json({ message: handleStatus('1212', lang) });
    }
    const isEmailUsed = await UseDB('SELECT COUNT(*) AS count FROM users WHERE email = ?', [email]);
    if (isEmailUsed[0].count > 0) {
        conn.release();
        return res.status(409).json({ message: handleStatus('1211', lang) });
    }
    const isMobileUsed = await UseDB('SELECT COUNT(*) AS count FROM users WHERE mobile = ?', [mobile]);
    if (isMobileUsed[0].count > 0) {
        conn.release();
        return res.status(409).json({ message: handleStatus('1210', lang) });
    }
    if (typeof gender !== 'boolean') {
        conn.release();
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (isNaN(Date.parse(birthdate))) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (!RegexUtil.validateEmail(email)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1221', lang) });
    }
    if (!RegexUtil.validatePassword(password)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1220', lang) });
    }
    if (!RegexUtil.validateUsertag(usertag)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1224', lang) });
    }
    if (!RegexUtil.validateFullname(fullnamem)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1225', lang) });
    }
    if (!RegexUtil.validateMobile(mobile)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1222', lang) });
    }
    const now = new Date();
    const birthDateObj = new Date(birthdate);
    const age = now.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = now.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDateObj.getDate())) {
        age--;
    }
    if (age < 16) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1213', lang) });
    }
    next();
}