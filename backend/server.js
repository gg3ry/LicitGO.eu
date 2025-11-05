import msql from 'mysql2/promise';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
/* import multer from 'multer';
import fs from 'fs';
import path from 'path'; */




dotenv.config();
const app = express();
const port = process.env.PORT || 3550;

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

app.post('/register', async (req, res) => {
  const { usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date, preferred_language } = req.body;
  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length != 9) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  else if (!usertag || !display_name || !password_hash || !email || !fullname || !mobile || !gender || !birth_date || !preferred_language) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  else if (typeof usertag !== 'string' || typeof display_name !== 'string' || typeof password_hash !== 'string' || typeof email !== 'string' || typeof fullname !== 'string' || typeof mobile !== 'string' || typeof gender !== 'boolean' || !(birth_date instanceof Date) || typeof preferred_language !== 'string') {
    return res.status(400).json({ error: 'Invalid field types' });
  }
  else if (typeof preferred_language !== 'string' || preferred_language.length === 0 || preferred_language.length > 3 ) {
    return res.status(400).json({ error: 'Invalid Preferred Language' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE usertag = ?', [usertag]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'Usertag already in use' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE email = ?', [email]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'Email already in use' });
  }
  else if (await app.db.query('SELECT id FROM users WHERE mobile = ?', [mobile]).then(([rows]) => rows.length > 0)) {
    return res.status(409).json({ error: 'Mobile number already in use' });
  }

  else {
    try {
      const [result] = await app.db.query(
        'INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date, preferred_language) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date, preferred_language]
      );
      if (preferred_language)
      return res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
      console.error('Error registering user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.get('/login', async (req, res) => {
  const { usertag, email, password_hash } = req.body;
  if (Object.keys(req.body).length != 2) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  else if (!usertag || !email) {
    return res.status(400).json({ error: 'Missing usertag or email' });
  }

  else if (!password_hash) {
    return res.status(400).json({ error: 'Missing password_hash' });
  }
  else if (typeof usertag !== 'string' || typeof email !== 'string' || typeof password_hash !== 'string') {
    return res.status(400).json({ error: 'Invalid field types' });
  }
  else if (usertag) {
    const [rows] = await app.db.query('SELECT * FROM users WHERE usertag = ? AND password_hash = ?', [usertag, password_hash]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid usertag or password' });
    }
    return res.status(200).json({ message: 'Login successful', user: rows[0] });
  }
  else if (email) {
    const [rows] = await app.db.query('SELECT * FROM users WHERE email = ? AND password_hash = ?', [email, password_hash]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    return res.status(200).json({ message: 'Login successful', user: rows[0] });
  }
});
app.get('/auctions', async (req, res) => {
  try {
    const [auction_rows] = await app.db.query('SELECT * FROM auctions');
    const [car_rows] = await app.db.query('SELECT * FROM cars');
    return res.status(200).json({ auctions: auction_rows, cars: car_rows });
  }
  catch (error) {
    console.error('Error fetching auctions:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.get('/auction/:id', async (req, res) => {
  const auctionId = req.params.id;
  if (!auctionId) {
    return res.status(400).json({ error: 'Missing auction ID' });
  }
  else if (isNaN(auctionId)) {
    return res.status(400).json({ error: 'Invalid auction ID' });
  }
  try {
    const [auction_rows] = await app.db.query('SELECT * FROM auctions WHERE id = ?', [auctionId]);
    const [car_rows] = await app.db.query('SELECT * FROM cars WHERE auction_id = ?', [auctionId]);
    if (auction_rows.length === 0) {
      return res.status(404).json({ error: 'Auction not found' });
    }
    return res.status(200).json({ auction: auction_rows[0], car: car_rows[0] });
  }
  catch (error) {
    console.error('Error fetching auction:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
app.post('/cars', async (req, res) => {
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
    owner_id
  } = req.body;
  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length != 22) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  else if (!manufacturer || !model || !odometerKM || !model_year || !efficiencyHP || !efficiencyKW || !engine_capacityCC || !fuel_type || !emissionsGKM || !transmission || !body_type || !color || !doors || !seats || !vin || !max_speedKMH || !zeroToHundredSec || !weightKG || !utility_features || !safety_features || !factoryExtras || !owner_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  else if (!manufacturer || manufacturer.length === 0 || typeof manufacturer !== 'string') {
    return res.status(400).json({ error: 'Invalid manufacturer' });
  }
  else if (!model || model.length === 0 || typeof model !== 'string') {
    return res.status(400).json({ error: 'Invalid model' });
  }
  else if (isNaN(odometerKM) || odometerKM < 0 || typeof odometerKM !== 'number' || odometerKM % 1 !== 0) {
    return res.status(400).json({ error: 'Invalid odometerKM' });
  }
  else if (isNaN(model_year) || model_year < 1900 || typeof model_year !== 'number' || model_year % 1 !== 0 || model_year > new Date().getFullYear() + 1) {
    return res.status(400).json({ error: 'Invalid model_year' });
  }
  else if (isNaN(engine_capacityCC) || engine_capacityCC <= 0 || typeof engine_capacityCC !== 'number' || engine_capacityCC % 1 !== 0) {
    return res.status(400).json({ error: 'Invalid engine_capacityCC' });
  }
  else if (!color || color.length === 0 || typeof color !== 'string') {
    return res.status(400).json({ error: 'Invalid color' });
  }
  else if (isNaN(doors) || doors <= 0 || typeof doors !== 'number' || doors % 1 !== 0 || doors > 7) {
    return res.status(400).json({ error: 'Invalid doors' });
  }
  else if (isNaN(seats) || seats <= 0 || typeof seats !== 'number' || seats % 1 !== 0 || seats > 9) {
    return res.status(400).json({ error: 'Invalid seats' });
  }
  else if (!vin || vin.length !== 17 || typeof vin !== 'string') {
    return res.status(400).json({ error: 'Invalid vin' });
  }
  else if (isNaN(owner_id) || owner_id <= 0 || typeof owner_id !== 'number' || owner_id % 1 !== 0) {
    return res.status(400).json({ error: 'Invalid owner_id' });
  }
  else {
    try {
      const [result] = await app.db.query(`INSERT INTO cars
        (manufacturer, model, odometerKM, model_year, efficiencyHP, efficiencyKW, 
        engine_capacityCC, fuel_type, emissionsGKM, transmission, body_type, color, doors, seats, vin, max_speedKMH, zeroToHundredSec, 
        weightKG, utility_features, safety_features, factoryExtras, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [manufacturer, model, odometerKM, model_year, efficiencyHP, efficiencyKW, engine_capacityCC,
        fuel_type, emissionsGKM, transmission, body_type, color, doors, seats, vin, max_speedKMH, zeroToHundredSec, weightKG, 
        utility_features, safety_features, factoryExtras, owner_id]
      );
      return res.status(201).json({ message: 'Car added successfully', carId: result.insertId });
    }
    catch (error) {
      console.error('Error adding car:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});
app.post('/auctions', async (req, res) => {
  const { car_id, starting_price, reserve_price, start_time, end_time, status } = req.body;

  if (typeof req.body !== 'object' || req.body === null || Object.keys(req.body).length !== 6) {
    return res.status(400).json({ error: 'Invalid request body' });
  }
  else if (!car_id || !starting_price || !start_time || !end_time || !status) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  else if (isNaN(car_id) || car_id <= 0 || typeof car_id !== 'number' || car_id % 1 !== 0) {
    return res.status(400).json({ error: 'Invalid car_id' });
  }
  else if (isNaN(starting_price) || starting_price < 0 || typeof starting_price !== 'number') {
    return res.status(400).json({ error: 'Invalid starting_price' });
  }
  else if (reserve_price && (isNaN(reserve_price) || reserve_price < 0 || typeof reserve_price !== 'number')) {
    return res.status(400).json({ error: 'Invalid reserve_price' });
  }
  else if (!start_time || isNaN(new Date(start_time).getTime())) {
    return res.status(400).json({ error: 'Invalid start_time' });
  }
  else if (!end_time || isNaN(new Date(end_time).getTime())) {
    return res.status(400).json({ error: 'Invalid end_time' });
  }
  else if (!['upcoming', 'active', 'completed', 'cancelled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  else {
    try {
      const [result] = await app.db.query(`INSERT INTO auctions
        (car_id, starting_price, reserve_price, start_time, end_time, status)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [car_id, starting_price, reserve_price, start_time, end_time, status]
      );
      return res.status(201).json({ message: 'Auction created successfully', auctionId: result.insertId });
    }
    catch (error) {
      console.error('Error creating auction:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});