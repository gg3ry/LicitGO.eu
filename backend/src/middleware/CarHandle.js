import handleStatus from "../lang/HandleStatus.js";
import ObjectLength from "../util/ObjectLength.js";

function CreateCarHandleMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    const { manufacturer, model, model_year, odometerKM, efficiencyHP,
        efficiencyKW, engine_capacity, fuel_type, emissionsGKM, transmission,
        body_type, color, door, seats, vin, max_speedKMH, zeroToHundredSec,
        weightKG, utility_features, safety_features, factoryExtras } = req.body;

    if (!manufacturer || !model || !model_year || !odometerKM || !efficiencyHP ||
        !efficiencyKW || !engine_capacity || !fuel_type || !emissionsGKM ||
        !transmission || !body_type || !color || !door || !seats || !vin ||
        !max_speedKMH || !zeroToHundredSec || !weightKG) {
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
    const { starting_priceUSD, reserve_priceUSD, start_time, end_time } = req.body;
    if (ObjectLength(req.body, 3, 4) === -1) {
        return res.status(400).json({ message: handleStatus('1204', lang) });
    }
    if (ObjectLength(req.body, 3, 4) === 1) {
        return res.status(400).json({ message: handleStatus('1205', lang) });
    }
    if (isNaN(starting_priceUSD) || isNaN(reserve_priceUSD)) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (isNaN(Date.parse(end_time))) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (!start_time) {
        start_time = new Date();
    }
    if (!starting_priceUSD || !end_time || !reserve_priceUSD) {
        return res.status(400).json({ message: handleStatus('1201', lang) });
    }
    if (start_time >= end_time) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (reserve_priceUSD < starting_priceUSD) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (starting_priceUSD < 0 || reserve_priceUSD < 0) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (start_time < new Date()) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    next();
}

export { CreateCarHandleMiddleware, CreateAuctionMiddleware };