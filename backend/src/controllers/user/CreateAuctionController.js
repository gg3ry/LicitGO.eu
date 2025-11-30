import UseDB from "../../database/UseDB";
import DBconnection from "../../database/connection.js";
import handleStatus from "../../languages/HandleStatus.js";
import GetUserID from "../../utilities/GetUserID.js";

export default async (req, res) => {
    let lang = req.headers['accept-language'] || 'EN';
    const conn = await DBconnection.getConnection();
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const userID = await GetUserID(req);
    if (userID === null) {
        conn.release();
        return res.status(1001).json({ message: handleStatus('401', lang) });
    }
    const { manufacturer, model, odometerKM, modelyear, efficiencyHP, efficiencyKW,
        enginecapacityCC, fueltype, emissionsGKM, transmission, bodytype, color,
        doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG,
        utilityfeatures, safetyfeatures, factoryExtras,

        startingpriceUSD, reservepriceUSD, starttime, endtime } = req.body;
    const carSql = `INSERT INTO cars (userid, manufacturer, model, modelyear, odometerKM, efficiencyHP, efficiencyKW,
        enginecapacityCC, fueltype, emissionsGKM, transmission, bodytype, color,
        doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG, utilityfeatures, safetyfeatures, factoryExtras, createdat, ownerid)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?)`;
    const carParams = [userID, manufacturer, model, modelyear, odometerKM, efficiencyHP, efficiencyKW,
        enginecapacityCC, fueltype, emissionsGKM, transmission, bodytype, color,
        doors, seats, vin, maxspeedKMH, zeroToHundredSec, weightKG, utilityfeatures, safetyfeatures, factoryExtras, userID];
    const carResult = await UseDB(carSql, carParams);
    if (carResult.affectedRows === 0) {
        conn.release();
        return res.status(500).json({ message: handleStatus('500', lang) });
    }
    const carID = carResult.insertId;
    const auctionSql = `INSERT INTO auctions (carid, startingpriceUSD, reservepriceUSD, starttime, endtime, createdat)
        VALUES (?, ?, ?, ?, ?, NOW())`;
    const auctionParams = [carID, startingpriceUSD, reservepriceUSD, starttime, endtime];
    const auctionResult = await UseDB(auctionSql, auctionParams);
    if (auctionResult.affectedRows === 0) {
        conn.release();
        return res.status(500).json({ message: handleStatus('500', lang) });
    }
    conn.release();
    return res.status(201).json({ message: handleStatus('201', lang) });
};