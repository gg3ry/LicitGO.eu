import DBconnection from './connection.js';
export default async function UseDB(sql, params) {
    try {
        const [results] = await DBconnection.query(sql, params);
        if (results.length !== 0 || results.affectedRows !== undefined) {
            return results;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
}