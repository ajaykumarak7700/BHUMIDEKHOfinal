<?php
require 'includes/db.php';

$queries = [
    // Add columns to properties
    "ALTER TABLE properties ADD COLUMN city VARCHAR(100) AFTER price",
    "ALTER TABLE properties ADD COLUMN type VARCHAR(50) AFTER city",
    "ALTER TABLE properties ADD COLUMN description TEXT AFTER title",
    "ALTER TABLE properties ADD COLUMN area VARCHAR(50) AFTER type",
    "ALTER TABLE properties ADD COLUMN address TEXT AFTER location",
    "ALTER TABLE properties ADD COLUMN map_link TEXT AFTER video_link",
    
    // Create likes table
    "CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        property_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (user_id, property_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
    )"
];

echo "<h2>Database Update Status:</h2>";
foreach ($queries as $q) {
    try {
        $pdo->exec($q);
        echo "<div style='color:green'>Success: " . htmlspecialchars(substr($q, 0, 50)) . "...</div>";
    } catch (PDOException $e) {
        // Ignore "Duplicate column name" errors
        if (strpos($e->getMessage(), "Duplicate column name") !== false) {
             echo "<div style='color:orange'>Skipped (Column exists): " . htmlspecialchars(substr($q, 0, 50)) . "...</div>";
        } else {
             echo "<div style='color:red'>Error: " . $e->getMessage() . "</div>";
        }
    }
}

// Add Dummy Properties
$dummy_props = [
    [
        'title' => 'Luxury Villa in Jaipur',
        'description' => 'A beautiful 4BHK villa with garden and pool.',
        'price' => 15000000,
        'city' => 'Jaipur',
        'location' => 'Vaishali Nagar, Jaipur',
        'address' => 'Plot 45, Lane 2, Vaishali Nagar',
        'type' => 'House',
        'area' => '3000 sqft',
        'image_path' => 'dummy1.jpg',
        'status' => 'approved'
    ],
    [
        'title' => 'Commercial Plot Main Road',
        'description' => 'Prime location plot suitable for shops.',
        'price' => 5000000,
        'city' => 'Udaipur',
        'location' => 'Sukher, Udaipur',
        'address' => 'NH-8, Near Celebration Mall',
        'type' => 'Plot',
        'area' => '1200 sqft',
        'image_path' => 'dummy2.jpg',
        'status' => 'approved'
    ],
    [
        'title' => '2BHK Affordable Flat',
        'description' => 'Ready to move flat near IT park.',
        'price' => 2500000,
        'city' => 'Kota',
        'location' => 'Jhalawar Road, Kota',
        'address' => 'Block C, Indraprastha Residency',
        'type' => 'Flat',
        'area' => '950 sqft',
        'image_path' => 'dummy3.jpg',
        'status' => 'approved'
    ]
];

// Check if we need to insert dummy user first (Admin info)
// Actually we can link to existing users, or find one.
// Let's ensure there is at least one admin account to link properties to if needed, or an agent.
// We'll just run this carefully. Assuming User ID 1 exists (created via index.php usually).
// If not, we create one.

try {
    $stmt = $pdo->query("SELECT id FROM users LIMIT 1");
    $user = $stmt->fetch();
    $user_id = $user ? $user['id'] : 1; 

    // create dummy user if not exists
    if (!$user) {
         $pdo->exec("INSERT INTO users (name, mobile, password, role) VALUES ('Admin', '9999999999', '123456', 'admin')");
         $user_id = $pdo->lastInsertId();
    }

    $stmt = $pdo->prepare("INSERT INTO properties (user_id, title, description, price, city, location, address, type, area, image_path, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    foreach ($dummy_props as $p) {
        $stmt->execute([
            $user_id, 
            $p['title'], 
            $p['description'], 
            $p['price'], 
            $p['city'], 
            $p['location'], 
            $p['address'], 
            $p['type'], 
            $p['area'], 
            $p['image_path'],
            $p['status']
        ]);
    }
    echo "<div style='color:green'>Dummy properties added.</div>";

} catch (PDOException $e) {
    echo "<div style='color:red'>Dummy Data Error: " . $e->getMessage() . "</div>";
}
?>
