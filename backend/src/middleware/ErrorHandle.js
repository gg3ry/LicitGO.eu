import HandleStatus from "../lang/HandleStatus.js";
import UseDB from "../db/UseDB.js";

export default function HandleErrorMiddleware(err, req, res, next) {
    console.color = 'red';
    console.error(`\n--- Error ---`);
    console.error(`Type: ${err.name} | Message: ${err.message}`);

    const statusCode = err.status || 500;
    try {
        const sql = 'INSERT INTO error_logs (error_message, stack_trace) VALUES (?, ?)';
        const params = [err.message, err.stack || 'No stack trace available'];
        UseDB(sql, params);
    } catch (dbError) {
        console.error('Failed to log error to database:', dbError);
    }
    console.color = 'white';
    const lang = req.headers['accept-language'] || 'EN';
    res.status(statusCode).json({
        error: {
            code: statusCode,
            message: HandleStatus(statusCode, lang)
        }
    });
}