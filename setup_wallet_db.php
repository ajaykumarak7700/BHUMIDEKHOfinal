<?php
// setup_wallet_db.php
// Database setup for Wallet System
// Run this once to fix tables

require_once 'includes/db.php';

try {
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // 1. Recharge Requests Table (Deposits)
    $sql1 = "CREATE TABLE IF NOT EXISTS recharge_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        proof_image VARCHAR(255),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admin_note TEXT
    )";
    $pdo->exec($sql1);
    echo "Table 'recharge_requests' checked/created.<br>";

    // 2. Withdrawal Requests Table
    $sql2 = "CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        upi_id VARCHAR(100),
        bank_details TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        admin_note TEXT
    )";
    $pdo->exec($sql2);
    echo "Table 'withdrawal_requests' checked/created.<br>";

    // 3. Transactions Table (History)
    $sql3 = "CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('credit', 'debit') NOT NULL,
        description VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    $pdo->exec($sql3);
    echo "Table 'transactions' checked/created.<br>";

    // 4. Ensure Users have wallet_balance
    // This is tricky in SQL to 'add if not exists' without procedure, but we can try catch
    try {
        $pdo->exec("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00");
        echo "Column 'wallet_balance' added to users.<br>";
    } catch (Exception $e) {
        // Ignore if already exists
        echo "Column 'wallet_balance' likely already exists.<br>";
    }

    echo "<h3>Wallet Database Setup Complete!</h3>";
    echo "<a href='index.php'>Go Back</a>";

} catch (PDOException $e) {
    die("DB Error: " . $e->getMessage());
}
?>
