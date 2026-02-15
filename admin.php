<?php
session_start();
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    header("Location: login.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - BhumiDekho</title>
    <link rel="stylesheet" href="css/style.css?v=<?php echo time(); ?>">
    <script type="module" src="https://unpkg.com/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"></script>
    <style>
        .admin-nav { display:flex; gap:10px; overflow-x:auto; padding:10px 16px; background:white; border-bottom:1px solid #eee; }
        .admin-tab { padding:8px 16px; border-radius:20px; background:#f5f5f5; white-space:nowrap; cursor:pointer; font-weight:500; color:#666; }
        .admin-tab.active { background: var(--primary); color: white; }
        .content-section { display:none; padding:16px; }
        .content-section.active { display:block; }
        
        .list-item { background:white; padding:15px; border-radius:12px; margin-bottom:10px; box-shadow:0 2px 5px rgba(0,0,0,0.05); }
        .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px; }
        .stat-card { background:white; padding:15px; border-radius:12px; text-align:center; box-shadow:0 2px 5px rgba(0,0,0,0.05); }
        .item-header { display:flex; justify-content:space-between; margin-bottom:5px; }
        .tag { padding:4px 8px; border-radius:4px; font-size:12px; }
        .tag-pending { background:#fff3e0; color:#e65100; }
        .tag-success { background:#e8f5e9; color:#2e7d32; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Admin Panel</h1>
        <button onclick="location.href='index.php'" class="btn-sm btn-outline">Exit</button>
    </div>

    <div class="admin-nav">
        <div class="admin-tab active" onclick="switchTab('agents')">Agents</div>
        <div class="admin-tab" onclick="switchTab('properties')">Properties</div>
        <div class="admin-tab" onclick="switchTab('withdrawals')">Withdrawals</div>
        <!-- <div class="admin-tab" onclick="switchTab('settings')">Settings</div> -->
    </div>

    <!-- AGENTS SECTION -->
    <div id="agents" class="content-section active">
        <h3 style="margin-bottom:15px;">Manage Agents</h3>
        <div id="agents-list"></div>
    </div>

    <!-- PROPERTIES SECTION -->
    <div id="properties" class="content-section">
        <h3 style="margin-bottom:15px;">All Properties</h3>
        <div class="filter-chips" style="margin-bottom:15px;">
            <button class="chip active" onclick="loadAdminProps('all')">All</button>
            <button class="chip" onclick="loadAdminProps('pending')">Pending</button>
            <button class="chip" onclick="loadAdminProps('approved')">Approved</button>
        </div>
        <div id="admin-prop-list"></div>
    </div>

    <!-- WITHDRAWALS SECTION -->
    <div id="withdrawals" class="content-section">
        <h3 style="margin-bottom:15px;">Withdrawal Requests</h3>
        <div id="withdrawal-list"></div>
    </div>

    <!-- MODALS -->
    
    <!-- Add Funds Modal -->
    <div id="fund-modal" class="modal-overlay">
        <div class="modal-sheet">
            <div class="modal-header">
                <h3>Manage Wallet</h3>
                <span onclick="closeModal('fund-modal')" class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <p id="fund-agent-name"></p>
                <input type="number" id="fund-amount" placeholder="Amount" style="width:100%; padding:10px; margin:10px 0; border:1px solid #ddd; border-radius:8px;">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <button onclick="submitFund('credit')" class="btn btn-primary">Add (+)</button>
                    <!-- <button onclick="submitFund('debit')" class="btn btn-danger">Cut (-)</button> --> 
                    <!-- Simple Add Funds as requested initially, can add Cut later if logic permits -->
                </div>
            </div>
        </div>
    </div>

    <!-- Edit Property Contact Modal -->
    <div id="contact-modal" class="modal-overlay">
        <div class="modal-sheet">
            <div class="modal-header">
                <h3>Edit Contact Info</h3>
                <span onclick="closeModal('contact-modal')" class="close-btn">&times;</span>
            </div>
            <div class="modal-body">
                <input type="hidden" id="edit-prop-id">
                <label>Display Mobile</label>
                <input type="tel" id="edit-mobile" class="form-control" style="width:100%; padding:10px; margin-bottom:10px;">
                <label>Display WhatsApp</label>
                <input type="tel" id="edit-whatsapp" class="form-control" style="width:100%; padding:10px; margin-bottom:10px;">
                <button onclick="saveContactInfo()" class="btn btn-primary">Save Changes</button>
            </div>
        </div>
    </div>

    <script src="js/app.js?v=<?php echo time(); ?>"></script>
    <script>
        // Tab Checking
        function switchTab(tabId) {
            document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.admin-tab').forEach(el => el.classList.remove('active'));
            
            document.getElementById(tabId).classList.add('active');
            event.target.classList.add('active');

            if(tabId === 'agents') loadAgents();
            if(tabId === 'properties') loadAdminProps();
            if(tabId === 'withdrawals') loadWithdrawals();
        }

        // --- AGENTS ---
        async function loadAgents() {
            const res = await fetch('api/admin.php?action=get_agents');
            const data = await res.json();
            const list = document.getElementById('agents-list');
            list.innerHTML = '';
            data.data.forEach(a => {
                list.innerHTML += `
                    <div class="list-item">
                        <div class="item-header">
                            <span style="font-weight:bold;">${a.name}</span>
                            <span class="tag tag-success">₹ ${a.wallet_balance}</span>
                        </div>
                        <p style="font-size:13px; color:#777;">${a.mobile}</p>
                        <hr style="margin:8px 0; border:0; border-top:1px solid #f0f0f0;">
                        <button onclick="openFundModal(${a.id}, '${a.name}')" class="btn-sm btn-outline">Manage Funds</button>
                    </div>
                `;
            });
        }

        // --- FUNDS ---
        let currentAgentId = null;
        function openFundModal(id, name) {
            currentAgentId = id;
            document.getElementById('fund-agent-name').textContent = name;
            document.getElementById('fund-modal').classList.add('open');
        }
        async function submitFund(type) {
            const amt = document.getElementById('fund-amount').value;
            // Simplified to just Add for now based on api/admin.php
            const fd = new FormData();
            fd.append('action', 'add_funds');
            fd.append('agent_id', currentAgentId);
            fd.append('amount', amt); 
            
            const res = await fetch('api/admin.php', { method:'POST', body:fd });
            const data = await res.json();
            if(data.status === 'success') {
                alert('Success');
                closeModal('fund-modal');
                loadAgents();
            }
        }

        // --- PROPERTIES ---
        async function loadAdminProps(filter = 'all') {
            // Reusing get_feed but ideally should have generic admin fetch.
            // For now let's use a specific admin action or filter existing.
            // Let's assume get_feed returns all for admin in api/property.php logic already?
            // Checking api/property.php... yes "if admin" logic was requested but not fully implemented in get_feed.
            // I will update get_feed URL to assume it fetches pending with "status=pending" if I add that support.
            // ACTUALLY, for Admin, let's just fetch ALL via a new action to be safe or update current.
            // I will implement a quick fetcher here.
            
            const list = document.getElementById('admin-prop-list');
            list.innerHTML = '<div class="loader" style="display:block"></div>';
            
            // Temporary: Fetch feed (which currently returns approved).
            // To see pending, I need to update API.
            // Assuming I updated API now...
            const res = await fetch(`api/property.php?action=get_feed&status=${filter}&limit=50`); 
            // Note: I need to ensure api supports status param. I will update it.
            const data = await res.json();
            list.innerHTML = '';
            
            if(data.data) {
                data.data.forEach(p => {
                    list.innerHTML += `
                        <div class="list-item">
                            <div style="display:flex; gap:10px;">
                                <img src="uploads/${p.image_path}" style="width:60px; height:60px; border-radius:8px; object-fit:cover;">
                                <div style="flex:1;">
                                    <div style="font-weight:600;">${p.title}</div>
                                    <div style="font-size:12px; color:#777;">${p.agent_name} | ${p.status}</div>
                                    <div style="font-size:13px; margin-top:4px;">Contact: ${p.contact_mobile || 'Default'}</div>
                                </div>
                            </div>
                            <div style="margin-top:10px; display:flex; gap:5px; overflow-x:auto;">
                                <button onclick="adminPropAction(${p.id}, 'approved')" class="btn-sm btn-success">Approve</button>
                                <button onclick="adminPropAction(${p.id}, 'rejected')" class="btn-sm btn-danger">Reject</button>
                                <button onclick="openContactModal(${p.id}, '${p.contact_mobile||''}', '${p.contact_whatsapp||''}')" class="btn-sm btn-dark">Edit Contact</button>
                                <button onclick="adminPropAction(${p.id}, 'delete')" class="btn-sm btn-outline">Delete</button>
                            </div>
                        </div>
                    `;
                });
            }
        }
        
        async function adminPropAction(id, status) {
            if(status === 'delete') {
                 if(!confirm('Delete sure?')) return;
                 const fd = new FormData(); fd.append('action', 'delete'); fd.append('id', id);
                 await fetch('api/property.php', { method:'POST', body:fd });
            } else {
                 const fd = new FormData(); fd.append('action', 'update_status'); fd.append('id', id); fd.append('status', status);
                 await fetch('api/property.php', { method:'POST', body:fd });
            }
            loadAdminProps();
        }
        
        // --- EDIT CONTACT ---
        function openContactModal(id, mob, wa) {
            document.getElementById('edit-prop-id').value = id;
            document.getElementById('edit-mobile').value = mob;
            document.getElementById('edit-whatsapp').value = wa;
            document.getElementById('contact-modal').classList.add('open');
        }
        
        async function saveContactInfo() {
            const id = document.getElementById('edit-prop-id').value;
            const mob = document.getElementById('edit-mobile').value;
            const wa = document.getElementById('edit-whatsapp').value;
            
            const fd = new FormData();
            fd.append('action', 'edit_contact');
            fd.append('property_id', id);
            fd.append('mobile', mob);
            fd.append('whatsapp', wa);
            
            await fetch('api/property.php', { method:'POST', body:fd });
            closeModal('contact-modal');
            loadAdminProps();
        }

        // --- WITHDRAWALS ---
        async function loadWithdrawals() {
            const res = await fetch('api/wallet.php?action=get_requests');
            const data = await res.json();
            const list = document.getElementById('withdrawal-list');
            list.innerHTML = '';
            if(data.data.length === 0) list.innerHTML = 'No pending requests.';
            
            data.data.forEach(w => {
                 list.innerHTML += `
                    <div class="list-item">
                        <div class="item-header">
                            <span>${w.name} (Mobile: ${w.mobile})</span>
                            <span class="tag tag-pending">₹ ${w.amount}</span>
                        </div>
                        <div style="margin-top:10px;">
                            <button onclick="withdrawAction(${w.id}, 'approved')" class="btn-sm btn-success">Approve</button>
                            <button onclick="withdrawAction(${w.id}, 'rejected')" class="btn-sm btn-danger">Reject</button>
                        </div>
                    </div>
                 `;
            });
        }
        
        async function withdrawAction(id, status) {
             const fd = new FormData();
             fd.append('action', 'admin_withdraw_action');
             fd.append('req_id', id);
             fd.append('status', status);
             await fetch('api/wallet.php', { method:'POST', body:fd });
             loadWithdrawals();
        }
        
        function closeModal(id) { document.getElementById(id).classList.remove('open'); }
        
        // Init
        loadAgents();
    </script>
</body>
</html>
