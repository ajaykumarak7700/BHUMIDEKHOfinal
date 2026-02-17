// State
let feedOffset = 0;
let isLoading = false;
let isSubmitting = false; // New flag to track form submissions
let currentFilters = {
    search: '',
    city: '',
    type: '',
    priceMax: ''
};
let currentPropId = null;
let userRole = '';
let currentUserId = null;

// Prevent accidental refresh/close when submitting
window.addEventListener('beforeunload', (e) => {
    if (isSubmitting) {
        e.preventDefault();
        e.returnValue = 'Data is being uploaded. Are you sure you want to leave?';
        return 'Data is being uploaded. Are you sure you want to leave?';
    }
});

// Constants
const PROPERTY_TYPES = ['Plot', 'House', 'Flat', 'Commercial', 'Agriculture'];
// In production, fetch cities from API
const CITIES = ['Jaipur', 'Udaipur', 'Kota', 'Jodhpur', 'Ajmer', 'Bikaner'];
const PRICES = [
    { label: 'Under 10 Lakh', value: 1000000 },
    { label: 'Under 25 Lakh', value: 2500000 },
    { label: 'Under 50 Lakh', value: 5000000 },
    { label: 'Under 1 Crore', value: 10000000 },
    { label: 'Above 1 Crore', value: 999999999 }
];

// Utils
const $ = (selector) => document.querySelector(selector);
const showAlert = (elId, msg, type = 'error') => {
    const el = document.getElementById(elId);
    if (!el) return;
    el.className = `alert alert-${type}`;

    // Attempt translation if msg is a key, otherwise display as is
    el.textContent = (typeof t === 'function' && translations[currentLang][msg]) ? t(msg) : msg;

    el.classList.remove('hide');
    setTimeout(() => el.classList.add('hide'), 3000);
};

function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatPrice(price) {
    price = parseFloat(price);
    if (price >= 10000000) return `₹ ${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹ ${(price / 100000).toFixed(1)} Lakh`;
    return `₹ ${price.toLocaleString()}`;
}

// Hero Slider
let slideIndex = 0;
function initSlider() {
    const slides = document.querySelectorAll('.hero-slide');
    if (slides.length === 0) return;

    // Clear existing
    slides.forEach(s => s.classList.remove('active'));
    slideIndex++;
    if (slideIndex > slides.length) slideIndex = 1;
    slides[slideIndex - 1].classList.add('active');
    setTimeout(initSlider, 4000); // Change every 4 seconds
}
document.addEventListener('DOMContentLoaded', initSlider);

// Filter Modal Logic
let activeFilterType = '';

function openFilterModal(type) {
    activeFilterType = type;
    const modal = $('#filter-modal');
    const container = $('#filter-options-container');
    const title = $('#filter-modal-title');
    container.innerHTML = '';

    let options = [];
    if (type === 'city') {
        title.textContent = (typeof t === 'function' ? t('select_city') : 'Select City');
        options = CITIES.map(c => ({ label: c, value: c }));
    } else if (type === 'type') {
        title.textContent = (typeof t === 'function' ? t('select_type') : 'Select Property Type');
        options = PROPERTY_TYPES.map(pt => ({
            label: (typeof t === 'function' ? (t('prop_' + pt.toLowerCase()) || pt) : pt),
            value: pt
        }));
    } else if (type === 'price') {
        title.textContent = (typeof t === 'function' ? t('select_budget') : 'Select Budget');
        options = PRICES;
    }

    // Add 'All' option
    const btnAll = document.createElement('button');
    btnAll.className = 'btn-outline';
    btnAll.style.textAlign = 'left';
    btnAll.textContent = (typeof t === 'function' ? t('reset') : 'Reset') + ' (All)';
    btnAll.onclick = () => applyFilter('');
    container.appendChild(btnAll);

    // Add specific options
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'btn-outline';
        btn.style.textAlign = 'left';
        btn.style.marginBottom = '5px';
        btn.textContent = opt.label;
        btn.onclick = () => applyFilter(opt.value, opt.label);
        container.appendChild(btn);
    });

    modal.classList.add('open');
}

function closeFilterModal() {
    $('#filter-modal').classList.remove('open');
}

function applyFilter(value, label) {
    if (activeFilterType === 'city') {
        currentFilters.city = value;
        $('#filter-city-label').textContent = value || (typeof t === 'function' ? t('filter_all_cities') : 'All Cities');
    } else if (activeFilterType === 'type') {
        currentFilters.type = value;
        $('#filter-type-label').textContent = label || (typeof t === 'function' ? t('filter_all_types') : 'All Types');
    } else if (activeFilterType === 'price') {
        currentFilters.priceMax = value;
        $('#filter-price-label').textContent = label || (typeof t === 'function' ? t('filter_all_prices') : 'All Prices');
    }

    closeFilterModal();
    loadFeed(true);
}

function resetFilters() {
    currentFilters = { search: '', city: '', type: '', priceMax: '' };
    $('#filter-city-label').textContent = (typeof t === 'function' ? t('filter_all_cities') : 'All Cities');
    $('#filter-type-label').textContent = (typeof t === 'function' ? t('filter_all_types') : 'All Types');
    $('#filter-price-label').textContent = (typeof t === 'function' ? t('filter_all_prices') : 'All Prices');
    $('#search-input').value = '';
    loadFeed(true);
}

// Auth
function toggleAuth() {
    $('#login-form').classList.toggle('hide');
    $('#signup-form').classList.toggle('hide');
}

async function handleLogin(e) {
    e.preventDefault();
    const mobile = $('#login-mobile').value;
    const password = $('#login-pass').value;
    const formData = new FormData();
    formData.append('action', 'login');
    formData.append('mobile', mobile);
    formData.append('password', password);

    try {
        const res = await fetch('api/auth.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status === 'success') {
            window.location.href = 'index.php';
        } else {
            showAlert('login-alert', data.message);
        }
    } catch (err) {
        console.error(err);
        showAlert('login-alert', 'connection_error');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double submit
    isSubmitting = true;

    const formData = new FormData();
    formData.append('action', 'signup');
    formData.append('name', $('#signup-name').value);
    formData.append('mobile', $('#signup-mobile').value);
    formData.append('password', $('#signup-pass').value);
    formData.append('role', $('#signup-role').value);

    try {
        const res = await fetch('api/auth.php', { method: 'POST', body: formData });
        const data = await res.json();

        isSubmitting = false; // Release lock

        if (data.status === 'success') {
            showAlert('signup-alert', 'Account created! Please login.', 'success');
            setTimeout(toggleAuth, 1500);
        } else {
            showAlert('signup-alert', data.message);
        }
    } catch (err) {
        isSubmitting = false; // Release lock on error
        showAlert('signup-alert', 'connection_error');
    }
}

async function handleLogout() {
    if (typeof t === 'function' && !confirm(t('confirm_logout'))) return;
    if (typeof t !== 'function' && !confirm("Are you sure you want to logout?")) return;

    const formData = new FormData();
    formData.append('action', 'logout');
    await fetch('api/auth.php', { method: 'POST', body: formData });
    window.location.href = 'index.php';
}

// Feed
async function loadFeed(reset = false) {
    if (isLoading) return;
    const container = $('#feed-container');
    // If container exists (e.g. in some other page using app.js directly), we use it.
    // index.php keeps its own loadFeed logic but if we unify, we should use this.
    // Currently index.php has overridden logic which also uses t().
    // So this function is mainly for other pages or if index.php uses it.

    if (!container) return;

    if (reset) {
        feedOffset = 0;
        container.innerHTML = '';
    }

    isLoading = true;
    $('#loader').style.display = 'block';

    const searchInput = $('#search-input');
    if (searchInput) currentFilters.search = searchInput.value;

    let params = new URLSearchParams({
        action: 'get_feed',
        offset: feedOffset
    });

    if (currentFilters.search) params.append('search', currentFilters.search);
    if (currentFilters.city) params.append('city', currentFilters.city);
    if (currentFilters.type) params.append('type', currentFilters.type);

    let url = `api/property.php?${params.toString()}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'success') {
            userRole = data.role;
            currentUserId = data.user_id;
            if (data.data.length > 0) {
                renderProperties(data.data);
                feedOffset += 10;
            } else if (reset) {
                const noPropMsg = typeof t === 'function' ? t('no_properties_found') : 'No properties found.';
                container.innerHTML = `<div style="text-align:center; padding:40px; color:#999;"><ion-icon name="search-outline" style="font-size:40px;"></ion-icon><p>${noPropMsg}</p></div>`;
            }
        }
    } catch (err) {
        console.error(err);
    } finally {
        isLoading = false;
        $('#loader').style.display = 'none';
    }
}

// Overwrite render to fix button onclicks
function renderProperties(props) {
    const container = $('#feed-container');
    if (!container) return;

    props.forEach(p => {
        const div = document.createElement('div');
        div.className = 'property-card';
        div.onclick = (e) => {
            if (!e.target.closest('button')) openModal(p);
        };

        let statusBadge = '';
        const soldLabel = typeof t === 'function' ? t('sold') : 'SOLD';
        if (p.status === 'sold') statusBadge = `<span style="background:#212121; color:white; padding:4px 10px; border-radius:4px; font-size:12px; position:absolute; top:40px; left:12px; z-index:2;">${soldLabel}</span>`;

        const videoLabel = typeof t === 'function' ? t('video') : 'Video';
        const videoTag = p.video_link ? `<div class="video-tag"><ion-icon name="videocam"></ion-icon> ${videoLabel}</div>` : '';

        // Translate type
        const typeLabel = (typeof t === 'function' ? t('prop_' + (p.type ? p.type.toLowerCase() : '')) : p.type) || p.type || 'Property';
        const viewDetailsLabel = typeof t === 'function' ? t('view_details') : 'View Property';

        // --- FEATURED & BOOST LOGIC ---
        // Featured Badge
        const featuredBadge = (p.is_featured == 1)
            ? `<div style="position:absolute; top:10px; right:10px; background:linear-gradient(45deg, #FFD700, #FFA500); color:#000; padding:4px 12px; border-radius:20px; font-weight:bold; font-size:12px; z-index:5; box-shadow:0 2px 4px rgba(0,0,0,0.2);"><ion-icon name="star" style="vertical-align:middle;"></ion-icon> Featured</div>`
            : '';

        // Boost Button (Only for Owner Agent & Not already featured)
        let boostBtn = '';
        // DEBUG LOGGING
        // console.log(`Prop ${p.id}: Role=${userRole}, CurUser=${currentUserId}, PropOwner=${p.user_id}, Featured=${p.is_featured}`);

        if (userRole === 'agent' && currentUserId && p.user_id == currentUserId && p.is_featured != 1) {
            boostBtn = `<button class="btn-boost" onclick="boostProperty(event, ${p.id})" style="width:100%; margin-top:8px; background:linear-gradient(45deg, #FFD700, #FF8C00); color:white; border:none; padding:8px; border-radius:6px; font-weight:bold; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:5px;"><ion-icon name="rocket-outline"></ion-icon> Boost Property (₹100)</button>`;
        }


        div.innerHTML = `
            ${featuredBadge}
            <div class="card-badge">${escapeHtml(typeLabel)}</div>
            <div class="card-like-btn" onclick="toggleLike(this, ${p.id})"><ion-icon name="heart-outline"></ion-icon></div>
            ${statusBadge}
            ${videoTag}
            <img src="uploads/${escapeHtml(p.image_path)}" onerror="this.src='https://placehold.co/600x400?text=BhumiDekho'">
            <div class="card-body">
                <div class="card-price">${formatPrice(p.price)}</div>
                <div class="card-location"><ion-icon name="location" style="margin-right:4px; color:#757575;"></ion-icon> ${escapeHtml(p.location)} ${p.city ? ', ' + p.city : ''}</div>
                
                <div class="card-details-row">
                    <span><ion-icon name="expand-outline"></ion-icon> ${escapeHtml(p.area || 'N/A')}</span>
                    <span>•</span>
                    <span>${escapeHtml(typeLabel)}</span>
                </div>

                <button class="card-action-btn" id="btn-detail-${p.id}">${viewDetailsLabel}</button>
                ${boostBtn}
            </div>
        `;

        container.appendChild(div);

        document.getElementById(`btn-detail-${p.id}`).onclick = () => openModal(p);
    });
}

// Boost Property Action
async function boostProperty(e, id) {
    e.stopPropagation(); // Prevent card click

    if (!confirm("Boost this property for ₹100? It will be featured on the Home Page.")) return;

    const btn = e.target.closest('button');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<ion-icon name="sync-outline" class="spin"></ion-icon> Processing...';
    btn.disabled = true;

    const fd = new FormData();
    fd.append('action', 'boost');
    fd.append('id', id);

    try {
        const res = await fetch('api/property.php', { method: 'POST', body: fd });
        const data = await res.json();

        if (data.status === 'success') {
            alert(data.message);
            loadFeed(true); // Refund to show updated status
        } else {
            alert(data.message);
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (err) {
        console.error(err);
        alert('Connection Failed');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

function toggleLike(btn, id) {
    btn.classList.toggle('liked');
    const icon = btn.querySelector('ion-icon');
    if (btn.classList.contains('liked')) {
        icon.name = 'heart';
    } else {
        icon.name = 'heart-outline';
    }
}

// Modal
function openModal(prop) {
    currentPropId = prop.id;
    $('#modal-title').textContent = prop.title;
    $('#modal-price').textContent = `₹ ${parseFloat(prop.price).toLocaleString()}`;
    $('#modal-location').textContent = prop.location;
    $('#modal-city').textContent = prop.city || '';
    $('#modal-img').src = `uploads/${prop.image_path}`;

    // Translate type
    const typeLabel = (typeof t === 'function' ? t('prop_' + (prop.type ? prop.type.toLowerCase() : '')) : prop.type) || prop.type || '-';
    $('#modal-type').textContent = typeLabel;

    $('#modal-area').textContent = prop.area || '-';

    const noDesc = typeof t === 'function' ? t('no_description_provided') : 'No description provided.';
    $('#modal-desc').textContent = prop.description || noDesc; // Wait, t() returns key if not found? 
    // In translations.js: return translations[currentLang][key] || key;
    // If 'no_description_provided' is not in dictionary, it returns 'no_description_provided'.
    // I need to add 'no_description_provided' to translations.js or just use hardcoded english default if key fails.
    // For now I'll just check if t exists.

    const loginToViewAddress = typeof t === 'function' ? t('login_to_view') : 'Login to view full address.';
    $('#modal-address').textContent = prop.address || loginToViewAddress;

    // Status color
    const statusEl = $('#modal-status');
    statusEl.textContent = prop.status.toUpperCase();
    if (prop.status === 'approved') { statusEl.style.background = '#e6fffa'; statusEl.style.color = '#047857'; }
    else if (prop.status === 'sold') { statusEl.style.background = '#1f2937'; statusEl.style.color = '#fff'; }
    else if (prop.status === 'pending') { statusEl.style.background = '#fffbeb'; statusEl.style.color = '#b45309'; }

    // Links
    const videoBtn = $('#modal-video');
    if (prop.video_link) {
        videoBtn.style.display = 'inline-flex';
        videoBtn.href = prop.video_link;
    } else {
        videoBtn.style.display = 'none';
    }

    const mapBtn = $('#modal-map');
    if (prop.map_link) {
        mapBtn.style.display = 'inline-flex';
        mapBtn.href = prop.map_link;
    } else {
        mapBtn.style.display = 'none';
    }

    // Agent
    $('#modal-agent-name').textContent = prop.agent_name || 'Unknown';
    const phoneLink = $('#modal-agent-phone');
    if (phoneLink) phoneLink.href = `tel:${prop.agent_mobile}`;

    $('#prop-modal').classList.add('open');
}

function closeModal() {
    $('#prop-modal').classList.remove('open');
}

// Add Property
async function handleAddProperty(e) {
    e.preventDefault();
    if (isSubmitting) return;
    isSubmitting = true;

    const formData = new FormData();
    formData.append('action', 'add');
    formData.append('title', $('#prop-title').value);
    formData.append('description', $('#prop-desc').value);
    formData.append('price', $('#prop-price').value);
    formData.append('type', $('#prop-type').value);
    formData.append('city', $('#prop-city').value);
    formData.append('area', $('#prop-area').value);
    formData.append('location', $('#prop-location').value);
    formData.append('address', $('#prop-address').value);
    formData.append('video_link', $('#prop-video').value);
    formData.append('map_link', $('#prop-map').value);
    formData.append('image', $('#prop-image').files[0]);

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Uploading...';

    try {
        const res = await fetch('api/property.php', { method: 'POST', body: formData });
        const data = await res.json();

        isSubmitting = false; // Release lock

        if (data.status === 'success') {
            showAlert('add-alert', data.message, 'success');
            setTimeout(() => window.location.href = 'index.php', 2000);
        } else {
            showAlert('add-alert', data.message);
            btn.disabled = false;
            btn.textContent = 'Submit Property';
        }
    } catch (err) {
        isSubmitting = false; // Release lock on error
        showAlert('add-alert', 'Upload failed');
        btn.disabled = false;
        btn.textContent = 'Submit Property';
    }
}

// Admin Actions
async function updateStatus(status) {
    if (!currentPropId) return;
    if (!confirm(`Are you sure you want to mark this as ${status}?`)) return;

    const formData = new FormData();
    formData.append('action', 'update_status');
    formData.append('id', currentPropId);
    formData.append('status', status);

    try {
        const res = await fetch('api/property.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status === 'success') {
            closeModal();
            loadFeed(true); // Reload
        } else {
            alert('Failed to update status');
        }
    } catch (e) { console.error(e); }
}

async function deleteProperty() {
    if (!currentPropId) return;
    if (!confirm("Are you sure you want to DELETE this property?")) return;

    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', currentPropId);
    try {
        const res = await fetch('api/property.php', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.status === 'success') {
            closeModal();
            loadFeed(true); // Reload
        } else {
            alert('Failed to delete');
            ```javascript
        }
    } catch (e) { console.error(e); }
}

// ==========================================
// ADMIN EDIT PROPERTY LOGIC V2 (Clean & Isolated)
// ==========================================

// 0. Helpers (Self-contained)
const safeText = (t) => (t == null ? '' : String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;"));

// 1. Locations Data
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
window.indianStates = INDIA_LOCATIONS_ADMIN_V2;

// 2. State & Init
window.adminProperties = [];
window.setAdminProperties = (list) => { window.adminProperties = list || []; };

// 3. MAIN ENTRY: Start V2 Flow
window.startAdminEditV2 = (propId) => {
    // A. Find Data
    const prop = window.adminProperties.find(p => p.id == propId);
    if (!prop) {
        alert('Property data not loaded. Please Refresh Page.');
        return;
    }
    
    // B. Create Container Dynamically (Avoids ID conflicts)
    let overlay = document.getElementById('admin-edit-overlay');
    if (overlay) overlay.remove(); // Clean start
    
    overlay = document.createElement('div');
    overlay.id = 'admin-edit-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:#f0f2f5; z-index:9999999; display:flex; flex-direction:column; font-family:sans-serif;';
    document.body.appendChild(overlay);

    // C. Parse Extras
    let extraDetails = [];
    try { extraDetails = typeof prop.extra_details === 'string' ? JSON.parse(prop.extra_details) : (prop.extra_details || []); } catch (e) {}

    // D. Render Content
    overlay.innerHTML = `
                < !--HEADER -->
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

        <!--SCROLLABLE BODY-- >
                <div style="flex:1; overflow-y:auto; padding:20px;">
                    <form id="ae-form-v2" onsubmit="event.preventDefault(); window.submitAdminEditV2('${prop.id}');">

                        <!-- SECTION: BASIC -->
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Basic Info</h4>

                            <label style="display:block; font-weight:bold; margin-bottom:5px; margin-top:15px;">Title</label>
                            <input id="v2-title" value="${safeText(prop.title)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">

                                <div style="display:flex; gap:15px; margin-top:15px;">
                                    <div style="flex:1;">
                                        <label style="display:block; font-weight:bold; margin-bottom:5px;">Category</label>
                                        <select id="v2-cat" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                            ${PROPERTY_TYPES.map(c => `<option value="${c}" ${prop.type === c ? 'selected' : ''}>${c}</option>`).join('')}
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

                        <!-- SECTION: LOCATION -->
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Location</h4>

                            <div style="display:flex; gap:15px; margin-top:15px;">
                                <div style="flex:1;">
                                    <label style="display:block; font-weight:bold; margin-bottom:5px;">State</label>
                                    <select id="v2-state" onchange="window.updateDistrictsV2(this.value)" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                        <option value="">Select State</option>
                                        ${Object.keys(window.indianStates).map(s => `<option value="${s}" ${prop.state === s ? 'selected' : ''}>${s}</option>`).join('')}
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

                        <!-- SECTION: FINANCIALS & CONTACT -->
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

                        <!-- SECTION: LINKS -->
                        <div class="ae-card" style="background:white; padding:20px; border-radius:8px; margin-bottom:20px; box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                            <h4 style="margin-top:0; color:#007bff; border-bottom:1px solid #eee; padding-bottom:10px;">Links</h4>
                            <label style="display:block; font-weight:bold; margin-bottom:5px;">YouTube</label>
                            <input id="v2-video" value="${safeText(prop.youtube_video)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box; margin-bottom:15px;">

                                <label style="display:block; font-weight:bold; margin-bottom:5px;">Map</label>
                                <input id="v2-map" value="${safeText(prop.map_link)}" style="width:100%; padding:10px; border:1px solid #ccc; border-radius:5px; box-sizing:border-box;">
                                </div>

                                <!-- SECTION: EXTRAS -->
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

                        // Init Extras
                        if (extraDetails.length) {
                            extraDetails.forEach(e => window.appendExtraV2(e.label, e.value));
    }

                        // Init Districts
                        window.updateDistrictsV2(prop.state, prop.district);
};

// 4. Update Districts V2
window.updateDistrictsV2 = (state, setVal) => {
    const dSelect = document.getElementById('v2-district');
                        if(!dSelect) return;
                        dSelect.innerHTML = '<option value="">Select District</option>';
                        const list = window.indianStates[state] || [];
    list.forEach(d => {
        const opt = document.createElement('option');
                        opt.value = d;
                        opt.innerHTML = d;
                        if(d===setVal) opt.selected = true;
                        dSelect.appendChild(opt);
    });
                        // Fallback
                        if(setVal && !list.includes(setVal)) {
        const opt = document.createElement('option');
                        opt.value = setVal; opt.innerHTML = setVal; opt.selected=true;
                        dSelect.appendChild(opt);
    }
};

// 5. Extra Fields V2
window.addExtraV2 = () => window.appendExtraV2('','');
window.appendExtraV2 = (l, v) => {
    const c = document.getElementById('v2-extras-container');
                        const d = document.createElement('div');
                        d.className = 'v2-extra-row';
                        d.style.cssText = 'display:flex; gap:10px; margin-bottom:10px;';
                        d.innerHTML = `<input class="v2-el" placeholder="Label" value="${safeText(l)}" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;"><input class="v2-ev" placeholder="Value" value="${safeText(v)}" style="flex:1; padding:8px; border:1px solid #ddd; border-radius:4px;"><button type="button" onclick="this.parentElement.remove()" style="color:red; background:none; border:none;">X</button>`;
                            c.appendChild(d);
};

// 6. Submit V2
window.submitAdminEditV2 = async (id) => {
    if(!confirm("Saving changes... Proceed?")) return;

                            const fd = new FormData();
                            fd.append('action', 'edit_property');
                            fd.append('id', id);

    // Helper to get val
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

                            // Extras
                            const extras = [];
    document.querySelectorAll('.v2-extra-row').forEach(row => {
        const l = row.querySelector('.v2-el').value;
                            const v = row.querySelector('.v2-ev').value;
                            if(l) extras.push({label:l, value:v});
    });
                            fd.append('extra_details', JSON.stringify(extras));

                            try {
        const res = await fetch('api/property.php', {method:'POST', body:fd });
                            const d = await res.json();
                            if(d.status === 'success') {
                                alert('SAVED SUCCESSFULLY!');
                            document.getElementById('admin-edit-overlay').remove();
                            window.location.reload();
        } else {
                                alert('Error: ' + d.message);
        }
    } catch(e) {console.error(e); alert('Failed to connect.'); }
};
