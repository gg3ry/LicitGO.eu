import { CheckSessionToken, GetLang } from 'utilities.js';
import { hash } from 'argon2';

async function GetloginHU(req, res) {
  const { usertag, email, password_hash } = req.query;
  const conn = await app.db.getConnection();
  const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
  if (typeof req.query !== 'object' || req.query === null ) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen kérés paraméterei' });
    }
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  else if (Object.keys(req.query).length != 2) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen kérés paraméterei' });
    }
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  else if (!password_hash) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Hiányzó jelszó' });
    }
    return res.status(400).json({ error: 'Missing password' });
  }
  else if (typeof password_hash !== 'string') {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen jelszó' });
    }
    return res.status(400).json({ error: 'Invalid password' });
  }
  else if ((!usertag && !email) || (usertag && email)) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Adj meg felhasználónevet (usertag) vagy e-mail címet' });
    }
    return res.status(400).json({ error: 'Provide either a usertag or an email address' });
  }
  else if ((usertag && typeof usertag !== 'string') && (email && typeof email !== 'string')) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen usertag vagy e-mail' });
    }
    return res.status(400).json({ error: 'Invalid usertag or email' });
  }
  else {
    try {
      const [rows] = await app.db.query(
        'SELECT id, usertag, display_name, email FROM users WHERE (usertag = ? OR email = ?) AND password_hash = ?',
        [usertag, email, await hash(password_hash)]
      );
      conn.release();
      if (rows.length === 0) {
        if (lang === 'HU') {
          return res.status(401).json({ error: 'Érvénytelen hitelesítő adatok' });
        }
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      async function generateSessionToken() {
        const token = require('crypto').randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await app.db.query(
          'INSERT INTO sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)',
          [rows[0].id, token, expiresAt]
        );
        return token;
      }
      const sessionToken = await generateSessionToken();
      await app.db.query(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [rows[0].id]
      );
      await app.db.query('INSERT INTO logs (user_id, action, timestamp) VALUES (?, ?, NOW())', [
        rows[0].id, 'login' ]);
      return res.status(200).json({ message: 'Sikeres bejelentkezés', user: rows[0], session_token: sessionToken });
    } catch (error) {
      console.error('Hiba tortent a bejelentkezes kozben:', error);
      conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
}

async function GetauctionsHU(req, res) {
  const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
  if (!(await CheckSessionToken(req.headers['x-session-token']))) {
    if (lang === 'HU') {
      return res.status(401).json({ error: 'Érvénytelen munkamenet token' });
    }
    return res.status(401).json({ error: 'Invalid session token' });
  }
  main();
  async function main() {
  const query = req.query;
  const conn = await app.db.getConnection();
  try {
    const allowed = new Set([
      'status',
      'manufacturer',
      'model',
      'odometerKM',
      'model_year',
      'efficiencyHP',
      'efficiencyKW',
      'engine_capacityCC',
      'fuel_type',
      'emissionsGKM',
      'transmission',
      'body_type',
      'color',
      'doors',
      'seats',
      'vin',
      'max_speedKMH',
      'zeroToHundredSec',
      'weightKG',
      'utility_features',
      'safety_features',
      'factoryExtras',
      'current_price'
    ]);

    const numericKeys = new Set([
      'odometerKM','model_year','efficiencyHP','efficiencyKW','engine_capacityCC',
      'emissionsGKM','doors','seats','max_speedKMH','zeroToHundredSec','weightKG','current_price'
    ]);

    const stringLikeKeys = new Set([
      'manufacturer','model','fuel_type','transmission','body_type','color','vin',
      'utility_features','safety_features','factoryExtras'
    ]);

    const where = [];
    const params = [];

    for (const [key, raw] of Object.entries(query)) {
      if (!allowed.has(key) || raw === undefined || raw === null || String(raw).trim() === '') continue;
      const val = String(raw).trim();
      if (key === 'status') {
        where.push('auctions.status = ?');
        params.push(val);
        continue;
      }

      if (stringLikeKeys.has(key)) {
        const parts = val.split(',').map(s => s.trim()).filter(Boolean);
        if (parts.length === 1) {
          where.push(`cars.${key} LIKE ?`);
          params.push(`%${parts[0]}%`);
        } else {
          where.push(`cars.${key} IN (${parts.map(() => '?').join(',')})`);
          params.push(...parts);
        }
        continue;
      }
      if (numericKeys.has(key)) {
        if (val.includes(',')) {
          const parts = val.split(',').map(s => s.trim()).filter(Boolean);
          if (parts.length === 2 && parts[0] !== '' && parts[1] !== '') {
            const min = Number(parts[0]);
            const max = Number(parts[1]);
            if (!isNaN(min)) { where.push(`cars.${key} >= ?`); params.push(min); }
            if (!isNaN(max)) { where.push(`cars.${key} <= ?`); params.push(max); }
            const nums = parts.map(n => Number(n)).filter(n => !isNaN(n));
            if (nums.length > 0) {
              where.push(`cars.${key} IN (${nums.map(() => '?').join(',')})`);
              params.push(...nums);
            }
          } else {
            const n = Number(parts[0]);
            if (!isNaN(n)) { where.push(`cars.${key} = ?`); params.push(n); }
          }
        } else if (val.includes('-')) {
          const parts = val.split('-').map(s => s.trim());
          const min = Number(parts[0]);
          const max = Number(parts[1]);
          if (!isNaN(min)) { where.push(`cars.${key} >= ?`); params.push(min); }
          if (!isNaN(max)) { where.push(`cars.${key} <= ?`); params.push(max); }
        } else {
          const n = Number(val);
          if (!isNaN(n)) {
            where.push(`cars.${key} = ?`);
            params.push(n);
          }
        }
        continue;
      }
      if (key === 'current_price') {
        const n = Number(val);
        if (!isNaN(n)) {
          where.push(`auctions.current_price = ?`);
          params.push(n);
        }
      }
    }

    const carCols = [
      'id','manufacturer','model','odometerKM','model_year','efficiencyHP','efficiencyKW',
      'engine_capacityCC','fuel_type','emissionsGKM','transmission','body_type','color',
      'doors','seats','vin','max_speedKMH','zeroToHundredSec','weightKG','utility_features',
      'safety_features','factoryExtras','owner_id','auction_id'
    ];
    const carSelect = carCols.map(c => `cars.${c} AS car_${c}`).join(', ');

    const whereSql = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const sql = `SELECT auctions.*, ${carSelect} FROM auctions JOIN cars ON cars.auction_id = auctions.id ${whereSql} ORDER BY auctions.start_time DESC`;

    const [rows] = await app.db.query(sql, params);
    conn.release();
    const results = rows.map(r => {
      const auction = {};
      const car = {};
      for (const k of Object.keys(r)) {
        if (k.startsWith('car_')) {
          car[k.slice(4)] = r[k];
        } else {
          auction[k] = r[k];
        }
      }
      return { auction, car };
    });

    return res.status(200).json({ results });
  } catch (error) {
    console.error('Hiba tortent az aukciok lekerdezese kozben:', error);
    conn.release();
    return res.status(500).json({ error: 'Belső szerverhiba' });
  }
}
}

async function GetauctionsByIdHU(req, res) {
  const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
  if (!(await CheckSessionToken(req.headers['x-session-token']))) {
    if (lang === 'HU') {
      return res.status(401).json({ error: 'Érvénytelen munkamenet token' });
    }
    return res.status(401).json({ error: 'Invalid session token' });
  }
  const conn = await app.db.getConnection();
  const auctionId = req.params.id;
  if (!auctionId) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Hiányzó aukció azonosító' });
    }
    return res.status(400).json({ error: 'Missing auction ID' });
  }
  else if (isNaN(auctionId)) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen aukció azonosító' });
    }
    return res.status(400).json({ error: 'Invalid auction ID' });
  }
  try {
    const [auction_rows] = await app.db.query('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    const [car_rows] = await app.db.query('SELECT * FROM cars WHERE auction_id = ?', [auctionId]);
    if (auction_rows.length === 0) {
      conn.release();
      if (lang === 'HU') {
        return res.status(404).json({ error: 'Aukció nem található' });
      }
      return res.status(404).json({ error: 'Auction not found' });
    }
    conn.release();
    return res.status(200).json({ auction: auction_rows[0], car: car_rows[0] });
  }
  catch (error) {
    if (lang === 'HU') {
      console.error('Hiba tortent az aukcio lekerdezese kozben:', error);
      conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
    console.error('Error occurred while fetching auction:', error);
    conn.release();
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function GetMyProfileHU(req, res) {
  const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
  if (!(await CheckSessionToken(req.headers['x-session-token']))) {
    if (lang === 'HU') {
      return res.status(401).json({ error: 'Érvénytelen munkamenet token' });
    }
    return res.status(401).json({ error: 'Invalid session token' });
  }
  main();
  async function main() {
  const conn = await app.db.getConnection();
    try {
      const sessionToken = req.headers['x-session-token'];
      const [userRows] = await app.db.query(
        `SELECT id, usertag, display_name, email, created_at FROM users WHERE id = (
          SELECT user_id FROM sessions WHERE session_token = ?
        )`,
        [sessionToken]
      );
      if (userRows.length === 0) {
        conn.release();
        if (lang === 'HU') {
          return res.status(404).json({ error: 'Felhasználó nem található' });
        }
        return res.status(404).json({ error: 'User not found' });
      }
      const user = userRows[0];
      try {
        const [profilePicRows] = await app.db.query(
          `SELECT file_path FROM profile_pictures WHERE user_id = ? ORDER BY uploaded_at DESC LIMIT 1`,
          [user.id]
        );
        var profilepicture = profilePicRows.length > 0 ? profilePicRows[0].file_path : null;
      } catch (error) {
        console.error('Error occurred while fetching profile picture:', error);
      }

      user.profile_picture = profilepicture;
      const [auctionRows] = await app.db.query(
        `SELECT auctions.*, cars.* FROM auctions
         JOIN cars ON cars.auction_id = auctions.id
         WHERE cars.owner_id = ?`,
        [user.id]
      );
      conn.release();
      return res.status(200).json({ user: user, auctions: auctionRows, profile_picture: profilepicture });
    } catch (error) {
      console.error('Error occurred while fetching profile:', error);
      conn.release();
      if (lang === 'HU') {
        return res.status(500).json({ error: 'Belső szerverhiba' });
      }
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}

async function VerifyEmailCode(req, res) {
  const lang = (await GetLang(req.headers['x-lang'])).toUpperCase();
  const conn = await app.db.getConnection();
  const { code } = req.query;
  if (typeof req.query !== 'object' || req.query === null || Object.keys(req.query).length < 1) {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen kérés paraméterei' });
    }
    return res.status(400).json({ error: 'Invalid request parameters' });
  }
  if (!code || typeof code !== 'string') {
    conn.release();
    if (lang === 'HU') {
      return res.status(400).json({ error: 'Érvénytelen kód' });
    }
    return res.status(400).json({ error: 'Invalid code' });
  }
  try {
    const [rows] = await app.db.query('SELECT * FROM email_codes WHERE code = ?', [code]);
    conn.release();
    if (rows.length === 0) {
      return res.status(404).json({ valid: false, message: 'Érvénytelen kód' });
    }
    return res.status(200).json({ valid: true, message: 'Érvényes kód' });
  } catch (error) {
    console.error('Error occurred while verifying code:', error);
    conn.release();
    if (lang === 'HU') {
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}

exports = { GetloginHU, GetauctionsHU, GetauctionsByIdHU, GetMyProfileHU, VerifyEmailCode };