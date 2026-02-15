<?php
require_once 'includes/db.php';

function safeExec($pdo, $sql) {
    try {
        $pdo->exec($sql);
        echo "Success: " . substr($sql, 0, 50) . "...\n";
    } catch (PDOException $e) {
        echo "Notice: " . $e->getMessage() . "\n";
    }
}

// Add contact columns to properties if they don't exist
safeExec($pdo, "ALTER TABLE properties ADD COLUMN contact_mobile VARCHAR(15)");
safeExec($pdo, "ALTER TABLE properties ADD COLUMN contact_whatsapp VARCHAR(15)");

// Create Withdrawals Table
$withdrawalTable = "CREATE TABLE IF NOT EXISTS withdrawal_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    mobile VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";
safeExec($pdo, $withdrawalTable);

echo "Database schema update complete.\n";
?>
