import {
  CheckSessionToken,
  CheckFileType,
  CheckIfVerified,
  GetUserID,
  GetLang,
  GetCurrency,
  TodaysExchangeRates
} from "../utilities.js";
import { hash } from "argon2";
import { sendVerificationEmail } from "../emailcode.js";
async function PostCarHU(req, res) {
  const conn = await app.db.getConnection();
  if (!(await CheckSessionToken(req.headers["x-session-token"]))) {
    conn.release();
    return res.status(401).json({ error: "Érvénytelen munkamenet token" });
  }
  main();
  async function main() {
    const files = req.files ? req.files["car_images"] : null;
    if (!files || files.length < 5) {
      conn.release();
      return res.status(400).json({ error: "Legalább 5 kép szükséges" });
    } else if (files.length > 50) {
      conn.release();
      return res.status(400).json({ error: "Maximum 50 kép tölthető fel" });
    }
    for (const file of files) {
      if (!CheckFileType(file)) {
        conn.release();
        return res
          .status(400)
          .json({ error: "Érvénytelen fájltípus a feltöltött képek között" });
      }
    }
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
      car_images,
      order_indexes,
    } = req.body;
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Object.keys(req.body).length != 22
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen kérés törzse" });
    } else if (
      !manufacturer ||
      !model ||
      !odometerKM ||
      !model_year ||
      !efficiencyHP ||
      !efficiencyKW ||
      !engine_capacityCC ||
      !fuel_type ||
      !emissionsGKM ||
      !transmission ||
      !body_type ||
      !color ||
      !doors ||
      !seats ||
      !vin ||
      !max_speedKMH ||
      !zeroToHundredSec ||
      !weightKG ||
      !utility_features ||
      !safety_features ||
      !factoryExtras ||
      !car_images ||
      !order_indexes
    ) {
      conn.release();
      return res.status(400).json({ error: "Hiányzó kötelező mezők" });
    } else if (
      !manufacturer ||
      manufacturer.length === 0 ||
      typeof manufacturer !== "string"
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen gyártó" });
    } else if (!model || model.length === 0 || typeof model !== "string") {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen modell" });
    } else if (
      isNaN(odometerKM) ||
      odometerKM < 0 ||
      typeof odometerKM !== "number" ||
      odometerKM % 1 !== 0
    ) {
      conn.release();
      return res
        .status(400)
        .json({ error: "Érvénytelen óraállás (odometerKM)" });
    } else if (
      isNaN(model_year) ||
      model_year < 1900 ||
      typeof model_year !== "number" ||
      model_year % 1 !== 0 ||
      model_year > new Date().getFullYear() + 1
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen gyártási év" });
    } else if (
      isNaN(engine_capacityCC) ||
      engine_capacityCC <= 0 ||
      typeof engine_capacityCC !== "number" ||
      engine_capacityCC % 1 !== 0
    ) {
      conn.release();
      return res
        .status(400)
        .json({ error: "Érvénytelen motor térfogata (CC)" });
    } else if (!color || color.length === 0 || typeof color !== "string") {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen szín" });
    } else if (
      isNaN(doors) ||
      doors <= 0 ||
      typeof doors !== "number" ||
      doors % 1 !== 0 ||
      doors > 7
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen ajtók száma" });
    } else if (
      isNaN(seats) ||
      seats <= 0 ||
      typeof seats !== "number" ||
      seats % 1 !== 0 ||
      seats > 9
    ) {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen ülések száma" });
    } else if (!vin || vin.length !== 17 || typeof vin !== "string") {
      conn.release();
      return res.status(400).json({ error: "Érvénytelen VIN" });
    } else if (
      !req.files ||
      !req.files["car_images"] ||
      req.files["car_images"].length === 0
    ) {
      conn.release();
      return res.status(400).json({ error: "Legalább egy autókép szükséges" });
    } else if (
      Array.isArray(order_indexes) &&
      order_indexes.length !== req.files["car_images"].length
    ) {
      conn.release();
      return res.status(400).json({
        error: "A sorrendindexek számának meg kell egyeznie a képek számával",
      });
    } else {
      const currentTime = new Date();
      try {
        const owner_id = await GetUserID(req.headers["x-session-token"]);
        if (!owner_id) {
          conn.release();
          return res
            .status(401)
            .json({ error: "Érvénytelen tulajdonos azonosító" });
        }
        if (!(await CheckIfVerified(owner_id))) {
          conn.release();
          return res
            .status(403)
            .json({ error: "A felhasználó nincs megerősítve" });
        }
        const [carU] = await app.db.query(
          `INSERT INTO cars
        (manufacturer, model, odometerKM, model_year, efficiencyHP, efficiencyKW, 
        engine_capacityCC, fuel_type, emissionsGKM, transmission, body_type, color, doors, seats, vin, max_speedKMH, zeroToHundredSec, 
        weightKG, utility_features, safety_features, factoryExtras, owner_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ]
        );
        await app.db.query(
          `INSERT INTO logs (user_id, action_type, action_details, action_time) VALUES (?, ?, ?, ?)`,
          [owner_id, "car_added", `Car ID: ${carU.insertId}`, currentTime]
        );
        for (let i = 0; i < req.files["car_images"].length; i++) {
          const file = req.files["car_images"][i];
          const order_index = Array.isArray(order_indexes)
            ? parseInt(order_indexes[i], 10)
            : parseInt(order_indexes, 10);
          await app.db.query(
            `INSERT INTO car_images (car_id, file_path, order_index, uploaded_at) VALUES (?, ?, ?, ?)`,
            [carU.insertId, file.path, order_index, currentTime]
          );
        }
        conn.release();
        return res
          .status(201)
          .json({ message: "Autó sikeresen hozzáadva", carId: carU.insertId });
      } catch (error) {
        console.error("Hiba tortent az auto hozzaadasa kozben:", error);
        conn.release();
        return res.status(500).json({ error: "Belső szerverhiba" });
      }
    }
  }
}

async function PostAuctionHU(req, res) {
  const conn = await app.db.getConnection();
  const lang = (await GetLang(req.headers["x-lang"])).toUpperCase();
  const currency = (await GetCurrency(req.headers["x-currency"])).toUpperCase();
  if (!(await CheckSessionToken(req.headers["x-session-token"]))) {
    conn.release();
    if (lang === "HU") {
      return res.status(401).json({ error: "Érvénytelen munkamenet token" });
    } 
    return res.status(401).json({ error: "Invalid session token" });
  }
  main();
  async function main() {
    const {
      car_id,
      starting_price,
      reserve_price,
      start_time,
      end_time,
      status,
    } = req.body;
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Object.keys(req.body).length !== 6
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen kérés törzse" });
      }
      return res.status(400).json({ error: "Invalid request body" });
    } else if (
      !car_id ||
      !starting_price ||
      !start_time ||
      !end_time ||
      !status
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Hiányzó kötelező mezők" });
      }
      return res.status(400).json({ error: "Missing required fields" });
    } else if (
      isNaN(car_id) ||
      car_id <= 0 ||
      typeof car_id !== "number" ||
      car_id % 1 !== 0
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen car_id" });
      }
      return res.status(400).json({ error: "Invalid car_id" });
    } else if (
      isNaN(starting_price) ||
      starting_price < 0 ||
      typeof starting_price !== "number"
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen kezdőár" });
      }
      return res.status(400).json({ error: "Invalid starting price" });
    } else if (
      reserve_price &&
      (isNaN(reserve_price) ||
        reserve_price < 0 ||
        typeof reserve_price !== "number")
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen tartalékár" });
      }
      return res.status(400).json({ error: "Invalid reserve price" });
    } else if (!start_time || isNaN(new Date(start_time).getTime())) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen kezdési idő" });
      }
      return res.status(400).json({ error: "Invalid start time" });
    } else if (!end_time || isNaN(new Date(end_time).getTime())) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen befejezési idő" });
      }
      return res.status(400).json({ error: "Invalid end time" });
    } else if (!["upcoming", "active"].includes(status)) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen státusz" });
      }
      return res.status(400).json({ error: "Invalid status" });
    } else {
      try {
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
        const [result] = await app.db.query(
          `INSERT INTO auctions
          (car_id, starting_priceUSD, reserve_priceUSD, start_time, end_time, status)
          VALUES (?, ?, ?, ?, ?, ?)`,
          [car_id, starting_price * conversionRate, reserve_price * conversionRate, start_time, end_time, status]
        );
        await app.db.query(
          `INSERT INTO logs (action_type, action_details, action_time) VALUES (?, ?, ?)`,
          [
            "auction_created",
            `Auction ID: ${result.insertId} for Car ID: ${car_id}`,
            new Date(),
          ]
        );
        conn.release();
        if (lang === "HU") {
          return res.status(201).json({
            message: "Aukció sikeresen létrehozva",
            auctionId: result.insertId,
          });
        }
        return res.status(201).json({
          
          message: "Auction created successfully",
          auctionId: result.insertId,
        });
      } catch (error) {
        console.error("Error during auction creation:", error);
        conn.release();
        if (lang === "HU") {
          return res.status(500).json({ error: "Belső szerverhiba" });
        }
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}

async function PostBidHU(req, res) {
  const conn = await app.db.getConnection();
  const lang = (await GetLang(req.headers["x-lang"])).toUpperCase();
  const bidder_id = await GetUserID(req.headers["x-session-token"]);
  if (!(await CheckSessionToken(req.headers["x-session-token"]))) {
    conn.release();
    if (lang === "HU") {
      return res.status(401).json({ error: "Érvénytelen munkamenet token" });
    }
    return res.status(401).json({ error: "Invalid session token" });
  }
  main();
  async function main() {
    const { auction_id, bid_amount } = req.body;
    if (
      typeof req.body !== "object" ||
      req.body === null ||
      Object.keys(req.body).length !== 2
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen kérés törzse" });
      }
      return res.status(400).json({ error: "Invalid request body" });
    } else if (!auction_id || !bid_amount) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Hiányzó kötelező mezők" });
      }
      return res.status(400).json({ error: "Missing required fields" });
    } else if (
      isNaN(auction_id) ||
      auction_id <= 0 ||
      typeof auction_id !== "number" ||
      auction_id % 1 !== 0
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen aukció azonosító" });
      }
      return res.status(400).json({ error: "Invalid auction ID" });
    } else if (
      isNaN(bid_amount) ||
      bid_amount <= 0 ||
      typeof bid_amount !== "number"
    ) {
      conn.release();
      if (lang === "HU") {
        return res.status(400).json({ error: "Érvénytelen licit összeg" });
      }
      return res.status(400).json({ error: "Invalid bid amount" });
    } else {
      if (
        !(await app.db
          .query("SELECT id FROM auctions WHERE id = ?", [auction_id])
          .then(([rows]) => rows.length > 0))
      ) {
        conn.release();
        if (lang === "HU") {
        return res.status(404).json({ error: "Aukció nem található" });
        }
        return res.status(404).json({ error: "Auction not found" });
      } else if (
        !(await app.db
          .query("SELECT id FROM users WHERE id = ?", [bidder_id])
          .then(([rows]) => rows.length > 0))
      ) {
        conn.release();
        if (lang === "HU") {
          return res.status(404).json({ error: "Licitáló felhasználó nem található" });
        }
        return res.status(404).json({ error: "Bidder user not found" });
      }
      const [highestBidRows] = await app.db.query(
        "SELECT MAX(bid_amountUSD) AS highest_bid FROM bids WHERE auction_id = ?",
        [auction_id]
      );
      const highestBid = highestBidRows[0].highest_bid || 0;
      let conversionRate = 1;
      const currency = (await GetCurrency(req.headers["x-currency"])).toUpperCase();
      if (currency !== 'USD') {
        const exchangeRates = await TodaysExchangeRates();
        if (exchangeRates) {
          if (currency === 'HUF') {
              conversionRate = exchangeRates.huf_to_usd;
          }
          else if (currency === 'EUR') {
              conversionRate = exchangeRates.eur_to_usd;
          }
        }
      }


      if (bid_amount <= highestBid) {
        conn.release();
        if (lang === "HU") {
          return res.status(400).json({ error: "A licit összegnek magasabbnak kell lennie, mint a jelenlegi legmagasabb licit" });
        }
        return res.status(400).json({ error: "Bid amount must be higher than the current highest bid" });
      }
      try {
        const bidder_id = await GetUserID(req.headers["x-session-token"]);
        if (!bidder_id) {
          conn.release();
          if (lang === "HU") {
            return res.status(401).json({ error: "Érvénytelen licitáló azonosító" });
          }
          return res.status(401).json({ error: "Invalid bidder ID" });
        }
        if (!(await CheckIfVerified(bidder_id))) {
          conn.release();
          if (lang === "HU") {
            return res.status(403).json({ error: "A felhasználó nincs megerősítve" });
          }
          return res.status(403).json({ error: "User is not verified" });
        }
        const [result] = await app.db.query(
          `INSERT INTO bids (auction_id, bidder_id, bid_amountUSD) VALUES (?, ?, ?)`,
          [auction_id, bidder_id, bid_amount * conversionRate]
        );
        await app.db.query(
          `INSERT INTO logs (user_id, action_type, action_details, action_time) VALUES (?, ?, ?, ?)`,
          [
            bidder_id,
            "bid_placed",
            `Bid ID: ${result.insertId} on Auction ID: ${auction_id} with amount: ${bid_amount * conversionRate} $USD`,
            new Date(),
          ]
        );
        conn.release();
        return res.status(201).json({ message: "Licit sikeresen leadva", bidId: result.insertId });
      } catch (error) {
        console.error("Error during bid placement:", error);
        conn.release();
        if (lang === "HU") {
          return res.status(500).json({ error: "Belső szerverhiba" });
        }
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}

async function RegisterHU(req, res) {
  const conn = await app.db.getConnection();
  const {
    usertag,
    display_name,
    password_hash,
    email,
    fullname,
    mobile,
    gender,
  } = req.body;
  const birth_date = new Date(req.body.birth_date);
  const profile_picture = req.file;

  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Object.keys(req.body).length != 8
  ) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen kérés törzse" });
  } else if (
    !usertag ||
    !display_name ||
    !password_hash ||
    !email ||
    !fullname ||
    !mobile ||
    !gender ||
    !birth_date
  ) {
    conn.release();
    return res.status(400).json({ error: "Hiányzó kötelező mezők" });
  } else if (
    typeof usertag !== "string" ||
    typeof display_name !== "string" ||
    typeof password_hash !== "string" ||
    typeof email !== "string" ||
    typeof fullname !== "string" ||
    typeof mobile !== "string" ||
    typeof gender !== "boolean" ||
    !(birth_date instanceof Date)
  ) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen mezőtípusok" });
  } else if (usertag.length < 3 || usertag.length > 32) {
    conn.release();
    return res
      .status(400)
      .json({ error: "A usertag hossza 3 és 32 karakter között kell legyen" });
  } else if (display_name.length < 3 || display_name.length > 100) {
    conn.release();
    return res.status(400).json({
      error: "A megjelenítendő név hossza 3 és 100 karakter között kell legyen",
    });
  } else if (password_hash.length < 8 || password_hash.length > 64) {
    conn.release();
    return res
      .status(400)
      .json({ error: "A jelszó hossza 8 és 64 karakter között kell legyen" });
  } else if (/\s/.test(password_hash)) {
    conn.release();
    return res
      .status(400)
      .json({ error: "A jelszó nem tartalmazhat szóközöket" });
  } else if (
    !/[A-Z]/.test(password_hash) ||
    !/[a-z]/.test(password_hash) ||
    !/[0-9]/.test(password_hash) ||
    !/[!@#$%^&*(),.?":{}|<>]/.test(password_hash)
  ) {
    conn.release();
    return res.status(400).json({
      error:
        "A jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert",
    });
  } else if (
    email.length < 5 ||
    email.length > 100 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen e-mail cím" });
  } else if (fullname.length < 3 || fullname.length > 150) {
    conn.release();
    return res.status(400).json({
      error: "A teljes név hossza 3 és 150 karakter között kell legyen",
    });
  } else if (
    mobile.length < 6 ||
    mobile.length > 30 ||
    !/^\+?[0-9\s\-()]+$/.test(mobile)
  ) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen telefonszám" });
  } else if (isNaN(birth_date.getTime()) || birth_date > new Date()) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen születési dátum" });
  } else if (profile_picture && !CheckFileType(profile_picture)) {
    conn.release();
    return res
      .status(400)
      .json({ error: "Érvénytelen fájltípus a profilképhez" });
  } else if (
    await app.db
      .query("SELECT id FROM users WHERE usertag = ?", [usertag])
      .then(([rows]) => rows.length > 0)
  ) {
    conn.release();
    return res.status(409).json({ error: "A usertag már használatban van" });
  } else if (
    await app.db
      .query("SELECT id FROM users WHERE email = ?", [email])
      .then(([rows]) => rows.length > 0)
  ) {
    conn.release();
    return res
      .status(409)
      .json({ error: "Az e-mail cím már használatban van" });
  } else if (
    await app.db
      .query("SELECT id FROM users WHERE mobile = ?", [mobile])
      .then(([rows]) => rows.length > 0)
  ) {
    conn.release();
    return res
      .status(409)
      .json({ error: "A telefonszám már használatban van" });
  } else {
    try {
      const hpassword = await hash(password_hash);
      const [result] = await app.db.query(
        "INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, gender, birth_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          usertag,
          display_name,
          hpassword,
          email,
          fullname,
          mobile,
          gender,
          birth_date,
        ]
      );
      if (profile_picture) {
        const profilePicturePath = path.join(
          __dirname,
          "../uploads/profiles",
          profile_picture.filename
        );
        fs.renameSync(profile_picture.path, profilePicturePath);
        await app.db.query(
          "UPDATE users SET profile_picture = ? WHERE id = ?",
          [profilePicturePath, result.insertId]
        );
      }
      await sendVerificationEmail(email, result.insertId, "verification");
      conn.release();
      return res.status(201).json({
        message: "Felhasználó sikeresen regisztrálva",
        userId: result.insertId,
      });
    } catch (error) {
      console.error("Hiba tortent a felhasznalo regisztracioja kozben:", error);
      await conn.release();
      return res.status(500).json({ error: "Belső szerverhiba" });
    }
  }
}

async function PasstempcodeHU(req, res) {
  const lang = (await GetLang(req.headers["x-lang"])).toUpperCase();
  const conn = await app.db.getConnection();
  const { info } = req.body;
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Object.keys(req.body).length < 1
  ) {
    conn.release();
    if (lang === "HU") {
      return res.status(400).json({ error: "Érvénytelen kérés törzse" });
    } else {
      return res.status(400).json({ error: "Invalid request body" });
    }
  } else if (!info) {
    conn.release();
    if (lang === "HU") {
      return res.status(400).json({ error: "Hiányzó kötelező mező" });
    }
    return res.status(400).json({ error: "Missing required field" });
  } 
  else if (typeof info !== "string" || isNaN(info)) {
    conn.release();
    if (lang === "HU") {
      return res.status(400).json({ error: "Érvénytelen felhasználói információ" });
    }
    return res.status(400).json({ error: "Invalid user information" });
  }
  else {
    try {
      let user;
      [user] = await app.db.query(
        "SELECT id, email FROM users WHERE (email = ? OR phone = ? OR usertag = ?)",
        [info, info, info]
      );
      if (user.length === 0) {
        conn.release();
        if (lang === "HU") {
          return res.status(404).json({ error: "Felhasználó nem található" });
        }
        return res.status(404).json({ error: "User not found" });
      }
      await sendVerificationEmail(user[0].email, user[0].id, "password_reset");
      conn.release();
      if (lang === "HU") {
        return res.status(200).json({ message: "Jelszó visszaállító kód elküldve az e-mail címre" });
      }
      return res.status(200).json({ message: "Password reset code sent to email address" });
    } catch (error) {
      console.error("Error during password reset code sending:", error);
      conn.release();
      if (lang === "HU") {
        return res.status(500).json({ error: "Belső szerverhiba" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

async function ResetPassword(req, res) {
  const conn = await app.db.getConnection();
  const { code, newPassword, PasswordConfirm } = req.body;
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Object.keys(req.body).length < 1
  ) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen kérés törzse" });
  } else if (!code) {
    conn.release();
    return res.status(400).json({ error: "Hiányzó kötelező mező" });
  } else {
    try {
      let emailCode;
      [emailCode] = await app.db.query(
        'SELECT id, user_id, expires_at, type FROM email_codes WHERE (code = ? AND type = "password_reset" AND expires_at > NOW())',
        [code]
      );
      if (emailCode.length === 0) {
        conn.release();
        return res.status(404).json({ error: "Érvénytelen kód" });
      }
      if (newPassword !== PasswordConfirm) {
        conn.release();
        return res
          .status(400)
          .json({ error: "Az új jelszó és a megerősítés nem egyezik" });
      }
      if (!newPassword || typeof newPassword !== "string") {
        conn.release();
        return res.status(400).json({ error: "Érvénytelen új jelszó" });
      }
      if (newPassword.length < 8) {
        conn.release();
        return res.status(400).json({
          error: "Az új jelszónak legalább 8 karakter hosszúnak kell lennie",
        });
      }
      if (newPassword.length > 64) {
        conn.release();
        return res
          .status(400)
          .json({ error: "Az új jelszó nem lehet hosszabb 64 karakternél" });
      }
      if (/\s/.test(newPassword)) {
        conn.release();
        return res
          .status(400)
          .json({ error: "Az új jelszó nem tartalmazhat szóközöket" });
      }
      if (
        !/[A-Z]/.test(newPassword) ||
        !/[a-z]/.test(newPassword) ||
        !/[0-9]/.test(newPassword) ||
        !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
      ) {
        conn.release();
        return res.status(400).json({
          error:
            "Az új jelszónak tartalmaznia kell legalább egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert",
        });
      }
      const hpassword = await hash(newPassword);
      await app.db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
        hpassword,
        emailCode[0].user_id,
      ]);
      await app.db.query(
        "INSERT INTO logs (user_id, action_type, action_details, action_time) VALUES (?, ?, ?, ?)",
        [
          emailCode[0].user_id,
          "password_reset",
          `Password reset using code ID: ${emailCode[0].id}`,
          new Date(),
        ]
      );
      await app.db.query("DELETE FROM email_codes WHERE id = ?", [
        emailCode[0].id,
      ]);
      conn.release();
      return res.status(200).json({ message: "Jelszó sikeresen frissítve" });
    } catch (error) {
      console.error("Hiba tortent a jelszo frissitese kozben:", error);
      conn.release();
      return res.status(500).json({ error: "Belső szerverhiba" });
    }
  }
}

async function EmailVerifyHU(req, res) {
  const conn = await app.db.getConnection();
  const { code } = req.body;
  if (
    typeof req.body !== "object" ||
    req.body === null ||
    Object.keys(req.body).length < 1
  ) {
    conn.release();
    return res
      .status(400)
      .json({ error: "Érvénytelen kérés törzse", valid: false });
  }
  if (!code) {
    conn.release();
    return res
      .status(400)
      .json({ error: "Hiányzó kötelező mező", valid: false });
  }
  if (!code || isNaN(code)) {
    conn.release();
    return res.status(400).json({ error: "Érvénytelen kód", valid: false });
  }
  const [results] = await app.db.query(
    'SELECT id, user_id, expires_at FROM email_codes WHERE (code = ? AND type = "verification" AND expires_at > NOW())',
    [code]
  );
  const [userinfo] = await app.db.query(
    "SELECT usertag FROM users WHERE id = ?",
    [results[0].user_id]
  );
  if (results.length === 0) {
    conn.release();
    return res.status(404).json({ error: "Érvénytelen kód", valid: false });
  }
  await app.db.query('UPDATE users SET type = "verified" WHERE id = ?', [
    results[0].user_id,
  ]);
  await app.db.query(
    "INSERT INTO logs (user_id, action_type, action_details, action_time) VALUES (?, ?, ?, ?)",
    [
      results[0].user_id,
      "account_created",
      `Account created with usertag: ${userinfo[0].usertag}`,
      new Date(),
    ]
  );
  await app.db.query("DELETE FROM email_codes WHERE id = ?", [results[0].id]);
  conn.release();
  return res
    .status(200)
    .json({ message: "Email successfully verified", valid: true });
}

exports = {
  PostCarHU,
  PostAuctionHU,
  PostBidHU,
  RegisterHU,
  PasstempcodeHU,
  ResetPassword,
  EmailVerifyHU,
};
