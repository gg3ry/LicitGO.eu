export default async function Logout(req, res) {
    const lang = req.cookies.language || 'en';
    const authToken = req.cookies.auth;
    if (!authToken) {
        return res.status(400).send(lang === 'hu' ? 'Nincs bejelentkezve.' : 'You are not logged in.');
    }
    res.clearCookie('auth');
    return res.status(200).send(lang === 'hu' ? 'Sikeres kijelentkezés.' : 'Logout successful.');
}