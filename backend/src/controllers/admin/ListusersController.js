import UseDB from '../../database/UseDB.js';
import DBconnection from '../../database/connection.js';


const buildQuery = (query) => {
    const maskedMobile = `CONCAT(REPEAT('*', LENGTH(mobile) - 4), SUBSTR(mobile, -4))`;


    const maskedEmail = `CONCAT(SUBSTR(email, 1, 2), '...', SUBSTR(email, INSTR(email, '@') + 1))`;


    let sql = `SELECT usertag, ${maskedEmail} AS email, fullname, type, gender, createdat, lastlogin, ${maskedMobile} AS mobile FROM users`;

    const params = [];
    const searchconditions = [];


    if (query.search) {
        const searchTerm = `%${query.search}%`;
        searchconditions.push(`(usertag LIKE ? OR email LIKE ? OR fullname LIKE ?)`);
        params.push(searchTerm, searchTerm, searchTerm);
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