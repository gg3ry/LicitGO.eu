//#region Imports
import msql from 'mysql2/promise';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cron from 'node-cron';
// import * as OTPAuth from "otpauth";
import { Exchanges } from 'modules/utilities.js';
import { GetloginHU, GetauctionsHU, GetauctionsByIdHU, GetMyProfileHU, VerifyEmailCode } from 'modules/apiGET.js';
import { PostCarHU, PostAuctionHU, PostBidHU, RegisterHU, ResetPassword, PasstempcodeHU } from 'modules/apiPOST.js';
//#endregion
//#region Setups
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
    if (file.size > 50 * 1024 * 1024) {
      return cb(new Error('A fájl mérete meghaladja az 50MB megengedett méretet'));
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
    if (file.size > 10 * 1024 * 1024) {
      return cb(new Error('A fájl mérete meghaladja a 10MB megengedett méretet'));
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.dbConfig = dbConfig;
app.db = msql.createPool(dbConfig);
//#endregion
//#region Post Endpoints
app.post('/register', profile_upload.single('profile_picture'), RegisterHU(req, res));
app.post('/reset-password', ResetPassword(req, res));
app.post('/passwordemailcode', PasstempcodeHU(req, res));
app.post('/cars', car_upload.fields([{ name: 'car_images', maxCount: 50 }]), PostCarHU(req, res));
app.post('/auctions', PostAuctionHU(req, res));
app.post('/bids', PostBidHU(req, res));
//#endregion
//#region HUGet Endpoints
app.get('/login', GetloginHU(req, res));
app.get('/auctions', GetauctionsHU(req, res));
app.get('/auction/:id', GetauctionsByIdHU(req, res));
app.get('/myprofile', GetMyProfileHU(req, res));
app.get('/verifycode', VerifyEmailCode(req, res));
//#endregion
//#region Error Handling
app.use((req, res) => {
  res.status(404).json({ error: 'Nem található' });
});
app.use((err, req, res) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Valami hiba történt!' });
});
app._router.use((err, req, res) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
app.listen(port, () => {
  console.log(`Szerver fut a ${port} porton.`);
  console.log('Kapcsolódás adatbázishoz:');
  console.log(`Hoszt: ${dbConfig.host}`);
  console.log(`Felhasználó: ${dbConfig.user}`);
  console.log(`Adatbázis: ${dbConfig.database}`);
  console.log(`==============================`);
  console.log('Server is running on port ' + port);
  console.log('Connecting to database:');
  console.log(`Host: ${dbConfig.host}`);
  console.log(`User: ${dbConfig.user}`);
  console.log(`Database: ${dbConfig.database}`);
  console.log(`==============================`);
});
//#endregion
//#region Scheduled Tasks
cron.schedule('0 6 * * *', async () => {
  try {
    const exchangeRates = await Exchanges('EUR', 'USD');
    const hufToUsdRate = await Exchanges('HUF', 'USD');
    const hufToEurRate = await Exchanges('HUF', 'EUR');
    if (exchangeRates && hufToUsdRate && hufToEurRate) {
      await app.db.query(
        'INSERT INTO exchange_rates (eur_to_usd, huf_to_usd, huf_to_eur, date) VALUES (?, ?, ?, CURDATE())',
        [exchangeRates, hufToUsdRate, hufToEurRate]
      );
      console.log('Exchange rates updated successfully.');
    }
  } catch (err) {
    console.error('Error during exchange rate update:', err);
  }
});
// Daily midnight summary logs: write a file with all actions from the previous day
cron.schedule('0 0 * * *', async () => {
  console.clear();
  try {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const start = new Date(yesterday);
    start.setHours(0, 0, 0, 0);
    const end = new Date(yesterday);
    end.setHours(23, 59, 59, 999);

    const [rows] = await app.db.query(
      'SELECT id, session_token, action_type, action_details, action_time FROM logs WHERE action_time BETWEEN ? AND ? ORDER BY action_time ASC',
      [start, end]
    );

    const logsDir = path.join(__dirname, 'logs');
    await fs.promises.mkdir(logsDir, { recursive: true });

    const year = String(start.getFullYear());
    const month = String(start.getMonth() + 1).padStart(2, '0');
    const day = String(start.getDate()).padStart(2, '0');
    const dateStr = `${year}.${month}.${day}`; // e.g. 2025.02.25
    const filename = path.join(logsDir, `${dateStr}.log`);

    const header = `Log for ${dateStr}\nGenerated at ${now.toISOString()}\n\n`;
    const body = (rows || []).map(r => {
      const time = r.action_time ? new Date(r.action_time).toISOString() : '';
      const details = r.action_details ? r.action_details.replace(/\r?\n/g, ' ') : '';
      return `${time} [${r.action_type}] session:${r.session_token || ''} id:${r.id} ${details}`;
    }).join('\n');

    await fs.promises.writeFile(filename, header + body, 'utf8');
    console.log(`Daily log written: ${filename}`);
    await app.db.query(
      'DELETE FROM logs WHERE action_time < ?',
      [start]
    );
  } catch (err) {
    console.error('Error writing daily log file:', err);
  }
});
//#endregion