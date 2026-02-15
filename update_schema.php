<?php
require_once 'includes/db.php';

function safeExec($pdo, $sql) {
    try {
        $pdo->exec($sql);
        echo "Success: $sql\n";
    } catch (PDOException $e) {
        // Ignore "Duplicate column" errors (Code 42S21 in MySQL usually, or generic info)
        echo "Notice: " . $e->getMessage() . "\n";
    }
}

// Add new columns to properties
safeExec($pdo, "ALTER TABLE properties ADD COLUMN description TEXT");
safeExec($pdo, "ALTER TABLE properties ADD COLUMN city VARCHAR(100)");
safeExec($pdo, "ALTER TABLE properties ADD COLUMN address TEXT");
safeExec($pdo, "ALTER TABLE properties ADD COLUMN type VARCHAR(50)");
safeExec($pdo, "ALTER TABLE properties ADD COLUMN area VARCHAR(50)");
safeExec($pdo, "ALTER TABLE properties ADD COLUMN map_link TEXT");

// Create Likes Table
$likesTable = "CREATE TABLE IF NOT EXISTS likes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    property_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_like (user_id, property_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
)";
safeExec($pdo, $likesTable);

echo "Database schema update complete.\n";
?>
