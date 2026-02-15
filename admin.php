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

    <!-- Property Edit Modal Container -->
    <div id="modal-container"></div>

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
                window.adminProperties = data.data;
            }
            
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
                                <button onclick="window.startAdminEditV2('${p.id}')" class="btn-sm btn-primary">Edit Property</button>
                                <button onclick="window.deleteProperty(${p.id})" class="btn-sm btn-danger">Delete</button>
                                <button onclick="window.markSold(${p.id})" class="btn-sm btn-secondary">Mark Sold</button>
                                <button onclick="openContactModal(${p.id}, '${p.contact_mobile||''}', '${p.contact_whatsapp||''}')" class="btn-sm btn-dark">Edit Contact</button>
                            </div>    <button onclick="adminPropAction(${p.id}, 'delete')" class="btn-sm btn-outline">Delete</button>
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
        
        // ==========================================
        // INDEPENDENT ADMIN EDIT LOGIC (V2 FIXED)
        // ==========================================
        const PROPERTY_TYPES_ADMIN = ['Plot', 'House', 'Farm Land', 'Agricultural Land', 'Industrial Land', 'Commercial'];
        const INDIA_LOCATIONS_ADMIN_V2 = {
            "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Visakhapatnam", "West Godavari", "Kadapa"],
            "Arunachal Pradesh": ["Itanagar", "Tawang", "West Kameng"],
            "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Tezpur"],
            "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Bihar Sharif", "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Danapur", "Saharsa", "Hajipur", "Sasaram", "Dehri", "Siwan", "Bettiah", "Motihari"],
            "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Raigarh", "Jagdalpur"],
            "Goa": ["North Goa", "South Goa", "Panaji", "Margao"],
            "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"],
            "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula"],
            "Himachal Pradesh": ["Shimla", "Dharamshala", "Manali", "Mandi", "Solan"],
            "Jharkhand": ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Deoghar", "Hazaribagh", "Giridih", "Ramgarh", "Medininagar"],
            "Karnataka": ["Bangalore", "Hubli-Dharwad", "Mysore", "Gulbarga", "Mangalore", "Belgaum"],
            "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
            "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa"],
            "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Nanded", "Kolhapur"],
            "Manipur": ["Imphal"],
            "Meghalaya": ["Shillong"],
            "Mizoram": ["Aizawl"],
            "Nagaland": ["Kohima", "Dimapur"],
            "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore"],
            "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot"],
            "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", "Alwar"],
            "Sikkim": ["Gangtok"],
            "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore"],
            "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
            "Tripura": ["Agartala"],
            "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", "Firozabad", "Jhansi", "Muzaffarnagar", "Mathura"],
            "Uttarakhand": ["Dehradun", "Haridwar", "Roorkee", "Haldwani", "Rudrapur"],
            "West Bengal": ["Kolkata", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Kharagpur"]
        };
        const safeText = (t) => (t == null ? '' : String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));

        // MAIN ENTRY
        window.startAdminEditV2 = (propId) => {
            console.log("Starting Admin Edit V2 for ID:", propId);
            const prop = window.adminProperties.find(p => p.id == propId);
            if (!prop) { alert('Property data not loaded. Please Refresh.'); return; }

            // Create Overlay
            let overlay = document.getElementById('admin-edit-overlay');
            if (overlay) overlay.remove();
            overlay = document.createElement('div');
            overlay.id = 'admin-edit-overlay';
            overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#f0f2f5; z-index:9999999; display:flex; flex-direction:column; font-family:sans-serif;';
            document.body.appendChild(overlay);

            // Extras
            let extraDetails = [];
            try { extraDetails = typeof prop.extra_details === 'string' ? JSON.parse(prop.extra_details) : (prop.extra_details || []); } catch (e) {}

            // HTML
            overlay.innerHTML = `
                <div style="background:#fff; padding:15px; border-bottom:1px solid #ddd; display:flex; justify-content:space-between; align-items:center; box-shadow:0 2px 5px rgba(0,0,0,0.05); flex-shrink:0;">
                    <div style="display:flex; align-items:center;">
                        <button type="button" onclick="document.getElementById('admin-edit-overlay').remove()" style="border:none; background:none; font-size:24px; cursor:pointer; margin-right:15px;">&larr;</button>
                        <div>
                            <h3 style="margin:0; font-size:18px; color:#333;">Edit Property</h3>
                            <div style="font-size:12px; color:#777;">ID: ${prop.id}</div>
                        </div>
                    </div>
                    <button onclick="window.submitAdminEditV2('${prop.id}')" style="background:#007bff; color:white; border:none; padding:10px 20px; border-radius:5px; font-weight:bold; cursor:pointer; font-size:14px;">SAVE</button>
                </div>
                <div style="flex:1; overflow-y:auto; padding:20px;">
                    <form id="ae-form-v2" onsubmit="event.preventDefault(); window.submitAdminEditV2('${prop.id}');">
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Basic Info</h4>
                            <label style="display:block; font-weight:bold; margin-bottom:5px; margin-top:15px;">Title</label>
                            <input id="v2-title" value="${safeText(prop.title)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                            <div style="display:flex; gap:15px; margin-top:15px;">
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Category</label>
                                    <select id="v2-cat" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                        ${PROPERTY_TYPES_ADMIN.map(c => `<option value="${c}" ${prop.type === c ? 'selected' : ''}>${c}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Area</label>
                                    <input id="v2-area" value="${safeText(prop.area)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                            </div>
                            <label style="display:block; font-weight:bold; margin-bottom:5px; margin-top:15px;">Description</label>
                            <textarea id="v2-desc" rows="5" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">${safeText(prop.description)}</textarea>
                        </div>
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Location</h4>
                            <div style="display:flex; gap:15px; margin-top:15px;">
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">State</label>
                                    <select id="v2-state" onchange="window.updateDistrictsV2(this.value)" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                        <option value="">Select State</option>
                                        ${Object.keys(INDIA_LOCATIONS_ADMIN_V2).map(s => `<option value="${s}" ${prop.state === s ? 'selected' : ''}>${s}</option>`).join('')}
                                    </select>
                                </div>
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">District</label>
                                    <select id="v2-district" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                        <option value="${prop.district}">${prop.district}</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display:flex; gap:15px; margin-top:15px;">
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">City</label>
                                    <input id="v2-city" value="${safeText(prop.city)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Pincode</label>
                                    <input id="v2-pincode" type="number" value="${prop.pincode||''}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                            </div>
                        </div>
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Price & Contacts</h4>
                            <div style="display:flex; gap:15px; margin-top:15px;">
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Total Price (₹)</label>
                                    <input id="v2-price" type="number" value="${prop.price}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Sq.Ft Rate</label>
                                    <input id="v2-sqft" type="number" value="${prop.price_per_sqft||''}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                            </div>
                            <div style="display:flex; gap:15px; margin-top:15px;">
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">Mobile</label>
                                    <input id="v2-mobile" value="${safeText(prop.contact_mobile)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">WhatsApp</label>
                                    <input id="v2-whatsapp" value="${safeText(prop.contact_whatsapp)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>
                            </div>
                        </div>
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Links</h4>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">YouTube</label>
                            <input id="v2-video" value="${safeText(prop.youtube_video)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box; margin-bottom:15px;">
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">Map</label>
                            <input id="v2-map" value="${safeText(prop.map_link)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                        </div>
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:40px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h4 style="margin:0; color:#007bff;">Extra Fields</h4>
                                <button type="button" onclick="window.addExtraV2()" style="background:#eee; border:none; padding:5px 15px; border-radius:20px; cursor:pointer;">+ Add</button>
                            </div>
                            <div id="v2-extras-container" style="margin-top:15px;"></div>
                        </div>
                    </form>
                </div>
            `;

            if (extraDetails.length) extraDetails.forEach(e => window.appendExtraV2(e.label, e.value));
            window.updateDistrictsV2(prop.state, prop.district);
        };

        window.updateDistrictsV2 = (state, setVal) => {
            const dSelect = document.getElementById('v2-district');
            if(!dSelect) return;
            dSelect.innerHTML = '<option value="">Select District</option>';
            const list = INDIA_LOCATIONS_ADMIN_V2[state] || [];
            list.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d; opt.innerHTML = d;
                if(d===setVal) opt.selected = true;
                dSelect.appendChild(opt);
            });
            if(setVal && !list.includes(setVal)) {
                const opt = document.createElement('option');
                opt.value = setVal; opt.innerHTML = setVal; opt.selected=true;
                dSelect.appendChild(opt);
            }
        };

        window.addExtraV2 = () => window.appendExtraV2('','');
        window.appendExtraV2 = (l, v) => {
            const c = document.getElementById('v2-extras-container');
            const d = document.createElement('div');
            d.className = 'v2-extra-row';
            d.style.cssText = 'display:flex; gap:10px; margin-bottom:10px;';
            d.innerHTML = `<input class="v2-el" placeholder="Label" value="${safeText(l)}" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;"><input class="v2-ev" placeholder="Value" value="${safeText(v)}" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;"><button type="button" onclick="this.parentElement.remove()" style="color:red; background:none; border:none;">X</button>`;
            c.appendChild(d);
        };

        window.submitAdminEditV2 = async (id) => {
            if(!confirm("Saving changes... Proceed?")) return;
            const fd = new FormData();
            fd.append('action', 'edit_property');
            fd.append('id', id);
            const getVal = (eid) => document.getElementById(eid).value;

            fd.append('title', getVal('v2-title'));
            fd.append('category', getVal('v2-cat'));
            fd.append('area', getVal('v2-area'));
            fd.append('description', getVal('v2-desc'));
            fd.append('state', getVal('v2-state'));
            fd.append('district', getVal('v2-district'));
            fd.append('city', getVal('v2-city'));
            fd.append('pincode', getVal('v2-pincode'));
            fd.append('price', getVal('v2-price'));
            fd.append('price_per_sqft', getVal('v2-sqft'));
            fd.append('contact_mobile', getVal('v2-mobile'));
            fd.append('contact_whatsapp', getVal('v2-whatsapp'));
            fd.append('youtube_video', getVal('v2-video'));
            fd.append('map_link', getVal('v2-map'));

            const extras = [];
            document.querySelectorAll('.v2-extra-row').forEach(row => {
                const l = row.querySelector('.v2-el').value;
                const v = row.querySelector('.v2-ev').value;
                if(l) extras.push({label:l, value:v});
            });
            fd.append('extra_details', JSON.stringify(extras));

            try {
                const res = await fetch('api/property.php', { method:'POST', body:fd });
                const d = await res.json();
                if(d.status === 'success') {
                    alert('SAVED SUCCESSFULLY!');
                    document.getElementById('admin-edit-overlay').remove();
                    window.location.reload();
                } else {
                    alert('Error: ' + d.message);
                }
            } catch(e) { console.error(e); alert('Failed to connect.'); }
        };
        
        // Init
        loadAgents();
    </script>
</body>
</html>
