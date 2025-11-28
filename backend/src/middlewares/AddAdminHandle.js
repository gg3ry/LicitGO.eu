import DBconnection from "../database/connection.js";
import UseDB from "../database/UseDB.js";
import handleStatus from "../languages/HandleStatus.js";
import ObjectLength from "../utilities/ObjectLength.js";
import RegexUtil from "../utilities/RegexUtil.js";

export default async function AddAdminMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { email, usertag, mobile, fullname, password, birthdate, gender } = req.body;
    if (ObjectLength(req.body, 7) === -1) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1204', lang) });
    }
    if (ObjectLength(req.body, 7) === 1) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1205', lang) });
    }
    if (!email || !usertag || !mobile || !fullname || !password || !birthdate || !gender) {
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
        return res.status(400).json({ message: handleStatus('1220', lang) });
    }
    if (!RegexUtil.validatePassword(password)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1223', lang) });
    }
    if (!RegexUtil.validateUsertag(usertag)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1224', lang) });
    }
    if (!RegexUtil.validateFullname(fullname)) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1225', lang) });
    }
    if (!RegexUtil.validatePhoneNumber(mobile)) {
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
    if (age < 18) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1206', lang) });
    }
    if (age > 150) {
        conn.release();
        return res.status(400).json({ message: handleStatus('1206', lang) });
    }
    conn.release();
    next();
}