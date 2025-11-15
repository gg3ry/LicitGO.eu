import { CheckSessionToken, GetUserID, GetLang } from 'utilities.js';

async function PutCarHU(req, res) {
    const lang = GetLang(req.headers['x-lang']);
    if (!CheckSessionToken(req.headers['x-session-token'])) {
        if (lang === 'HU') {
            return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
        }
        return res.status(401).json({ error: 'Invalid session token.' });
    }
    main();
    async function main() {
        const { car_id } = req.params;
        const { description, utility_features, safety_features, factoryExtras, } = req.body;
        const lang = GetLang(req.headers['x-lang']);
        const conn = await app.db.getConnection();
        if (!car_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Hiányzó kötelező mezők.' });
            }
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (!description && !utility_features && !safety_features && !factoryExtras) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Nincs frissítendő mező megadva.' });
            }
            return res.status(400).json({ error: 'No fields to update provided.' });
        }
        const user_id = await GetUserID(req.headers['x-session-token']);
        if (await app.db.query('SELECT owner_id FROM cars WHERE id = ?', [car_id]).then(([rows]) => rows.length > 0 ? rows : null) === null) {
            conn.release();
            if (lang === 'HU') {
                return res.status(404).json({ error: 'A megadott azonosítóval nem található autó.' });
            }
            return res.status(404).json({ error: 'Car not found with the given ID.' });
        }
        if (await app.db.query('SELECT owner_id FROM cars WHERE id = ?', [car_id]).then(([rows]) => rows.length > 0 ? rows[0].owner_id : null) !== user_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(403).json({ error: 'Nincs jogosultságod az autó adatainak módosításához.' });
            }
            return res.status(403).json({ error: 'You do not have permission to modify the car details.' });
        }
        try {
            await app.db.query('UPDATE cars set description = ?, utility_features = ?, safety_features = ?, factory_extras = ? WHERE id = ?', [
                description || carowner[0].description,
                utility_features || carowner[0].utility_features,
                safety_features || carowner[0].safety_features,
                factoryExtras || carowner[0].factory_extras,
                car_id
            ]);
            conn.release();
            if (lang === 'HU') {
                return res.status(200).json({ message: 'Az autó adatai sikeresen frissítve.' });
            }
            return res.status(200).json({ message: 'Car details updated successfully.' });
        }
        catch (error) {
            conn.release();
            console.error('Error updating car details:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt az autó adatainak frissítése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while updating car details.' });
        }
    }
}

async function PutAuction(req, res) {
    const lang = GetLang(req.headers['x-lang']);
    if (!await CheckSessionToken(req.headers['x-session-token'])) {
            if (lang === 'HU') {
                return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
            }
            return res.status(401).json({ error: 'Invalid session token.' });
        }
        else {
            main();
        }
    async function main() {
        const { auction_id } = req.params;
        const { starting_price, reserve_price, end_time, status } = req.body;
        const conn = await app.db.getConnection();
        if (!auction_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Hiányzó kötelező mezők.' });
            }
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        if (!starting_price && !reserve_price && !end_time && !status) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Nincs frissítendő mező megadva.' });
            }
            return res.status(400).json({ error: 'No fields to update were provided.' });
        }
        if (typeof status !== 'string') {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Az aukció státusza nem módosítható ezen a végponton keresztül.' });
            }
            return res.status(400).json({ error: 'The auction status cannot be modified through this endpoint.' });
        }
        if (!isNaN(starting_price) && starting_price < 0) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'A kezdőár nem lehet negatív érték.' });
            }
            return res.status(400).json({ error: 'The starting price cannot be a negative value.' });
        }
        if (!isNaN(reserve_price) && reserve_price < 0) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'A fenntartási ár nem lehet negatív érték.' });
            }
            return res.status(400).json({ error: 'The reserve price cannot be a negative value.' });
        }
        const user_id = await GetUserID(req.headers['x-session-token']);
        const carID = await app.db.query('SELECT car_id FROM auctions WHERE id = ?', [auction_id]).then(([rows]) => rows.length > 0 ? rows[0].car_id : null);
        if (carID === null) {
            conn.release();
            if (lang === 'HU') {
                return res.status(404).json({ error: 'A megadott azonosítóval nem található aukció.' });
            }
            return res.status(404).json({ error: 'No auction found with the provided ID.' });
        }
        const carOwnerID = await app.db.query('SELECT owner_id FROM cars WHERE id = ?', [carID]).then(([rows]) => rows.length > 0 ? rows[0].owner_id : null);
        if (carOwnerID !== user_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(403).json({ error: 'Nincs jogosultságod az aukció adatainak módosításához.' });
            }
            return res.status(403).json({ error: 'You do not have permission to modify the auction data.' });
        }
        try {
            await app.db.query('UPDATE auctions set starting_price = ?, reserve_price = ?, end_time = ? WHERE id = ?', [
                starting_price || auction[0].starting_price,
                reserve_price || auction[0].reserve_price,
                end_time || auction[0].end_time,
                auction_id
            ]);
            conn.release();
            if (lang === 'HU') {
                return res.status(200).json({ message: 'Az aukció adatai sikeresen frissítve.' });
            }
            return res.status(200).json({ message: 'The auction data has been successfully updated.' });
        }
        catch (error) {
            conn.release();
            console.error('Error updating auction data:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt az aukció adatainak frissítése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while updating the auction data.' });
        }
    }
}

async function PutUser(req, res) {
    const lang = GetLang(req.headers['x-lang']);
    if (!CheckSessionToken(req.headers['x-session-token'])) {
        if (lang === 'HU') {
            return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
        }
        return res.status(401).json({ error: 'Invalid session token.' });
    }
    main();
    async function main() {
        const user_id = await GetUserID(req.headers['x-session-token']);
        const conn = await app.db.getConnection();
        const { display_name, fullname, mobile } = req.body;
        if (!display_name && !fullname && !mobile) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Nincs frissítendő mező megadva.' });
            }
            return res.status(400).json({ error: 'No fields to update were provided.' });
        }
        try {
            await app.db.query('UPDATE users set display_name = ?, fullname = ?, mobile = ? WHERE id = ?', [
                display_name || user[0].display_name,
                fullname || user[0].fullname,
                mobile || user[0].mobile,
                user_id
            ]);
            conn.release();
            if (lang === 'HU') {
                return res.status(200).json({ message: 'A felhasználó adatai sikeresen frissítve.' });
            }
            return res.status(200).json({ message: 'The user data has been successfully updated.' });
        } catch (error) {
            conn.release();
            console.error('Error updating user data:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt a felhasználó adatainak frissítése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while updating the user data.' });
        }
    }
}


exports = { PutCarHU, PutAuction, PutUser };