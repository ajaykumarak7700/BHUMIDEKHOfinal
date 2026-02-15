<?php
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$action = $_POST['action'] ?? $_GET['action'] ?? '';
$user_id = $_SESSION['user_id'];

if ($action === 'get_balance') {
    $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    echo json_encode(['status' => 'success', 'balance' => $stmt->fetchColumn()]);

} elseif ($action === 'request_withdrawal') {
    $amount = $_POST['amount'];
    
    // Check balance
    $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $balance = $stmt->fetchColumn();

    if ($amount > $balance) {
        echo json_encode(['status' => 'error', 'message' => 'Insufficient balance']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        // Deduct balance immediately or hold it? Let's just record request.
        // Usually systems deduct on approval or hold. Let's deduct on approval for simplicity or mark as 'pending'
        // Ideally: Insert into requests
        $stmt = $pdo->prepare("INSERT INTO withdrawal_requests (user_id, amount) VALUES (?, ?)");
        $stmt->execute([$user_id, $amount]);
        
        echo json_encode(['status' => 'success', 'message' => 'Request submitted']);
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => 'Error processing']);
    }

} elseif ($action === 'admin_withdraw_action') {
    if ($_SESSION['role'] !== 'admin') exit(json_encode(['status'=>'error']));

    $req_id = $_POST['req_id'];
    $status = $_POST['status']; // approved, rejected
    
    $stmt = $pdo->prepare("SELECT * FROM withdrawal_requests WHERE id = ?");
    $stmt->execute([$req_id]);
    $req = $stmt->fetch();

    if (!$req || $req['status'] !== 'pending') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        if ($status === 'approved') {
            // Deduct from user wallet
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
            $stmt->execute([$req['amount'], $req['user_id']]);
            
            // Log transaction
            $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'debit', 'Withdrawal Approved')");
            $stmt->execute([$req['user_id'], $req['amount']]);
        }
        
        $stmt = $pdo->prepare("UPDATE withdrawal_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $req_id]);
        
        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} elseif ($action === 'get_requests') {
    if ($_SESSION['role'] !== 'admin') exit;
    $stmt = $pdo->query("SELECT w.*, u.name, u.mobile FROM withdrawal_requests w JOIN users u ON w.user_id = u.id WHERE w.status = 'pending'");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);
}
?>
