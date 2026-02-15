<?php
require 'includes/db.php';

$queries = [
    // 1. Add overrides for contact info in properties
    "ALTER TABLE properties ADD COLUMN contact_mobile VARCHAR(20) AFTER status",
    "ALTER TABLE properties ADD COLUMN contact_whatsapp VARCHAR(20) AFTER contact_mobile",
    
    // 2. Withdrawal Requests Table
    "CREATE TABLE IF NOT EXISTS withdrawal_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )"
];

echo "<h2>Database Update Status:</h2>";
foreach ($queries as $q) {
    try {
        $pdo->exec($q);
        echo "Success\n";
    } catch (PDOException $e) {
         // Ignore "Duplicate column" errors
         echo "Handled: " . $e->getMessage() . "\n";
    }
}
?>
