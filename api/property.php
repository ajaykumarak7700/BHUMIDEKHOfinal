<?php
require_once '../includes/db.php';

// --- AUTO-UPDATE SCHEMA (Self-Healing) ---
try {
    // Ensure is_featured exists
    $check = $pdo->query("SHOW COLUMNS FROM properties LIKE 'is_featured'");
    if ($check->rowCount() == 0) {
        $pdo->exec("ALTER TABLE properties ADD COLUMN is_featured TINYINT(1) DEFAULT 0");
    }
    // Ensure wallet_balance exists
    $check = $pdo->query("SHOW COLUMNS FROM users LIKE 'wallet_balance'");
    if ($check->rowCount() == 0) {
        $pdo->exec("ALTER TABLE users ADD COLUMN wallet_balance DECIMAL(10,2) DEFAULT 0.00");
    }
} catch (Exception $e) { /* Silent Fail */ }
// -----------------------------------------
session_start();
header('Content-Type: application/json');

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'add') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Login required']);
        exit;
    }

    $title = $_POST['title'];
    $desc = $_POST['desc'];
    $price = $_POST['price'];
    $city = $_POST['city'];
    $type = $_POST['type'];
    $area = $_POST['area'];
    $address = $_POST['address'];
    $video = $_POST['video_link'] ?? '';
    $map = $_POST['map_link'] ?? '';
    
    // Get User's Phone for Default Contact
    $stmtUser = $pdo->prepare("SELECT mobile FROM users WHERE id = ?");
    $stmtUser->execute([$_SESSION['user_id']]);
    $userRow = $stmtUser->fetch();
    $contact = $userRow['mobile'];

    // Image Upload
    $imagePath = '';
    if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $ext;
        $target = '../uploads/' . $fileName;
        if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
            $imagePath = $fileName;
        }
    }

    $sql = "INSERT INTO properties (user_id, title, description, price, city, type, area, location, address, video_link, map_link, image_path, contact_mobile, contact_whatsapp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    if ($stmt->execute([$_SESSION['user_id'], $title, $desc, $price, $city, $type, $area, $city, $address, $video, $map, $imagePath, $contact, $contact])) {
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'DB Error']);
    }

} elseif ($action === 'get_feed') {
    $offset = (int)($_GET['offset'] ?? 0);
    $search = $_GET['search'] ?? '';
    
    // Default status is approved (public view)
    $status = 'approved';
    
    // If Admin requests a specific status or Agent requests their own
    if (isset($_GET['status']) && $_SESSION['role'] === 'admin') {
        $status = $_GET['status']; // 'pending', 'rejected', 'all'
    }

    $sql = "SELECT p.*, u.name as agent_name 
            FROM properties p 
            JOIN users u ON p.user_id = u.id";
            
            if ($status !== 'all') {
                $sql .= " WHERE p.status = '$status'";
            } else {
                $sql .= " WHERE 1=1"; // For 'all'
            }
    
    $params = [];
    if ($search) {
        $sql .= " AND (p.title LIKE ? OR p.city LIKE ? OR p.type LIKE ? OR p.location LIKE ?)";
        $term = "%$search%";
        $params = [$term, $term, $term, $term];
    }
    
    $sql .= " ORDER BY p.is_featured DESC, p.created_at DESC LIMIT 50 OFFSET $offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(), 'role' => $_SESSION['role']??'guest', 'user_id' => $_SESSION['user_id'] ?? null]);

} elseif ($action === 'edit_contact') {
    // Admin Only: Override Contact Details
    if ($_SESSION['role'] !== 'admin') exit(json_encode(['status'=>'error']));
    
    $pid = $_POST['property_id'];
    $mobile = $_POST['mobile'];
    $whatsapp = $_POST['whatsapp'];
    
    $stmt = $pdo->prepare("UPDATE properties SET contact_mobile = ?, contact_whatsapp = ? WHERE id = ?");
    if($stmt->execute([$mobile, $whatsapp, $pid])) {
        echo json_encode(['status' => 'success']);
    } else {
         echo json_encode(['status' => 'error']);
    }

} elseif ($action === 'edit_property') {
    // Admin Edit Full Property
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
         echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
         exit;
    }
    
    $id = $_POST['id'];
    $title = $_POST['title'];
    $cat = $_POST['category'];
    $area = $_POST['area'];
    $desc = $_POST['description'];
    $price = $_POST['price'];
    $sqft = $_POST['price_per_sqft'] ?? '';
    
    $state = $_POST['state'] ?? '';
    $dist = $_POST['district'] ?? '';
    $city = $_POST['city'];
    $pin = $_POST['pincode'] ?? '';
    
    $mobile = $_POST['contact_mobile'];
    $wa = $_POST['contact_whatsapp'];
    $vid = $_POST['youtube_video'] ?? '';
    $map = $_POST['map_link'] ?? '';
    $extras = $_POST['extra_details'] ?? '[]';

    $sql = "UPDATE properties SET 
            title=?, type=?, area=?, description=?, price=?, price_per_sqft=?,
            state=?, district=?, city=?, pincode=?, 
            contact_mobile=?, contact_whatsapp=?, youtube_video=?, map_link=?, extra_details=?
            WHERE id=?";
            
    $stmt = $pdo->prepare($sql);
    try {
        if($stmt->execute([$title, $cat, $area, $desc, $price, $sqft, $state, $dist, $city, $pin, $mobile, $wa, $vid, $map, $extras, $id])) {
            echo json_encode(['status' => 'success']);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'DB Update Failed']);
        }
    } catch (PDOException $e) {
        // Fallback if some columns don't exist (e.g. older schema)
        // We log error but try to return informative message
        echo json_encode(['status' => 'error', 'message' => 'DB Schema Error: ' . $e->getMessage()]);
    }

} elseif ($action === 'update_status') {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
    $id = $_POST['id'];
    $status = $_POST['status'];
    $stmt = $pdo->prepare("UPDATE properties SET status = ? WHERE id = ?");
    $stmt->execute([$status, $id]);
    echo json_encode(['status' => 'success']);

} elseif ($action === 'boost') {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['status' => 'error', 'message' => 'Login required']);
        exit;
    }

    // Role Check (Optional, user said "Agent")
    if (($_SESSION['role'] ?? '') !== 'agent') {
        echo json_encode(['status' => 'error', 'message' => 'Only agents can boost properties']);
        exit;
    }
    
    $propId = $_POST['id'];
    $userId = $_SESSION['user_id'];
    $amount = 100;

    // Check Ownership & Status
    $stmt = $pdo->prepare("SELECT user_id, is_featured FROM properties WHERE id = ?");
    $stmt->execute([$propId]);
    $prop = $stmt->fetch();

    if (!$prop) {
        echo json_encode(['status' => 'error', 'message' => 'Property not found']);
        exit;
    }
    
    if ($prop['user_id'] != $userId) {
        echo json_encode(['status' => 'error', 'message' => 'You do not own this property']);
        exit;
    }

    if ($prop['is_featured']) {
        echo json_encode(['status' => 'error', 'message' => 'Already featured']);
        exit;
    }

    // Check Wallet
    $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
    $stmt->execute([$userId]);
    $user = $stmt->fetch();

    if (($user['wallet_balance'] ?? 0) < $amount) {
        echo json_encode(['status' => 'error', 'message' => 'Low Balance! Recharge Wallet.']);
        exit;
    }

    // Transaction
    $pdo->beginTransaction();
    try {
        // Deduct
        $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
        $stmt->execute([$amount, $userId]);

        // Record
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'debit', ?)");
        $stmt->execute([$userId, $amount, "Featured Property Boost: " . $propId]);

        // Feature
        $stmt = $pdo->prepare("UPDATE properties SET is_featured=1 WHERE id=?");
        $stmt->execute([$propId]);
        
        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Boosted Successfully! -₹100']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Transaction Failed']);
    }
} elseif ($action === 'delete') {
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
    $id = $_POST['id'];
    $stmt = $pdo->prepare("DELETE FROM properties WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['status' => 'success']);
}
?>
