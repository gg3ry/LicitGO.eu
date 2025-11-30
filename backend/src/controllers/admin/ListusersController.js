import UseDB from '../../database/UseDB.js';
import DBconnection from '../../database/connection.js';
import { decryptString } from '../../utilities/Encryption.js';


const buildQuery = (query) => {
    let sql = `SELECT usertag, email, fullname, type, gender, createdat, lastlogin, mobile FROM users`;

    const params = [];
    const searchconditions = [];


    if (query.search) {
        const searchTerm = `%${query.search}%`;

        searchconditions.push(`(usertag LIKE ? OR fullname LIKE ?)`);
        params.push(searchTerm, searchTerm);
    }
    if (query.type) {
        searchconditions.push('type = ?');
        params.push(query.type);
    }
    if (query.gender !== undefined) {
        searchconditions.push('gender = ?');
        params.push(query.gender);
    }


    if (searchconditions.length > 0) {
        sql += ` WHERE ${searchconditions.join(' AND ')}`;
    }

    let sortBy = 'createdat';
    let sortOrder = 'DESC';
    
    
    const allowedSorts = ['createdat', 'lastlogin', 'usertag', 'email', 'id', 'type'];

    if (query.sortBy && allowedSorts.includes(query.sortBy)) {
        sortBy = query.sortBy;
    }

    if (query.sortOrder && ['ASC', 'DESC'].includes(query.sortOrder.toUpperCase())) {
        sortOrder = query.sortOrder.toUpperCase();
    }
    
    sql += ` ORDER BY ${sortBy} ${sortOrder}`;

    return { sql, params };
};


export default async (req, res) => {
    const conn = await DBconnection.getConnection();
    
    let page = parseInt(req.query.page) || 1;
    const limit = 20;
    if (page < 1) {
        page = 1;
    }
    const offset = (page - 1) * limit;

    const { sql: baseSql, params: baseParams } = buildQuery(req.query);
    
    let whereClause = baseSql.substring(baseSql.indexOf('WHERE'));
    if (baseSql.indexOf(' WHERE ') === -1) {
        whereClause = '';
    }

    const countSql = `SELECT COUNT(*) as count FROM users ${whereClause}`; 
    const orderByIndex = countSql.toUpperCase().indexOf(' ORDER BY');
    const finalCountSql = orderByIndex > 0 ? countSql.substring(0, orderByIndex) : countSql;


    const countResult = await UseDB(finalCountSql, baseParams);
    const totalUsers = countResult[0].count;
    const totalPages = Math.ceil(totalUsers / limit);


    const fetchSql = `${baseSql} LIMIT ? OFFSET ?`;
    const fetchParams = [...baseParams, limit, offset];

    const users = await UseDB(fetchSql, fetchParams);

    for (const u of users) {
        try {
            const decryptedEmail = decryptString(u.email);
            const [localPart = '', domainPart = ''] = decryptedEmail.split('@');
            let maskedLocal = localPart;
            if (maskedLocal.length > 2) {
                maskedLocal = maskedLocal.slice(0, 2) + '*'.repeat(maskedLocal.length - 2);
            }
            let maskedDomain = '';
            if (domainPart) {
                maskedDomain = domainPart.split('.').map(p => '*'.repeat(p.length)).join('.');
            }
            u.email = domainPart ? `${maskedLocal}@${maskedDomain}` : maskedLocal;
        } catch (e) {
            u.email = null;
        }

        try {
            let decryptedMobile = String(decryptString(u.mobile));
            decryptedMobile = decryptedMobile.replace(/[^\d+]/g, '');

            let country = '';
            let rest = decryptedMobile;
            if (rest.startsWith('+')) {
                const m = rest.match(/^\+(\d{1,3})/);
                if (m) {
                    country = '+' + m[1];
                    rest = rest.slice(1 + m[1].length);
                }
            } else if (rest.startsWith('06')) {
                country = '06';
                rest = rest.slice(2);
            } else if (rest.startsWith('36')) {
                country = '+36';
                rest = rest.slice(2);
            }

            const last4 = rest.slice(-4) || '';
            const middleLen = Math.max(0, rest.length - 4);
            const maskedMiddle = middleLen > 0 ? '*'.repeat(middleLen) : '';

            if (country) {
                if (maskedMiddle) {
                    u.mobile = `${country}-${maskedMiddle}-${last4}`;
                } else {
                    u.mobile = `${country}-${last4}`;
                }
            } else {
                if (maskedMiddle) {
                    u.mobile = `${maskedMiddle}-${last4}`;
                } else {
                    u.mobile = last4;
                }
            }
        } catch (e) {
            u.mobile = null;
        }
    }

    conn.release();
    return res.status(200).json({
        users,
        pagination: {
            page,
            limit,
            totalUsers,
            totalPages
        }
    });
};