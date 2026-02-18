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

} elseif ($action === 'request_recharge') {
    // Ensure table exists
    $pdo->exec("CREATE TABLE IF NOT EXISTS recharge_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        proof_image TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");

    $amount = $_POST['amount'];
    $proofBase64 = $_POST['proof']; 

    // Save Image
    $imagePath = '';
    if ($proofBase64) {
        $data = explode(',', $proofBase64);
        $content = base64_decode(end($data));
        $fileName = 'proof_' . time() . '_' . $user_id . '.jpg';
        $path = '../uploads/' . $fileName;
        file_put_contents($path, $content);
        $imagePath = $fileName;
    }

    $stmt = $pdo->prepare("INSERT INTO recharge_requests (user_id, amount, proof_image) VALUES (?, ?, ?)");
    if ($stmt->execute([$user_id, $amount, $imagePath])) {
        echo json_encode(['status' => 'success', 'message' => 'Recharge Request Submitted! Admin will verify soon.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'DB Insert Failed']);
    }

} elseif ($action === 'approve_recharge') {
    if ($_SESSION['role'] !== 'admin') exit(json_encode(['status'=>'error', 'message'=>'Unauthorized']));

    $req_id = $_POST['req_id'];
    $status = $_POST['status']; // approved, rejected

    $stmt = $pdo->prepare("SELECT * FROM recharge_requests WHERE id = ?");
    $stmt->execute([$req_id]);
    $req = $stmt->fetch();

    if (!$req || $req['status'] !== 'pending') {
        echo json_encode(['status' => 'error', 'message' => 'Invalid Request']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        if ($status === 'approved') {
            // Credit User Wallet
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            $stmt->execute([$req['amount'], $req['user_id']]);

            // Log Transaction
            $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, 'credit', 'Wallet Recharge (Approved)')");
            $stmt->execute([$req['user_id'], $req['amount']]);
        }

        // Update Request Status
        $stmt = $pdo->prepare("UPDATE recharge_requests SET status = ? WHERE id = ?");
        $stmt->execute([$status, $req_id]);

        $pdo->commit();
        echo json_encode(['status' => 'success', 'message' => 'Request ' . ucfirst($status)]);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }

} elseif ($action === 'get_recharge_requests') {
    // Admin only
    if ($_SESSION['role'] !== 'admin') exit;
    $stmt = $pdo->query("SELECT r.*, u.name, u.mobile FROM recharge_requests r JOIN users u ON r.user_id = u.id WHERE r.status = 'pending' ORDER BY r.created_at DESC");
    echo json_encode(['status' => 'success', 'data' => $stmt->fetchAll()]);

} elseif ($action === 'admin_adjust_wallet') {
    // Sync Endpoint for App-based Admin Actions
    if ($_SESSION['role'] !== 'admin') exit(json_encode(['status'=>'error', 'message'=>'Unauthorized']));

    $target_user_id = $_POST['user_id'];
    $amount = $_POST['amount'];
    $type = $_POST['type']; // 'credit' or 'debit'

    if (!$target_user_id || !$amount) exit(json_encode(['status'=>'error', 'message'=>'Missing Data']));

    $pdo->beginTransaction();
    try {
        if ($type === 'credit') {
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance + ? WHERE id = ?");
            $desc = "Admin Adjustment (Credit)";
        } else {
            $stmt = $pdo->prepare("UPDATE users SET wallet_balance = wallet_balance - ? WHERE id = ?");
            $desc = "Admin Adjustment (Debit)";
        }
        $stmt->execute([$amount, $target_user_id]);

        $stmt = $pdo->prepare("INSERT INTO transactions (user_id, amount, type, description) VALUES (?, ?, ?, ?)");
        $stmt->execute([$target_user_id, $amount, $type, $desc]);

        $pdo->commit();
        echo json_encode(['status' => 'success']);
    } catch (Exception $e) {
        $pdo->rollBack();
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
}
?>
