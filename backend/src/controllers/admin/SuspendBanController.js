import UseDB from "../../database/UseDB";
import DBconnection from "../../database/connection.js";
import handleStatus from "../../languages/HandleStatus.js";

export default async (req, res) => {
    const conn = await DBconnection.getConnection();
    const lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { userID, action } = req.params;
    if (!userID || !action) {
        conn.release();
        return res.status(400).json({ error: handleStatus('400', lang) });
    }
    if (!['suspend', 'ban', 'unsuspend', 'unban'].includes(action.toLowerCase())) {
        conn.release();
        return res.status(400).json({ error: handleStatus('400', lang) });
    }
    let sql = '';
    switch (action.toLowerCase()) {
        case 'suspend':
            sql = 'UPDATE users SET type = ? WHERE id = ? AND type = ?';
            const results = await UseDB(sql, ['suspended', userID, 'verified' || 'unverified']);

            if (results.affectedRows === 0) {
                conn.release();
                return res.status(404).json({ error: handleStatus('404', lang) });
            }
            return res.status(200).json({ message: handleStatus('200', lang) });
        case 'ban':
            sql = 'UPDATE users SET type = ? WHERE id = ? AND type = ?';
            const banResults = await UseDB(sql, ['banned', userID, 'verified' || 'unverified' || 'suspended']);
            conn.release();
            if (banResults.affectedRows === 0) {
                return res.status(404).json({ error: handleStatus('404', lang) });
            }
            return res.status(200).json({ message: handleStatus('200', lang) });
        case 'unsuspend':

            sql = 'UPDATE users SET type = ? WHERE id = ? AND type = ?';
            const unsuspendResults = await UseDB(sql, ['verified', userID, 'suspended']);
            conn.release();
            if (unsuspendResults.affectedRows === 0) {
                return res.status(404).json({ error: handleStatus('404', lang) });
            }
            return res.status(200).json({ message: handleStatus('200', lang) });
        case 'unban':
            sql = 'UPDATE users SET type = ? WHERE id = ? AND type = ?';
            const unbanResults = await UseDB(sql, ['verified', userID, 'banned']);
            conn.release();
            if (unbanResults.affectedRows === 0) {
                return res.status(404).json({ error: handleStatus('404', lang) });
            }
            return res.status(200).json({ message: handleStatus('200', lang) });
        default:
            conn.release();
            return res.status(400).json({ error: handleStatus('400', lang) });
    }
};