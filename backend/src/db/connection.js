import mysql from 'mysql2/promise';
import configuration from '../conf/configure.js';

async function initializeDatabase() {
    const config = configuration();
    const pool = mysql.createPool({
        host: config.db.host || 'localhost',
        user: config.db.user || 'root',
        password: config.db.password || '',
        database: config.db.database || 'licitgoeu',
        port: config.db.port || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    return pool;
}

const pool = await initializeDatabase();

export default pool;