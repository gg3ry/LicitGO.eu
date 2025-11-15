import nodemailer from 'nodemailer';
import dotenv from "dotenv";
import EmailStyle from 'EmailStyle.js';
dotenv.config({ path: "../.env" });
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

async function CheckSessionToken(sessionToken) {
    if (!sessionToken || sessionToken.length !== 64) {
        return false;
    }
    else {
        isTokenValid = false
        const [rows] = await app.db.query('SELECT session_token FROM sessions WHERE session_token = ?', [sessionToken]);
        if (rows.length == 1) {
            isTokenValid = true;
        }
        return isTokenValid;
    }
}

async function GetUserID(sessionToken) {
    if (!sessionToken || sessionToken.length !== 64) {
        return null;
    }
    const [rows] = await app.db.query('SELECT user_id FROM sessions WHERE session_token = ?', [sessionToken]);
    if (rows.length === 0) {
        return null;
    }
    return rows[0].user_id;
}

async function CheckIfAdmin(userID) {
    const [rows] = await app.db.query('SELECT type FROM users WHERE id = ?', [userID]);
    if (rows.length === 0) {
        return false;
    }
    if (rows[0].type !== 'admin' && rows[0].type !== 'superadmin') {
        return false;
    }
    return true;
}

async function CheckIfVerified(userID) {
    const [rows] = await app.db.query('SELECT type FROM users WHERE id = ?', [userID]);
    if (rows.length === 0) {
        return false;
    }
    if (rows[0].type === 'unverified' || rows[0].type === 'suspended') {
        return false;
    }
    return true;
}

async function GetLang(lang) {
    if (toUpperCase(lang) === 'HU' || toUpperCase(lang) === 'EN') {
        return lang;
    }
    return 'EN';
}

async function GetCurrency(currency) {
    if (toUpperCase(currency) === 'HUF' || toUpperCase(currency) === 'EUR' || toUpperCase(currency) === 'USD') {
        return currency;
    }
    return 'USD';
}

async function TodaysExchangeRates() {
    const [res] = await app.db.query('SELECT eur_to_usd, huf_to_usd, huf_to_eur FROM exchange_rates WHERE date = CURDATE() ORDER BY fetched_at DESC LIMIT 1');
    if (res.length > 0) {
        return res[0];
    }
    return null;
}

async function Exchanges(from, to) {
  const res = await fetch(`${process.env.EXCHANGE_API}${process.env.EXCHANGE_RATE_API_KEY}/latest/${from}`);
  const data = await res.json();
    if (data.result === 'success' && data.conversion_rates && data.conversion_rates[to]) {
        return data.conversion_rates[to];
    }
    else {
        console.error('Hiba az árfolyam lekérésekor:', data);
    }
}

function CheckFileType(file) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg', 'image/webp', 'image/bmp', 'image/svg'];
    return file && allowedTypes.includes(file.mimetype);
}

async function SendEmail(to, subject, htmlMessage) {
    
    const mailOptions = {
        from: `"${process.env.EMAIL_SENDER_NAME}" <${process.env.EMAIL_SENDER_EMAIL}>`,
        to: to,
        subject: subject,
        html: `
        ${EmailStyle()}
        ${htmlMessage}
        `
    };
    await transporter.sendMail(mailOptions);
}

exports = { CheckSessionToken, CheckFileType, GetUserID, CheckIfAdmin, CheckIfVerified, SendEmail, GetLang, Exchanges, GetCurrency, TodaysExchangeRates };