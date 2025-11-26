CREATE DATABASE IF NOT EXISTS licitgoeu
CHARACTER SET utf8
DEFAULT COLLATE utf8_hungarian_ci;
USE licitgoeu;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usertag VARCHAR(32) NOT NULL UNIQUE,
    passwordhash VARCHAR(64) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    lastlogin DATETIME,
    gender BOOLEAN NOT NULL,
    birthdate DATE NOT NULL,
    type ENUM('unverified', 'verified', 'admin', 'superadmin', 'suspended', 'banned', 'deleted') DEFAULT 'unverified' NOT NULL,
);

CREATE TABLE IF NOT EXISTS profpics (
    userid INT NOT NULL UNIQUE PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    odometerKM INT NOT NULL,
    modelyear INT NOT NULL,
    efficiencyHP INT NOT NULL,
    efficiencyKW INT NOT NULL,
    engine_capacityCC INT NOT NULL,
    fueltype ENUM('gasoline', 'diesel', 'electric', 'hybrid') DEFAULT 'gasoline' NOT NULL,
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
    ownerid INT,
    FOREIGN KEY (ownerid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    carid INT NOT NULL UNIQUE,
    startingpriceUSD DECIMAL(10, 2) NOT NULL,
    reservepriceUSD DECIMAL(10, 2),
    starttime DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    endtime DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'active' NOT NULL,
    winnerid INT,
    FOREIGN KEY (carid) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (winnerid) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auctionid INT NOT NULL,
    bidderid INT NOT NULL,
    bidamountUSD DECIMAL(10, 2) NOT NULL,
    bidtime DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auctionid) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidderid) REFERENCES users(id) ON DELETE CASCADE
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
    userid INT NOT NULL,
    code VARCHAR(10) NOT NULL,
    expiresat DATETIME NOT NULL,
    type ENUM('verification', 'password_reset') NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS usersettings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL UNIQUE,
    darkmode BOOLEAN DEFAULT FALSE,
    language ENUM('EN', 'HU') DEFAULT 'EN' NOT NULL,
    currency ENUM('EUR', 'HUF', 'USD') DEFAULT 'EUR' NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiresat DATETIME NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS errorlogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    errormessage TEXT NOT NULL,
    stacktrace TEXT,
    occurredat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT,
    sessiontoken VARCHAR(255),
    actiontype ENUM('login', 'logout', 'account_created', 'bid_placed', 'auction_created', 'auction_cancelled', "server_error",
    'car_added', 'car_updated', 'user_registered', 'password_reset', 'admin_action',
    'super_admin_action', 'global_settings_updated') NOT NULL,
    action_details TEXT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (sessiontoken) REFERENCES sessions(token) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS authentication (
    userid INT PRIMARY KEY UNIQUE,
    twofactorsecret VARCHAR(255),
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backup_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid INT NOT NULL,
    backupkey TEXT NOT NULL,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exchange_rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eurousd DECIMAL(10, 6) NOT NULL,
        hufusd DECIMAL(10, 6) NOT NULL,
        hufeuro DECIMAL(10, 6) NOT NULL,
        date DATE NOT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*
INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, type)
VALUES ( placeholder for user data, 'superadmin');
*/