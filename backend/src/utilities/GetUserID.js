import UseDB from "../database/UseDB";
import DBconnection from "../database/connection.js";

export default async (req) => {
    const conn = await DBconnection.getConnection();
    const token = req.cookies['sessiontoken'];
    if (!token) {
        conn.release();
        return null;
    }
    const rows = await UseDB('SELECT userid FROM sessions WHERE token = ? AND expiresat > NOW()', [token]);
    if (rows.length === 0) {
        conn.release();
        return null;
    }
    const userID = rows[0].userid;
    conn.release();
    return userID;
}