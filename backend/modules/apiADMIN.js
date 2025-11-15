import { CheckSessionToken, GetUserID, CheckIfAdmin, GetLang, SendEmail, GetCurrency, TodaysExchangeRates } from 'utilities.js';

async function SuspendUser(req, res) {
    const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
    if (!CheckSessionToken(req.headers['x-session-token'])) {
        if (lang === 'HU') {
            return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
        }
        return res.status(401).json({ error: 'Invalid session token.' });
    }
    else {
        main();
    }
    async function main() {
        const { target_user_id } = req.params;
        const { reason, send_notification = true } = req.body;
        const conn = await app.db.getConnection();
        const user_id = await GetUserID(req.headers['x-session-token']);
        if (!await CheckIfAdmin(user_id)) {
            conn.release();
            if (lang === 'HU') {
                return res.status(403).json({ error: 'Nincs jogosultságod felhasználók felfüggesztéséhez.' });
            }
            return res.status(403).json({ error: 'You do not have permission to suspend users.' });
        }
        if (!target_user_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Hiányzó kötelező mezők.' });
            }
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        try {
            const [result] = await app.db.query('UPDATE users SET type = ? WHERE id = ?', ['suspended', target_user_id]);
            if (result.affectedRows === 0) {
                conn.release();
                if (lang === 'HU') {
                    return res.status(404).json({ error: 'A megadott azonosítóval nem található felhasználó.' });
                }
                return res.status(404).json({ error: 'User not found with the given ID.' });
            }
            if (send_notification) {
                const [userRows] = await app.db.query('SELECT email, display_name FROM users WHERE id = ?', [target_user_id]);
                if (userRows.length > 0) {
                    const [data] = await app.db.query('SELECT language FROM user_settings WHERE user_id = ?', [target_user_id]);
                    const user_lang = data.length > 0 ? data[0].language : 'EN';
                    const userEmail = userRows[0].email;
                    const userDisplayName = userRows[0].display_name;
                    let subject, html;
                    if (user_lang === 'HU') {
                        subject = 'Fiók felfüggesztve';
                        html = `
                        <div class="email-container">
                            <div class="email-header">
                                <h2>Kedves ${userDisplayName}!</h2>
                            </div>
                            <div class="email-content">
                                <p>A fiókodat a következő okból felfüggesztettük: ${reason || 'Nincs megadva ok'}.</p>
                                <p>Ha úgy gondolod, hogy ez tévedés, kérjük, lépj kapcsolatba ügyfélszolgálatunkkal.</p>
                            </div>
                            <div class="email-footer">
                                <p>Köszönjük, hogy a LicitGO-t használod!</p>
                            </div>
                        </div>  
                    `}
                    else {
                        subject = 'Account Suspended';
                        html = `
                        <div class="email-container">
                            <div class="email-header">
                                <h2>Dear ${userDisplayName}!</h2>
                            </div>
                            <div class="email-content">
                                <p>Your account has been suspended for the following reason: ${reason || 'No reason provided'}.</p>
                                <p>If you believe this is a mistake, please contact our support team.</p>
                            </div>
                            <div class="email-footer">
                                <p>Thank you for using LicitGO!</p>
                            </div>
                        </div>  
                    `}
                    await SendEmail(userEmail, subject, html);
                }
            }
            conn.release();
            if (lang === 'HU') {
                return res.status(200).json({ message: 'Felhasználó sikeresen felfüggesztve.' });
            }
            return res.status(200).json({ message: 'User successfully suspended.' });
        } catch (error) {
            conn.release();
            console.error('Error occurred while suspending the user:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt a felhasználó felfüggesztése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while suspending the user.' });
        }
    }
}

async function UnsuspendUser(req, res) {
    const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
    if (!CheckSessionToken(req.headers['x-session-token'])) {
        if (lang === 'HU') {
            return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
        }
        return res.status(401).json({ error: 'Invalid session token.' });
    }
    else {
        main();
    }
    async function main() {
        const { target_user_id } = req.params;
        const { reason, send_notification = true } = req.body;
        const conn = await app.db.getConnection();
        const user_id = await GetUserID(req.headers['x-session-token']);
        if (!await CheckIfAdmin(user_id)) {
            conn.release();
            if (lang === 'HU') {
                return res.status(403).json({ error: 'Nincs jogosultságod felhasználók felfüggesztésének feloldásához.' });
            }
            return res.status(403).json({ error: 'You do not have permission to lift user suspensions.' });
        }
        if (!target_user_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Hiányzó kötelező mezők.' });
            }
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        try {
            const [result] = await app.db.query('UPDATE users SET type = ? WHERE id = ?', ['verified', target_user_id]);
            if (result.affectedRows === 0) {
                conn.release();
                if (lang === 'HU') {
                    return res.status(404).json({ error: 'A megadott azonosítóval nem található felhasználó.' });
                }
                return res.status(404).json({ error: 'User not found with the provided ID.' });
            }
            if (send_notification) {
                const [userRows] = await app.db.query('SELECT email, display_name FROM users WHERE id = ?', [target_user_id]);
                if (userRows.length > 0) {
                    const [data] = await app.db.query('SELECT language FROM user_settings WHERE user_id = ?', [target_user_id]);
                    const user_lang = data.length > 0 ? data[0].language : 'EN';
                    const userEmail = userRows[0].email;
                    const userDisplayName = userRows[0].display_name;
                    let subject, html;
                    if (user_lang === 'HU') {
                        subject = 'Fiók felfüggesztésének feloldva';
                        html = `
                        <div class="email-container">
                            <div class="email-header">
                                <h2>Kedves ${userDisplayName}!</h2>
                            </div>
                            <div class="email-content">
                                <p> A fiokja felfüggesztése feloldásra került.</p>
                                <p>Most már újra hozzáférhetsz a fiókodhoz és használhatod szolgáltatásainkat.</p>
                                <h4>Miért került sor a fiók felfüggesztésének feloldására?</h4>
                                <p>${reason || 'Nincs megadva ok'}.</p>
                            </div>
                            <div class="email-footer">
                                <p>Köszönjük, hogy a LicitGO-t használod!</p>
                            </div>
                        </div>  
                    `}
                    else {
                        subject = 'Account Suspension Lifted';
                        html = `
                        <div class="email-container">
                            <div class="email-header">
                                <h2>Dear ${userDisplayName}!</h2>
                            </div>
                            <div class="email-content">
                                <p>Your account suspension has been lifted.</p>
                                <p>You can now access your account again and use our services.</p>
                                <h4>Why was the account suspension lifted?</h4>
                                <p>${reason || 'No reason provided'}.</p>
                            </div>
                            <div class="email-footer">
                                <p>Thank you for using LicitGO!</p>
                            </div>
                        </div>  
                    `}
                    await SendEmail(userEmail, subject, html);
                }
            }
            conn.release();
            if (lang === 'HU') {
                return res.status(200).json({ message: 'Felhasználó felfüggesztése sikeresen feloldva.' });
            }
            return res.status(200).json({ message: 'User suspension successfully lifted.' });
        } catch (error) {
            conn.release();
            console.error('Error during user unsuspension:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt a felhasználó ellenőrzése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while verifying the user.' });
        }
    }
}

async function VerifyUser(req, res) {
    const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
    if (!CheckSessionToken(req.headers['x-session-token'])) {
        if (lang === 'HU') {
            return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
        }
        return res.status(401).json({ error: 'Invalid session token.' });
    }
    else {
        main();
    }
    async function main() {
        const { target_user_id } = req.params;
        const conn = await app.db.getConnection();
        const user_id = await GetUserID(req.headers['x-session-token']);
        if (!await CheckIfAdmin(user_id)) {
            conn.release();
            return res.status(403).json({ error: 'Nincs jogosultságod felhasználók ellenőrzéséhez.' });
        }
        if (!target_user_id) {
            conn.release();
            return res.status(400).json({ error: 'Hiányzó kötelező mezők.' });
        }
        try {
            const [result] = await app.db.query('UPDATE users SET type = ? WHERE id = ?', ['verified', target_user_id]);
            if (result.affectedRows === 0) {
                conn.release();
                if (lang === 'HU') {
                return res.status(404).json({ error: 'A megadott azonosítóval nem található felhasználó.' });
                }
                return res.status(404).json({ error: 'User not found with the given ID.' });
            }
            conn.release();
            return res.status(200).json({ message: 'Felhasználó sikeresen ellenőrizve.' });
        } catch (error) {
            conn.release();
            console.error('Hiba a felhasználó ellenőrzése során:', error);
            return res.status(500).json({ error: 'Hiba történt a felhasználó ellenőrzése során.' });
        }
    }
}

async function cancelAuction(req, res) {
    const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
    if (!CheckSessionToken(req.headers['x-session-token'])) {
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
        const { reason } = req.body;
        const conn = await app.db.getConnection();
        const user_id = await GetUserID(req.headers['x-session-token']);
        if (!await CheckIfAdmin(user_id)) {
            conn.release();
            if (lang === 'HU') {
                return res.status(403).json({ error: 'Nincs jogosultságod hirdetések törléséhez.' });
            }
            return res.status(403).json({ error: 'You do not have permission to delete listings.' });
        }
        if (!auction_id) {
            conn.release();
            if (lang === 'HU') {
                return res.status(400).json({ error: 'Hiányzó kötelező mezők.' });
            }
            return res.status(400).json({ error: 'Missing required fields.' });
        }
        try {
            const car_id = await app.db.query('SELECT car_id, owner_id FROM auctions WHERE id = ?', [auction_id]);
            const [result] = await app.db.query('DELETE FROM auctions WHERE id = ?', [auction_id]);
            if (result.affectedRows === 0) {
                conn.release();
                if (lang === 'HU') {
                    return res.status(404).json({ error: 'A megadott azonosítóval nem található hirdetés.' });
                }
                return res.status(404).json({ error: 'Listing not found with the given ID.' });
            }
            await app.db.query('DELETE FROM cars WHERE id = ?', [car_id[0].car_id]);
            const [ owner ] = await app.db.query('SELECT email, display_name FROM users WHERE id = ?', [car_id[0].owner_id]);
            if (owner.length > 0) {
                const ownerEmail = owner[0].email;
                const ownerDisplayName = owner[0].display_name;
                let subject, html;
                if (lang === 'HU') {
                    subject = 'Hirdetés törölve';
                    html = `
                    <div class="email-container">
                        <div class="email-header">
                            <h2>Kedves ${ownerDisplayName}!</h2>
                        </div>
                        <div class="email-content">
                            <p>A hirdetésedet a következő okból töröltük: ${reason || 'Nincs megadva ok'}.</p>
                            <p>Ha úgy gondolod, hogy ez tévedés, kérjük, lépj kapcsolatba ügyfélszolgálatunkkal.</p>
                        </div>
                        <div class="email-footer">
                            <p>Köszönjük, hogy a LicitGO-t használod!</p>
                        </div>
                    </div>  
                `}
                else {
                    subject = 'Listing Deleted';
                    html = `
                    <div class="email-container">
                        <div class="email-header">
                            <h2>Dear ${ownerDisplayName}!</h2>
                        </div>
                        <div class="email-content">
                            <p>Your listing has been deleted for the following reason: ${reason || 'No reason provided'}.</p>
                            <p>If you believe this is a mistake, please contact our support team.</p>
                        </div>
                        <div class="email-footer">
                            <p>Thank you for using LicitGO!</p>
                        </div>
                    </div>  
                `}
                await SendEmail(ownerEmail, subject, html);
                const [ imageRows ] = await app.db.query('SELECT file_path FROM car_images WHERE car_id = ?', [car_id[0].car_id]);
                for (const row of imageRows) {
                    const fs = require('fs');
                    fs.unlink(row.file_path, (err) => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        }
                    });
                }
                await app.db.query('DELETE FROM car_images WHERE car_id = ?', [car_id[0].car_id]);
                const [ bidRows ] = await app.db.query('SELECT id, bid_amount, bidder_id FROM bids WHERE auction_id = ?', [auction_id]);
                for (const bid of bidRows) {
                    const [ bidder ] = await app.db.query('SELECT email, display_name FROM users WHERE id = ?', [bid.bidder_id]);
                    if (bidder.length > 0) {
                        const bidderEmail = bidder[0].email;
                        const bidderDisplayName = bidder[0].display_name;
                        let bidSubject, bidHtml;
                        if (lang === 'HU') {
                            bidSubject = 'Lemondott licit értesítés';
                            bidHtml = `
                            <div class="email-container">
                                <div class="email-header">
                                    <h2>Kedves ${bidderDisplayName}!</h2>
                                </div>
                                <div class="email-content">
                                    <p>A licitedet a következő okból töröltük: ${reason || 'Nincs megadva ok'}.</p>
                                    <p>Ha úgy gondolod, hogy ez tévedés, kérjük, lépj kapcsolatba ügyfélszolgálatunkkal.</p>
                                    <p> Ön <b>${bid.bid_amount} Ft</b> összeget licitált erre a hirdetésre.</p>
                                </div>
                                <div class="email-footer">
                                    <p>Köszönjük, hogy a LicitGO-t használod!</p>
                                </div>
                            </div>  
                        `}
                        else {
                            bidSubject = 'Bid Cancellation Notice';
                            bidHtml = `
                            <div class="email-container">
                                <div class="email-header">
                                    <h2>Dear ${bidderDisplayName}!</h2>
                                </div>
                                <div class="email-content">
                                    <p>Your bid has been deleted for the following reason: ${reason || 'No reason provided'}.</p>
                                    <p>If you believe this is a mistake, please contact our support team.</p>
                                    <p>You had placed a bid of <b>${bid.bid_amount} HUF</b> on this listing.</p>
                                </div>
                                <div class="email-footer">
                                    <p>Thank you for using LicitGO!</p>
                                </div>
                            </div>  
                        `}
                        await SendEmail(bidderEmail, bidSubject, bidHtml);
                    }   
                }
                await app.db.query('DELETE FROM bids WHERE auction_id = ?', [auction_id]);
                aw
            }
            else {
                        console.error('Owner not found for the deleted listing.');
                        res.status(500).json({ error: 'Error notifying the listing owner.' });
                    }
        } catch (error) {
            conn.release();
            console.error('Error during listing deletion:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt a hirdetés törlése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while deleting the listing.' });
        }
    }
}

async function getAdminStats(req, res) {
    const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
    const currency = (await GetCurrency(req.headers['x-currency'])).toUpperCase();
    if (!CheckSessionToken(req.headers['x-session-token'])) {
        if (lang === 'HU') {
            return res.status(401).json({ error: 'Érvénytelen munkamenet token.' });
        }
        return res.status(401).json({ error: 'Invalid session token.' });
    }
    else {
        main();
    }
    async function main() {
        const conn = await app.db.getConnection();
        const user_id = await GetUserID(req.headers['x-session-token']);
        if (!await CheckIfAdmin(user_id)) {
            conn.release();
            if (lang === 'HU') {
                return res.status(403).json({ error: 'Nincs jogosultságod admin statisztikák lekéréséhez.' });
            }
            return res.status(403).json({ error: 'You do not have permission to access admin statistics.' });
        }
        try {
            const [userCountRows] = await app.db.query('SELECT COUNT(*) AS user_count FROM users');
            const [ auctionsLast30Days ] = await app.db.query('SELECT COUNT(*) AS auction_count FROM auctions WHERE created_at >= NOW() - INTERVAL 30 DAY');
            const [ auctionsLast24Hours ] = await app.db.query('SELECT COUNT(*) AS auction_count FROM auctions WHERE created_at >= NOW() - INTERVAL 24 HOUR');
            const [ auctionsLast3months ] = await app.db.query('SELECT COUNT(*) AS auction_count FROM auctions WHERE created_at >= NOW() - INTERVAL 3 MONTH');
            const [ moneyLast30Days ] = await app.db.query('SELECT IFNULL(SUM(bid_amount), 0) AS total_revenue FROM bids WHERE created_at >= NOW() - INTERVAL 30 DAY');
            const [ moneyLast24Hours ] = await app.db.query('SELECT IFNULL(SUM(bid_amount), 0) AS total_revenue FROM bids WHERE created_at >= NOW() - INTERVAL 24 HOUR');
            const [ moneyLast3months ] = await app.db.query('SELECT IFNULL(SUM(bid_amount), 0) AS total_revenue FROM bids WHERE created_at >= NOW() - INTERVAL 3 MONTH');
            const [ finalizedAuctionsCountRows ] = await app.db.query('SELECT COUNT(*) AS finalized_auctions_count FROM auctions WHERE status = ?', ['finalized']);
            const [ finalizedAuctionsRevenueRows ] = await app.db.query('SELECT IFNULL(SUM(final_price), 0) AS finalized_auctions_revenue FROM auctions WHERE status = ?', ['finalized']);
            let conversionRate = 1;
            if (currency !== 'USD') {
                const exchangeRates = await TodaysExchangeRates();
                if (exchangeRates) {
                    
                    if (currency === 'HUF') {
                        conversionRate = exchangeRates.huf_to_usd;
                    } else if (currency === 'EUR') {
                        conversionRate = exchangeRates.eur_to_usd;
                    }
                }
            }
            conn.release();
            return res.status(200).json({
                total_users: userCountRows[0].user_count,
                auctions_last_30_days: auctionsLast30Days[0].auction_count,
                auctions_last_24_hours: auctionsLast24Hours[0].auction_count,
                auctions_last_3_months: auctionsLast3months[0].auction_count,
                revenue_last_30_days: moneyLast30Days[0].total_revenue * conversionRate,
                revenue_last_24_hours: moneyLast24Hours[0].total_revenue * conversionRate,
                revenue_last_3_months: moneyLast3months[0].total_revenue * conversionRate,
                finalized_auctions_count: finalizedAuctionsCountRows[0].finalized_auctions_count,
                finalized_auctions_revenue: finalizedAuctionsRevenueRows[0].finalized_auctions_revenue * conversionRate
            });
        } catch (error) {
            conn.release();
            console.error('Error fetching admin statistics:', error);
            if (lang === 'HU') {
                return res.status(500).json({ error: 'Hiba történt az admin statisztikák lekérése során.' });
            }
            return res.status(500).json({ error: 'An error occurred while fetching admin statistics.' });
        }
    }
}

export { SuspendUser, UnsuspendUser, VerifyUser, getAdminStats, cancelAuction };