import configs from '../configs/Configs.js';
import generateUserToken from '../utilities/usertoken';
import useDB from './DB.js';
import argon2 from 'argon2';
import { encryptData } from '../utilities/Encrypt.js';

export default async function setupDB() {

    const fs = await import('fs/promises');
    const sql = await fs.readFile('../../setup.sql', 'utf8');
    await useDB(sql);

    const [rows] = await useDB('SELECT COUNT(*) AS count FROM users WHERE type = ?', ['superadmin']);
    if (rows[0].count === 0) {
        const usertoken = generateUserToken();
        const { usertag, email, password, fullname, gender, birthdate, mobile } = configs.baseadmin;
        const passwordhash = await argon2.hash(password);
        const encryptedEmail = encryptData(email);
        const encryptedFullname = encryptData(fullname);
        const encryptedMobile = encryptData(mobile);
        const insertQuery = `
            INSERT INTO users (usertoken, usertag, passwordhash, email, 
            fullname, gender, birthdate, mobile, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [usertoken, usertag, passwordhash, encryptedEmail,
            encryptedFullname, gender === 'male' ? 1 : 0, birthdate, encryptedMobile, 'superadmin'];
        await useDB(insertQuery, params);
        console.log(`Superadmin created with details: \n
            Usertag: ${usertag} \n
            Email: ${email} \n
            Fullname: ${fullname} \n
            Password: ${password} \n
            Mobile: ${mobile} \n
            
            Please keep these credentials safe. \n
            Please change the password after first login.
        `);
    }
}