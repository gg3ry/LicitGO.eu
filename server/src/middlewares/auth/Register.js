import ObjectLenght from '../../utilities/ObjectLenght.js';
import regexes from '../../utilities/Regexes.js';

export default function RegisterMiddleware(req, res, next) {
    let { usertag, password, email, fullname, mobile, gender, birthdate } = req.body;
    const lang = req.cookies.language || 'en';
    
    
    if (!usertag) {
        return res.status(400).send(lang === 'hu' ? 'A felhasználónév megadása kötelező.' : 'Usertag is required.');
    }
    if (!password) {
        return res.status(400).send(lang === 'hu' ? 'A jelszó megadása kötelező.' : 'Password is required.');
    }
    if (!email) {
        return res.status(400).send(lang === 'hu' ? 'Az email cím megadása kötelező.' : 'Email is required.');
    }
    if (!mobile) {
        return res.status(400).send(lang === 'hu' ? 'A telefonszám megadása kötelező.' : 'Mobile number is required.');
    }
    if (!fullname) {
        return res.status(400).send(lang === 'hu' ? 'A teljes név megadása kötelező.' : 'Fullname is required.');
    }
    if (!gender) {
        return res.status(400).send(lang === 'hu' ? 'A nem megadása kötelező.' : 'Gender is required.');
    }
    if (!birthdate) {
        return res.status(400).send(lang === 'hu' ? 'A születési dátum megadása kötelező.' : 'Birthdate is required.');
    }

    if (typeof usertag !== 'string') {
        req.body.usertag = usertag.toString();
        usertag = req.body.usertag;
    }
    if (typeof password !== 'string') {
        req.body.password = password.toString();
        password = req.body.password;
    }
    if (typeof email !== 'string') {
        req.body.email = email.toString();
        email = req.body.email;
    }
    if (typeof fullname !== 'string') {
        req.body.fullname = fullname.toString();
        fullname = req.body.fullname;
    }
    if (typeof mobile !== 'string') {
        req.body.mobile = mobile.toString();
        mobile = req.body.mobile;
    }
    if (typeof gender !== 'string') {
        req.body.gender = gender.toString();
        gender = req.body.gender;
    }
    if (typeof birthdate !== 'string') {
        req.body.birthdate = birthdate.toString();
        birthdate = req.body.birthdate;
    }
    if (ObjectLenght(req.body, 8) !== 0) {
        return res.status(400).send(lang === 'hu' ? 'Érvénytelen mezők száma.' : 'Invalid number of fields.');
    }

    if (!regexes.usertag.test(usertag)) {
        return res.status(400).send(lang === 'hu' ? 'A felhasználónév érvénytelen formátumú.' : 'Invalid usertag format.');
    }
    if (!regexes.password.lengthmin.test(password)) {
        return res.status(400).send(lang === 'hu' ? 'A jelszónak legalább 8 karakter hosszúnak kell lennie.' : 'Password must be at least 8 characters long.');
    }
    if (!regexes.password.lengthmax.test(password)) {
        return res.status(400).send(lang === 'hu' ? 'A jelszó legfeljebb 32 karakter hosszúnak lehet.' : 'Password can be at most 32 characters long.');
    }
    if (!regexes.password.lowercase.test(password)) {
        return res.status(400).send(lang === 'hu' ? 'A jelszónak tartalmaznia kell legalább egy kisbetűt.' : 'Password must contain at least one lowercase letter.');
    }
    if (!regexes.password.uppercase.test(password)) {
        return res.status(400).send(lang === 'hu' ? 'A jelszónak tartalmaznia kell legalább egy nagybetűt.' : 'Password must contain at least one uppercase letter.');
    }
    if (!regexes.password.digit.test(password)) {
        return res.status(400).send(lang === 'hu' ? 'A jelszónak tartalmaznia kell legalább egy számot.' : 'Password must contain at least one digit.');
    }
    if (!regexes.password.special.test(password)) {
        return res.status(400).send(lang === 'hu' ? 'A jelszónak tartalmaznia kell legalább egy speciális karaktert.' : 'Password must contain at least one special character.');
    }
    if (!regexes.email.test(email)) {
        return res.status(400).send(lang === 'hu' ? 'Az email cím érvénytelen formátumú.' : 'Invalid email format.');
    }
    if (!regexes.fullname.test(fullname)) {
        return res.status(400).send(lang === 'hu' ? 'A teljes név érvénytelen formátumú.' : 'Invalid fullname format.');
    }
    if (!regexes.mobile.test(mobile)) {
        return res.status(400).send(lang === 'hu' ? 'A telefonszám érvénytelen formátumú.' : 'Invalid mobile number format.');
    }

    next();
}