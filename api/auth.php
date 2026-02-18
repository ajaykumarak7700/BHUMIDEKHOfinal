<?php
session_start();
require_once '../includes/db.php';

header('Content-Type: application/json');

// Handle JSON input as well if needed, but sticking to POST as per usual form submission or fetch formData
// If the input is raw JSON, decode it:
// $_POST = json_decode(file_get_contents('php://input'), true);
// But standard FormData uses $_POST directly. Using $_POST for simplicity with FormData.

$action = $_POST['action'] ?? '';

if ($action === 'signup') {
    $name = $_POST['name'] ?? '';
    $mobile = $_POST['mobile'] ?? '';
    $password = $_POST['password'] ?? '';
    $role = $_POST['role'] ?? 'customer'; 

    if (!$name || !$mobile || !$password) {
        echo json_encode(['status' => 'error', 'message' => 'All fields are required']);
        exit;
    }

    // Check if mobile exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE mobile = ?");
    $stmt->execute([$mobile]);
    if ($stmt->fetch()) {
        echo json_encode(['status' => 'error', 'message' => 'Mobile number already registered']);
        exit;
    }

    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (name, mobile, password, role) VALUES (?, ?, ?, ?)");
    if ($stmt->execute([$name, $mobile, $hashed_password, $role])) {
        echo json_encode(['status' => 'success', 'message' => 'Registration successful']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Registration failed']);
    }

} elseif ($action === 'login') {
    $mobile = $_POST['mobile'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM users WHERE mobile = ?");
    $stmt->execute([$mobile]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['name'] = $user['name'];
        $_SESSION['wallet'] = $user['wallet_balance'] ?? 0;
        echo json_encode(['status' => 'success', 'role' => $user['role'], 'message' => 'Login successful']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid credentials']);
    }

} elseif ($action === 'logout') {
    session_destroy();
    echo json_encode(['status' => 'success']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}
?>
