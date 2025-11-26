import handleStatus from "../lang/HandleStatus.js";
import ObjectLength from "../util/ObjectLength.js";

function CreateCarHandleMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { manufacturer, model, modelyear, odometerKM, efficiencyHP,
        efficiencyKW, enginecapacity, fueltype, emissionsGKM, transmission,
        bodytype, color, doors, seats, vin, maxspeedKMH, zeroToHundredSec,
        weightKG, utilityfeatures, safetyfeatures, factoryExtras } = req.body;

    if (!manufacturer || !model || !modelyear || !odometerKM || !efficiencyHP ||
        !efficiencyKW || !enginecapacity || !fueltype || !emissionsGKM ||
        !transmission || !bodytype || !color || !doors || !seats || !vin ||
        !maxspeedKMH || !zeroToHundredSec || !weightKG) {
        return res.status(400).json({ message: handleStatus('1201', lang) });
    }
    if (ObjectLength(req.body, 16, 20) === -1) {
        return res.status(400).json({ message: handleStatus('1204', lang) });
    }
    if (ObjectLength(req.body, 16, 20) === 1) {
        return res.status(400).json({ message: handleStatus('1205', lang) });
    }
    next();
}

function CreateAuctionMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { startingpriceUSD, reservepriceUSD, starttime, endtime } = req.body;
    if (ObjectLength(req.body, 3, 4) === -1) {
        return res.status(400).json({ message: handleStatus('1204', lang) });
    }
    if (ObjectLength(req.body, 3, 4) === 1) {
        return res.status(400).json({ message: handleStatus('1205', lang) });
    }
    if (isNaN(startingpriceUSD) || isNaN(reservepriceUSD)) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (isNaN(Date.parse(endtime))) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (!starttime) {
        starttime = new Date();
    }
    if (!startingpriceUSD || !endtime || !reservepriceUSD) {
        return res.status(400).json({ message: handleStatus('1201', lang) });
    }
    if (starttime >= endtime) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (reservepriceUSD < startingpriceUSD) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (startingpriceUSD < 0 || reservepriceUSD < 0) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (starttime < new Date()) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    next();
}

export { CreateCarHandleMiddleware, CreateAuctionMiddleware };