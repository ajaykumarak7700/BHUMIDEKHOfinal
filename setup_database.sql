-- Database Schema for BhumiDekho

CREATE DATABASE IF NOT EXISTS bhumidekho;
USE bhumidekho;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    mobile VARCHAR(15) UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'agent', 'admin') DEFAULT 'customer',
    wallet_balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    city VARCHAR(100),
    type VARCHAR(50), -- e.g. Plot, House, Flat
    area VARCHAR(50),
    location VARCHAR(255),
    address TEXT,
    video_link VARCHAR(255),
    map_link VARCHAR(255),
    image_path VARCHAR(255),
    contact_mobile VARCHAR(15),
    contact_whatsapp VARCHAR(15),
    status ENUM('pending', 'approved', 'rejected', 'hidden') DEFAULT 'pending',
    is_featured TINYINT(1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('credit', 'debit') NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Withdrawal Requests Table
CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recharge Requests Table
CREATE TABLE IF NOT EXISTS recharge_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    proof_image TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert Default Admin (Password: admin123 - adjust hash as needed or use signup)
-- INSERT INTO users (name, email, mobile, password, role, wallet_balance) VALUES 
-- ('Admin', 'admin@bhumidekho.com', '9876543210', '$2y$10$YourHashedPasswordHere', 'admin', 100000.00);
