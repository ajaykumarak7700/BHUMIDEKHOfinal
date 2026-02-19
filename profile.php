<?php
session_start();
// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: index.php");
    exit;
}
$user_name = $_SESSION['name'] ?? 'User';
$user_role = $_SESSION['role'] ?? 'customer';
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Wallet | BhumiDekho</title>
    <!-- Simple, Clean CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        body { font-family: sans-serif; background: #f4f6f8; margin: 0; padding: 0; }
        .header { background: #fff; padding: 15px; border-bottom: 1px solid #ddd; display: flex; align-items: center; }
        .header h1 { margin: 0; font-size: 18px; flex: 1; text-align: center; color: #333; }
        .back-btn { background: none; border: none; font-size: 20px; cursor: pointer; color: #555; }
        
        .container { max-width: 600px; margin: 0 auto; padding: 15px; }
        
        /* Wallet Card */
        .wallet-card {
            background: linear-gradient(135deg, #2e7d32, #66bb6a);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
            margin-bottom: 25px;
        }
        .balance-label { font-size: 14px; opacity: 0.9; }
        .balance { font-size: 36px; font-weight: bold; margin: 5px 0 20px; }
        .btn-group { display: flex; gap: 15px; justify-content: center; }
        .action-btn {
            background: rgba(255,255,255,0.2);
            border: 1px solid rgba(255,255,255,0.4);
            color: white;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: 0.2s;
        }
        .action-btn:hover { background: rgba(255,255,255,0.3); }
        .action-btn.active { background: white; color: #2e7d32; }
        
        /* Modals */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 999; justify-content: center; align-items: flex-end; }
        .modal.open { display: flex; }
        .modal-content { background: white; width: 100%; max-width: 600px; padding: 25px; border-radius: 20px 20px 0 0; animation: slideUp 0.3s; }
        @keyframes slideUp { from {transform: translateY(100%);} to {transform: translateY(0);} }
        
        .form-group { margin-bottom: 20px; }
        .form-group label { display: block; margin-bottom: 8px; font-weight: bold; color: #555; }
        .form-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 16px; box-sizing: border-box; }
        .submit-btn { width: 100%; padding: 15px; background: #2e7d32; color: white; border: none; border-radius: 10px; font-size: 16px; font-weight: bold; cursor: pointer; }
        .cancel-btn { width: 100%; padding: 15px; background: none; border: none; color: #777; margin-top: 5px; cursor: pointer; font-size: 14px; }
        
        /* History */
        .history-list { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .history-item { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
        .history-item:last-child { border-bottom: none; }
        .h-left { }
        .h-desc { font-weight: 500; font-size: 14px; color: #333; }
        .h-date { font-size: 12px; color: #999; margin-top: 4px; }
        .h-amount { font-weight: bold; font-size: 15px; }
        .credit { color: #2e7d32; }
        .debit { color: #c62828; }
        
        .empty-state { padding: 30px; text-align: center; color: #999; font-size: 14px; }
    </style>
</head>
<body>

    <div class="header">
        <button class="back-btn" onclick="location.href='index.php'"><i class="fas fa-arrow-left"></i></button>
        <h1>My Wallet</h1>
    </div>

    <div class="container">
        <!-- Balance Card -->
        <div class="wallet-card">
            <div class="balance-label">Current Balance</div>
            <div class="balance" id="display-balance">₹ 0.00</div>
            <div class="btn-group">
                <button class="action-btn active" onclick="openModal('deposit-modal')">
                    <i class="fas fa-plus"></i> Add Money
                </button>
                <button class="action-btn" onclick="openModal('withdraw-modal')">
                    <i class="fas fa-arrow-down"></i> Withdraw
                </button>
            </div>
        </div>

        <h3 style="margin: 20px 0 10px; color: #444;">Recent Transactions</h3>
        <div class="history-list" id="tx-list">
            <div class="empty-state">Loading...</div>
        </div>
    </div>

    <!-- Deposit Modal -->
    <div id="deposit-modal" class="modal">
        <div class="modal-content">
            <h2 style="margin-top:0;">Add Money (Deposit)</h2>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="dep-amount" class="form-input" placeholder="Enter Amount (e.g. 500)">
            </div>
             <div class="form-group">
                <label>Upload Payment Screenshot</label>
                <div style="background:#f9f9f9; padding:15px; border:1px dashed #ccc; text-align:center; border-radius:8px;">
                    <input type="file" id="dep-proof" accept="image/*">
                </div>
            </div>
            <div style="font-size:13px; color:#555; background:#e8f5e9; padding:10px; border-radius:8px; margin-bottom:20px;">
                <i class="fas fa-info-circle"></i> Pay to UPI ID: <strong>bhumidekho@upi</strong> and upload the screenshot here.
            </div>
            <button class="submit-btn" onclick="submitDeposit()">Submit Deposit Request</button>
            <button class="cancel-btn" onclick="closeModal('deposit-modal')">Cancel</button>
        </div>
    </div>

    <!-- Withdraw Modal -->
    <div id="withdraw-modal" class="modal">
        <div class="modal-content">
            <h2 style="margin-top:0;">Withdraw Money</h2>
            <div class="form-group">
                <label>Amount (₹)</label>
                <input type="number" id="with-amount" class="form-input" placeholder="Enter Amount to Withdraw">
            </div>
            <div class="form-group">
                <label>UPI ID (to receive money)</label>
                <input type="text" id="with-upi" class="form-input" placeholder="e.g. 9876543210@ybl">
            </div>
            <button class="submit-btn" style="background:#c62828;" onclick="submitWithdraw()">Request Withdrawal</button>
            <button class="cancel-btn" onclick="closeModal('withdraw-modal')">Cancel</button>
        </div>
    </div>

    <script>
        // Load Wallet Data on Start
        document.addEventListener('DOMContentLoaded', loadWallet);

        async function loadWallet() {
            try {
                const res = await fetch('api/wallet.php?action=get_wallet');
                const data = await res.json();
                
                if(data.status === 'success') {
                    document.getElementById('display-balance').innerText = '₹ ' + parseFloat(data.balance).toLocaleString('en-IN', {minimumFractionDigits: 2});
                    
                    const list = document.getElementById('tx-list');
                    list.innerHTML = '';
                    
                    if(data.history.length === 0) {
                        list.innerHTML = '<div class="empty-state">No transactions yet.</div>';
                    } else {
                        data.history.forEach(tx => {
                            const isCredit = tx.type === 'credit';
                            const colorClass = isCredit ? 'credit' : 'debit';
                            const sign = isCredit ? '+' : '-';
                            list.innerHTML += `
                                <div class="history-item">
                                    <div class="h-left">
                                        <div class="h-desc">${tx.description}</div>
                                        <div class="h-date">${tx.created_at}</div>
                                    </div>
                                    <div class="h-amount ${colorClass}">${sign} ₹ ${parseFloat(tx.amount).toFixed(2)}</div>
                                </div>
                            `;
                        });
                    }
                }
            } catch(e) { console.error(e); }
        }

        function openModal(id) { document.getElementById(id).classList.add('open'); }
        function closeModal(id) { document.getElementById(id).classList.remove('open'); }

        // Submit Deposit
        async function submitDeposit() {
            const amount = document.getElementById('dep-amount').value;
            const proof = document.getElementById('dep-proof').files[0];

            if(!amount || amount <= 0) { alert("Enter valid amount"); return; }
            if(!proof) { alert("Please upload screenshot"); return; }

            const btn = event.target;
            btn.innerText = "Uploading...";
            btn.disabled = true;

            const fd = new FormData();
            fd.append('action', 'deposit_request');
            fd.append('amount', amount);
            fd.append('proof', proof);

            try {
                const res = await fetch('api/wallet.php', { method: 'POST', body: fd });
                const data = await res.json();
                if(data.status === 'success') {
                    alert('Success! Admin will approve soon.');
                    closeModal('deposit-modal');
                    location.reload();
                } else {
                    alert(data.message);
                }
            } catch(e) { alert("Connection Error"); }
            
            btn.innerText = "Submit Deposit Request";
            btn.disabled = false;
        }

        // Submit Withdraw
        async function submitWithdraw() {
            const amount = document.getElementById('with-amount').value;
            const upi = document.getElementById('with-upi').value;

            if(!amount || amount <= 0) { alert("Enter valid amount"); return; }
            if(!upi) { alert("Enter UPI ID"); return; }

            const btn = event.target;
            btn.innerText = "Processing...";
            btn.disabled = true;

            const fd = new FormData();
            fd.append('action', 'withdraw_request');
            fd.append('amount', amount);
            fd.append('upi', upi);

            try {
                const res = await fetch('api/wallet.php', { method: 'POST', body: fd });
                const data = await res.json();
                if(data.status === 'success') {
                    alert('Withdrawal Request Sent!');
                    closeModal('withdraw-modal');
                    location.reload();
                } else {
                    alert(data.message);
                }
            } catch(e) { alert("Connection Error"); }

            btn.innerText = "Request Withdrawal";
            btn.disabled = false;
        }
    </script>
</body>
</html>
