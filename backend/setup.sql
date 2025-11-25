CREATE DATABASE IF NOT EXISTS licitgoeu
CHARACTER SET utf8
DEFAULT COLLATE utf8_hungarian_ci;
USE licitgoeu;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usertag VARCHAR(32) NOT NULL UNIQUE,
    password_hash VARCHAR(64) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    fullname VARCHAR(150) NOT NULL,
    mobile VARCHAR(15) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login DATETIME,
    gender BOOLEAN NOT NULL,
    birth_date DATE NOT NULL,
    type ENUM('unverified', 'verified', 'admin', 'superadmin', 'suspended', 'banned', 'deleted') DEFAULT 'unverified' NOT NULL,
);

CREATE TABLE IF NOT EXISTS profile_pictures (
    user_id INT NOT NULL UNIQUE PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    manufacturer VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    odometerKM INT NOT NULL,
    model_year INT NOT NULL,
    efficiencyHP INT NOT NULL,
    efficiencyKW INT NOT NULL,
    engine_capacityCC INT NOT NULL,
    fuel_type ENUM('gasoline', 'diesel', 'electric', 'hybrid') DEFAULT 'gasoline' NOT NULL,
    emissionsGKM INT,
    transmission ENUM('manual', 'automatic', 'semi-automatic', 'CVT', 'dual-clutch', 'other') DEFAULT 'manual' NOT NULL,
    body_type ENUM('sedan', 'hatchback', 'SUV', 'coupe', 'convertible', 'wagon', 'van', 'truck', 'other') DEFAULT 'sedan' NOT NULL,
    color VARCHAR(50) NOT NULL,
    doors INT NOT NULL,
    seats INT NOT NULL,
    vin VARCHAR(17) NOT NULL UNIQUE,
    max_speedKMH INT,
    zeroToHundredSec FLOAT,
    weightKG INT,
    utility_features TEXT,
    safety_features TEXT,
    factoryExtras TEXT,
    owner_id INT,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auctions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL UNIQUE,
    starting_priceUSD DECIMAL(10, 2) NOT NULL,
    reserve_priceUSD DECIMAL(10, 2),
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NOT NULL,
    status ENUM('upcoming', 'active', 'completed', 'cancelled') DEFAULT 'active' NOT NULL,
    winner_id INT,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    FOREIGN KEY (winner_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bids (
    id INT AUTO_INCREMENT PRIMARY KEY,
    auction_id INT NOT NULL,
    bidder_id INT NOT NULL,
    bid_amountUSD DECIMAL(10, 2) NOT NULL,
    bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (auction_id) REFERENCES auctions(id) ON DELETE CASCADE,
    FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS car_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    order_index INT DEFAULT 0 CHECK (order_index >= 0 AND order_index < 50),
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS email_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at DATETIME NOT NULL,
    type ENUM('verification', 'password_reset') NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    dark_mode BOOLEAN DEFAULT FALSE,
    language ENUM('EN', 'HU') DEFAULT 'EN' NOT NULL,
    currency ENUM('EUR', 'HUF', 'USD') DEFAULT 'EUR' NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS error_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    error_message TEXT NOT NULL,
    stack_trace TEXT,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_token VARCHAR(255),
    action_type ENUM('login', 'logout', 'account_created', 'bid_placed', 'auction_created', 'auction_cancelled', "server_error",
    'car_added', 'car_updated', 'user_registered', 'password_reset', 'admin_action',
    'super_admin_action', 'global_settings_updated') NOT NULL,
    action_details TEXT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (session_token) REFERENCES sessions(session_token) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS authentication (
    user_id INT PRIMARY KEY,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret VARCHAR(255),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS backup_keys (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    backup_key TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exchange_rates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eur_to_usd DECIMAL(10, 6) NOT NULL,
        huf_to_usd DECIMAL(10, 6) NOT NULL,
        huf_to_eur DECIMAL(10, 6) NOT NULL,
        date DATE NOT NULL,
        fetched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/*
INSERT INTO users (usertag, display_name, password_hash, email, fullname, mobile, type)
VALUES ( placeholder for user data, 'superadmin');
*/