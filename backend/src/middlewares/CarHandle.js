import e from "express";
import handleStatus from "../languages/HandleStatus.js";
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

    if (ObjectLength(req.body, 20, 25) === -1) {
        return res.status(400).json({ message: handleStatus('1204', lang) });
    }
    if (ObjectLength(req.body, 20, 25) === 1) {
        return res.status(400).json({ message: handleStatus('1205', lang) });
    }
    if (!manufacturer || !model || !modelyear || !odometerKM || !efficiencyHP ||
        !efficiencyKW || !enginecapacity || !fueltype || !emissionsGKM ||
        !transmission || !bodytype || !color || !doors || !seats || !vin ||
        !maxspeedKMH || !zeroToHundredSec || !weightKG) {
        return res.status(400).json({ message: handleStatus('1201', lang) });
    }
    if (isNaN(modelyear) || isNaN(odometerKM) || isNaN(efficiencyHP) || isNaN(efficiencyKW) ||
        isNaN(enginecapacity) || isNaN(emissionsGKM) || isNaN(doors) ||
        isNaN(seats) || isNaN(maxspeedKMH) || isNaN(zeroToHundredSec) || isNaN(weightKG)) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (manufacturer.length > 100 || model.length > 150) {
        return res.status(400).json({ message: handleStatus('1200', lang) });
    }
    if (fueltype.toLowerCase() !== 'gasoline' && fueltype.toLowerCase() !== 'diesel'
    && fueltype.toLowerCase() !== 'electric' && fueltype.toLowerCase() !== 'hybrid' && fueltype.toLowerCase() !== 'other') {
        return res.status(400).json({ message: handleStatus('1403', lang) });
    }
    if (transmission.toLowerCase() !== 'manual' &&transmission.toLowerCase() !== 'automatic'
    && transmission.toLowerCase() !== 'semi-automatic' && transmission.toLowerCase() !== 'cvt'
    && transmission.toLowerCase() !== 'dual-clutch' && transmission.toLowerCase() !== 'other') {
        return res.status(400).json({ message: handleStatus('1403', lang) });
    }
    if (bodytype.toLowerCase() !== 'sedan' && bodytype.toLowerCase() !== 'hatchback'
    && bodytype.toLowerCase() !== 'suv' && bodytype.toLowerCase() !== 'coupe'
    && bodytype.toLowerCase() !== 'convertible' && bodytype.toLowerCase() !== 'wagon'
    && bodytype.toLowerCase() !== 'van' && bodytype.toLowerCase() !== 'truck' && bodytype.toLowerCase() !== 'other') {
        return res.status(400).json({ message: handleStatus('1403', lang) });
    }
    if (vin.length !== 17) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    if (utilityfeatures && typeof utilityfeatures !== 'string') {
        return res.status(400).json({ message: handleStatus('1401', lang) });
    }
    if (safetyfeatures && typeof safetyfeatures !== 'string') {
        return res.status(400).json({ message: handleStatus('1401', lang) });
    }
    if (factoryExtras && typeof factoryExtras !== 'string') {
        return res.status(400).json({ message: handleStatus('1401', lang) });
    }
    if (factoryExtras && typeof factoryExtras !== 'string') {
        return res.status(400).json({ message: handleStatus('1401', lang) });
    }
    if (modelyear < 1886 || modelyear > new Date().getFullYear() + 1) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }

    next();
}

function CreateAuctionMiddleware(req, res, next) {
    let lang = req.headers['accept-language'] || 'EN';
    if (!lang.toUpperCase().includes('EN') && !lang.toUpperCase().includes('HU')) {
        lang = 'EN';
    }
    let { startingpriceUSD, reservepriceUSD, starttime, endtime } = req.body;
    if (isNaN(startingpriceUSD) || isNaN(reservepriceUSD)) {
        return res.status(400).json({ message: handleStatus('1403', lang) });
    }
    if (isNaN(Date.parse(endtime))) {
        return res.status(400).json({ message: handleStatus('1402', lang) });
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
    if (endtime < new Date()) {
        return res.status(400).json({ message: handleStatus('1202', lang) });
    }
    next();
}

export { CreateCarHandleMiddleware, CreateAuctionMiddleware };