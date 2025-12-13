import ObjectLenght from '../../utilities/ObjectLenght.js';

export default function LoginMiddleware(req, res, next) {
    const lang = req.cookies.language || 'en';
    const authToken = req.cookies.auth;
    if (authToken) {
        return res.status(400).send(lang === 'hu' ? 'Már be vagy jelentkezve.' : 'You are already logged in.');
    }
    const { identifier, password, keeplogin } = req.body;
    if (!identifier || !password) {
        return res.status(400).send(lang === 'hu' ? 'Hiányzó bejelentkezési adatok.' : 'Missing login credentials.');
    }
    if (ObjectLenght(req.body, 2, 3) !== 0) {
        return res.status(400).send(lang === 'hu' ? 'Érvénytelen mezők száma.' : 'Invalid number of fields.');
    }
    if (typeof identifier !== 'string') {
        req.body.identifier = identifier.toString();
    }
    if (typeof password !== 'string') {
        req.body.password = password.toString();
    }
    next();
}