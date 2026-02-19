<?php
// api/wallet_v2.php
// Complete Rewrite of Wallet Logic in Hindi/English
session_start();
require_once '../includes/db.php';
header('Content-Type: application/json');

// 1. Authentication Check
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Please Login First']);
    exit;
}

$user_id = $_SESSION['user_id'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// ==========================================
// USER ACTIONS (Customer/Agent)
// ==========================================

// Action: Wallet Info (Balance & History)
if ($action === 'get_wallet') {
    // Balance layein
    $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $balance = $stmt->fetchColumn() ?: 0.00;

    // Last 10 Transactions
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10");
    $stmt->execute([$user_id]);
    $history = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success',
        'balance' => $balance,
        'history' => $history
    ]);
    exit;
}

// Action: Request Recharge (Deposit)
if ($action === 'deposit_request') {
    $amount = filter_input(INPUT_POST, 'amount', FILTER_VALIDATE_FLOAT);
    
    // Validate Amount
    if (!$amount || $amount <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid Amount']);
        exit;
    }

    // Handle Image Upload
    $proofImage = '';
    if (isset($_FILES['proof']) && $_FILES['proof']['error'] === UPLOAD_ERR_OK) {
        $ext = pathinfo($_FILES['proof']['name'], PATHINFO_EXTENSION);
        $fileName = 'deposit_' . time() . '_' . $user_id . '.' . $ext;
        $targetDir = '../uploads/';
        
        // Create folder if missing
        if (!file_exists($targetDir)) mkdir($targetDir, 0777, true);

        if (move_uploaded_file($_FILES['proof']['tmp_name'], $targetDir . $fileName)) {
            $proofImage = $fileName;
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Failed to upload image']);
            exit;
        }
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Payment Screenshot is Required']);
        exit;
    }

    // Insert Request
    try {
        $stmt = $pdo->prepare("INSERT INTO recharge_requests (user_id, amount, proof_image, status) VALUES (?, ?, ?, 'pending')");
        $stmt->execute([$user_id, $amount, $proofImage]);
        echo json_encode(['status' => 'success', 'message' => 'Deposit Request Sent! Wait for Admin approval.']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB Error: ' . $e->getMessage()]);
    }
    exit;
}

// Action: Request Withdrawal
if ($action === 'withdraw_request') {
    $amount = filter_input(INPUT_POST, 'amount', FILTER_VALIDATE_FLOAT);
    $upi = $_POST['upi'] ?? '';
    
    if (!$amount || $amount <= 0) {
        echo json_encode(['status' => 'error', 'message' => 'Invalid Amount']);
        exit;
    }

    // Check Balance
    $stmt = $pdo->prepare("SELECT wallet_balance FROM users WHERE id = ?");
    $stmt->execute([$user_id]);
    $current_balance = $stmt->fetchColumn();

    if ($current_balance < $amount) {
        echo json_encode(['status' => 'error', 'message' => 'Insufficient Balance in Wallet']);
        exit;
    }

    // Insert Request
    try {
        $stmt = $pdo->prepare("INSERT INTO withdrawal_requests (user_id, amount, upi_id, status) VALUES (?, ?, ?, 'pending')");
        $stmt->execute([$user_id, $amount, $upi]);
        echo json_encode(['status' => 'success', 'message' => 'Withdrawal Request Sent!']);
    } catch (Exception $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB Error']);
    }
    exit;
}

// ==========================================
// ADMIN ACTIONS
// ==========================================

// Security Check for Admin
if ($action === 'get_all_requests' || $action === 'process_deposit' || $action === 'process_withdrawal') {
    if ($_SESSION['role'] !== 'admin') {
        echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
        exit;
    }
}

// Get All Requests (Pending only)
if ($action === 'get_all_requests') {
    // Fetch pending deposits
    $deposits = $pdo->query("
        SELECT r.*, u.name, u.mobile, u.role 
        FROM recharge_requests r 
        JOIN users u ON r.user_id = u.id 
        WHERE r.status = 'pending' 
        ORDER BY r.created_at DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    // Fetch pending withdrawals
    $withdrawals = $pdo->query("
        SELECT w.*, u.name, u.mobile, u.role 
        FROM withdrawal_requests w 
        JOIN users u ON w.user_id = u.id 
        WHERE w.status = 'pending' 
        ORDER BY w.created_at DESC
    ")->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'status' => 'success', 
        'deposits' => $deposits, 
        'withdrawals' => $withdrawals
    ]);
    exit;
}

// Process Deposit (Approve/Reject)
if ($action === 'process_deposit') {
    $req_id = $_POST['req_id'];
    $status = $_POST['status']; // 'approved' or 'rejected'

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM recharge_requests WHERE id = ? AND status = 'pending'");
        $stmt->execute([$req_id]);
        $req = $stmt->fetch();

        if (!$req) throw new Exception("Request invalid or already processed");

        if ($status === 'approved') {
            // Update User Wallet
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            if (!$stmt->execute([$req['amount'], $req['user_id']])) throw new Exception("Update failed");

            // Log Transaction
            $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'credit', 'Deposit Approved')");
            $stmt->execute([$req['user_id'], $req['amount']]);
        }

        // Update Request Status
        $stmt = $pdo->prepare("UPDATE recharge_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $req_id]);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Deposit ' . ucfirst($status)]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}

// Process Withdrawal (Approve/Reject)
if ($action === 'process_withdrawal') {
    $req_id = $_POST['req_id'];
    $status = $_POST['status']; 

    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare("SELECT * FROM withdrawal_requests WHERE id = ? AND status = 'pending'");
        $stmt->execute([$req_id]);
        $req = $stmt->fetch();

        if (!$req) throw new Exception("Request invalid");

        if ($status === 'approved') {
            // Deduct Money
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
            $stmt->execute([$req['amount'], $req['user_id']]);

            // Log
            $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'debit', 'Withdrawal Approved')");
            $stmt->execute([$req['user_id'], $req['amount']]);
        }

        $stmt = $pdo->prepare("UPDATE withdrawal_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $req_id]);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Withdrawal ' . ucfirst($status)]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
    exit;
}
?>
