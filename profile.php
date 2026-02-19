<?php
session_start();
require_once 'includes/db.php';

if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}

$userState = [
    'id' => $_SESSION['user_id'],
    'name' => $_SESSION['name'] ?? 'User',
    'role' => $_SESSION['role'],
    'wallet_balance' => 0.00
];

// Fetch fresh details
try {
    $stmt = $pdo->prepare("SELECT name, mobile, email, wallet_balance, role FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    if($user) {
        $userState = array_merge($userState, $user);
    }
} catch(Exception $e) {
    // Silent fail
}

// Fetch transaction history
$transactions = [];
try {
    $stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
    $stmt->execute([$_SESSION['user_id']]);
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch(Exception $e) {}

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - BhumiDekho</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root { --primary: #00c853; --dark: #1b5e20; --light: #f5f5f5; --white: #ffffff; }
        body { margin:0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--light); color: #333; }
        .header { background: var(--white); padding: 15px; display:flex; align-items:center; box-shadow: 0 1px 5px rgba(0,0,0,0.05); }
        .header h1 { margin:0; font-size: 18px; flex:1; text-align:center; }
        .back-btn { font-size: 20px; color: #333; cursor:pointer; background:none; border:none; }
        
        .profile-card { background: var(--white); padding: 20px; margin: 15px; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .avatar { width: 80px; height: 80px; background: #e8f5e9; border-radius: 50%; display:flex; align-items:center; justify-content:center; margin: 0 auto 10px; color: var(--primary); font-size: 30px; }
        .user-name { font-size: 20px; font-weight: bold; margin-bottom: 5px; }
        .user-role { font-size: 14px; color: #666; background: #eee; padding: 2px 10px; border-radius: 10px; display:inline-block; }
        
        .wallet-card { background: linear-gradient(135deg, var(--dark), var(--primary)); color: white; padding: 20px; margin: 15px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,128,0,0.2); }
        .wallet-label { font-size: 14px; opacity: 0.9; }
        .wallet-amount { font-size: 32px; font-weight: bold; margin: 5px 0 15px; }
        .wallet-actions { display: flex; gap: 10px; }
        .w-btn { flex: 1; padding: 10px; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 5px; }
        .w-btn.add { background: white; color: var(--primary); }
        .w-btn.withdraw { background: rgba(255,255,255,0.2); color: white; backdrop-filter: blur(5px); }
        
        .section-title { padding: 0 15px; font-size: 16px; font-weight: 600; color: #555; margin-bottom: 10px; }
        .tx-list { background: var(--white); margin: 0 15px 80px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .tx-item { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .tx-item:last-child { border-bottom: none; }
        .tx-desc { font-weight: 500; font-size: 14px; }
        .tx-date { font-size: 11px; color: #999; margin-top: 3px; }
        .tx-amount { font-weight: bold; font-size: 15px; }
        .credit { color: green; }
        .debit { color: red; }
        
        /* Modals */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; align-items: end; }
        .modal.open { display: flex; }
        .modal-content { background: white; width: 100%; padding: 20px; border-radius: 20px 20px 0 0; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        .form-group { margin-bottom: 15px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; }
        .form-control { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; }
        .btn-submit { width: 100%; padding: 14px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-top: 10px; }
    </style>
</head>
<body>

    <div class="header">
        <button class="back-btn" onclick="location.href='index.php'"><i class="fas fa-arrow-left"></i></button>
        <h1>My Profile</h1>
        <button class="back-btn" onclick="handleLogout()"><i class="fas fa-sign-out-alt" style="color:#d32f2f"></i></button>
    </div>

    <div class="profile-card">
        <div class="avatar"><i class="fas fa-user"></i></div>
        <div class="user-name"><?php echo htmlspecialchars($userState['name']); ?></div>
        <div class="user-role"><?php echo ucfirst($userState['role']); ?></div>
        <div style="margin-top:5px; font-size:13px; color:#777;"><?php echo $userState['mobile']; ?></div>
    </div>

    <div class="wallet-card">
        <div class="wallet-label">Available Balance</div>
        <div class="wallet-amount">₹ <?php echo number_format($userState['wallet_balance'], 2); ?></div>
        <div class="wallet-actions">
            <button class="w-btn add" onclick="openModal('recharge')"><i class="fas fa-plus-circle"></i> Add Money</button>
            <button class="w-btn withdraw" onclick="openModal('withdraw')"><i class="fas fa-arrow-down"></i> Withdraw</button>
        </div>
    </div>

    <div class="section-title">Recent Transactions</div>
    <div class="tx-list">
        <?php if(empty($transactions)): ?>
            <div style="padding:20px; text-align:center; color:#999;">No transactions yet</div>
        <?php else: ?>
            <?php foreach($transactions as $tx): ?>
                <div class="tx-item">
                    <div>
                        <div class="tx-desc"><?php echo htmlspecialchars($tx['description']); ?></div>
                        <div class="tx-date"><?php echo date('d M Y, h:i A', strtotime($tx['created_at'])); ?></div>
                    </div>
                    <div class="tx-amount <?php echo $tx['type']; ?>">
                        <?php echo ($tx['type'] == 'credit' ? '+' : '-'); ?> ₹<?php echo number_format($tx['amount'], 2); ?>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php endif; ?>
    </div>

    <!-- Recharge Modal -->
    <div id="recharge-modal" class="modal">
        <div class="modal-content">
            <h3>Add Money</h3>
            <p style="color:#666; font-size:13px; margin-bottom:15px;">Enter amount and upload payment screenshot.</p>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="r-amount" class="form-control" placeholder="e.g. 500">
            </div>
            <div class="form-group">
                <label>Payment Proof (Screenshot)</label>
                <input type="file" id="r-proof" class="form-control" accept="image/*">
            </div>
            <div style="padding:10px; background:#e3f2fd; border-radius:8px; margin-bottom:15px; font-size:12px;">
                <strong>Bank Details:</strong><br>
                UPI: bhumidekho@upi<br>
                Pay via any UPI app and upload screenshot.
            </div>
            <button class="btn-submit" onclick="submitRecharge()">Submit Request</button>
            <button onclick="closeModals()" style="width:100%; padding:14px; background:none; border:none; margin-top:5px; color:#666;">Cancel</button>
        </div>
    </div>

    <!-- Withdraw Modal -->
    <div id="withdraw-modal" class="modal">
        <div class="modal-content">
            <h3>Withdraw Money</h3>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="w-amount" class="form-control" placeholder="Amount to withdraw">
            </div>
            <p style="font-size:12px; color:#666;">Withdrawal requests are processed within 24 hours.</p>
            <button class="btn-submit" style="background:#d32f2f;" onclick="submitWithdraw()">Request Withdrawal</button>
            <button onclick="closeModals()" style="width:100%; padding:14px; background:none; border:none; margin-top:5px; color:#666;">Cancel</button>
        </div>
    </div>

    <script>
        function openModal(type) {
            document.getElementById(type + '-modal').classList.add('open');
        }
        function closeModals() {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('open'));
        }
        
        async function submitWithdraw() {
            const amt = document.getElementById('w-amount').value;
            if(!amt || amt <= 0) { alert('Invalid amount'); return; }
            
            const btn = event.target;
            btn.disabled = true;
            btn.innerText = 'Processing...';
            
            const fd = new FormData();
            fd.append('action', 'request_withdrawal');
            fd.append('amount', amt);
            
            try {
                const res = await fetch('api/wallet.php', { method:'POST', body:fd });
                const d = await res.json();
                if(d.status === 'success') {
                    alert('Withdrawal Request Sent!');
                    location.reload();
                } else {
                    alert(d.message);
                    btn.disabled = false;
                    btn.innerText = 'Request Withdrawal';
                }
            } catch(e) { alert('Error'); btn.disabled=false; }
        }

        async function submitRecharge() {
            const amt = document.getElementById('r-amount').value;
            const proof = document.getElementById('r-proof').files[0];
            
            if(!amt || amt <= 0) { alert('Invalid amount'); return; }
            if(!proof) { alert('Please upload proof'); return; }
            
            const btn = event.target;
            btn.disabled = true;
            btn.innerText = 'Uploading...';
            
            const reader = new FileReader();
            reader.readAsDataURL(proof);
            reader.onload = async function() {
                const base64 = reader.result;
                
                const fd = new FormData();
                fd.append('action', 'request_recharge');
                fd.append('amount', amt);
                fd.append('proof', base64); // Send as base64 for simplicity with existing api/wallet logic
                
                try {
                    const res = await fetch('api/wallet.php', { method:'POST', body:fd });
                    const d = await res.json();
                    if(d.status === 'success') {
                        alert('Deposit Request Sent!');
                        location.reload();
                    } else {
                        alert(d.message);
                        btn.disabled = false;
                        btn.innerText = 'Submit Request';
                    }
                } catch(e) { alert('Error'); btn.disabled=false; }
            };
        }

        async function handleLogout() {
             if(!confirm('Logout?')) return;
             const fd = new FormData(); fd.append('action', 'logout');
             await fetch('api/auth.php', { method:'POST', body:fd });
             location.href = 'index.php';
        }
    </script>
</body>
</html>
