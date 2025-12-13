import mysql from 'mysql2/promise';
import configs from '../configs/Configs.js';

export const pool = mysql.createPool({
    host: configs.db.host,
    user: configs.db.user,
    password: configs.db.password,
    database: configs.db.name,
    port: configs.db.port,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export async function use(sql, params) {
    if (!params) {
        const [rows] = await pool.query(sql);
        return rows;
    }
    const [results] = await pool.query(sql, params);
    return results;
}

export default { use, pool };