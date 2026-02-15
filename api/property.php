<?php
require_once '../includes/db.php';
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
    
    $sql .= " ORDER BY p.created_at DESC LIMIT 50 OFFSET $offset";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll(), 'role' => $_SESSION['role']??'guest']);

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
