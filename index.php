<!DOCTYPE html>
<html lang="hi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>भूमि देखो App</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #00c853; /* Bright Green */
            --dark: #1b5e20;
            --light: #f5f5f5;
            --white: #ffffff;
            --text: #333;
            --gray: #9e9e9e;
            --gold: #ffd700;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; -webkit-tap-highlight-color: transparent; }
        
        body { background-color: var(--light); color: var(--text); height: 100vh; overflow: hidden; display: flex; flex-direction: column; }

        /* --- Utility Classes --- */
        .hidden { display: none !important; }
        .flex { display: flex; align-items: center; }
        .flex-col { display: flex; flex-direction: column; }
        .justify-between { justify-content: space-between; }
        .card { background: var(--white); border-radius: 12px; padding: 15px; margin-bottom: 15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .btn { border: none; padding: 12px 20px; border-radius: 8px; font-weight: 600; cursor: pointer; width: 100%; font-size: 14px; }
        .btn-primary { background: var(--primary); color: white; }
        .btn-outline { background: transparent; border: 1px solid var(--primary); color: var(--primary); }
        .badge { padding: 4px 8px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .badge-green { background: #e8f5e9; color: var(--primary); }

        /* --- Header --- */
        header { background: var(--white); padding: 15px; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 5px rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 20px; font-weight: 800; color: var(--primary); }

        /* --- Main Content Area --- */
        #app-content { flex: 1; overflow-y: auto; padding: 15px; padding-bottom: 80px; }

        /* --- Login Modal --- */
        #login-modal { 
            position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
            background: rgba(0,0,0,0.5); z-index: 3000; 
            display: none; 
            align-items: center; justify-content: center; 
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .login-box { 
            background: white; width: 90%; max-width: 400px; 
            padding: 30px; border-radius: 12px; 
            box-shadow: 0 10px 25px rgba(0,0,0,0.2); 
            text-align: center; 
        }

        .auth-btn { 
            width: 100%; padding: 15px; margin: 10px 0; 
            border-radius: 8px; border: 1px solid #eee; 
            font-size: 16px; font-weight: bold; cursor: pointer; 
            display: flex; align-items: center; justify-content: center; gap: 10px; 
            transition: 0.2s; 
        }
        .auth-btn:active { transform: scale(0.98); }
        .role-user { color: #1976d2; background: #e3f2fd; }
        .role-agent { color: #f57c00; background: #fff3e0; }
        .role-admin { color: #d32f2f; background: #ffebee; }

        /* --- Components --- */
        .search-box { position: relative; margin-bottom: 20px; }
        .search-box input { width: 100%; padding: 12px 15px 12px 40px; border-radius: 25px; border: none; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); outline: none; }
        .search-box i { position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: var(--gray); }

        /* Property Card */
        .prop-card { border-radius: 12px; overflow: hidden; background: white; margin-bottom: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); position: relative; }
        .prop-img { width: 100%; height: 200px; object-fit: cover; }
        .prop-details { padding: 15px; }
        .prop-price { font-size: 22px; font-weight: bold; color: var(--primary); }
        .prop-loc { color: #555; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 5px; }
        .prop-meta { display: flex; justify-content: space-between; font-size: 12px; color: #888; margin-bottom: 10px; }
        
        .like-btn-overlay { position: absolute; top: 10px; right: 10px; width: 35px; height: 35px; background: rgba(255,255,255,0.8); border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; z-index: 5; }
        .like-btn-overlay i { font-size: 20px; color: #ccc; transition: 0.2s; }
        .like-btn-overlay.liked i { color: #e91e63; }

        /* --- DETAIL MODAL --- */
        .detail-modal { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 2000; display: none; overflow-y: auto; }
        .modal-content { background: white; width: 100%; max-width: 600px; margin: 0 auto; min-height: 100%; position: relative; padding-bottom: 80px; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        
        .modal-header { position: relative; height: 250px; background: #000; }
        .modal-close { position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.5); color: white; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; z-index: 10; }
        
        .modal-tabs { display: flex; border-bottom: 1px solid #eee; position: sticky; top: 0; background: white; z-index: 10; }
        .tab { flex: 1; padding: 15px; text-align: center; font-weight: 600; color: #888; cursor: pointer; border-bottom: 2px solid transparent; }
        .tab.active { color: var(--primary); border-bottom-color: var(--primary); }
        
        .tab-content { display: none; padding: 15px; }
        .tab-content.active { display: block; }
        
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .detail-label { color: #666; font-size: 14px; }
        .detail-value { font-weight: 600; color: #333; }

        /* Footer Nav */
        .bottom-nav { position: fixed; bottom: 0; left: 0; width: 100%; background: white; border-top: 1px solid #eee; display: flex; justify-content: space-around; padding: 10px 0; z-index: 99; padding-bottom: max(10px, env(safe-area-inset-bottom)); }
        .nav-item { text-align: center; color: var(--gray); font-size: 10px; cursor: pointer; flex: 1; }
        .nav-item i { font-size: 20px; display: block; margin-bottom: 4px; }
        .nav-item.active { color: var(--primary); }

    </style>
</head>
<body>

    <!-- 1. LOGIN MODAL -->
    <div id="login-modal">
        <div class="login-box">
            <h2 style="color: var(--primary); margin-bottom: 20px;" data-i18n="choose_account">खाता चुनें</h2>
            <p style="color: #888; margin-bottom: 25px;" data-i18n="login_as">Login as</p>
            
            <button class="auth-btn role-user" onclick="window.location.href='login.php'">
                <i class="fas fa-user"></i> <span data-i18n="user_role">ग्राहक / User</span>
            </button>
            <button class="auth-btn role-agent" onclick="window.location.href='login.php?role=agent'">
                <i class="fas fa-user-tag"></i> <span data-i18n="agent_role">एजेंट / Agent</span>
            </button>
            <button class="auth-btn role-admin" onclick="window.location.href='login.php?role=admin'">
                <i class="fas fa-user-shield"></i> <span data-i18n="admin_role">एडमिन / Admin</span>
            </button>
            <button class="btn btn-outline" style="margin-top: 15px;" onclick="closeLoginModal()" data-i18n="cancel">Cancel</button>
        </div>
    </div>

    <!-- 2. MAIN LAYOUT -->
    <div id="main-app" class="flex-col" style="height: 100%;">
        
        <!-- Header -->
        <header>
            <div class="logo">Bhumi<span style="color:black">Dekho</span></div>
            <div class="flex" style="gap:10px;">
                <button id="lang-toggle-btn" class="btn btn-outline" style="padding: 5px 10px; font-size: 12px; height: 32px; display:flex; align-items:center;" onclick="toggleLanguage()">
                    English
                </button>
                <?php session_start(); if(isset($_SESSION['user_id'])): ?>
                    <div id="wallet-header" style="font-size: 14px; font-weight: bold; color: var(--dark); background: #fff8e1; padding: 5px 10px; border-radius: 20px; cursor:pointer;" onclick="location.href='<?php echo ($_SESSION['role'] === 'admin' ? 'admin.php' : 'profile.php'); ?>'">
                        <i class="fas fa-wallet" style="color:var(--primary)"></i> ₹ <?php echo isset($_SESSION['wallet']) ? $_SESSION['wallet'] : '0'; ?>
                    </div>
                <?php endif; ?>
                <i class="fas fa-bell" style="font-size: 20px; color: #555;"></i>
            </div>
        </header>

        <!-- Content -->
        <div id="app-content">
            
            <!-- HOME -->
            <section id="page-home">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="search-input" data-i18n="search_placeholder" placeholder="खोजें जमीन, गांव, खसरा नंबर..." onkeyup="searchFeed()">
                </div>

                <div id="property-feed">
                    <!-- Loaded via JS -->
                    <div style="text-align:center; padding:20px;" data-i18n="loading">Loading Properties...</div>
                </div>
            </section>

            <!-- LIKES -->
            <section id="page-like" class="hidden">
                <h3 data-i18n="my_liked_properties">❤️ मेरी पसंदीदा प्रॉपर्टी</h3>
                <div id="wishlist-feed" style="margin-top:15px;">
                    <p style="text-align:center; color:#999;" data-i18n="login_to_view_saved">Login to view saved properties.</p>
                </div>
            </section>

            <!-- HELP -->
            <section id="page-helpline" class="hidden">
                <div class="card" style="max-width: 500px; margin: 0 auto;">
                    <h3 style="text-align:center; margin-bottom:20px; color:var(--primary);" data-i18n="helpline">🛟 सहायता / Helpline</h3>
                    <p style="text-align:center; margin-bottom:10px;" data-i18n="call_us">Call us: +91 9876543210</p>
                    <button class="btn btn-primary" onclick="alert('Connecting...')" data-i18n="call_now">Call Now</button>
                </div>
            </section>

        </div>

        <!-- Footer -->
        <nav class="bottom-nav">
            <div class="nav-item active" onclick="navTo('home', this)">
                <i class="fas fa-home"></i>
                <span data-i18n="home">Home</span>
            </div>
            <div class="nav-item" onclick="navTo('like', this)">
                <i class="fas fa-heart"></i>
                <span data-i18n="like">Like</span>
            </div>
            <div class="nav-item" onclick="navTo('helpline', this)">
                <i class="fas fa-headset"></i>
                <span data-i18n="help">Help</span>
            </div>
            <?php if(isset($_SESSION['user_id'])): ?>
                 <?php if($_SESSION['role'] === 'admin'): ?>
                    <div class="nav-item" onclick="location.href='admin.php'">
                        <i class="fas fa-user-shield"></i>
                        <span data-i18n="admin">Admin</span>
                    </div>
                 <?php else: ?>
                    <div class="nav-item" onclick="navTo('login', this)"> <!-- Profile Placeholder -->
                        <i class="fas fa-user"></i>
                        <span data-i18n="profile">Profile</span>
                    </div>
                 <?php endif; ?>
            <?php else: ?>
                <div class="nav-item" onclick="openLoginModal()">
                    <i class="fas fa-user"></i>
                    <span data-i18n="login">Login</span>
                </div>
            <?php endif; ?>
        </nav>

    </div>

    <!-- DETAIL MODAL -->
    <div id="detail-modal" class="detail-modal">
        <div class="modal-content">
            <div class="modal-close" onclick="closeDetail()">&times;</div>
            
            <div class="modal-header">
                <img id="m-img" src="" style="width:100%; height:100%; object-fit:cover; opacity: 0.8;">
                <div style="position: absolute; bottom: 20px; left: 20px; color: white;">
                    <h2 id="m-title" style="text-shadow: 0 2px 4px rgba(0,0,0,0.8);">Title</h2>
                    <h3 id="m-price" style="color: var(--gold); text-shadow: 0 2px 4px rgba(0,0,0,0.8);">Price</h3>
                </div>
            </div>

            <div class="modal-tabs">
                <div class="tab active" onclick="switchTab('details')">🏞️ <span data-i18n="view_details">Details</span></div>
                <div class="tab" onclick="switchTab('map')">🗺️ Map</div>
            </div>

            <div id="tab-details" class="tab-content active">
                <h3 data-i18n="land_details">भूमि का विवरण</h3>
                <div class="detail-row"><span class="detail-label" data-i18n="city">City</span> <span class="detail-value" id="d-city">-</span></div>
                <div class="detail-row"><span class="detail-label" data-i18n="type">Type</span> <span class="detail-value" id="d-type">-</span></div>
                <div class="detail-row"><span class="detail-label" data-i18n="area">Area</span> <span class="detail-value" id="d-area">-</span></div>
                <div class="detail-row"><span class="detail-label" data-i18n="address">Address</span> <span class="detail-value" id="d-address">-</span></div>
                <br>
                <p id="d-desc" style="color: #555; font-size: 14px;"></p>
                <div style="margin-top:20px;">
                    <h4><span data-i18n="sold_by">Sold By</span>: <span id="d-agent" style="color:var(--primary)">Agent</span></h4>
                    <p style="color:#777;"><span data-i18n="mobile">Mobile</span>: <span id="d-mobile">Login to view</span></p>
                </div>
            </div>

            <div id="tab-map" class="tab-content">
                <div style="width:100%; height:200px; background:#ddd; display:flex; align-items:center; justify-content:center;">
                    <a id="d-map-link" href="#" target="_blank" class="btn btn-outline" data-i18n="open_maps">Open Google Maps</a>
                </div>
            </div>

             <div style="padding: 15px; border-top: 1px solid #eee; position: sticky; bottom: 0; background: white; display: flex; gap: 10px;">
                <a id="btn-call" href="#" class="btn btn-primary" style="text-align:center; text-decoration:none;"><i class="fas fa-phone"></i> <span data-i18n="call_btn">कॉल करें</span></a>
                <a id="btn-wa" href="#" class="btn btn-outline" style="text-align:center; text-decoration:none;"><i class="fab fa-whatsapp"></i> <span data-i18n="whatsapp_btn">व्हाट्सएप</span></a>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast" style="position: fixed; bottom: 100px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 10px 20px; border-radius: 20px; font-size: 14px; opacity: 0; pointer-events: none; transition: 0.3s; z-index: 3000;"></div>

    <script src="js/translations.js?v=<?php echo time(); ?>"></script>
    <script src="js/app.js?v=<?php echo time(); ?>"></script>
    <script>
        // Inline JS to bridge your logic request with our PHP backend
        document.addEventListener('DOMContentLoaded', () => {
             loadFeed(); // Use app.js logic but render with new layout
             // Initial toggle button text set by translations.js, but let's Ensure
             if(typeof applyTranslations === 'function') applyTranslations();
        });

        function toggleLanguage() {
            const newLang = currentLang === 'hi' ? 'en' : 'hi';
            setLanguage(newLang);
            loadFeed(); // Reload properties
        }

        function navTo(page, el) {
            document.querySelectorAll('section').forEach(s => s.classList.add('hidden'));
            document.getElementById('page-' + page).classList.remove('hidden');
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            if(el) el.classList.add('active');
        }
        
        function openLoginModal() { document.getElementById('login-modal').style.display = 'flex'; }
        function closeLoginModal() { document.getElementById('login-modal').style.display = 'none'; }
        function closeDetail() { document.getElementById('detail-modal').style.display = 'none'; }
        
        function switchTab(t) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById('tab-'+t).classList.add('active');
            document.querySelectorAll('.tab').forEach(tb => tb.classList.remove('active'));
            event.target.classList.add('active');
        }

        async function loadFeed() {
            const res = await fetch('api/property.php?action=get_feed');
            const data = await res.json();
            const role = data.role || '';
            const userId = data.user_id || null;
            
            // DEBUG: Show user info at top of feed
            feed.innerHTML = `<div style="background:#333; color:white; padding:5px; font-size:10px; text-align:center; margin-bottom:10px;">
                Debug: Role=${role}, MyID=${userId}, Count=${data.data.length}
            </div>`;

            data.data.forEach(p => {
                // Determine display type
                let displayType = p.type || 'Property';
                let translatedType = p.type ? (t('prop_' + p.type.toLowerCase()) || p.type) : 'Property';

                // Video and Photo labels
                let videoLabel = t('video');
                let photosLabel = t('photos');
                let viewDetailsLabel = t('view_details');

                // --- FEATURED & BOOST LOGIC ---
                // Featured Badge
                const featuredBadge = (p.is_featured == 1)
                    ? `<div style="position:absolute; top:10px; right:12px; background:linear-gradient(45deg, #FFD700, #FFA500); color:#000; padding:4px 12px; border-radius:20px; font-weight:bold; font-size:12px; z-index:5; box-shadow:0 2px 4px rgba(0,0,0,0.2);"><i class="fas fa-star"></i> Featured</div>`
                    : '';

                // Boost Button (Only for Owner Agent & Not already featured)
                let boostBtn = '';
                // Check Boost Condition
                const canBoost = (role.toLowerCase() === 'agent' && userId && p.user_id == userId && p.is_featured != 1);
                // console.log(`Prop ${p.id}: Owner=${p.user_id}, My=${userId}, Role=${role}, Featured=${p.is_featured}, CanBoost=${canBoost}`);

                if (canBoost) {
                    boostBtn = `<button class="btn" onclick="boostProperty(event, ${p.id})" style="width:100%; margin-top:8px; background:linear-gradient(45deg, #FFD700, #FF8C00); color:white; border:none; padding:12px; border-radius:8px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;"><i class="fas fa-rocket"></i> Boost Property (₹100)</button>`;
                }

                feed.innerHTML += `
                <div class="prop-card" onclick="openDetailProp(${p.id}, '${escapeHtml(p.title)}', '${p.price}', '${escapeHtml(p.image_path)}', '${escapeHtml(p.city||'')}', '${escapeHtml(p.type||'')}', '${escapeHtml(p.area||'')}', '${escapeHtml(p.description||'')}', '${p.contact_mobile||''}', '${p.map_link||''}', '${p.contact_whatsapp||''}', '${p.agent_name}')">
                    ${featuredBadge}
                    <div class="like-btn-overlay" onclick="event.stopPropagation(); alert('Liked!')">
                        <i class="far fa-heart"></i>
                    </div>
                    <img src="uploads/${p.image_path}" class="prop-img" onerror="this.src='https://via.placeholder.com/400'">
                    <div class="prop-details">
                        <div class="prop-price">₹ ${formatPrice(p.price)}</div>
                        <div class="prop-loc"><i class="fas fa-map-marker-alt"></i> ${p.location||''}</div>
                        <div class="prop-meta">
                            <span><i class="fas fa-camera"></i> ${photosLabel}</span>
                            <span>${p.video_link ? '<i class="fas fa-video" style="color:red;"></i> ' + videoLabel : ''}</span>
                        </div>
                        <button class="btn btn-primary" style="margin-top: 10px;">${viewDetailsLabel}</button>
                        ${boostBtn}
                    </div>
                </div>`;
            });
        }
        
        function openDetailProp(id, title, price, img, city, type, area, desc, mob, map, wa, agent) {
             document.getElementById('detail-modal').style.display = 'block';
             document.getElementById('m-title').textContent = title;
             document.getElementById('m-price').textContent = '₹ ' + formatPrice(price);
             document.getElementById('m-img').src = 'uploads/' + img;
             
             document.getElementById('d-city').textContent = city;
             // Translate Type
             document.getElementById('d-type').textContent = t('prop_' + (type ? type.toLowerCase() : '')) || type;
             
             document.getElementById('d-area').textContent = area;
             document.getElementById('d-desc').textContent = desc;
             document.getElementById('d-agent').textContent = agent;
             document.getElementById('d-mobile').textContent = mob ? mob : t('login_to_view');
             
             document.getElementById('btn-call').href = mob ? 'tel:'+mob : '#';
             document.getElementById('btn-wa').href = wa ? 'https://wa.me/'+wa : '#';
             document.getElementById('d-map-link').href = map ? map : '#';
             
             // Update static labels in modal which might be covered by data-i18n but good to check
             // Modal static labels are data-i18n handled.
        }

        function formatPrice(price) {
            price = parseFloat(price);
            if (price >= 10000000) return (price/10000000).toFixed(2) + ' Cr';
            if (price >= 100000) return (price/100000).toFixed(1) + ' Lakh';
            return price.toLocaleString();
        }
        
        function escapeHtml(text) {
            return text ? text.replace(/'/g, "\\'") : '';
        }
        async function boostProperty(e, id) {
            e.stopPropagation(); 
            if(!confirm("Boost this property for ₹100?")) return;

            const btn = e.target.closest('button');
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Processing...';
            btn.disabled = true;

            const fd = new FormData();
            fd.append('action', 'boost');
            fd.append('id', id);

            try {
                const res = await fetch('api/property.php', { method: 'POST', body: fd });
                const data = await res.json();
                alert(data.message);
                if (data.status === 'success') loadFeed();
                else { btn.innerHTML = originalText; btn.disabled = false; }
            } catch (err) {
                alert('Connection Failed');
                btn.innerHTML = originalText; btn.disabled = false;
            }
        }
    </script>
</body>
</html>
