CREATE DATABASE IF NOT EXISTS licitgoeu
CHARACTER SET utf8
DEFAULT COLLATE utf8_hungarian_ci;
USE licitgoeu;

CREATE TABLE IF NOT EXISTS users (
    usertoken VARCHAR(64) PRIMARY KEY NOT NULL UNIQUE,
    usertag VARCHAR(32) NOT NULL UNIQUE,
    passwordhash VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    fullname VARCHAR(255) NOT NULL,
    mobile VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(10) NOT NULL,
    birthdate DATE NOT NULL,
    type ENUM('unverified', 'verified', 'admin', 'superadmin', 'suspended', 'banned', 'deleted') DEFAULT 'unverified' NOT NULL,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lastlogin DATETIME,
    tfaenabled BOOLEAN DEFAULT FALSE,
    tfasecret VARCHAR(255) DEFAULT NULL,
    tfabackups TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS profpics (
    usertoken VARCHAR(64) NOT NULL UNIQUE PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    odometerKM INT NOT NULL,
    modelyear INT NOT NULL,
    efficiencyHP INT NOT NULL,
    efficiencyKW INT NOT NULL,
    enginecapacityCC INT NOT NULL,
    fueltype ENUM('gasoline', 'diesel', 'electric', 'hybrid', 'other') DEFAULT 'gasoline' NOT NULL,
    emissionsGKM INT,
    transmission ENUM('manual', 'automatic', 'semi-automatic', 'CVT', 'dual-clutch', 'other') DEFAULT 'manual' NOT NULL,
    bodytype ENUM('sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other') DEFAULT 'sedan' NOT NULL,
    color VARCHAR(50) NOT NULL,
    doors INT NOT NULL,
    seats INT NOT NULL,
    vin VARCHAR(17) NOT NULL UNIQUE,
    maxspeedKMH INT,
    zeroToHundredSec FLOAT,
    weightKG INT,
    utilityfeatures TEXT,
    safetyfeatures TEXT,
    factoryExtras TEXT,
    ownertoken VARCHAR(64) NOT NULL,
    FOREIGN KEY (ownertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carid INT NOT NULL UNIQUE,
    startingpriceUSD DECIMAL(10, 2) NOT NULL,
    reservepriceUSD DECIMAL(10, 2),
    starttime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endtime DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'active' NOT NULL,
    winner VARCHAR(64),
    FOREIGN KEY (carid) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (winner) REFERENCES users(usertoken) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auctionid INT NOT NULL,
    bidder VARCHAR(64) NOT NULL,
    bidamountUSD DECIMAL(10, 2) NOT NULL,
    bidtime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auctionid) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS carimages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carid INT NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    uploadedat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orderindex INT DEFAULT 0 CHECK (orderindex >= 0 AND orderindex < 50),
    FOREIGN KEY (carid) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS emailcodes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usertoken VARCHAR(64) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expiresat DATETIME NOT NULL,
    type ENUM('verification', 'password_reset') NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usersettings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usertoken VARCHAR(64) NOT NULL UNIQUE,
    darkmode BOOLEAN DEFAULT FALSE,
    language ENUM('en', 'hu') DEFAULT 'en' NOT NULL,
    currency ENUM('EUR', 'HUF', 'USD') DEFAULT 'EUR' NOT NULL,
    FOREIGN KEY (usertoken) REFERENCES users(usertoken) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS errorlogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    stacktrace TEXT,
    route VARCHAR(255),
    occurredat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exchangerates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eurousd DECIMAL(10, 6) NOT NULL,
        hufusd DECIMAL(10, 6) NOT NULL,
        hufeuro DECIMAL(10, 6) NOT NULL,
        date DATE NOT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);