import msql from 'mysql2/promise';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const car_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/cars');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return cb(new Error('Érvénytelen fájltípus'));
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + fileExtension);
  }
});
const profile_pic_storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads/profiles');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const validExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      return cb(new Error('Érvénytelen fájltípus'));
    }
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + fileExtension);
  }
});

const profile_upload = multer({ profile_pic_storage });
const car_upload = multer({ car_storage });
dotenv.config();
const app = express();
const port = 3550;

app.use(cors());
app.use(express.json());


const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 10
};
app.dbConfig = dbConfig;
app.db = msql.createPool(dbConfig);

app.post('/register', profile_upload.single('profile_picture'), async (req, res) => {
  const { usertag, display_name, password_hash, email, fullname, mobile, gender} = req.body;
  const birth_date = new Date(req.body.birth_date);
  const profile_picture = req.file;
  const conn = await app.db.getConnection();

  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length != 8) {
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!usertag || !display_name || !password_hash || !email || !fullname || !mobile || !gender || !birth_date) {
    return res.status(400).json({ error: 'Hiányzó kötelező mezők' });
  }
  else if (typeof usertag !== 'string' || typeof display_name !== 'string' || typeof password_hash !== 'string' || typeof email !== 'string' || typeof fullname !== 'string' || typeof mobile !== 'string' || typeof gender !== 'boolean' || !(birth_date instanceof Date)) {
    return res.status(400).json({ error: 'Érvénytelen mezőtípusok' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE usertag = ?', [usertag]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'A usertag már használatban van' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE email = ?', [email]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'Az e-mail cím már használatban van' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE mobile = ?', [mobile]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'A telefonszám már használatban van' });
  }

  else {
    try {
      const [result] = await app.db.query(
        'INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date]
      );
      await conn.commit();
      await conn.release();
      return res.status(201).json({ message: 'Felhasználó sikeresen regisztrálva', userId: result.insertId });
    } catch (error) {
      console.error('Hiba tortent a felhasznalo regisztracioja kozben:', error);
      await conn.rollback();
      await conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
});

app.post('/login', async (req, res) => {
  const { usertag, email, password_hash } = req.body;
  const conn = await app.db.getConnection();
  if (typeof req.body !== 'object' || req.body === null ) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (Object.keys(req.body).length != 2) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!password_hash) {
    conn.release();
    return res.status(400).json({ error: 'Hiányzó password_hash' });
  }
  else if (typeof password_hash !== 'string') {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen jelszó' });
  }
  else if ((!usertag && !email) || (usertag && email)) {
    conn.release();
    return res.status(400).json({ error: 'Adj meg felhasználónevet (usertag) vagy e-mail címet' });
  }
  else if ((usertag && typeof usertag !== 'string') && (email && typeof email !== 'string')) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen usertag vagy e-mail' });
  }
  else {
    try {
      const [rows] = await app.db.query(
        'SELECT id, usertag, display_name, email FROM users WHERE (usertag = ? OR email = ?) AND password_hash = ?',
        [usertag, email, password_hash]
      );
      conn.release();
      if (rows.length === 0) {
        return res.status(401).json({ error: 'Érvénytelen hitelesítő adatok' });
      }
      return res.status(200).json({ message: 'Sikeres bejelentkezés', user: rows[0] });
    } catch (error) {
      console.error('Hiba tortent a bejelentkezes kozben:', error);
      conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
});
app.get('/auctions', async (req, res) => {
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
});
app.get('/auction/:id', async (req, res) => {
  const conn = await app.db.getConnection();
  const auctionId = req.params.id;
  if (!auctionId) {
    conn.release();
    return res.status(400).json({ error: 'Hiányzó aukció azonosító' });
  }
  else if (isNaN(auctionId)) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen aukció azonosító' });
  }
  try {
    const [auction_rows] = await app.db.query('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    const [car_rows] = await app.db.query('SELECT * FROM cars WHERE auction_id = ?', [auctionId]);
    if (auction_rows.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Aukció nem található' });
    }
    conn.release();
    return res.status(200).json({ auction: auction_rows[0], car: car_rows[0] });
  }
  catch (error) {
    console.error('Hiba tortent az aukcio lekerdezese kozben:', error);
    conn.release();
    return res.status(500).json({ error: 'Belső szerverhiba' });
  }
});
app.post('/cars', car_upload.fields([{ name: 'car_images', maxCount: 50 }]), async (req, res) => {
  const conn = await app.db.getConnection();
  const {
    manufacturer,
    model,
    odometerKM,
    model_year,
    efficiencyHP,
    efficiencyKW,
    engine_capacityCC,
    fuel_type,
    emissionsGKM,
    transmission,
    body_type,
    color,
    doors,
    seats,
    vin,
    max_speedKMH,
    zeroToHundredSec,
    weightKG,
    utility_features,
    safety_features,
    factoryExtras,
    owner_id,
    car_images,
    order_indexes
  } = req.body;
  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length != 22) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!manufacturer || !model || !odometerKM || !model_year || !efficiencyHP || !efficiencyKW || !engine_capacityCC || !fuel_type || !emissionsGKM || !transmission || !body_type || !color || !doors || !seats || !vin || !max_speedKMH || !zeroToHundredSec || !weightKG || !utility_features || !safety_features || !factoryExtras || !owner_id || !car_images || !order_indexes) {
    conn.release();
    return res.status(400).json({ error: 'Hiányzó kötelező mezők' });
  }
  else if (!manufacturer || manufacturer.length === 0 || typeof manufacturer !== 'string') {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen gyártó' });
  }
  else if (!model || model.length === 0 || typeof model !== 'string') {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen modell' });
  }
  else if (isNaN(odometerKM) || odometerKM < 0 || typeof odometerKM !== 'number' || odometerKM % 1 !== 0) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen óraállás (odometerKM)' });
  }
  else if (isNaN(model_year) || model_year < 1900 || typeof model_year !== 'number' || model_year % 1 !== 0 || model_year > new Date().getFullYear() + 1) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen gyártási év' });
  }
  else if (isNaN(engine_capacityCC) || engine_capacityCC <= 0 || typeof engine_capacityCC !== 'number' || engine_capacityCC % 1 !== 0) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen motor térfogata (CC)' });
  }
  else if (!color || color.length === 0 || typeof color !== 'string') {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen szín' });
  }
  else if (isNaN(doors) || doors <= 0 || typeof doors !== 'number' || doors % 1 !== 0 || doors > 7) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen ajtók száma' });
  }
  else if (isNaN(seats) || seats <= 0 || typeof seats !== 'number' || seats % 1 !== 0 || seats > 9) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen ülések száma' });
  }
  else if (!vin || vin.length !== 17 || typeof vin !== 'string') {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen VIN' });
  }
  else if (isNaN(owner_id) || owner_id <= 0 || typeof owner_id !== 'number' || owner_id % 1 !== 0) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen tulajdonos azonosító' });
  }
  else if (!req.files || !req.files['car_images'] || req.files['car_images'].length === 0) {
    conn.release();
    return res.status(400).json({ error: 'Legalább egy autókép szükséges' });
  }
  else if (Array.isArray(order_indexes) && order_indexes.length !== req.files['car_images'].length) {
    conn.release();
    return res.status(400).json({ error: 'A sorrendindexek számának meg kell egyeznie a képek számával' });
  }
  else {
    const currentTime = new Date();
    try {
      const [carU] = await app.db.query(`INSERT INTO cars
        (manufacturer, model, odometerKM, model_year, efficiencyHP, efficiencyKW, 
        engine_capacityCC, fuel_type, emissionsGKM, transmission, body_type, color, doors, seats, vin, max_speedKMH, zeroToHundredSec, 
        weightKG, utility_features, safety_features, factoryExtras, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [manufacturer, model, odometerKM, model_year, efficiencyHP, efficiencyKW, engine_capacityCC,
        fuel_type, emissionsGKM, transmission, body_type, color, doors, seats, vin, max_speedKMH, zeroToHundredSec, weightKG, 
        utility_features, safety_features, factoryExtras, owner_id]
      );
      for (let i = 0; i < req.files['car_images'].length; i++) {
        const file = req.files['car_images'][i];
        const order_index = Array.isArray(order_indexes) ? parseInt(order_indexes[i], 10) : parseInt(order_indexes, 10);
        await app.db.query(`INSERT INTO car_images (car_id, file_path, order_index, uploaded_at) VALUES (?, ?, ?, ?)`,
          [carU.insertId, file.path, order_index, currentTime]
        );
      }
      conn.release();
      return res.status(201).json({ message: 'Autó sikeresen hozzáadva', carId: carU.insertId });
    }
    catch (error) {
      console.error('Hiba tortent az auto hozzaadasa kozben:', error);
      conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
});
app.post('/auctions', async (req, res) => {
  const conn = await app.db.getConnection();
  const { car_id, starting_price, reserve_price, start_time, end_time, status } = req.body;

  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length !== 6) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kérés törzse' });
  }
  else if (!car_id || !starting_price || !start_time || !end_time || !status) {
    conn.release();
    return res.status(400).json({ error: 'Hiányzó kötelező mezők' });
  }
  else if (isNaN(car_id) || car_id <= 0 || typeof car_id !== 'number' || car_id % 1 !== 0) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen car_id' });
  }
  else if (isNaN(starting_price) || starting_price < 0 || typeof starting_price !== 'number') {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kezdőár' });
  }
  else if (reserve_price && (isNaN(reserve_price) || reserve_price < 0 || typeof reserve_price !== 'number')) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen tartalékár' });
  }
  else if (!start_time || isNaN(new Date(start_time).getTime())) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen kezdési idő' });
  }
  else if (!end_time || isNaN(new Date(end_time).getTime())) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen befejezési idő' });
  }
  else if (!['upcoming', 'active', 'completed', 'cancelled'].includes(status)) {
    conn.release();
    return res.status(400).json({ error: 'Érvénytelen státusz' });
  }
  else {
    try {
      const [result] = await app.db.query(`INSERT INTO auctions
        (car_id, starting_price, reserve_price, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [car_id, starting_price, reserve_price, start_time, end_time, status]
      );
      conn.release();
      return res.status(201).json({ message: 'Aukció sikeresen létrehozva', auctionId: result.insertId });
    }
    catch (error) {
      console.error('Hiba tortent az aukcio letrehozasa kozben:', error);
      conn.release();
      return res.status(500).json({ error: 'Belső szerverhiba' });
    }
  }
});






app.use((req, res, next) => {
  res.status(404).json({ error: 'Nem található' });
});
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Valami hiba történt!' });
});
app._router.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => {
  console.log(`Szerver fut a ${port} porton.`);
});