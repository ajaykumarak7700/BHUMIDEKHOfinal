<?php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';

if ($action === 'get_agents') {
    $stmt = $pdo->query("SELECT id, name, mobile, wallet_balance, created_at FROM users WHERE role = 'agent' ORDER BY created_at DESC");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);

} elseif ($action === 'add_funds') {
    $agent_id = $_POST['agent_id'] ?? 0;
    $amount = $_POST['amount'] ?? 0;
    
    if ($amount <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid amount']);
        exit;
    }

    try {
        $pdo->beginTransaction();
        
        // Update user wallet
        $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
        $stmt->execute([$amount, $agent_id]);

        // Record transaction
        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'credit', 'Admin added funds')");
        $stmt->execute([$agent_id, $amount]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid action']);
}
?>
