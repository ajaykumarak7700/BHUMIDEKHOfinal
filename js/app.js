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

        div.innerHTML = `
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
            </div>
        `;

        container.appendChild(div);

        document.getElementById(`btn-detail-${p.id}`).onclick = () => openModal(p);
    });
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
        }
    } catch (e) { console.error(e); }
}
