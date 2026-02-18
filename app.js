window.showGlobalLoader = (message = "Please wait...") => {
    const loader = document.getElementById('global-loader');
    const text = document.getElementById('loader-text');
    if (text) text.innerText = message;
    if (loader) {
        loader.style.display = 'flex';
        loader.classList.remove('success');
        loader.classList.add('active'); // No more timeout delay
    }
};

window.hideGlobalLoader = (message = "Success!", duration = 100) => {
    const loader = document.getElementById('global-loader');
    const text = document.getElementById('loader-text');
    if (loader) {
        if (message) {
            if (text) text.innerText = message;
            loader.classList.add('success');
            setTimeout(() => {
                loader.classList.remove('active');
                setTimeout(() => {
                    loader.style.display = 'none';
                    loader.classList.remove('success');
                }, 100);
            }, duration);
        } else {
            loader.classList.remove('active');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 100);
        }
    }
};

// --- State Management ---
const State = {
    view: 'home', // home, likes, login, admin, agent, details, signup
    isLoading: true, // Tracks if we are waiting for data
    isDataLoaded: false, // SAFETY FLAG: Prevents saving empty data before correct load
    user: null,
    messages: {}, // { userId: [ { sender, text, time }, ... ] }
    broadcastMessages: [], // Admin broadcast messages to all users
    activeChatId: null, // Track open chat for updates
    selectedPropertyId: null,
    likes: [],
    properties: [], // Reset to empty, waiting for Firebase
    withdrawalRequests: [],
    agents: [
        { id: 101, name: "John Agent", email: "john.agent@bhumidekho.com", password: "admin123", phone: "9876543210", status: "approved", wallet: 5000 }
    ],
    adminTab: 'dashboard',
    adminSearch: '',
    agentTab: 'dashboard',
    agentSearch: '',
    loginRole: 'customer', // Added for login page state
    signupRole: 'customer', // Added for signup page state
    detailsTab: 'Details',
    loadingMessage: 'आपका नजदीकी प्रॉपर्टी सर्च किया जा रहा है...',
    isCriticalTimeout: false,
    settings: {
        showDate: true,
        contactInfo: {
            phone: '+91 98765 43210',
            email: 'support@bhumidekho.com',
            founder1: { name: 'Rajesh Kumar', title: 'Co-Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80', bio: 'Visionary leader with 15+ years in Real Estate.' },
            founders: [
                { name: 'Rajesh Kumar', title: 'Co-Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80', bio: 'Visionary leader with 15+ years in Real Estate.' },
                { name: 'Sneha Gupta', title: 'Co-Founder & CMO', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80', bio: 'Expert in marketing strategies and brand building.' }
            ]
        },
        appDetails: {
            banners: [
                "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200",
                "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200",
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200"
            ]
        },
        ux: {
            loadingText: 'आपका नजदीकी प्रॉपर्टी सर्च किया जा रहा है...',
            loadingIcon: 'loader-circle',
            slowConnIcon: 'fas fa-wifi-slash',
            slowConnHeading: 'Connection slow hai!',
            slowConnSubtext: 'Please Check Your Internet Connection'
        }
    },
    walletTransactions: [],
    adminWallet: 100000,
    customers: [
        { id: 201, name: "Rahul Sharma", phone: "9800012345", email: "rahul@gmail.com", password: "123", status: "active", joinedAt: "01/01/2026" },
        { id: 202, name: "Priya Singh", phone: "9800054321", email: "priya@gmail.com", password: "123", status: "active", joinedAt: "15/01/2026" }
    ],
    otherPage: {
        heading: "Explore More",
        subHeading: "Discover additional features and services",
        cards: [
            { id: 1, title: "Card 1", desc: "Premium features for exclusive members.", icon: "star", bg: "#ffffff" },
            { id: 2, title: "Card 2", desc: "Manage your app preferences here.", icon: "cog", bg: "#ffffff" },
            { id: 3, title: "Card 3", desc: "View your past activity history.", icon: "history", bg: "#ffffff" },
            { id: 4, title: "Card 4", desc: "Saved items for quick access.", icon: "bookmark", bg: "#ffffff" },
            { id: 5, title: "Card 5", desc: "Share with friends and family.", icon: "share-alt", bg: "#ffffff" },
            { id: 6, title: "Card 6", desc: "Get help and support anytime.", icon: "question-circle", bg: "#ffffff" },
            { id: 7, title: "Card 7", desc: "Check your latest notifications.", icon: "bell", bg: "#ffffff" },
            { id: 8, title: "Card 8", desc: "Privacy and security settings.", icon: "shield-alt", bg: "#ffffff" }
        ]
    },
    sellRentPage: {
        heading: "Sell or Rent Your Property",
        subHeading: "Choose an option below to proceed",
        cards: [
            {
                title: "SELF LISTING (₹99)",
                desc: "Post your property directly (Charge: ₹99)",
                icon: "plus-circle",
                bg: "#e8f5e9",
                action: "startCustomerListing()",
                bgImg: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800"
            },
            {
                title: "CONTACT BHUMIDEKHO",
                desc: "Let us help you sell/rent your property",
                icon: "headset",
                bg: "#e3f2fd",
                action: "openContactAdminModal()",
                bgImg: "https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?auto=format&fit=crop&w=800"
            }
        ]
    },
    sellRentAgentPage: {
        heading: "Manage Properties",
        subHeading: "Tap above to list a new property",
        cards: [
            { title: "POST NEW PROPERTY", desc: "List a new house, plot or flat", icon: "plus", bg: "#ffffff", action: "showPropertyModal()" }
        ]
    },
    premiumPlans: [
        { id: 1, name: "Starter", price: 499, duration: 30, credits: 500, propertyLimit: 5, description: "Basic plan for new agents", color: "#4CAF50" },
        { id: 2, name: "Pro", price: 999, duration: 30, credits: 1200, propertyLimit: 15, description: "Most popular choice", color: "#2196F3" },
        { id: 3, name: "Business", price: 2499, duration: 90, credits: 3000, propertyLimit: 50, description: "For power users", color: "#9C27B0" }
    ]
};

// --- Offline Data (Dummy cards shown ONLY during loading) ---
const OFFLINE_PROPERTIES = [
    {
        id: 'off_1',
        title: "Modern 3BHK Apartment - Sample",
        city: "Mumbai",
        category: "Residential",
        price: "1.2 Cr",
        area: "1200 sq.ft",
        priceSqft: "10,000",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=500&q=80",
        status: "approved",
        featured: true,
        isOffline: true,
        createdAt: "Loading..."
    },
    {
        id: 'off_2',
        title: "Prime Commercial Plot - Sample",
        city: "Delhi",
        category: "Plot",
        price: "85 Lakh",
        area: "1500 sq.ft",
        priceSqft: "5,666",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80",
        status: "approved",
        featured: true,
        isOffline: true,
        createdAt: "Loading..."
    },
    {
        id: 'off_3',
        title: "Luxury Villa with Garden - Sample",
        city: "Pune",
        category: "Villa",
        price: "2.5 Cr",
        area: "3500 sq.ft",
        priceSqft: "7,142",
        image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=500&q=80",
        status: "approved",
        featured: false,
        isOffline: true,
        createdAt: "Loading..."
    },
    {
        id: 'off_4',
        title: "Agricultural Land Near NH - Sample",
        city: "Lucknow",
        category: "Agricultural Land",
        price: "45 Lakh",
        area: "1 Acre",
        priceSqft: "1.03",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=500&q=80",
        status: "approved",
        featured: false,
        isOffline: true,
        createdAt: "Loading..."
    }
];

// --- Firebase Helper Functions ---
function saveToFirebase() {
    if (typeof database === 'undefined' || !database) return Promise.resolve();

    // SAFETY CHECK: Never save if we haven't loaded data yet!
    // This prevents overwriting the DB with empty/default state on startup.
    if (!State.isDataLoaded) {
        console.warn("?? Safety Block: Attempted to save before data load. Operation cancelled.");
        return Promise.resolve();
    }

    const dataToSync = {
        agents: State.agents,
        settings: State.settings,
        withdrawalRequests: State.withdrawalRequests || [],
        walletTransactions: State.walletTransactions || [],
        adminWallet: State.adminWallet,
        customers: State.customers || [],
        properties: State.properties || [],
        otherPage: State.otherPage,
        sellRentPage: State.sellRentPage,
        premiumPlans: State.premiumPlans,
        coupons: State.coupons || [],
        messages: State.messages || {}
    };

    return database.ref('bhumi_v2').set(dataToSync)
        .then(() => console.log("?? Firebase Sync: SUCCESS!"))
        .catch(err => console.error("?? Firebase Sync: FAILED!", err));
}

// --- NEW: Sync Wallet & Requests from PHP Backend ---
window.syncWalletDataFromPHP = async () => {
    // Only Admin needs to fetch ALL requests. 
    if (State.user && State.user.role === 'admin') {
        try {
            // 1. Recharge Requests
            const res1 = await fetch('api/wallet.php?action=get_recharge_requests');
            const data1 = await res1.json();

            if (data1.status === 'success') {
                const phpRecharges = data1.data.map(r => ({
                    id: parseInt(r.id),
                    // For recharges, UI uses agentId for both currently
                    agentId: parseInt(r.user_id),
                    agentName: r.name + ' (' + r.mobile + ')',
                    amount: parseFloat(r.amount),
                    proof: 'uploads/' + r.proof_image,
                    status: r.status,
                    date: new Date(r.created_at).toLocaleString(),
                    isPhp: true
                }));

                if (!State.walletRequests) State.walletRequests = [];
                State.walletRequests = State.walletRequests.filter(r => !r.isPhp);
                State.walletRequests = [...State.walletRequests, ...phpRecharges];
            }

            // 2. Withdrawal Requests
            const res2 = await fetch('api/wallet.php?action=get_requests');
            const data2 = await res2.json();

            if (data2.status === 'success') {
                const phpWithdrawals = data2.data.map(r => {
                    const isCustomer = r.role === 'customer';
                    return {
                        id: parseInt(r.id),
                        agentId: !isCustomer ? parseInt(r.user_id) : undefined,
                        customerId: isCustomer ? parseInt(r.user_id) : undefined,
                        // Provide fallback name if not found in list (though backend sends it)
                        agentName: r.name + ' (' + r.mobile + ')',
                        customerName: r.name + ' (' + r.mobile + ')',
                        amount: parseFloat(r.amount),
                        status: r.status,
                        date: new Date(r.created_at).toLocaleString(),
                        isPhp: true
                    };
                });

                if (!State.withdrawalRequests) State.withdrawalRequests = [];
                State.withdrawalRequests = State.withdrawalRequests.filter(r => !r.isPhp);
                State.withdrawalRequests = [...State.withdrawalRequests, ...phpWithdrawals];
            }

            console.log("Synced Wallet Data from PHP");
            render(); // Refresh UI

        } catch (e) {
            console.error("PHP Sync Error:", e);
        }
    }
};

function loadFromFirebase(callback) {
    if (typeof database === 'undefined' || !database) {
        State.isLoading = false;
        if (callback) callback(false);
        return;
    }

    // Check if we already have REAL data from cache
    const hasCachedData = State.properties.length > 0 && !State.properties[0].isOffline;
    State.isLoading = !hasCachedData;

    if (hasCachedData) {
        render();
    }

    const slowNetTimer = setTimeout(() => {
        const hasRealData = State.properties.length > 0 && !State.properties[0].isOffline;
        if (State.isLoading && !State.isDataLoaded && !hasRealData) {
            showSlowNetWarning("Internet slow hai, kripya intezar karein...");
        }
    }, 10000);

    const criticalNetTimer = setTimeout(() => {
        if (State.isLoading && !State.isDataLoaded) {
            State.isCriticalTimeout = true;
            render();
        }
    }, 10000);

    if (!navigator.onLine) showSlowNetWarning("No Internet! Please check your connection.");

    database.ref('bhumi_v2').once('value')
        .then(snapshot => {
            clearTimeout(slowNetTimer);
            clearTimeout(criticalNetTimer);
            hideSlowNetWarning();
            State.isCriticalTimeout = false;
            State.loadingMessage = 'आपका नजदीकी प्रॉपर्टी सर्च किया जा रहा है...';

            const data = snapshot.val();
            State.isDataLoaded = true;

            if (data) {
                if (data.agents) State.agents = data.agents;
                if (data.settings) State.settings = data.settings;
                // We don't overwrite withdrawalRequests/walletRequests blindly if we use PHP
                // But let's keep syncing them in case we switch back or for history not in PHP
                if (data.withdrawalRequests) State.withdrawalRequests = data.withdrawalRequests;
                if (data.walletTransactions) State.walletTransactions = data.walletTransactions;
                if (data.adminWallet !== undefined) State.adminWallet = data.adminWallet;
                if (data.customers) State.customers = data.customers;
                if (data.otherPage) State.otherPage = data.otherPage;
                if (data.premiumPlans) State.premiumPlans = data.premiumPlans;
                if (data.coupons) State.coupons = data.coupons;

                if (data.properties) {
                    State.properties = Array.isArray(data.properties) ? data.properties : Object.values(data.properties);
                    State.properties = State.properties.filter(p => p != null);
                } else {
                    State.properties = [];
                }

                saveToLocalStorage();
                console.log("?? Firebase Data Cached to LocalStorage!");

                State.isLoading = false;
                render();
                if (callback) callback(true);
            } else {
                State.properties = [];
                State.isLoading = false;
                render();
                if (callback) callback(false);
            }

        })
        .catch(err => {
            console.error("Firebase Load Error:", err);
            clearTimeout(slowNetTimer);
            clearTimeout(criticalNetTimer);
            State.isCriticalTimeout = false;
            hideSlowNetWarning();
            State.isLoading = false;
            if (callback) callback(false);
        });
}

// --- UX Helpers for Slow Internet ---
function showSlowNetWarning(msg = "Internet slow hai, kripya intezar karein...") {
    let warning = document.getElementById('slow-net-warning');
    if (!warning) {
        warning = document.createElement('div');
        warning.id = 'slow-net-warning';
        warning.innerHTML = `
            <div style="background: rgba(255, 153, 51, 0.98); color: white; padding: 12px 25px; border-radius: 50px; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); font-size: 0.9rem; font-weight: 700; border: 1.5px solid rgba(255,255,255,1); animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);">
                <i class="fas fa-wifi-slash" style="font-size: 1.1rem;"></i>
                <span id="slow-net-msg">${msg}</span>
            </div>
        `;
        warning.style.cssText = "position:fixed; top:85px; left:50%; transform:translateX(-50%); z-index:9999;";
        document.body.appendChild(warning);
    } else {
        const msgEl = document.getElementById('slow-net-msg');
        if (msgEl) msgEl.innerText = msg;
    }
}

function hideSlowNetWarning() {
    const warning = document.getElementById('slow-net-warning');
    if (warning) {
        warning.style.animation = "popOut 0.5s ease-in forwards";
        setTimeout(() => { if (warning.parentElement) warning.remove(); }, 500);
    }
}

// Online/Offline Listeners
window.addEventListener('offline', () => showSlowNetWarning("No Internet Connection!"));
window.addEventListener('online', () => {
    showSlowNetWarning("Back Online! Loading data...");
    setTimeout(hideSlowNetWarning, 2000);
});

function retryLoading() {
    State.isCriticalTimeout = false;
    State.isLoading = true;
    render(); // Show the spinning circle again
    loadFromFirebase(); // Re-trigger Firebase fetch
}

// --- Enquiry System ---
function directWhatsAppEnquiry(pid) {
    const p = State.properties.find(x => x.id === pid);
    if (!p) return;

    const whatsappNumber = p.whatsapp || p.mobile || '0000000000';
    const userName = State.user ? State.user.name : 'Client';
    const userPhone = State.user ? (State.user.phone || 'N/A') : 'N/A';

    const waMsg = `*Property Enquiry*\n\n` +
        `*Property:* ${p.title}\n` +
        `*ID:* BD-${p.id}\n` +
        `*Price:* Rs. ${p.price}\n` +
        `*Location:* ${p.city}\n\n` +
        `*Details:* I am interested in this property. Please provide more information.\n\n` +
        `*Sent by:* ${userName} (${userPhone})\n` +
        `Sent via BhumiDekho App`;

    const waUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

    // Optional: Silently record enquiry in background
    if (typeof database !== 'undefined' && database) {
        database.ref('bhumi_v2/enquiries').push({
            id: Date.now(),
            propertyId: pid,
            propertyName: p.title,
            name: userName,
            phone: userPhone,
            message: 'Direct WhatsApp Enquiry',
            date: new Date().toLocaleString(),
            status: 'direct_wa'
        });
    }

    window.open(waUrl, '_blank');
}

function showEnquiryModal(pid) {
    const p = State.properties.find(x => x.id === pid);
    if (!p) return;

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';

    // Auto-fill user info if logged in
    const userName = State.user ? State.user.name : '';
    const userPhone = State.user ? (State.user.phone || '') : '';

    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:0 !important; display:flex; flex-direction:column; max-height:90vh; overflow:hidden;">
            <div style="background:linear-gradient(135deg, #FF9933, #FF7700); padding:20px; color:white; text-align:center; flex-shrink:0;">
                <h3 style="margin:0; font-size:1.4rem;">Property Enquiry</h3>
                <p style="margin:5px 0 0; font-size:0.85rem; opacity:0.9;">${p.title}</p>
            </div>
            <div style="padding:25px; overflow-y:auto; flex:1;">
                <div style="display:flex; gap:15px; margin-bottom:20px; background:#f8f9fa; padding:10px; border-radius:12px; border:1px solid #eee;">
                    <img src="${p.image}" style="width:70px; height:70px; object-fit:cover; border-radius:10px; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
                    <div style="display:flex; flex-direction:column; justify-content:center;">
                        <div style="font-weight:800; color:#138808; font-size:1.1rem;">Rs. ${p.price}</div>
                        <div style="font-size:0.8rem; color:#666;"><i class="fas fa-map-marker-alt"></i> ${p.city}</div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:700; color:#1a2a3a;">आपका नाम (Your Name)</label>
                    <input type="text" id="enq-name" value="${userName}" class="login-input" placeholder="Enter your name" style="width:100%; border:1.5px solid #eee; border-radius:10px; padding:12px;">
                </div>
                <div class="form-group" style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-weight:700; color:#1a2a3a;">मोबाइल नंबर (Mobile Number)</label>
                    <input type="tel" id="enq-phone" value="${userPhone}" class="login-input" placeholder="Enter mobile number" style="width:100%; border:1.5px solid #eee; border-radius:10px; padding:12px;">
                </div>
                <div class="form-group" style="margin-bottom:20px;">
                    <label style="display:block; margin-bottom:5px; font-weight:700; color:#1a2a3a;">आपका संदेश (Message)</label>
                    <textarea id="enq-msg" class="login-input" placeholder="Interested in this property. Please call me." style="width:100%; height:80px; border:1.5px solid #eee; border-radius:10px; padding:12px; resize:none;">प्रॉपर्टी के बारे में और जानकारी चाहिए।</textarea>
                </div>

                <button class="login-btn enq-submit-btn" onclick="submitEnquiry(${pid})" style="background:#138808; border-radius:12px; margin-bottom:12px;">
                    <i class="fas fa-paper-plane"></i> Submit Enquiry
                </button>
                <button class="prop-btn" style="background:#D32F2F; color:white; padding:15px; font-weight:800; border-radius:12px; font-size:1rem;" onclick="closeModal()">CLOSE</button>
            </div>
        </div>
    `;
}

async function submitEnquiry(pid) {
    const name = document.getElementById('enq-name').value.trim();
    const phone = document.getElementById('enq-phone').value.trim();
    const message = document.getElementById('enq-msg').value.trim();

    if (!name || !phone) {
        alert("कृपया अपना नाम और मोबाइल नंबर भरें।");
        return;
    }

    const p = State.properties.find(x => x.id === pid);
    if (!p) return;

    const submitBtn = document.querySelector('.enq-submit-btn');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    submitBtn.disabled = true;

    try {
        const enquiry = {
            id: Date.now(),
            propertyId: pid,
            propertyName: p.title,
            name,
            phone,
            message,
            date: new Date().toLocaleString(),
            status: 'new'
        };

        if (!State.enquiries) State.enquiries = [];
        State.enquiries.push(enquiry);

        // In a real app, you'd push to Firebase here
        if (typeof database !== 'undefined' && database) {
            await database.ref('bhumi_v2/enquiries').push(enquiry);
        }

        // --- WhatsApp Integration ---
        const whatsappNumber = p.whatsapp || p.mobile || '0000000000';
        const waMsg = `*New Property Enquiry*\n\n` +
            `*Property:* ${p.title}\n` +
            `*Price:* Rs. ${p.price}\n` +
            `*Location:* ${p.city}\n` +
            `*Category:* ${p.category}\n\n` +
            `*Client Name:* ${name}\n` +
            `*Client Phone:* ${phone}\n` +
            `*Message:* ${message}\n\n` +
            `Sent from BhumiDekho App`;

        const waUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(waMsg)}`;

        // Show success and open WhatsApp
        const modal = document.querySelector('.modal-content');
        modal.innerHTML = `
            <div style="text-align:center; padding:40px 20px;">
                <div style="width:80px; height:80px; background:#e8f5e9; color:#138808; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.5rem; animation: popIn 0.5s ease-out;">
                    <i class="fas fa-check-double"></i>
                </div>
                <h3 style="color:#1a2a3a; margin-bottom:10px;">Enquiry Sent Successfully!</h3>
                <div style="color:#4caf50; font-weight:700; margin-bottom:5px; display:flex; align-items:center; justify-content:center; gap:5px;">
                    <i class="fas fa-check-double"></i> Message Delivered
                </div>
                <p style="color:#666; margin-bottom:25px;">Redirecting to WhatsApp for property owner contact...</p>
                <button class="login-btn" onclick="window.open('${waUrl}', '_blank'); closeModal();" style="background:#138808; width:auto; padding:10px 40px;">Open WhatsApp Now</button>
            </div>
        `;

        // Automatically open after a short delay
        setTimeout(() => {
            window.open(waUrl, '_blank');
        }, 1500);

    } catch (err) {
        console.error("Enquiry Error:", err);
        hideGlobalLoader(null);
        alert("Something went wrong. Please try again.");
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Enquiry';
        submitBtn.disabled = false;
    }
}


function setupFirebaseListener() {
    if (typeof database === 'undefined' || !database) return;

    database.ref('bhumi_v2').on('value', snapshot => {
        const data = snapshot.val();
        if (data) {
            // Only update parts that shouldn't disrupt user session
            State.agents = data.agents || State.agents;
            State.withdrawalRequests = data.withdrawalRequests || State.withdrawalRequests;
            State.walletTransactions = data.walletTransactions || State.walletTransactions;
            State.adminWallet = data.adminWallet !== undefined ? data.adminWallet : State.adminWallet;
            if (data.otherPage) State.otherPage = data.otherPage;

            // CRITICAL FIX: Also handle Object-to-Array conversion here for live updates
            if (data.hasOwnProperty('properties')) {
                State.properties = Array.isArray(data.properties) ? data.properties : Object.values(data.properties);
                State.properties = State.properties.filter(p => p != null);
            }

            if (data.messages) {
                State.messages = data.messages;
                // If a chat is open, refresh its messages
                if (State.activeChatId) {
                    renderChatMessages(State.activeChatId);
                }
            }

            // We usually don't want to live-sync settings or customers while user is active 
            // unless we handle merge conflicts/state refresh carefully.
            // For now, let's keep it simple.
            render();
        }
    });
}

// Helper to render messages inside an open chat modal without full page reload
window.renderChatMessages = (chatId) => {
    const chatBox = document.getElementById('chat-messages') || document.getElementById('chat-messages-user') || document.getElementById('admin-chat-messages');
    if (!chatBox) {
        console.warn('Chat box not found! Looking for: chat-messages, chat-messages-user, or admin-chat-messages');
        return;
    }

    if (!State.messages) State.messages = {};
    const messages = State.messages[chatId] || [];

    // Determine who 'me' is
    let myName = 'Guest';
    let isAdmin = false;

    if (State.user) {
        myName = State.user.name;
    } else if (State.view === 'admin') {
        myName = 'Admin';
        isAdmin = true;
    }

    chatBox.innerHTML = messages.map(m => {
        // Strict check: 
        let isMe = false;

        if (isAdmin) {
            isMe = (m.sender === 'Admin');
        } else {
            isMe = (m.sender === myName);
        }

        const align = isMe ? 'flex-end' : 'flex-start';
        // Admin gets different color slightly to differentiate
        const bg = isMe ? (isAdmin ? '#cce5ff' : '#d9fdd3') : '#ffffff';
        const color = (m.sender === 'Admin') ? '#004085' : '#111b21';
        const radius = isMe ? '15px 0 15px 15px' : '0 15px 15px 15px';
        const shadow = '0 1px 0.5px rgba(0,0,0,0.13)';

        // 3-State Read Receipts
        let ticks = '';
        if (isMe) {
            if (m.seen) {
                // Blue double tick - Message read
                ticks = `<span style="color:#53bdeb; margin-left:3px; font-size:0.7rem;" title="Read"><i class="fas fa-check-double"></i></span>`;
            } else if (m.delivered) {
                // Gray double tick - Message delivered but not read
                ticks = `<span style="color:#8696a0; margin-left:3px; font-size:0.7rem;" title="Delivered"><i class="fas fa-check-double"></i></span>`;
            } else {
                // Single gray tick - Message sent
                ticks = `<span style="color:#8696a0; margin-left:3px; font-size:0.7rem;" title="Sent"><i class="fas fa-check"></i></span>`;
            }
        }

        // Message content based on type
        let messageContent = '';

        if (m.type === 'image' && m.fileUrl) {
            // Image message
            messageContent = `
                <div style="margin-bottom:5px;">
                    <img src="${m.fileUrl}" 
                         alt="Image" 
                         style="max-width:250px; max-height:250px; border-radius:8px; cursor:pointer; display:block;"
                         onclick="window.open('${m.fileUrl}', '_blank')"
                         title="Click to view full size">
                </div>
                <div style="font-size:0.85rem; color:#667781;">${m.text}</div>
            `;
        } else if (m.type === 'file' && m.fileUrl) {
            // File message (PDF, etc.)
            const fileIcon = m.fileType === 'application/pdf' ? 'fa-file-pdf' : 'fa-file';
            const fileSize = m.fileSize ? (m.fileSize / 1024).toFixed(1) + ' KB' : '';
            messageContent = `
                <div style="display:flex; align-items:center; gap:10px; padding:8px; background:rgba(0,0,0,0.05); border-radius:8px; cursor:pointer;"
                     onclick="downloadFile('${m.fileUrl}', '${m.fileName || 'file'}')">
                    <i class="fas ${fileIcon}" style="font-size:2rem; color:#667781;"></i>
                    <div style="flex:1;">
                        <div style="font-size:0.9rem; font-weight:600;">${m.fileName || 'File'}</div>
                        <div style="font-size:0.75rem; color:#667781;">${fileSize}</div>
                    </div>
                    <i class="fas fa-download" style="color:#667781;"></i>
                </div>
            `;
        } else {
            // Regular text message
            messageContent = `<div style="font-size:1rem; line-height:19px; margin-bottom:2px;">${m.text}</div>`;
        }

        // Delete button (only for admin)
        const deleteBtn = isAdmin ? `
            <button onclick="deleteMessage('${chatId}', ${i}); event.stopPropagation();" 
                    style="position:absolute; top:5px; right:5px; background:rgba(255,0,0,0.7); color:white; border:none; border-radius:50%; width:20px; height:20px; cursor:pointer; font-size:0.7rem; display:none; align-items:center; justify-content:center; transition:all 0.2s;"
                    class="msg-delete-btn"
                    onmouseover="this.style.background='rgba(255,0,0,0.9)'"
                    onmouseout="this.style.background='rgba(255,0,0,0.7)'"
                    title="Delete message">
                <i class="fas fa-times"></i>
            </button>
        ` : '';

        return `
            <div style="display:flex; flex-direction:column; align-items:${align}; width:100%;">
                <div style="background:${bg}; color:${color}; padding:6px 10px 8px 10px; border-radius:${radius}; max-width:80%; box-shadow:${shadow}; margin-bottom:4px; position:relative;"
                     onmouseover="if(this.querySelector('.msg-delete-btn')) this.querySelector('.msg-delete-btn').style.display='flex'"
                     onmouseout="if(this.querySelector('.msg-delete-btn')) this.querySelector('.msg-delete-btn').style.display='none'">
                    ${deleteBtn}
                    ${messageContent}
                    <div style="font-size:0.65rem; color:#667781; text-align:right; display:flex; align-items:center; justify-content:flex-end; gap:4px; margin-top:2px;">
                        ${m.time} ${ticks}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (messages.length === 0) {
        chatBox.innerHTML = `<div style="text-align:center; color:#888; font-size:0.9rem; margin-top:40px; background:#fff; padding:10px; border-radius:10px; box-shadow:0 1px 2px rgba(0,0,0,0.1); width:fit-content; margin-left:auto; margin-right:auto;">
            <i class="fas fa-lock" style="font-size:0.7rem; margin-bottom:5px;"></i><br>
            Start a secure conversation
        </div>`;
    }

    chatBox.scrollTop = chatBox.scrollHeight;
};


// Save to localStorage (backup - ONLY Session & Settings, NO Properties/Images)
// Save to localStorage (backup - INCLUDING Properties for Speed)
function saveToLocalStorage() {
    try {
        localStorage.setItem('bhumi_v2_state', JSON.stringify({
            guestLikes: (!State.user) ? State.likes : (JSON.parse(localStorage.getItem('bhumi_v2_state'))?.guestLikes || []),
            user: State.user,
            settings: State.settings,
            adminWallet: State.adminWallet,
            // Persist critical data for offline/reload access
            agents: State.agents,
            customers: State.customers,
            withdrawalRequests: State.withdrawalRequests,
            walletTransactions: State.walletTransactions,
            messages: State.messages,
            otherPage: State.otherPage,
            sellRentPage: State.sellRentPage,
            premiumPlans: State.premiumPlans,
            coupons: State.coupons
        }));

        // --- OPTIMIZATION START: Cache Properties Locally ---
        if (State.properties && State.properties.length > 0) {
            // Save only necessary fields to save space if needed, 
            // but for now saving full object to ensure smooth offline experience.
            // We use a try-catch block specifically for this in case of QuotaExceeded
            localStorage.setItem('bhumi_v2_props', JSON.stringify(State.properties));
        }
        // --- OPTIMIZATION END ---

    } catch (e) {
        if (e.name === 'QuotaExceededError') {
            console.warn("LocalStorage Quota Exceeded. Clearing old cache to make space.");
            // Strategy: Clear properties cache allows app to still function
            localStorage.removeItem('bhumi_v2_props');
        }
    }
}

// --- App Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // First load from localStorage for instant display
    // Use setTimeout to allow the browser to paint the HTML skeleton FIRST
    setTimeout(() => {
        loadGlobalData();
        updateUIForUser();
        render(); // This will replace the skeleton with real content

        // Firebase loading enabled - Background Sync
        loadFromFirebase((success) => {
            if (success) {
                console.log('?? Synced with Firebase cloud data!');
                render();
            } else {
                console.log('?? Using local data (Firebase unavailable)');
            }
            window.syncWalletDataFromPHP(); // Sync PHP Data
            setupFirebaseListener();
        });
    }, 50);

    window.addEventListener('popstate', (e) => {
        if (e.state) { State.view = e.state.view; render(); }
    });
    attachNavListeners();
});

function loadGlobalData() {
    try {
        const savedState = localStorage.getItem('bhumi_v2_state');
        if (savedState) {
            const parsed = JSON.parse(savedState);
            State.user = parsed.user;
            // Load agents with fallback to default
            State.agents = (parsed.agents && parsed.agents.length > 0) ? parsed.agents.map(a => ({
                ...a,
                currentPlan: a.currentPlan || 'Free', // Free, Silver, Gold
                planExpiry: a.planExpiry || null,
                listingsUsed: a.listingsUsed || 0
            })) : [
                { id: 101, name: "John Agent", email: "john.agent@bhumidekho.com", password: "admin123", phone: "9876543210", status: "approved", wallet: 5000, currentPlan: 'Free', planExpiry: null, listingsUsed: 0 }
            ];

            // Load customers with fallback to default
            State.customers = (parsed.customers && parsed.customers.length > 0) ? parsed.customers : [
                { id: 201, name: "Rahul Sharma", phone: "9800012345", email: "rahul@gmail.com", password: "123", status: "active", joinedAt: "01/01/2026", likes: [], wallet: 0 },
                { id: 202, name: "Priya Singh", phone: "9800054321", email: "priya@gmail.com", password: "123", status: "active", joinedAt: "15/01/2026", likes: [], wallet: 0 }
            ];

            // Determine likes source
            if (State.user && State.user.role === 'customer') {
                const cust = State.customers.find(c => c.id === State.user.id);
                if (cust) State.likes = cust.likes || [];
            } else {
                State.likes = parsed.guestLikes || parsed.likes || [];
            }

            State.settings = parsed.settings || { showDate: true };
            State.withdrawalRequests = parsed.withdrawalRequests || [];
            State.walletTransactions = parsed.walletTransactions || [];
            State.adminWallet = parsed.adminWallet !== undefined ? parsed.adminWallet : 100000;
            if (parsed.messages) State.messages = parsed.messages;
            if (parsed.otherPage) State.otherPage = parsed.otherPage;
            if (parsed.otherPage) State.otherPage = parsed.otherPage;
            // if (parsed.sellRentPage) State.sellRentPage = parsed.sellRentPage; // Force local config for 2 buttons
            if (parsed.premiumPlans) State.premiumPlans = parsed.premiumPlans;
            if (parsed.coupons) State.coupons = parsed.coupons;
        } else {
            throw new Error("No saved state");
        }
    } catch (e) {
        // Defaults if no data found or corrupted
        console.warn("Resetting state due to error/missing:", e);

        // Alert only if it was a corruption error (savedState existed but failed to load)
        if (e.message !== "No saved state") {
            alert("Warning: Saved data was corrupted and has been reset. This can happen if storage was full.");
        }

        State.settings = { showDate: true };
        State.adminWallet = 100000;
        State.agents = [];
        State.customers = [
            { id: 201, name: "Rahul Sharma", phone: "9800012345", email: "rahul@gmail.com", password: "123", status: "active", joinedAt: "01/01/2026", likes: [], wallet: 0 },
            { id: 202, name: "Priya Singh", phone: "9800054321", email: "priya@gmail.com", password: "123", status: "active", joinedAt: "15/01/2026", likes: [], wallet: 0 }
        ];
    }

    // Ensure Settings Objects Exist
    if (!State.settings.contactInfo) {
        State.settings.contactInfo = {
            phone: '+91 98765 43210',
            email: 'support@bhumidekho.com',
            founders: [
                { name: 'Rajesh Kumar', title: 'Co-Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80', bio: 'Visionary leader with 15+ years in Real Estate.' },
                { name: 'Sneha Gupta', title: 'Co-Founder & CMO', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80', bio: 'Expert in marketing strategies and brand building.' }
            ]
        };
    }
    // Migration for new Founders Array structure
    if (State.settings.contactInfo && !State.settings.contactInfo.founders) {
        const f1 = State.settings.contactInfo.founder1 || { name: 'Rajesh Kumar', title: 'CEO', image: '', bio: '' };
        const f2 = State.settings.contactInfo.founder2 || { name: 'Sneha Gupta', title: 'CMO', image: '', bio: '' };
        State.settings.contactInfo.founders = [f1, f2];
    }
    if (!State.settings.appDetails) {
        State.settings.appDetails = {
            banners: [
                "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200"
            ]
        };
    }

    // Initialize with Offline properties as placeholders
    State.properties = [...OFFLINE_PROPERTIES];

    // Only load critical session data
    // --- OPTIMIZATION START: Load Properties from LocalStorage ---
    try {
        const savedProps = localStorage.getItem('bhumi_v2_props');
        if (savedProps) {
            let props = JSON.parse(savedProps);
            if (Array.isArray(props) && props.length > 0) {
                // Background processing to fix data consistency
                props.forEach(p => {
                    if (!p.status) p.status = 'approved';
                    if (p.featured === undefined) p.featured = false;
                });

                // If we have cached properties, use them immediately!
                if (props.length > 0) {
                    State.properties = props;
                    State.isDataLoaded = true; // MARK DATA AS LOADED FROM CACHE
                    console.log("?? Loaded from Cache (Fast Start):", props.length, "properties");
                }
            }
        }
    } catch (e) {
        console.error("Error loading cached properties:", e);
        // Fallback to empty if cache is corrupted, but don't crash
        if (!State.properties) State.properties = [];
    }
    // --- OPTIMIZATION END ---
    checkMembershipExpiry();
}

const checkMembershipExpiry = () => {
    if (!State.agents) return;
    let updated = false;
    const now = Date.now();

    State.agents.forEach(agent => {
        if (agent.planExpiry && now > agent.planExpiry) {
            // Plan Expired
            if (agent.currentPlan !== 'Expired') {
                agent.currentPlan = 'Expired'; // Mark plan as expired
                updated = true;

                // Hide their properties
                State.properties.forEach(p => {
                    if (p.agentId === agent.id && p.status === 'approved') {
                        p.status = 'hidden';
                        p.disableReason = 'Plan Expired';
                    }
                });

                // Alert if current user
                if (State.user && State.user.id === agent.id) {
                    setTimeout(() => alert("Your Premium Membership has expired! Your properties are now hidden. Please recharge."), 1000);
                }
            }
        }
    });

    if (updated) saveGlobalData();
};

const saveGlobalData = async () => {
    // Save to localStorage (instant)
    try {
        saveToLocalStorage();
    } catch (e) {
        console.error("Storage Error:", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert("Storage Full! Some data may not be saved locally. Please delete old properties.");
        }
    }

    // Await Firebase sync with a timeout (e.g. 5 seconds)
    // This ensures fast UI response while still attempting sync.
    // If sync takes > 5s, the promise resolves early so UI unblocks, 
    // but the Firebase operation continues in background.
    try {
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 5000));
        await Promise.race([saveToFirebase(), timeoutPromise]);
    } catch (err) {
        console.error("Firebase Sync Failed/Timeout:", err);
        // We still resolve because local save succeeded, but we log the error
    }
};

function updateUIForUser() {
    const profileAction = document.getElementById('profile-action');
    const nameSpan = document.getElementById('user-name-h');
    const loginText = document.getElementById('login-text');

    if (!profileAction || !nameSpan) return;
    const profileIconBox = profileAction.querySelector('.profile-circle');

    if (State.user) {
        nameSpan.innerText = State.user.name ? State.user.name.split(' ')[0] : 'User';
        nameSpan.style.display = 'block'; // Ensure name is visible

        if (State.user.photo) {
            // Use image
            profileIconBox.innerHTML = `<img src="${State.user.photo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">`;
            profileIconBox.style.border = '2px solid #138808'; // Active border
        } else {
            // Use initial or default icon
            const initial = State.user.name ? State.user.name.charAt(0).toUpperCase() : 'U';
            profileIconBox.innerHTML = `<span style="font-size:1.2rem; font-weight:700; color:#138808;">${initial}</span>`;
            profileIconBox.style.border = '2px solid #ddd';
        }

        profileAction.onclick = () => {
            // Navigate based on role
            if (State.user.role === 'customer') navigate('profile');
            else navigate(State.user.role);
        };
    } else {
        nameSpan.style.display = 'none';
        profileIconBox.innerHTML = `<i class="fas fa-user" style="color:#666;"></i>`;
        profileIconBox.style.border = '2px solid #ddd';
        profileAction.onclick = () => navigate('login');
    }

    if (loginText) loginText.innerText = State.user ? State.user.role.toUpperCase() : 'LOGIN';

    const footerIcon = document.getElementById('footer-user-icon');
    if (footerIcon) {
        if (State.user && State.user.photo) {
            footerIcon.innerHTML = `<img src="${State.user.photo}" style="width:24px; height:24px; object-fit:cover; border-radius:50%; border:1px solid #ddd;">`;
        } else if (State.user) {
            footerIcon.innerHTML = `<i class="fas fa-user-circle" style="font-size:1.2rem;"></i>`;
        } else {
            footerIcon.innerHTML = `<i class="fas fa-user"></i>`;
        }
    }
}

// --- Navigation & Router ---
// --- Navigation & Router ---
function navigate(view, params = null) {
    State.view = view;
    if (params) State.selectedPropertyId = params;
    window.scrollTo(0, 0);

    const header = document.getElementById('main-header');
    if (header) header.style.display = (view === 'login' || view === 'admin' || view === 'agent') ? 'none' : 'block';

    const profileAction = document.getElementById('profile-action');
    const nameSpan = document.getElementById('user-name-h');
    if (profileAction && nameSpan) {
        const profileIconBox = profileAction.querySelector('.profile-circle');
        if (State.user) {
            nameSpan.innerText = State.user.name ? State.user.name.split(' ')[0] : 'User';
            nameSpan.style.display = 'block';
            if (State.user.photo) {
                profileIconBox.innerHTML = `<img src="${State.user.photo}" style="width:100%; height:100%; object-fit:cover;">`;
            } else {
                profileIconBox.innerHTML = `<i class="fas fa-user-circle"></i>`;
            }
            profileAction.onclick = () => {
                if (State.user.role === 'customer') navigate('profile');
                else navigate(State.user.role);
            };
        } else {
            nameSpan.style.display = 'none';
            profileIconBox.innerHTML = `<i class="fas fa-user"></i>`;
            profileAction.onclick = () => navigate('login');
        }
    }

    const loginText = document.getElementById('login-text');
    if (loginText) loginText.innerText = State.user ? State.user.role.toUpperCase() : 'LOGIN';

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.getAttribute('data-page') === view);
    });

    render();
}

function attachNavListeners() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const view = item.getAttribute('data-page');

            // --- Sell/Rent Auth Check ---
            // If user clicks 'sell-rent' and is NOT logged in, redirect to login
            if (view === 'sell-rent' && !State.user) {
                navigate('login');
                return;
            }

            if (view === 'search') openSearchModal();
            else if (view === 'add-property') {
                if (!State.user) {
                    navigate('login');
                } else {
                    if (State.user.role === 'agent') {
                        if (typeof setAgentTab === 'function') setAgentTab('properties');
                        navigate('agent');
                    } else if (State.user.role === 'admin') {
                        if (typeof setAdminTab === 'function') setAdminTab('properties');
                        navigate('admin');
                    } else {
                        // Fallback for customers
                        alert("Please contact an agent to list your property.");
                    }
                }
            }
            else if (view === 'login' && State.user) {
                if (State.user.role === 'customer') navigate('profile');
                else navigate(State.user.role);
            }
            else navigate(view);
        };
    });
}

// --- Main Render Function ---
// --- Main Render Function ---
function render() {
    const app = document.getElementById('app');
    if (!app) return;

    // Broadcast check (only if modal isn't already active)
    if (State.settings.broadcast && State.settings.broadcast.active) {
        const b = State.settings.broadcast;
        const recipient = b.recipient || 'all';
        const userRole = State.user ? State.user.role : 'guest';
        let shouldShow = false;
        if (recipient === 'all') shouldShow = true;
        else if (recipient === 'agents' && userRole === 'agent') shouldShow = true;

        if (shouldShow && !localStorage.getItem('dismissed_broadcast_' + b.id)) {
            const modal = document.getElementById('modal-container');
            if (modal && modal.style.display !== 'flex') {
                modal.style.display = 'flex';
                modal.innerHTML = `
                    <style>
                        @keyframes borderMove {
                            0% { background-position: 0% 50%; }
                            100% { background-position: 100% 50%; }
                        }
                    </style>
                    <!-- Wrapper for Animated Border (Thinner: padding 2.5px) -->
                    <div class="modal-content scale-in" style="max-width:380px; padding:2.5px; border-radius:18px; border:none; overflow:hidden; background: linear-gradient(90deg, #FF9933, #ffffff, #138808, #FF9933); background-size: 300% 100%; animation: borderMove 4s linear infinite; box-shadow: 0 15px 40px rgba(0,0,0,0.25);">
                        
                        <!-- Inner Content Box -->
                        <div style="background: #fff; border-radius: 16px; overflow:hidden; height:100%;">
                            <!-- Header -->
                            <div style="background: #fff; padding:20px 20px 5px 20px; text-align:center;">
                                <i class="fas fa-bullhorn" style="font-size:2rem; margin-bottom:10px; background: -webkit-linear-gradient(#FF9933, #138808); -webkit-background-clip: text; -webkit-text-fill-color: transparent;"></i>
                                <h2 style="margin:0; font-size:1.1rem; font-weight:700; color:#444; text-transform:uppercase; letter-spacing:0.5px;">Message</h2>
                            </div>
                            
                            <!-- Scrollable Content Area -->
                            <div style="padding:10px 25px 25px 25px;">
                                <div style="font-size:1rem; color:#333; font-family: 'Poppins', sans-serif; font-weight:500; line-height:1.5; margin-bottom:25px; white-space:pre-wrap; text-align:left;">${b.message}</div>
                                <div style="text-align:center;">
                                    <button class="login-btn" onclick="dismissBroadcast(${b.id})" style="padding:8px 30px; font-size:0.9rem; width:auto; min-width:100px; border-radius:50px; font-weight:600; background: #333; border:none; color:white; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    }

    const logoText = document.getElementById('app-logo-text');
    if (logoText) logoText.innerHTML = State.settings.appName || 'Bhumi<span style="color: #FF9933;">Dekho</span>';

    updateOtherButton();

    // DOUBLE BUFFERING: Render to a temporary element first to avoid "Blink"
    const tempContainer = document.createElement('div');

    switch (State.view) {
        case 'home': renderHome(tempContainer); break;
        case 'likes': renderLikes(tempContainer); break;
        case 'other': renderOther(tempContainer); break;
        case 'login': renderLogin(tempContainer); break;
        case 'admin': renderAdmin(tempContainer); break;
        case 'agent': renderAgent(tempContainer); break;
        case 'details': renderDetails(tempContainer); break;
        case 'signup': renderSignup(tempContainer); break;
        case 'profile': renderProfile(tempContainer); break;
        case 'contact': renderContactUs(tempContainer); break;
        case 'sell-rent': renderSellRent(tempContainer); break;
        default: renderHome(tempContainer);
    }

    // Direct swap to eliminate the 806: app.innerHTML = ''; blink
    app.innerHTML = tempContainer.innerHTML;
}

function renderSellRent(container) {
    const data = State.sellRentPage || { heading: "Sell or Rent Your Property", subHeading: "Choose an option below to proceed", cards: [] };
    const isAgent = State.user && (State.user.role === 'agent' || State.user.role === 'admin');

    container.innerHTML = `
        <div style="padding:20px 20px 100px 20px; max-width:800px; margin:0 auto; margin-top:20px;">
            ${!isAgent ? `
                <div style="text-align:center; margin-bottom:30px;">
                    <h2 style="color:#1a2a3a; font-size:1.8rem; font-weight:900; margin-bottom:10px;">${data.heading}</h2>
                    <p style="color:#666;">${data.subHeading}</p>
                </div>
                
                <!-- Sell/Rent Choice Boxes -->
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(${(data.settings?.minWidth) || 140}px, 1fr)); gap:15px; margin-bottom:25px;">
                    ${(data.cards || []).filter(c => !c.hidden).map((card, i) => `
                        <button onclick="window.selectSRType(${i})" id="sr-btn-${i}" class="sr-dynamic-btn clickable-effect" 
                            style="background:${card.bgImg ? `url(${card.bgImg}) center/cover no-repeat` : (card.bg || '#ffffff')}; border:2px solid ${State.selectedSRIndex === i ? '#138808' : '#eee'}; padding:${(data.settings?.padding) || 25}px 15px; border-radius:30px; transition:0.3s; box-shadow:0 4px 15px rgba(0,0,0,0.05); cursor:pointer; position:relative; overflow:hidden; min-height:${(data.settings?.minHeight) || 120}px;">
                            ${card.bgImg ? '<div style="position:absolute; inset:0; background:rgba(0,0,0,0.45); z-index:1;"></div>' : ''}
                            <div style="position:relative; z-index:2;">
                                ${!card.hideIcon ? `
                                    <div style="width:${(data.settings?.iconBox) || 70}px; height:${(data.settings?.iconBox) || 70}px; background:${card.bgImg ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.05)'}; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px; border: 2px solid ${card.bgImg ? 'rgba(255,255,255,0.3)' : 'transparent'};">
                                        <i class="fas fa-${card.icon || 'star'}" style="color:${card.bgImg ? 'white' : '#1a2a3a'}; font-size:${(data.settings?.iconSize) || 2.2}rem;"></i>
                                    </div>
                                ` : ''}
                                <div style="font-weight:900; color:${card.bgImg ? 'white' : '#1a2a3a'}; font-size:${(data.settings?.fontSize) || 0.85}rem; letter-spacing:0.5px; line-height:1.2; text-shadow:${card.bgImg ? '0 2px 4px rgba(0,0,0,0.6)' : 'none'}; text-transform:uppercase;">
                                    ${card.title}
                                </div>
                            </div>
                        </button>
                    `).join('')}
                </div>

                <!-- Support Box -->
                <div style="background:white; padding:30px; border-radius:30px; border:1px solid #eee; box-shadow:0 15px 45px rgba(0,0,0,0.04); text-align:center; position:relative; overflow:hidden;">
                    <div style="position:absolute; top:-20px; left:-20px; width:70px; height:70px; background:rgba(255, 153, 51, 0.1); border-radius:50%;"></div>
                    <div style="position:absolute; bottom:-20px; right:-20px; width:100px; height:100px; background:rgba(19, 136, 8, 0.1); border-radius:50%;"></div>
                    
                    <div style="width:70px; height:70px; background:linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#1976D2; font-size:2rem; box-shadow:0 8px 20px rgba(25, 118, 210, 0.2);">
                        <i class="fas fa-headset"></i>
                    </div>
                    
                    <h3 style="margin-bottom:10px; color:#1a2a3a; font-weight:900; font-size:1.4rem;">Need Help?</h3>
                    <p style="color:#666; margin-bottom:25px; max-width:400px; margin-left:auto; margin-right:auto; line-height:1.6;">
                        Have questions about selling or renting your property? Our support team is here to guide you 24/7.
                    </p>
                    
                    <div style="display:flex; justify-content:center; gap:15px; flex-wrap:wrap;">
                        <a href="tel:${State.settings.contactInfo.phone}" class="clickable-effect" style="display:flex; align-items:center; gap:10px; padding:14px 28px; background:linear-gradient(135deg, #138808, #2e7d32); color:white; border-radius:50px; text-decoration:none; font-weight:700; box-shadow:0 8px 20px rgba(19, 136, 8, 0.3); transition:transform 0.2s;">
                            <i class="fas fa-phone-alt"></i> Call Support
                        </a>
                        <button onclick="openMessenger()" class="clickable-effect" style="display:flex; align-items:center; gap:10px; padding:14px 28px; background:white; color:#FF9933; border:2px solid #FF9933; border-radius:50px; font-weight:700; cursor:pointer; box-shadow:0 5px 15px rgba(255, 153, 51, 0.15); transition:transform 0.2s;">
                            <i class="fab fa-facebook-messenger"></i> Chat Now
                        </button>
                    </div>
                </div>
            ` : ''}

            ${isAgent ? `
                <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:60vh;">
                    <h2 style="color:#1a2a3a; font-size:1.5rem; font-weight:800; margin-bottom:30px; text-align:center;">
                        ${(State.sellRentAgentPage?.heading) || 'Manage Properties'}
                    </h2>
                    
                    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:20px; width:100%; max-width:600px; justify-items:center;">
                        ${(State.sellRentAgentPage?.cards || []).filter(c => !c.hidden).map((card, i) => `
                            <button onclick="${card.action || 'showPropertyModal()'}" class="clickable-effect" style="width: 180px; height: 180px; background: ${card.bg || 'white'}; border: none; border-radius: 30px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 15px 35px rgba(0,0,0,0.1); position: relative; overflow: hidden; transition: transform 0.2s;">
                                <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: linear-gradient(90deg, #FF9933, #138808);"></div>
                                <div style="width: 70px; height: 70px; background: linear-gradient(135deg, #FF9933, #FF7722); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; box-shadow: 0 8px 20px rgba(255, 153, 51, 0.3);">
                                    <i class="fas fa-${card.icon || 'plus'}" style="color: white; font-size: 2.2rem;"></i>
                                </div>
                                <div style="text-align: center; padding:0 10px;">
                                    <div style="color: #1a2a3a; font-weight: 800; font-size: 0.9rem; line-height: 1.2;">${card.title}</div>
                                </div>
                            </button>
                        `).join('')}
                    </div>

                    <!-- Membership UI Injection -->
                    <div style="width:100%; max-width:600px; margin-top:30px;">
                         ${window.getMembershipUI ? window.getMembershipUI(State.agents.find(a => a.id === State.user.id)) : ''}
                    </div>
                    
                    <p style="margin-top:20px; color:#666; font-size:0.9rem; font-style:italic;">
                        ${(State.sellRentAgentPage?.subHeading) || 'Tap above to list a new property'}
                    </p>
                </div>
            ` : ''}
        </div>
    `;
}

window.selectSRType = (index) => {
    const cards = State.sellRentPage?.cards || [];
    const selectedCard = cards[index];

    // Check custom action
    if (selectedCard && selectedCard.action) {
        // Execute global function string (e.g. "openBoostModal()")
        try {
            const funcName = selectedCard.action.replace('()', '');
            if (typeof window[funcName] === 'function') {
                window[funcName]();
            } else {
                console.warn("Function not found:", funcName);
            }
        } catch (e) {
            console.error(e);
        }
        return;
    }

    // Check if it's the "List Property" or "+" button
    if (selectedCard && (selectedCard.title.toLowerCase().includes('list') || selectedCard.title.toLowerCase().includes('sell') || selectedCard.title.toLowerCase().includes('add') || selectedCard.icon === 'plus')) {
        showPropertyModal();
        return;
    }

    State.selectedSRIndex = index;
    State.selectedSRType = selectedCard?.title || 'Unknown';

    // Reset all buttons
    document.querySelectorAll('.sr-dynamic-btn').forEach((btn, i) => {
        btn.style.borderColor = (i === index) ? '#138808' : '#eee';
        btn.style.transform = (i === index) ? 'scale(1.02)' : 'scale(1)';
    });
};

window.submitSRRequest = () => {
    const desc = document.getElementById('sr-description').value;
    const type = State.selectedSRType || 'Not Selected';
    if (!desc.trim()) {
        showGlobalLoader('Please enter property description.', 1500);
        return;
    }

    showGlobalLoader('Submitting Request...', 0);

    // Simulate API call/save
    setTimeout(() => {
        hideGlobalLoader('Request Sent Successfully!', 2000);
        document.getElementById('sr-description').value = '';
    }, 1500);
};

function renderOther(container) {
    const data = State.otherPage || { heading: "Explore More", subHeading: "", cards: [] };
    container.innerHTML = `
        <div style="padding:20px 20px 100px 20px; max-width:800px; margin:0 auto; margin-top:20px;">
            <div style="text-align:center; margin-bottom:30px;">
                <h2 style="color:#1a2a3a; font-size:1.8rem; font-weight:900; margin-bottom:10px;">
                    ${data.heading}
                </h2>
                <p style="color:#666;">${data.subHeading}</p>
            </div>

            <div class="other-grid">
                ${(data.cards || []).filter(c => !c.hidden).map((card, i) => `
                    <div class="other-card clickable-effect" onclick="handleCardClick(${i})" 
                        style="background:${card.bgImg ? `url(${card.bgImg}) center/cover no-repeat` : (card.bg || '#ffffff')}; height:${card.size || 160}px; position:relative;">
                        ${card.bgImg ? '<div style="position:absolute; inset:0; background:rgba(0,0,0,0.4); border-radius:16px;"></div>' : ''}
                        <div style="position:relative; z-index:2; width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                            ${!card.hideIcon ? `
                            <div class="other-card-icon" style="${card.bgImg ? 'background:rgba(255,255,255,0.9); box-shadow:0 4px 15px rgba(0,0,0,0.3);' : ''}">
                                <i class="fas fa-${card.icon || 'star'}"></i>
                            </div>
                            ` : ''}
                            ${!card.hideText ? `
                            <div class="other-card-content" style="${card.bgImg ? 'color:white !important; text-shadow:0 2px 4px rgba(0,0,0,0.5);' : ''}">
                                <h3 class="other-card-title" style="${card.bgImg ? 'color:white !important;' : ''}">${card.title}</h3>
                                <p class="other-card-desc" style="${card.bgImg ? 'color:rgba(255,255,255,0.9) !important;' : ''}">${card.desc}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function renderContactUs(container) {
    container.innerHTML = `
        <div style="padding:20px 20px 100px 20px; max-width:800px; margin:0 auto; margin-top:20px;">
            <div style="text-align:center; margin-bottom:40px;">
                <h2 style="color:#138808; font-size:2rem; font-weight:900; margin-bottom:15px;">About & Contact</h2>
                <p style="color:#666; font-style:italic;">Get in touch with us through the following channels:</p>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px; margin-bottom:40px;">
                <div style="background:white; padding:30px; border-radius:15px; text-align:center; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                    <div style="width:60px; height:60px; background:#e8f5e9; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#138808; font-size:1.5rem;">
                        <i class="fas fa-phone-alt"></i>
                    </div>
                    <h3 style="margin-bottom:10px;">Call Us</h3>
                    <p style="color:#666; margin-bottom:5px;">Available 24/7</p>
                    <a href="tel:${State.settings.contactInfo.phone}" style="color:#138808; font-weight:700; text-decoration:none; font-size:1.2rem;">${State.settings.contactInfo.phone}</a>
                </div>

                <div style="background:white; padding:30px; border-radius:15px; text-align:center; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                    <div style="width:60px; height:60px; background:#e3f2fd; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#1976D2; font-size:1.5rem;">
                        <i class="fas fa-envelope"></i>
                    </div>
                    <h3 style="margin-bottom:10px;">Email Us</h3>
                    <p style="color:#666; margin-bottom:5px;">For Support & Inquiries</p>
                    <a href="mailto:${State.settings.contactInfo.email}" style="color:#1976D2; font-weight:700; text-decoration:none; font-size:1.1rem;">${State.settings.contactInfo.email}</a>
                </div>
            </div>

            <div style="text-align:center; margin-bottom:40px;">
                <h3 style="margin-bottom:20px; color:#1a2a3a; font-size:1.2rem;">Connect with us on Social Media</h3>
                <div style="display:flex; justify-content:center; gap:20px; flex-wrap:wrap;">
                    ${(() => {
            const s = State.settings.socialLinks || {};
            let html = '';
            if (s.insta) html += `<a href="${s.insta}" target="_blank" style="width:50px; height:50px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.1); color:#E1306C; font-size:1.5rem; text-decoration:none; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-instagram"></i></a>`;
            if (s.youtube) html += `<a href="${s.youtube}" target="_blank" style="width:50px; height:50px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.1); color:#FF0000; font-size:1.5rem; text-decoration:none; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-youtube"></i></a>`;
            if (s.facebook) html += `<a href="${s.facebook}" target="_blank" style="width:50px; height:50px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.1); color:#1877F2; font-size:1.5rem; text-decoration:none; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fab fa-facebook"></i></a>`;
            if (s.twitter) html += `<a href="${s.twitter}" target="_blank" style="width:50px; height:50px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 5px 15px rgba(0,0,0,0.1); color:#000; font-size:1.5rem; text-decoration:none; transition:transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'"><i class="fa-brands fa-x-twitter"></i></a>`;

            if (!html) return '<div style="color:#999; font-style:italic;">Links coming soon...</div>';
            return html;
        })()}
                </div>
            </div>

            <div style="background:#f9f9f9; padding:25px; border-radius:15px; text-align:left; margin-bottom:40px; border:1px solid #eee;">
                <h3 style="color:#1a2a3a; margin-bottom:15px; border-bottom:2px solid #FF9933; display:inline-block; padding-bottom:5px;">About Us</h3>
                <p style="color:#555; font-size:1rem; line-height:1.8; white-space:pre-line;">${State.settings.aboutText || 'Welcome to BhumiDekho!\n\nWe are India\'s most trusted real estate platform, dedicated to helping you find your dream home, plot, or commercial property with ease and transparency.\n\nOur mission is to simplify the property buying and selling process for everyone.'}</p>
            </div>

            <div style="margin-bottom:40px;">
                <h3 style="color:#1a2a3a; border-left:5px solid #FF9933; padding-left:15px; margin-bottom:25px;">Our Founders</h3>
                <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(250px, 1fr)); gap:25px;">
                    ${State.settings.contactInfo.founders.map(f => `
                        <div style="background:white; border-radius:15px; overflow:hidden; box-shadow:0 5px 15px rgba(0,0,0,0.1);">
                            <div style="height:200px; background:#ddd;">
                                <img src="${f.image || 'https://via.placeholder.com/200'}" style="width:100%; height:100%; object-fit:cover;">
                            </div>
                            <div style="padding:20px; text-align:center;">
                                <h4 style="margin:0; font-size:1.2rem;">${f.name}</h4>
                                <p style="color:#138808; font-size:0.9rem; font-weight:600; margin-top:5px;">${f.title}</p>
                                <p style="color:#666; font-size:0.85rem; margin-top:10px;">${f.bio}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

             <div style="text-align:center; color:#999; font-size:0.85rem; margin-top:50px;">
                &copy; 2026 BhumiDekho. All rights reserved.
            </div>
        </div>
    `;
}

function renderProfile(container) {
    if (!State.user) return navigate('login');
    const isCustomer = State.user.role === 'customer';
    const isAgent = State.user.role === 'agent';

    // Find detailed user object to get current data
    let userDetails = State.user;
    if (isCustomer) {
        const found = State.customers.find(c => c.id === State.user.id);
        if (found) userDetails = found;
    } else if (isAgent) {
        const found = State.agents.find(a => a.id === State.user.id);
        if (found) userDetails = found;
    }

    container.innerHTML = `
        <div style="padding:20px; max-width:600px; margin:0 auto; margin-top:80px;">
            <div style="background:white; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.1); overflow:hidden;">
                <div style="background:linear-gradient(135deg, #138808, #28a745); padding:30px; text-align:center; color:white; position:relative;">
                    <div style="position:relative; width:140px; height:140px; margin:0 auto 15px;">
                        ${userDetails.photo ?
            `<img src="${userDetails.photo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; border:5px solid white; box-shadow:0 5px 15px rgba(0,0,0,0.2);">` :
            `<div style="width:100%; height:100%; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#138808; font-size:3.5rem; font-weight:800; border:5px solid white; box-shadow:0 5px 15px rgba(0,0,0,0.2);">${userDetails.name.charAt(0)}</div>`
        }
                        
                        ${(isCustomer || isAgent) ? `
                            <label for="profile-upload" style="position:absolute; bottom:5px; right:5px; background:#FF9933; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.3); border:3px solid white;">
                                <i class="fas fa-camera" style="font-size:1.1rem;"></i>
                            </label>
                            <input type="file" id="profile-upload" accept="image/*" style="display:none;" onchange="handleProfilePhotoUpload(this)">
                        ` : ''}
                    </div>
                    
                    <div style="display:flex; justify-content:center; align-items:center; gap:10px;">
                        <h2 style="margin:0;">${userDetails.name}</h2>
                        ${(isCustomer || isAgent) ? `<i class="fas fa-pen" onclick="editProfileName()" style="font-size:0.9rem; cursor:pointer; opacity:0.8;"></i>` : ''}
                    </div>
                    <p style="opacity:0.9; margin-top:5px;">${State.user.role.toUpperCase()}</p>
                </div>
                <div style="padding:20px;">
                    <div style="margin-bottom:20px;">
                        <label style="display:block; color:#666; font-size:0.85rem; margin-bottom:5px;">Mobile Number</label>
                        <div style="font-size:1.1rem; font-weight:600; color:#333;">${userDetails.phone || 'N/A'}</div>
                    </div>
                     <div style="margin-bottom:20px;">
                        <label style="display:block; color:#666; font-size:0.85rem; margin-bottom:5px;">User ID</label>
                        <div style="font-size:1.1rem; font-weight:600; color:#333;">${userDetails.id}</div>
                    </div>

                    ${(isCustomer || isAgent) ? `
                        <div style="background:linear-gradient(135deg, #FF9933, #FFB366); padding:20px; border-radius:15px; margin-bottom:20px; cursor:${isCustomer ? 'pointer' : 'default'}; transition:transform 0.2s;" onclick="${isCustomer ? 'openCustomerWalletModal()' : ''}" onmouseover="${isCustomer ? 'this.style.transform=\'scale(1.02)\'' : ''}" onmouseout="${isCustomer ? 'this.style.transform=\'scale(1)\'' : ''}">
                            <div style="display:flex; justify-content:space-between; align-items:center; color:white;">
                                <div>
                                    <div style="font-size:0.85rem; opacity:0.9; margin-bottom:5px;">Wallet Balance</div>
                                    <div style="font-size:1.8rem; font-weight:800;">Rs. ${(userDetails.wallet || 0).toLocaleString()}</div>
                                </div>
                                <i class="fas fa-wallet" style="font-size:2.5rem; opacity:0.3;"></i>
                            </div>
                            <div style="margin-top:15px; font-size:1rem; opacity:1; font-weight:800; text-decoration:underline;">
                                <i class="fas fa-hand-pointer"></i> CLICK TO MANAGE WALLET
                            </div>
                        </div>
                        
                        ${(() => {
                const kyc = userDetails.kyc || { status: 'none' };
                const isEditing = State.kycEditMode;

                if (kyc.status === 'pending' && !isEditing) {
                    return `
                                    <div style="background:#fff3e0; padding:20px; border-radius:15px; margin-bottom:20px; border:1px solid #ffe0b2;">
                                        <div style="color:#e65100; font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:10px;">
                                            <i class="fas fa-clock"></i> KYC Pending
                                        </div>
                                        <p style="font-size:0.85rem; color:#666; margin-bottom:10px;">Your details are under review. Please wait 24-48 hours.</p>
                                        <div style="font-size:0.9rem; color:#333; margin-bottom:10px;">
                                            <strong>Bank:</strong> ${kyc.ifsc} <span style="margin:0 5px;">|</span> <strong>Acc:</strong> ${kyc.accountNumber}
                                        </div>
                                        <button onclick="enableKYCEdit()" style="background:none; border:1px solid #e65100; color:#e65100; padding:6px 15px; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem;">Edit Details</button>
                                    </div>
                                `;
                } else if (kyc.status === 'approved' && !isEditing) {
                    return `
                                    <div style="background:#e8f5e9; padding:20px; border-radius:15px; margin-bottom:20px; border:1px solid #c8e6c9;">
                                        <div style="color:#2e7d32; font-weight:700; display:flex; align-items:center; gap:10px; margin-bottom:15px;">
                                            <i class="fas fa-check-circle"></i> KYC Verified
                                        </div>
                                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:0.9rem; color:#333;">
                                            <div><span style="color:#666; font-size:0.75rem;">Name</span><br><strong>${kyc.accountName}</strong></div>
                                            <div><span style="color:#666; font-size:0.75rem;">Account No</span><br><strong>${kyc.accountNumber}</strong></div>
                                            <div><span style="color:#666; font-size:0.75rem;">IFSC</span><br><strong>${kyc.ifsc}</strong></div>
                                        </div>
                                        <div style="margin-top:15px;">
                                            <span style="color:#666; font-size:0.75rem;">Document</span><br>
                                            <img src="${kyc.doc}" style="height:60px; border-radius:8px; border:1px solid #ddd; margin-top:5px;">
                                        </div>
                                        <button onclick="enableKYCEdit()" style="margin-top:15px; background:none; border:1px solid #2e7d32; color:#2e7d32; padding:6px 15px; border-radius:20px; font-weight:700; cursor:pointer; font-size:0.8rem;">Update Details</button>
                                    </div>
                                `;
                } else {
                    return `
                                    <div style="background:#f8f9fa; padding:20px; border-radius:15px; margin-bottom:20px; border:1px solid #eee;">
                                        <h3 style="margin-bottom:15px; color:#1a2a3a; font-size:1.1rem; display:flex; align-items:center; gap:8px;">
                                            <i class="fas fa-university"></i> Bank Details (KYC)
                                        </h3>
                                        ${kyc.status === 'rejected' ? `<div style="color:#D32F2F; background:#ffebee; padding:10px; border-radius:8px; margin-bottom:15px; font-size:0.85rem;"><i class="fas fa-exclamation-circle"></i> <strong>Rejected:</strong> ${kyc.rejectReason || 'Details incorrect'}</div>` : ''}
                                        
                                        <div class="form-group"><label>Account Holder Name</label><input id="kyc-name" class="login-input" value="${kyc.accountName || ''}"></div>
                                        <div class="form-group"><label>Account Number</label><input id="kyc-no" class="login-input" value="${kyc.accountNumber || ''}"></div>
                                        <div class="form-group"><label>IFSC Code</label><input id="kyc-ifsc" class="login-input" value="${kyc.ifsc || ''}"></div>
                                        <div class="form-group">
                                            <label>Upload Passbook / Cheque ${isAgent ? '& ID Proof' : ''}</label>
                                            <input type="file" accept="image/*" onchange="handleKYCUpload(this)" style="padding:10px; background:white; border:1px solid #eee; width:100%; border-radius:10px;">
                                            <img id="kyc-preview" src="${kyc.doc || ''}" style="width:100%; height:150px; object-fit:contain; margin-top:10px; border-radius:10px; display:${kyc.doc ? 'block' : 'none'}; border:1px solid #ddd; background:#eee;">
                                        </div>
                                        <button class="login-btn" onclick="submitKYC()" style="background:#1a2a3a;">Submit Verification</button>
                                        ${isEditing ? `<button class="prop-btn" style="background:none; color:#666; width:100%; margin-top:10px;" onclick="cancelKYCEdit()">Cancel</button>` : ''}
                                    </div>
                                `;
                }
            })()}
                    ` : ''}

                    <div style="border-top:1px solid #eee; margin:20px 0;"></div>

                    <button class="login-btn" onclick="window.location.href='tel:${State.settings.contactInfo.phone}'" style="background:#007bff; margin-bottom:15px;">
                        <i class="fas fa-phone-alt"></i> Contact Support
                    </button>
                    <button class="login-btn" onclick="logout()" style="background:#D32F2F;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.handleKYCUpload = (input) => {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            State.tempKYCImage = e.target.result;
            document.getElementById('kyc-preview').src = e.target.result;
            document.getElementById('kyc-preview').style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
};

window.submitKYC = async () => {
    try {
        const accName = document.getElementById('kyc-name').value;
        const accNo = document.getElementById('kyc-no').value;
        const ifsc = document.getElementById('kyc-ifsc').value;
        const doc = State.tempKYCImage || (State.user.kyc ? State.user.kyc.doc : '');

        if (!accName || !accNo || !ifsc || !doc) return alert("Please fill all details and upload document.");

        showGlobalLoader("Updating KYC..."); // Updating KYC...

        const role = State.user.role;
        const collection = role === 'agent' ? State.agents : State.customers;
        const u = collection.find(x => x.id === State.user.id);

        if (u) {
            u.kyc = {
                status: 'pending',
                accountName: accName,
                accountNumber: accNo,
                ifsc: ifsc,
                doc: doc,
                submittedAt: new Date().toLocaleString()
            };
            if (State.user.id === u.id) State.user.kyc = u.kyc;
            State.kycEditMode = false;
            State.tempKYCImage = null;

            await saveGlobalData();
            hideGlobalLoader("केवाईसी अपडेट सफल!");
            render();
            setTimeout(() => {
                alert("KYC Submitted! Please wait for approval.");
            }, 200);
        }
    } catch (err) {
        console.error("KYC Submit Error:", err);
        hideGlobalLoader(null);
        alert("Error submitting KYC. Please try again.");
    }
};

window.enableKYCEdit = () => { State.kycEditMode = true; render(); };
window.cancelKYCEdit = () => { State.kycEditMode = false; render(); };


window.startCustomerListing = function () {
    if (!State.user) {
        alert("Please login first!");
        navigate('login');
        return;
    }

    // Find current wallet balance logic
    let balance = 0;
    if (State.user.role === 'customer') {
        const cust = State.customers.find(c => c.id === State.user.id);
        balance = cust ? (cust.wallet || 0) : 0;
    } else {
        // Agent or other
        const ag = State.agents.find(a => a.id === State.user.id);
        balance = ag ? (ag.wallet || 0) : 0;
    }

    const required = 99;
    if (balance < required) {
        alert(`Insufficient Balance! You need ₹${required}. Your balance: ₹${balance}. Please add money to wallet.`);
        return;
    }

    if (confirm(`Listing costs ₹${required}. Proceed to add property details?`)) {
        window.location.href = 'add_prop.php';
    }
};

window.openContactAdminModal = function () {
    alert("Please contact our support team at: " + (State.settings.contactInfo.phone || "9876543210"));
    // Or implement a callback request modal here if needed
};

window.handleProfilePhotoUpload = async (input) => {
    if (input.files && input.files[0]) {
        try {
            showGlobalLoader("Uploading Photo...");
            const base64 = await toBase64(input.files[0]);

            // Update State
            if (State.user.role === 'customer') {
                const c = State.customers.find(x => x.id === State.user.id);
                if (c) {
                    c.photo = base64;
                    State.user.photo = base64;
                    await saveGlobalData();
                    render();
                }
            } else if (State.user.role === 'agent') {
                const a = State.agents.find(x => x.id === State.user.id);
                if (a) {
                    a.photo = base64;
                    State.user.photo = base64;
                    await saveGlobalData();
                    render();
                }
            }
            hideGlobalLoader("Profile Photo Updated!");
        } catch (e) {
            console.error(e);
            hideGlobalLoader(null);
            alert("Failed to upload photo.");
        }
    }
};

window.editProfileName = async () => {
    const currentName = State.user.name;
    const newName = prompt("Enter your new name:", currentName);

    if (newName && newName.trim() !== "" && newName !== currentName) {
        showGlobalLoader("Updating Name...");
        // Update State
        if (State.user.role === 'customer') {
            const c = State.customers.find(x => x.id === State.user.id);
            if (c) {
                c.name = newName.trim();
                State.user.name = newName.trim();
                await saveGlobalData();
                render();
            }
        } else if (State.user.role === 'agent') {
            const a = State.agents.find(x => x.id === State.user.id);
            if (a) {
                a.name = newName.trim();
                State.user.name = newName.trim();
                await saveGlobalData();
                render();
            }
        }
        hideGlobalLoader("Name Updated!");
    }
};



// --- Shared Components ---
function renderPropertyCard(p, isLikeView = false) {
    const isLiked = State.likes.includes(p.id);
    return `
        <div class="prop-card" onclick="navigate('details', ${p.id})">
            <div class="prop-img-box">
                <img src="${p.image}" alt="" loading="lazy">
                <div class="prop-like-btn" onclick="toggleLike(event, ${p.id})" title="Like this property">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart" style="color:${isLiked ? '#FF5252' : 'white'}"></i>
                </div>
                <div class="prop-id" style="font-size: 0.7rem; color: #138808; font-weight: 800; margin-bottom: 2px;">
                    <i class="fas fa-fingerprint"></i> ID: BD-${p.id}
                </div>
            </div>
            <div class="prop-body">
                <div class="prop-price">
                    Rs. ${p.priceSqft || p.price} / ${p.category === 'Rented Room' ? 'Month' : (p.priceUnit || 'Sq.ft')}
                </div>
                <div class="prop-sub">
                    ${p.category === 'Rented Room' ? 'Rent' : 'Price'}: Rs. ${p.price} | Area: ${p.area} ${p.areaUnit || ''}
                </div>
                <h4 class="prop-title">${p.title}</h4>
                <div class="prop-location">
                    <i class="fas fa-map-marker-alt" style="font-size: 0.75rem;"></i> ${p.city.toUpperCase()}
                </div>
                ${State.settings.showDate ? `
                    <div class="prop-date">
                        <i class="fas fa-clock"></i> ${p.createdAt || 'N/A'}
                    </div>
                ` : ''}
                <button class="prop-btn">${p.isOffline ? 'Sample View' : 'View Property'}</button>
                ${isLikeView ? `
                    <button class="prop-btn enquiry-btn" onclick="event.stopPropagation(); directWhatsAppEnquiry(${p.id})">
                        <i class="fas fa-paper-plane"></i> Enquiry (पूछताछ करें)
                    </button>
                ` : ''}
            </div>
            ${p.isOffline ? `<div class="offline-badge">OFFLINE SAMPLE</div>` : ''}
        </div>
    `;
}

// --- Views Implementation ---

function renderHome(container) {
    let props = State.properties.filter(p => p.status === 'approved');
    props.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        // Sort by timestamp if available, fallback to ID
        const timeA = a.createdTimestamp || a.id;
        const timeB = b.createdTimestamp || b.id;
        return timeB - timeA;
    });

    const banners = (State.settings.appDetails && State.settings.appDetails.banners && State.settings.appDetails.banners.length > 0) ?
        State.settings.appDetails.banners.map(url => ({ img: url, title: "Property" })) :
        [
            { img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200", title: "Dream Home Awaits" },
            { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200", title: "Luxury Villas" },
            { img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200", title: "Prime Plots" }
        ];

    // Categories - Load from State.settings or use defaults
    const categories = State.settings.propertyTypes || ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House'];
    const activeCat = State.homeCategory || 'All';
    const searchQuery = (State.homeSearch || '').toLowerCase();
    const searchState = State.searchState || '';
    const searchDistrict = State.searchDistrict || '';
    const searchType = State.searchType || '';

    const filteredProps = props.filter(p => {
        // Filter by Category (Top Nav)
        if (activeCat !== 'All' && p.category !== activeCat) return false;

        // Filter by Search Text (Title or City)
        if (searchQuery && !p.title.toLowerCase().includes(searchQuery) && !p.city.toLowerCase().includes(searchQuery)) return false;

        // Filter by State
        if (searchState && p.state !== searchState) return false;

        // Filter by District
        if (searchDistrict && p.district !== searchDistrict) return false;

        // Filter by Property Type (Search Modal)
        if (searchType && searchType !== 'All' && p.category !== searchType) return false;

        return true;
    });

    // Custom sort to prioritize active category, then featured, then display order, then time
    filteredProps.sort((a, b) => {
        // 1. Category Priority
        if (activeCat !== 'All') {
            const isMatch = (item) =>
                item.category === activeCat ||
                (activeCat === 'Villa' && item.title.toLowerCase().includes('villa')) ||
                (activeCat === 'Rented Room' && (item.description?.toLowerCase().includes('rent') || item.title.toLowerCase().includes('rent'))) ||
                (activeCat === 'Agricultural Land' && (item.title.toLowerCase().includes('agri') || item.description?.toLowerCase().includes('agri') || item.title.toLowerCase().includes('farm'))) ||
                (activeCat === 'Farm House' && item.title.toLowerCase().includes('farm'));

            const matchA = isMatch(a);
            const matchB = isMatch(b);
            if (matchA && !matchB) return -1;
            if (!matchA && matchB) return 1;
        }

        // 2. Featured Priority
        if (a.featured !== b.featured) return b.featured ? 1 : -1;

        // 3. Display Order Priority
        const orderA = a.displayOrder !== undefined ? a.displayOrder : 9999;
        const orderB = b.displayOrder !== undefined ? b.displayOrder : 9999;
        if (orderA !== orderB) return orderA - orderB;

        // 4. Time/ID Fallback
        const timeA = a.createdTimestamp || a.id;
        const timeB = b.createdTimestamp || b.id;
        return timeB - timeA;
    });

    const initialLoadCount = 8;
    const initialProps = filteredProps.slice(0, initialLoadCount);
    const hasMore = filteredProps.length > initialLoadCount;

    container.innerHTML = `
        <div class="hero-slider" id="hero-slider">
            <div class="slider-track" id="slider-track">
                ${banners.map(b => `
                    <div class="slide">
                        <img src="${b.img}" alt="" loading="lazy">
                        <div class="slide-content">
                            <h2 style="font-size:1.5rem; color:white;">${b.title}</h2>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="slider-dots" id="slider-dots">
                ${banners.map((_, i) => `<div class="dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('')}
            </div>
        </div>

        <!-- SPONSORED AD BANNER -->
        <div style="padding: 15px 15px 5px 15px;">
            <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); position: relative; cursor: pointer; border: 1px solid #eee;" onclick="window.openMessenger ? window.openMessenger() : alert('Contact Admin for Advertising')">
                <span style="position: absolute; top: 5px; right: 5px; background: rgba(0,0,0,0.6); color: white; font-size: 0.6rem; padding: 2px 6px; border-radius: 4px; font-weight: 700;">SPONSORED</span>
                <img src="https://via.placeholder.com/600x150/FFF3E0/FF9933?text=ADVERTISE+HERE+%7C+GROW+YOUR+BUSINESS" alt="Advertisement" style="width: 100%; height: auto; display: block;">
            </div>
        </div>

        <!-- FEATURED PROPERTIES (Horizontal Scroll) -->
        ${(() => {
            const featured = props.filter(p => p.featured);
            if (featured.length === 0) return '';
            return `
                <div style="padding: 15px 0 5px 20px;">
                    <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: #1a2a3a; display: flex; align-items: center; gap: 8px;">
                        <i class="fas fa-fire" style="color: #FF5722;"></i> Featured Properties
                    </h3>
                    <div style="display: flex; gap: 15px; overflow-x: auto; padding-right: 20px; padding-bottom: 10px; scrollbar-width: none; -ms-overflow-style: none;">
                        <style>.featured-scroll::-webkit-scrollbar { display: none; }</style>
                        ${featured.map(p => `
                            <div style="min-width: 200px; width: 200px; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 5px 15px rgba(0,0,0,0.08); scroll-snap-align: start;" onclick="navigate('details', ${p.id})">
                                <div style="height: 120px; position: relative;">
                                    <img src="${p.image}" style="width: 100%; height: 100%; object-fit: cover;">
                                    <span style="position: absolute; top: 8px; left: 8px; background: #FF9933; color: white; font-size: 0.65rem; font-weight: 700; padding: 3px 8px; border-radius: 4px;">FEATURED</span>
                                </div>
                                <div style="padding: 10px;">
                                    <h4 style="margin: 0 0 5px 0; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color:#333;">${p.title}</h4>
                                    <div style="color: #138808; font-weight: 700; font-size: 0.95rem;">Rs. ${p.price}</div>
                                    <div style="font-size: 0.75rem; color: #666;"><i class="fas fa-map-marker-alt"></i> ${p.city}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
             `;
        })()}

        <!-- Categories Scroll (Moved above search) -->
        <div id="cat-scroll" style="padding: 0 0 5px 20px; margin-top: 5px; position: relative; z-index: 10; display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none;">
            <style>#cat-scroll::-webkit-scrollbar { display: none; }</style>
            ${(() => {
            const icons = {
                'All': 'fa-th-large',
                'Plot': 'fa-map-marked',
                'Rented Room': 'fa-bed',
                'Agricultural Land': 'fa-seedling',
                'Residential': 'fa-home',
                'Commercial': 'fa-building',
                'Villa': 'fa-hotel',
                'Farm House': 'fa-tractor'
            };
            return categories.map(cat => `
                    <button id="category-btn-${cat.replace(/\s+/g, '-')}" onclick="setHomeCategory('${cat}', this)" class="cat-btn ${activeCat === cat ? 'active' : ''}">
                        <i class="fas ${icons[cat] || 'fa-tag'}"></i> ${cat}
                    </button>
                `).join('');
        })()}
        </div>

        <!-- Search Box & Messenger Container -->
        <div style="padding: 0 12px; margin-bottom: 20px; position: relative; z-index: 10; display: flex; gap: 8px; align-items: center;">
            <div style="background: #ffffff; border-radius: 50px; padding: 5px 8px; box-shadow: 0 10px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 5px; height: 50px; flex: 1; min-width: 0;">
                ${(() => {
            const hasFilters = State.searchState || State.searchDistrict || State.homeSearch || State.searchType;
            if (hasFilters) {
                const filterParts = [];
                if (State.searchState) filterParts.push(State.searchState);
                if (State.searchDistrict) filterParts.push(State.searchDistrict);
                if (State.homeSearch) filterParts.push(State.homeSearch);
                if (State.searchType && State.searchType !== 'All') filterParts.push(State.searchType);

                return `
                            <div onclick="clearAllFilters()" style="flex: 1; display: flex; align-items: center; gap: 8px; padding: 5px 10px; background: #fff3e0; border-radius: 25px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#ffe0b2'" onmouseout="this.style.background='#fff3e0'">
                                <i class="fas fa-filter" style="color: #FF9933; font-size: 0.85rem;"></i>
                                <span style="font-size: 0.8rem; color: #333; font-weight: 600; flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${filterParts.join(' > ')}</span>
                                <i class="fas fa-times-circle" style="color: #FF9933; font-size: 0.9rem;"></i>
                            </div>
                        `;
            } else {
                return `
                            <input type="text" placeholder="City, Property..." 
                                value=""
                                oninput="updateHomeSearch(this.value)"
                                style="border: none; outline: none; flex: 1; font-size: 0.85rem; padding-left: 10px; background: transparent; min-width: 0;">
                        `;
            }
        })()}
                
                <span style="font-size: 1.1rem; opacity: 0.4; margin-right: -2px; animation: finger-point 1.5s infinite ease-in-out; pointer-events: none; flex-shrink: 0;">👉</span>

                <div onclick="openSearchModal()" style="width: 36px; height: 36px; background: #FF9933; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(255, 153, 51, 0.3);">
                    <i class="fas fa-sliders-h" style="color: white; font-size: 0.85rem;"></i>
                </div>
            </div>

            <!-- Message Button - Optimized for Mobile -->
            <div id="home-chat-btn" onclick="openMessenger()" style="position: relative; height: 50px; padding: 0 15px; background: #138808; border-radius: 50px; display: flex; align-items: center; gap: 6px; cursor: pointer; flex-shrink: 0; box-shadow: 0 10px 20px rgba(19, 136, 8, 0.25); border: 2.5px solid white;">
                <div id="chat-notification-dot" style="display: none; position: absolute; top: 50%; left: -10px; transform: translateY(-50%); width: 20px; height: 20px; background: #00ff00; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,255,0,0.4); animation: pulse-green 1.5s infinite;"></div>
                <i class="fab fa-facebook-messenger" style="color: white; font-size: 1.1rem;"></i>
                <span style="color: white; font-weight: 800; font-size: 0.75rem;">CHAT</span>
            </div>

            <!-- About Us Button (Updated Compact) -->
            <div onclick="navigate('contact')" style="height: 50px; padding: 0 16px; background: linear-gradient(135deg, #f0f0f0, #ffffff); border-radius: 50px; display: flex; align-items: center; gap: 6px; cursor: pointer; flex-shrink: 0; box-shadow: 0 5px 15px rgba(0,0,0,0.08); border: 1px solid #e0e0e0;">
                <i class="fas fa-info-circle" style="color: #FF9933; font-size: 1.1rem;"></i>
                <span style="color: #333; font-weight: 800; font-size: 0.7rem; text-transform:uppercase;">About</span>
            </div>
        </div>

        ${(State.isLoading && !State.isCriticalTimeout && (!State.properties.length || (State.properties.length > 0 && State.properties[0].isOffline))) ? `<div class="loading-scroll-wrapper">` : ''}
        <div class="property-grid ${(State.isLoading && !State.isCriticalTimeout && (!State.properties.length || (State.properties.length > 0 && State.properties[0].isOffline))) ? 'loading-processing' : ''}" id="home-prop-grid" style="position: relative;">
            ${(State.isCriticalTimeout && !State.isDataLoaded) ? `
                <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; background: #fff3e0; border-radius: 18px; border: 2px dashed #FF9933; margin: 10px 0; position: sticky; top: 20px;">
                    <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 10px 20px rgba(255, 153, 51, 0.2);">
                        <i class="fas fa-signal" style="font-size: 2.2rem; color: #FF9933; position: relative;">
                            <div style="position: absolute; width: 100%; height: 3px; background: #FF9933; transform: rotate(-45deg); top: 50%; left: 0;"></div>
                        </i>
                    </div>
                    <h2 style="color: #1a2a3a; margin-bottom: 8px; font-size: 1.5rem;">${(State.settings.ux && State.settings.ux.slowConnHeading) || 'Connection slow hai!'}</h2>
                    <p style="color: #666; font-weight: 600; font-size: 1rem; margin-bottom: 25px;">${(State.settings.ux && State.settings.ux.slowConnSubtext) || 'Please Check Your Internet Connection'}</p>
                    <button onclick="retryLoading()" style="padding: 12px 35px; background: #1a2a3a; color: white; border: none; border-radius: 50px; cursor: pointer; font-weight: 800; box-shadow: 0 5px 15px rgba(0,0,0,0.2); text-transform: uppercase; letter-spacing: 0.5px;">Retry Now</button>
                    <div style="margin-top: 15px; font-size: 0.8rem; color: #999;">Searching for data in background...</div>
                </div>
            ` : (
            (State.isLoading && !State.isCriticalTimeout)
                ? (() => {
                    const filledCard = `
                        <div class="prop-card" style="opacity: 0.8; pointer-events: none;">
                            <div class="prop-img-box">
                                <img src="https://picsum.photos/400/250?random=${Math.random()}" alt="Loading..." style="width:100%; height:160px; object-fit:cover;">
                                <div class="prop-badge">Premium</div>
                            </div>
                            <div class="prop-body">
                                <div class="prop-price">Rs. ${(Math.floor(Math.random() * 90) + 10)},00,000</div>
                                <div class="prop-title">Premium Luxury Property</div>
                                <div class="prop-location" style="font-size: 0.8rem; color:#666;"><i class="fas fa-map-marker-alt"></i> New Delhi, India</div>
                                <div class="prop-tags">
                                    <span><i class="fas fa-bed"></i> 3 BHK</span>
                                    <span><i class="fas fa-expand-arrows-alt"></i> 1500 sqft</span>
                                </div>
                            </div>
                        </div>`;
                    const set = filledCard.repeat(8);
                    return set + set; // Duplicate for infinite scroll
                })()
                : (initialProps.length > 0
                    ? initialProps.map(p => renderPropertyCard(p)).join('')
                    : '<div style="grid-column:1/-1; text-align:center; padding:50px; color:#999;">No properties found in this category.</div>'
                )
        )}
        </div>

        ${((!State.properties.length || (State.properties.length > 0 && State.properties[0].isOffline)) && State.isLoading && !State.isCriticalTimeout) ? `
                <div class="smart-loader-overlay">
                    <div style="position: relative; width: 210px; height: 210px; display: flex; align-items: center; justify-content: center;">
                        <div class="${(State.settings.ux && State.settings.ux.loadingIcon) || 'loader-circle'}"></div>
                        <div class="loader-text-inner">${(State.settings.ux && State.settings.ux.loadingText) || State.loadingMessage}</div>
                    </div>
                </div>
            </div>` : ''}
        
        ${hasMore && !State.isLoading ? `
            <div style="text-align:center; padding-bottom:30px; padding-top:10px;">
                <button id="load-more-btn" class="login-btn" style="width:auto; padding:10px 30px; background:#1a2a3a;" onclick="loadMoreProperties()">Load More</button>
            </div>
        ` : ''}
    `;

    // Store remaining props in a temporary global for pagination
    window.remainingHomeProps = filteredProps.slice(initialLoadCount);

    startSlider();
}

window.loadMoreProperties = () => {
    if (!window.remainingHomeProps || window.remainingHomeProps.length === 0) return;

    const chunk = window.remainingHomeProps.slice(0, 8);
    window.remainingHomeProps = window.remainingHomeProps.slice(8);

    const grid = document.getElementById('home-prop-grid');
    if (grid) {
        // Create a temporary container to convert string to nodes
        const temp = document.createElement('div');
        temp.innerHTML = chunk.map(p => renderPropertyCard(p)).join('');
        while (temp.firstChild) {
            grid.appendChild(temp.firstChild);
        }
    }

    if (window.remainingHomeProps.length === 0) {
        const btn = document.getElementById('load-more-btn');
        if (btn) btn.style.display = 'none';
    }
};

let sliderInterval;
let currentSlide = 0;
function startSlider() {
    if (sliderInterval) clearInterval(sliderInterval);
    sliderInterval = setInterval(() => {
        currentSlide = (currentSlide + 1) % 3;
        updateSlider();
    }, 4000);
}
function updateSlider() {
    const track = document.getElementById('slider-track');
    const dots = document.querySelectorAll('.dot');
    if (!track) return;
    track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === currentSlide));
}
window.goToSlide = (idx) => { currentSlide = idx; updateSlider(); startSlider(); };



function renderLikes(container) {
    const likedProps = State.properties.filter(p => State.likes.includes(p.id) && p.status === 'approved');
    container.innerHTML = `
        <div class="likes-page">
            <div style="background: linear-gradient(to right, #FF9933, #FFFFFF, #138808); padding: 15px; border-radius: 15px; margin-bottom: 25px; text-align: center; border: 2px solid rgba(0,0,0,0.05);">
                <h2 style="margin:0; color:#1a2a3a; font-size:1.4rem; font-weight:900;"><i class="fas fa-heart" style="color:#D32F2F;"></i> पसंदीदा प्रॉपर्टीज</h2>
            </div>
            ${likedProps.length === 0 ? `<div style="text-align:center; padding:50px; color:#999;">कोई पसंदीदा प्रॉपर्टी नहीं मिली</div>` : `<div class="property-grid">${likedProps.map(p => renderPropertyCard(p, true)).join('')}</div>`}
        </div>
    `;
}

function renderLogin(container) {
    const activeRole = State.loginRole || 'customer';

    container.innerHTML = `
        <div class="login-wrap">
            <div class="login-box">
                <div class="role-tab-switcher" style="margin-bottom:20px;">
                    <button class="role-tab ${activeRole === 'customer' ? 'active' : ''}" onclick="setLoginRole('customer')">Customer Login</button>
                    <button class="role-tab ${activeRole !== 'customer' ? 'active' : ''}" onclick="setLoginRole('agent')">Partner Login</button>
                </div>
                
                ${activeRole !== 'customer' ? `
                <div style="margin-bottom:25px; position:relative; text-align:left; animation: fadeIn 0.3s ease;">
                    <label style="display:block; margin-bottom:8px; color:#666; font-size:0.85rem; font-weight:600;">Select Partner Role</label>
                    <div style="position:relative;">
                        <i class="fas fa-user-shield" style="position:absolute; left:15px; top:50%; transform:translateY(-50%); color:#138808; z-index:1;"></i>
                        <select id="partner-role-select" onchange="setLoginRole(this.value)" class="login-input" style="padding-left:45px; font-weight:600; cursor:pointer; width:100%; -webkit-appearance:none; appearance:none; background:#f9f9f9; border:1px solid #ddd;">
                            <option value="agent" ${activeRole === 'agent' ? 'selected' : ''}>Real Estate Agent</option>
                            ${activeRole === 'admin' ? '<option value="admin" selected>Administrator</option>' : ''}
                        </select>
                        <i class="fas fa-chevron-down" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); pointer-events:none; color:#138808; font-size:0.8rem;"></i>
                    </div>
                </div>
                ` : ''}
                <h2 class="login-title" ondblclick="revealAdminOption()">Welcome Back!</h2>
                <div class="input-group">
                    <i class="fas fa-user input-icon"></i>
                    <input type="text" id="login-id" placeholder="Email or Phone Number" class="login-input">
                </div>
                <div class="input-group">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" id="pass" placeholder="Password" class="login-input">
                </div>
                <button class="login-btn" onclick="handleLogin('${activeRole}')">LOGIN SECURELY</button>
                <div class="login-footer">
                    <a href="#" onclick="openForgotPasswordModal()" class="forgot-link">Forgot Password?</a>
                    ${activeRole !== 'admin' ? `<a href="#" onclick="navigateToSignup('${activeRole}')" class="signup-link">Create Account</a>` : ''}
                </div>
                <button class="prop-btn" style="background:none; color:#999; margin-top:15px; width:100%; border:1px solid #eee;" onclick="navigate('home')">Close</button>
            </div>
        </div>
    `;
}

window.navigateToSignup = (role) => {
    State.signupRole = role || 'customer';
    navigate('signup');
};

window.revealAdminOption = () => {
    // Only works if we are on the Partner Login tab
    if (State.loginRole === 'customer') {
        alert("Please switch to Partner Login tab first!");
        return;
    }
    setLoginRole('admin');
    alert("Admin Mode Activated");
};

window.setLoginRole = (r) => {
    State.loginRole = r;
    render();
};

function openForgotPasswordModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px; text-align:center;">
            <h3 style="margin-bottom:15px; color:#1a2a3a;">Forgot Password?</h3>
            <div style="background:#e8f5e9; padding:20px; border-radius:15px; margin-bottom:20px;">
                <p style="color:#666; margin-bottom:15px;">Please contact our helpline for password recovery.</p>
                <div style="margin-bottom:15px;">
                    <i class="fas fa-phone-alt" style="color:#138808; font-size:1.5rem; margin-bottom:5px;"></i>
                    <div style="font-weight:700; color:#1a2a3a; font-size:1.1rem;">${State.settings.contactInfo.helplinePhone || '+91 98765 43210'}</div>
                </div>
                <div>
                     <i class="fas fa-envelope" style="color:#138808; font-size:1.5rem; margin-bottom:5px;"></i>
                    <div style="font-weight:700; color:#1a2a3a;">${State.settings.contactInfo.helplineEmail || 'support@bhumidekho.com'}</div>
                </div>
            </div>
            <button class="login-btn" onclick="window.location.href='tel:+919876543210'" style="background:#138808; margin-bottom:10px;">
                Call Helpline
            </button>
            <button class="prop-btn" style="background:none; color:#999;" onclick="closeModal()">Close</button>
        </div>`;
}
// Removed sendOtp and resetPassword as requested

function handleLogin(role) {
    if (window.isRealTaskRunning) return;

    const loginIdInput = document.getElementById('login-id');
    const passInput = document.getElementById('pass');
    if (!loginIdInput || !passInput) return;

    const loginId = loginIdInput.value.trim();
    const pass = passInput.value.trim();

    if (!loginId || !pass) return alert("Please enter both ID and Password.");

    window.isRealTaskRunning = true;
    showGlobalLoader("लॉगिन हो रहा है..."); // Logging in...

    // Start processing immediately
    (async () => {
        try {
            if (role === 'admin') {
                if (loginId === 'admin@bhumidekho.com' && pass === (State.settings.adminPassword || 'admin123')) {
                    // Double Verification
                    hideGlobalLoader(null);
                    setTimeout(async () => {
                        const pin = prompt("🔐 Enter Security PIN for Admin Access:");
                        if (pin === "252325") {
                            showGlobalLoader("Verifying PIN...");
                            await new Promise(r => setTimeout(r, 800)); // Fake delay for security feel
                            State.user = { role: 'admin', name: 'Super Admin' };
                            await saveGlobalData();
                            hideGlobalLoader("लॉगिन सफल! (Admin Mode)");
                            navigate('admin');
                        } else {
                            alert("❌ INCORRECT PIN! Access Denied.");
                        }
                    }, 100);
                } else {
                    hideGlobalLoader(null);
                    setTimeout(() => alert("Wrong Credentials"), 200);
                }
            } else if (role === 'agent') {
                const agent = State.agents.find(a => (a.email === loginId || a.phone === loginId) && a.password === pass);
                if (agent) {
                    if (agent.status === 'blocked') {
                        hideGlobalLoader(null);
                        setTimeout(() => alert("आपका अकाउंट अभी अप्रूव नहीं हुआ है।"), 200);
                        return;
                    }
                    if (agent.status === 'approved') {
                        State.user = { role: 'agent', name: agent.name, id: agent.id, photo: agent.photo };
                        await saveGlobalData();
                        hideGlobalLoader("लॉगिन सफल!");
                        navigate('agent');
                    } else {
                        hideGlobalLoader(null);
                        setTimeout(() => alert("Approval pending. Please wait for Admin to approve your account."), 200);
                    }
                } else {
                    hideGlobalLoader(null);
                    setTimeout(() => alert("Wrong Credentials"), 200);
                }
            } else {
                // Customer Login
                const cust = State.customers.find(c => (c.phone === loginId || c.email === loginId) && c.password === pass);
                if (cust) {
                    if (cust.status === 'blocked') {
                        hideGlobalLoader(null);
                        setTimeout(() => alert("Your account has been blocked."), 200);
                        return;
                    }
                    State.user = { role: 'customer', name: cust.name, id: cust.id, phone: cust.phone, photo: cust.photo || null };
                    if (!cust.likes) cust.likes = [];
                    State.likes = cust.likes;
                    await saveGlobalData();
                    hideGlobalLoader("लॉगिन सफल!");
                    navigate('home');
                } else {
                    hideGlobalLoader(null);
                    setTimeout(() => {
                        if (confirm("Customer not found. Do you want to Register?")) {
                            navigate('signup');
                        }
                    }, 200);
                }
            }
        } catch (err) {
            console.error("Login Error:", err);
            hideGlobalLoader(null);
            setTimeout(() => alert("Login failed. Check your connection."), 200);
        } finally {
            window.isRealTaskRunning = false;
        }
    })();
}

function renderSignup(container) {
    const signupRole = State.signupRole || 'customer';

    container.innerHTML = `
        <div class="login-wrap">
            <div class="login-box" style="max-width:400px;">
                <div class="role-tab-switcher" style="margin-bottom:15px;">
                    <button class="role-tab ${signupRole === 'customer' ? 'active' : ''}" onclick="setSignupRole('customer')">Customer</button>
                    <button class="role-tab ${signupRole === 'agent' ? 'active' : ''}" onclick="setSignupRole('agent')">Agent</button>
                </div>
                <h2 style="color:#1a2a3a; margin-bottom:20px;">${signupRole === 'agent' ? 'Agent Registration' : 'Customer Sign Up'}</h2>
                <div class="form-group"><label>Full Name</label><input type="text" id="s-name" class="login-input"></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Phone</label><input type="text" id="s-phone" class="login-input"></div>
                    <div class="form-group"><label>City</label><input type="text" id="s-city" class="login-input"></div>
                </div>
                ${signupRole === 'agent' ? `<div class="form-group"><label>Email Address</label><input type="email" id="s-email" class="login-input"></div>` : ''}
                ${signupRole === 'agent' ? `
                    <div class="form-group"><label>Experience</label>
                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                            <select id="s-exp-years" class="login-input">
                                <option value="0">0 Years</option>
                                ${Array.from({ length: 50 }, (_, i) => `<option value="${i + 1}">${i + 1} Years</option>`).join('')}
                            </select>
                            <select id="s-exp-months" class="login-input">
                                <option value="0">0 Months</option>
                                ${Array.from({ length: 11 }, (_, i) => `<option value="${i + 1}">${i + 1} Months</option>`).join('')}
                            </select>
                        </div>
                    </div>
                ` : ''}
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Password</label><input type="password" id="s-pass" class="login-input"></div>
                    <div class="form-group"><label>Confirm</label><input type="password" id="s-cpass" class="login-input"></div>
                </div>
                ${signupRole === 'agent' ? `<div class="form-group"><label>Profile Photo</label><input type="file" id="s-photo" accept="image/*" class="login-input"></div>` : ''}
                <button class="login-btn" onclick="handleSignup('${signupRole}')">Register Now</button>
                <div class="auth-redirect-box">
                    Already have an account? <a href="#" onclick="navigate('login')" class="auth-redirect-link">Login Here</a>
                </div>
                <button class="prop-btn" style="background:#f5f5f5; color:#555; margin-top:15px; width:100%; border:1px solid #ddd; padding:12px; font-weight:700; font-size:1rem;" onclick="navigate('home')">CLOSE</button>
            </div>
        </div>`;
}

window.setSignupRole = (r) => {
    State.signupRole = r;
    render();
};

async function handleSignup(role) {
    if (window.isRealTaskRunning) return;

    const name = document.getElementById('s-name').value.trim();
    const phone = document.getElementById('s-phone').value.trim();
    const city = document.getElementById('s-city').value.trim();
    const pass = document.getElementById('s-pass').value.trim();
    const cpass = document.getElementById('s-cpass').value.trim();

    if (!name || !phone || !pass || !cpass || !city) return alert("Please fill all fields");
    if (pass !== cpass) return alert("Passwords do not match!");

    let email = '';
    let photoData = '';
    let experience = '';

    if (role === 'agent') {
        const emailInput = document.getElementById('s-email');
        email = emailInput ? emailInput.value.trim() : '';
        if (!email) return alert("Email is required for Agents");

        const photoFile = document.getElementById('s-photo').files[0];
        if (!photoFile) return alert("Please upload a profile photo for Agent account");

        const expYears = document.getElementById('s-exp-years').value;
        const expMonths = document.getElementById('s-exp-months').value;
        experience = `${expYears} Years ${expMonths} Months`;

        try {
            photoData = await toBase64(photoFile);
        } catch (e) {
            return alert("Error processing photo. Please try a different one.");
        }
    }

    window.isRealTaskRunning = true;
    showGlobalLoader("रजिस्ट्रेशन हो रहा है..."); // Registering...

    (async () => {
        try {
            if (role === 'agent') {
                if (State.agents.find(a => a.phone === phone)) {
                    hideGlobalLoader(null);
                    setTimeout(() => alert("This mobile number is already registered!"), 200);
                    return;
                }
                if (State.agents.find(a => a.email === email)) {
                    hideGlobalLoader(null);
                    setTimeout(() => alert("This email address is already registered!"), 200);
                    return;
                }

                State.agents.push({
                    id: Date.now(), name, phone, city, email, password: pass, photo: photoData,
                    experience: experience, status: 'pending', wallet: 0,
                    joinedAt: new Date().toLocaleDateString()
                });

                await saveGlobalData();
                hideGlobalLoader("रजिस्ट्रेशन सफल!");
                setTimeout(() => {
                    alert("Agent Registered! Please wait for Admin approval.");
                    navigate('login');
                }, 200);
            } else {
                // Customer Signup
                if (State.customers.find(c => c.phone === phone)) {
                    hideGlobalLoader(null);
                    setTimeout(() => alert("Account already exists with this mobile number!"), 200);
                    return;
                }

                const newCustomer = {
                    id: Date.now(), name, phone, city, email: '', password: pass,
                    status: 'active', joinedAt: new Date().toLocaleDateString(), likes: [], wallet: 0
                };

                State.customers.push(newCustomer);

                // Auto Login for Customer
                State.user = { role: 'customer', name: name, id: newCustomer.id, phone: phone, photo: null };
                State.likes = [];

                await saveGlobalData();
                hideGlobalLoader("रजिस्ट्रेशन सफल!");
                setTimeout(() => {
                    navigate('home');
                }, 200);
            }
        } catch (err) {
            console.error("Signup Error:", err);
            hideGlobalLoader(null);
            setTimeout(() => alert("Registration failed. Please check your data."), 200);
        } finally {
            window.isRealTaskRunning = false;
        }
    })();
}

function renderAdmin(container) {
    const tab = State.adminTab || 'dashboard';
    const stats = [
        { label: 'Properties', val: State.properties.length },
        { label: 'Agents', val: State.agents.length },
        { label: 'Wallet Balance', val: 'Rs. ' + State.adminWallet.toLocaleString() }
    ];
    container.innerHTML = `
        <div class="dashboard-layout">
            <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
            <aside class="sidebar">
                <div class="logo-simple" style="color:white; margin-bottom:40px; font-size: 1.5rem; font-weight: 900;">
                    <i class="fas fa-user-shield"></i> Admin Panel
                </div>
                <nav class="side-nav">
                    <a href="#" class="side-link ${tab === 'dashboard' ? 'active' : ''}" onclick="setAdminTab('dashboard'); toggleSidebar()"><i class="fas fa-th-large"></i> Dashboard</a>
                    <a href="#" class="side-link ${tab === 'properties' ? 'active' : ''}" onclick="setAdminTab('properties'); toggleSidebar()"><i class="fas fa-building"></i> Properties</a>
                    <a href="#" class="side-link ${tab === 'agents' ? 'active' : ''}" onclick="setAdminTab('agents'); toggleSidebar()"><i class="fas fa-users"></i> Agents</a>
                    <a href="#" class="side-link ${tab === 'customers' ? 'active' : ''}" onclick="setAdminTab('customers'); toggleSidebar()"><i class="fas fa-user-friends"></i> Customers</a>
                    <a href="#" class="side-link ${tab === 'messages' ? 'active' : ''}" onclick="setAdminTab('messages'); toggleSidebar()"><i class="fas fa-comments"></i> Messages</a>
                    <a href="#" class="side-link ${tab === 'withdrawals' ? 'active' : ''}" onclick="setAdminTab('withdrawals'); toggleSidebar()"><i class="fas fa-money-bill-wave"></i> Withdrawals</a>
                    <a href="#" class="side-link ${tab === 'financialHistory' ? 'active' : ''}" onclick="setAdminTab('financialHistory'); toggleSidebar()"><i class="fas fa-history"></i> Financial History</a>
                    <a href="#" class="side-link ${tab === 'adminWallet' ? 'active' : ''}" onclick="setAdminTab('adminWallet'); toggleSidebar()"><i class="fas fa-wallet"></i> My Wallet</a>
                    <a href="#" class="side-link ${tab === 'exploreMgr' ? 'active' : ''}" onclick="setAdminTab('exploreMgr'); toggleSidebar()"><i class="fas fa-th-large"></i> Explore Pages</a>
                    <a href="#" class="side-link ${tab === 'sellRentMgr' ? 'active' : ''}" onclick="setAdminTab('sellRentMgr'); toggleSidebar()"><i class="fas fa-edit"></i> Sell/Rent Mgr</a>
                    <a href="#" class="side-link ${tab === 'walletRequests' ? 'active' : ''}" onclick="setAdminTab('walletRequests'); toggleSidebar()"><i class="fas fa-hand-holding-usd"></i> Wallet Requests ${State.walletRequests && State.walletRequests.some(r => r.status === 'pending') ? '<span style="background:red; width:8px; height:8px; border-radius:50%; display:inline-block; margin-left:5px;"></span>' : ''}</a>
                    <a href="#" class="side-link ${tab === 'premiumPlans' ? 'active' : ''}" onclick="setAdminTab('premiumPlans'); toggleSidebar()"><i class="fas fa-gem"></i> Premium Plans</a>
                    <a href="#" class="side-link ${tab === 'coupons' ? 'active' : ''}" onclick="setAdminTab('coupons'); toggleSidebar()"><i class="fas fa-tags"></i> Coupons</a>
                    <a href="#" class="side-link ${tab === 'settings' ? 'active' : ''}" onclick="setAdminTab('settings'); toggleSidebar()"><i class="fas fa-cogs"></i> Settings</a>
                    <a href="#" class="side-link" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</a>
                </nav>
            </aside>
            <main class="dash-main">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <div style="display:flex; align-items:center;">
                        <i class="fas fa-bars mobile-menu-btn" style="display:none; margin-right:15px; font-size:1.5rem; cursor:pointer;" onclick="toggleSidebar()"></i>
                        <div>
                            <h1 style="font-size:1.5rem;">Admin Dashboard</h1>
                            <div style="margin-top:8px; padding:8px 15px; background:linear-gradient(135deg, #138808, #28a745); color:white; border-radius:30px; display:inline-flex; align-items:center; gap:8px; font-weight:700;">
                                <i class="fas fa-wallet"></i> Wallet Balance: Rs. ${State.adminWallet.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button class="prop-btn" style="width:auto; padding:10px 20px; background:${State.settings.showDate ? '#138808' : '#D32F2F'};" onclick="toggleDateSetting()">
                            <i class="fas fa-eye${State.settings.showDate ? '' : '-slash'}"></i> ${State.settings.showDate ? 'Hide Date' : 'Show Date'} on Site
                        </button>
                        <button class="add-property-btn" onclick="showPropertyModal()">
                            <span class="add-prop-icon"><i class="fas fa-plus"></i></span>
                            <span class="add-prop-text">Add Property</span>
                            <span class="add-prop-shine"></span>
                        </button>
                    </div>
                </div>
                ${tab === 'dashboard' ? `<div class="stats-row">${stats.map(s => `<div class="stat-box"><div class="stat-num">${s.val}</div><div class="stat-tag">${s.label}</div></div>`).join('')}</div>` : ''}
                ${tab === 'properties' ? `
                    <div class="stat-box" style="margin-bottom:20px;"><input type="text" placeholder="Search properties..." oninput="updateAdminSearch(this.value)" value="${State.adminSearch}" style="width:100%; border:none; outline:none;"></div>
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">S.No</th><th style="padding:15px; text-align:left;">Property ID</th><th style="padding:15px; text-align:left;">Property</th><th style="padding:15px; text-align:left;">Agent Info</th><th style="padding:15px; text-align:left;">Price</th><th style="padding:15px; text-align:left;">Status</th><th style="padding:15px; text-align:left;">Featured</th><th style="padding:15px; text-align:right;">Action</th></tr></thead>
                            <tbody>
                                    ${[...State.properties].sort((a, b) => (b.createdTimestamp || b.id) - (a.createdTimestamp || a.id)).filter(p => p.title.toLowerCase().includes(State.adminSearch.toLowerCase())).map((p, index) => {
        const agent = State.agents.find(a => a.name === p.agent);
        const agentPhone = agent ? agent.phone : (p.agent.includes('John') ? '9876543210' : 'N/A');
        return `
                                        <tr style="border-top:1px solid #eee;">
                                            <td style="padding:15px; font-weight:700; color:#138808;">#${index + 1}</td>
                                            <td style="padding:15px; font-family:monospace; font-weight:800; color:#1a2a3a;">BD-${p.id}</td>
                                            <td style="padding:15px;">
                                                <div><strong>${p.title}</strong></div>
                                                <div style="font-size:0.75rem; color:#999;">${p.city}</div>
                                                <div style="font-size:0.7rem; color:#666; margin-top:4px;"><i class="fas fa-calendar-alt"></i> ${p.createdAt || 'N/A'}</div>
                                            </td>
                                            <td style="padding:15px;">
                                                ${p.role === 'customer' ? `
                                                    <div><strong>${p.agent}</strong> <span style="font-size:0.65rem; background:#e3f2fd; color:#1976D2; padding:2px 6px; border-radius:4px; font-weight:700;">CUSTOMER</span></div>
                                                    <div style="font-size:0.75rem; color:#138808; font-weight:700;"><i class="fas fa-phone-alt"></i> ${p.mobile || 'N/A'}</div>
                                                ` : `
                                                    <div><strong>${p.agent}</strong> <span style="font-size:0.65rem; background:#e8f5e9; color:#2e7d32; padding:2px 6px; border-radius:4px; font-weight:700;">AGENT</span></div>
                                                    <div style="font-size:0.75rem; color:#138808; font-weight:700;"><i class="fas fa-phone-alt"></i> ${agentPhone}</div>
                                                `}
                                            </td>
                                            <td style="padding:15px;">Rs. ${p.price}</td>
                                            <td style="padding:15px;">
                                                <span style="padding:4px 10px; border-radius:50px; font-size:0.7rem; font-weight:700; background:${p.status === 'approved' ? '#e8f5e9' : (p.status === 'disabled' ? '#ffebee' : (p.status === 'sold' ? '#e0f2f1' : '#fff3e0'))}; color:${p.status === 'approved' ? '#2e7d32' : (p.status === 'disabled' ? '#D32F2F' : (p.status === 'sold' ? '#00796b' : '#e65100'))};">${p.status.toUpperCase()}</span>
                                                ${p.status === 'disabled' && p.disableReason ? `<div style="font-size:0.7rem; color:#D32F2F; margin-top:5px; font-weight:600; max-width:150px; line-height:1.2;">Reason: ${p.disableReason}</div>` : ''}
                                            </td>
                                            <td style="padding:15px;">
                                                <div style="display:flex; flex-direction:column; gap:8px;">
                                                    <button onclick="toggleFeature(${p.id})" style="border:none; padding:5px 10px; border-radius:4px; font-weight:700; background:${p.featured ? '#FF9933' : '#eee'}; color:${p.featured ? 'white' : '#999'};">
                                                        ${p.featured ? 'FEATURED' : 'MARK FEATURED'}
                                                    </button>
                                                    <div style="display:flex; align-items:center; gap:5px;">
                                                        <input type="number" id="order-${p.id}" value="${p.displayOrder !== undefined ? p.displayOrder : ''}" placeholder="Order" 
                                                            style="width:60px; padding:4px 6px; border:1px solid #ddd; border-radius:4px; font-size:0.8rem; text-align:center;"
                                                            onchange="updateDisplayOrder(${p.id}, this.value)">
                                                        <i class="fas fa-sort-numeric-down" style="color:#666; font-size:0.8rem;" title="Display Order"></i>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style="padding:15px; text-align:right;">
                                                <div style="display:flex; flex-direction:column; gap:5px; align-items:end;">
                                                    <div style="display:flex; gap:5px;">
                                                        <button style="background:none; border:1px solid #ddd; padding:5px 10px; border-radius:5px;" onclick="editProperty(${p.id})">Edit</button>
                                                        ${p.status === 'pending' ? `<button style="background:#138808; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="approveProperty(${p.id})">Approve</button>` : ''}
                                                        ${p.status === 'approved' ? `<button style="background:#D32F2F; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="disableProperty(${p.id})">Disable</button>` :
                (p.status === 'disabled' || p.status === 'sold' ? `<button style="background:#138808; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="approveProperty(${p.id})">Enable</button>` : '')}
                                                    </div>
                                                    <div style="display:flex; gap:5px;">
                                                        ${p.status !== 'sold' ? `<button style="background:#00796b; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="markAsSold(${p.id})">Mark Sold</button>` :
                `<button style="background:#FF9933; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="markAsUnsold(${p.id})">Unsold</button>`}
                                                        <button style="background:#D32F2F; color:white; border:none; padding:5px 10px; border-radius:5px; font-weight:700;" onclick="deleteProperty(${p.id})"><i class="fas fa-trash"></i> Delete</button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${tab === 'agents' ? `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 style="margin:0; color:#1a2a3a;"><i class="fas fa-users"></i> All Agents (${State.agents.length})</h3>
                        <button onclick="downloadAgentsList()" style="background:linear-gradient(135deg, #FF9933, #138808); color:white; border:none; padding:10px 20px; border-radius:25px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 4px 15px rgba(19,136,8,0.3);">
                            <i class="fas fa-download"></i> Download CSV
                        </button>
                    </div>
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;">
                                <tr>
                                    <th style="padding:15px; text-align:left;">S.No</th>
                                    <th style="padding:15px; text-align:left;">Agent</th>
                                    <th style="padding:15px; text-align:left;">Contact Info</th>
                                    <th style="padding:15px; text-align:left;">KYC Info</th>
                                    <th style="padding:15px; text-align:left;">Status</th>
                                    <th style="padding:15px; text-align:left;">Plan</th>
                                    <th style="padding:15px; text-align:right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${State.agents.slice().sort((a, b) => (b.id || 0) - (a.id || 0)).map((a, index) => {
        const statusColor = a.status === 'approved' ? '#2e7d32' : (a.status === 'blocked' ? '#D32F2F' : '#e65100');
        const statusBg = a.status === 'approved' ? '#e8f5e9' : (a.status === 'blocked' ? '#ffebee' : '#fff3e0');
        const kyc = a.kyc || { status: 'none' };
        const kColor = kyc.status === 'approved' ? '#2e7d32' : (kyc.status === 'pending' ? '#e65100' : (kyc.status === 'rejected' ? '#D32F2F' : '#999'));
        return `
                                        <tr style="border-top:1px solid #eee;">
                                            <td style="padding:15px; font-weight:700; color:#138808;">#${index + 1}</td>
                                            <td style="padding:15px;">
                                                <div style="display:flex; align-items:center; gap:10px;">
                                                    <div style="width:35px; height:35px; background:#f0f2f5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#1a2a3a; font-weight:800; overflow:hidden;">
                                                        ${a.photo ? `<img src="${a.photo}" style="width:100%; height:100%; object-fit:cover;">` : a.name.charAt(0)}
                                                    </div>
                                                    <strong>${a.name}</strong>
                                                </div>
                                            </td>
                                            <td style="padding:15px;">
                                                <div><i class="fas fa-envelope" style="font-size:0.75rem; color:#999;"></i> ${a.email}</div>
                                                <div style="font-size:0.85rem; color:#138808; font-weight:700;"><i class="fas fa-phone-alt" style="font-size:0.75rem;"></i> ${a.phone || 'N/A'}</div>
                                            </td>
                                            <td style="padding:15px;">
                                                <div style="font-size:0.75rem; font-weight:700; color:${kColor}; text-transform:uppercase;">${kyc.status}</div>
                                            </td>
                                            <td style="padding:15px;">
                                                <span style="padding:5px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; background:${statusBg}; color:${statusColor}; text-transform:uppercase;">
                                                    ${a.status}
                                                </span>
                                            </td>
                                            <td style="padding:15px;">
                                                <div style="font-weight:700; color:#1a2a3a;">${a.currentPlan || 'Free'}</div>
                                                ${a.planExpiry ? `<div style="font-size:0.75rem; color:${Date.now() > a.planExpiry ? 'red' : '#666'}">Exp: ${new Date(a.planExpiry).toLocaleDateString()}</div>` : ''}
                                                <div style="font-size:0.7rem; color:#999;">Used: ${a.listingsUsed || 0}</div>
                                            </td>
                                             <td style="padding:15px; text-align:right;">
                                                <div style="display:flex; justify-content:flex-end; gap:5px;">
                                                 <button style="background:#007bff; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="openMessengerForUser('${a.name}', '${a.id}')" title="Message Agent"><i class="fab fa-facebook-messenger"></i></button>
                                                ${kyc.status !== 'none' ? `<button onclick="verifyKYC(${a.id})" style="background:${kyc.status === 'pending' ? '#673AB7' : (kyc.status === 'approved' ? '#2e7d32' : '#D32F2F')}; color:white; border:none; padding:6px 12px; border-radius:6px; margin-right:5px; font-weight:700; cursor:pointer; font-size:0.8rem;">${kyc.status === 'pending' ? 'KYC Request' : 'View KYC'}</button>` : ''}
                                                ${a.status === 'pending' ? `<button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="approveAgent(${a.id})">Approve</button>` : ''}
                                                ${a.status === 'approved' ? `<button style="background:#1a2a3a; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="blockAgent(${a.id})">Block</button>` : ''}
                                                 ${a.status === 'blocked' ? `<button style="background:#FF9933; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="approveAgent(${a.id})">Unblock</button>` : ''}
                                                 <button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="manageWallet(${a.id})"><i class="fas fa-wallet"></i></button>
                                                 <button style="background:#673AB7; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="manageAgentPlan(${a.id})" title="Manage Plan"><i class="fas fa-crown"></i></button>
                                                 <button style="background:#eee; color:#1a2a3a; border:1px solid #ddd; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="editAgent(${a.id})"><i class="fas fa-edit"></i></button>
                                                 <button style="background:none; border:1px solid #D32F2F; color:#D32F2F; padding:5px 10px; border-radius:6px; font-weight:600; cursor:pointer;" onclick="rejectAgent(${a.id})"><i class="fas fa-trash"></i></button>
                                                </div>
                                            </td>
                                        </tr>
                                    `;
    }).join('')}
                                ${State.agents.length === 0 ? `<tr><td colspan="4" style="padding:40px; text-align:center; color:#999;">No agents found.</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                    </div>
                ` : ''}
                ${tab === 'customers' ? `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h3 style="margin:0; color:#1a2a3a;"><i class="fas fa-user-friends"></i> All Customers (${(State.customers || []).length})</h3>
                        <button onclick="downloadCustomersList()" style="background:linear-gradient(135deg, #FF9933, #138808); color:white; border:none; padding:10px 20px; border-radius:25px; font-weight:700; cursor:pointer; display:flex; align-items:center; gap:8px; box-shadow:0 4px 15px rgba(19,136,8,0.3);">
                            <i class="fas fa-download"></i> Download CSV
                        </button>
                    </div>
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;">
                                <tr>
                                    <th style="padding:15px; text-align:left;">S.No</th>
                                    <th style="padding:15px; text-align:left;">Name</th>
                                    <th style="padding:15px; text-align:left;">Contact</th>
                                    <th style="padding:15px; text-align:left;">Joined</th>

                                    <th style="padding:15px; text-align:left;">Wallet</th>
                                    <th style="padding:15px; text-align:left;">Status</th>
                                    <th style="padding:15px; text-align:right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(State.customers || []).slice().sort((a, b) => b.id - a.id).map((c, index) => {
        const kyc = c.kyc || { status: 'none' };
        const kColor = kyc.status === 'approved' ? '#2e7d32' : (kyc.status === 'pending' ? '#e65100' : (kyc.status === 'rejected' ? '#D32F2F' : '#999'));
        return `
                                    <tr style="border-top:1px solid #eee;">
                                        <td style="padding:15px; font-weight:700; color:#138808;">#${index + 1}</td>
                                        <td style="padding:15px;"><strong>${c.name}</strong></td>
                                        <td style="padding:15px;">
                                            <div>${c.phone}</div>
                                            <div style="font-size:0.8rem; color:#666;">${c.email}</div>
                                        </td>
                                        <td style="padding:15px;">${c.joinedAt}</td>

                                        <td style="padding:15px; font-weight:700;">Rs. ${(c.wallet || 0).toLocaleString()}</td>
                                        <td style="padding:15px;">
                                            <span style="padding:5px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; background:${c.status === 'active' ? '#e8f5e9' : '#ffebee'}; color:${c.status === 'active' ? '#2e7d32' : '#D32F2F'}; text-transform:uppercase;">
                                                ${c.status}
                                            </span>
                                        </td>
                                         <td style="padding:15px; text-align:right;">
                                             <div style="display:flex; justify-content:flex-end; gap:5px;">
                                                 <button style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="openMessengerForUser('${c.name}', '${c.id}')" title="Message Customer"><i class="fab fa-facebook-messenger"></i></button>
                                                <button style="background:#007bff; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="editCustomer(${c.id})"><i class="fas fa-edit"></i></button>
                                                <button style="background:#FF9933; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="manageCustomerWallet(${c.id})"><i class="fas fa-wallet"></i></button>
                                                ${kyc.status !== 'none' ? `<button onclick="verifyKYC(${c.id})" style="background:${kyc.status === 'pending' ? '#673AB7' : (kyc.status === 'approved' ? '#2e7d32' : '#D32F2F')}; color:white; border:none; padding:5px 10px; border-radius:5px; font-weight:600; font-size:0.8rem;">${kyc.status === 'pending' ? 'KYC Request' : 'View KYC'}</button>` : ''}
                                                ${c.status === 'active' ? `<button style="background:#D32F2F; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="toggleCustomerStatus(${c.id})">Block</button>` :
                `<button style="background:#138808; color:white; border:none; padding:5px 10px; border-radius:5px;" onclick="toggleCustomerStatus(${c.id})">Unblock</button>`}
                                                <button style="background:#D32F2F; color:white; border:none; padding:5px 10px; border-radius:5px; font-weight:700;" onclick="deleteCustomer(${c.id})"><i class="fas fa-trash"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                `}).join('')}
                                ${(!State.customers || State.customers.length === 0) ? `<tr><td colspan="7" style="padding:40px; text-align:center; color:#999;">No customers found.</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                ` : ''}

                ${tab === 'withdrawals' ? `
                    <div class="stat-box" style="padding:0; overflow-x:auto;">
                        <table style="width:100%; border-collapse:collapse; min-width:800px;">
                            <thead style="background:#f8f9fa;">
                                <tr>
                                    <th style="padding:15px; text-align:left;">User Details</th>
                                    <th style="padding:15px; text-align:left;">Verified Wallet</th>
                                    <th style="padding:15px; text-align:left;">Req. Amount</th>
                                    <th style="padding:15px; text-align:left;">Date</th>
                                    <th style="padding:15px; text-align:left;">Status</th>
                                    <th style="padding:15px; text-align:right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(State.withdrawalRequests || []).sort((a, b) => b.id - a.id).map(r => {
                    let name = r.agentName || r.customerName || 'Unknown';
                    let phone = 'N/A';
                    let wallet = 0;
                    let type = 'Agent';

                    if (r.customerId) {
                        type = 'Customer';
                        const c = State.customers.find(x => x.id === r.customerId);
                        if (c) {
                            name = c.name;
                            phone = c.phone;
                            wallet = c.wallet || 0;
                        } else {
                            name = r.customerName;
                        }
                    } else {
                        const a = State.agents.find(x => x.name === r.agentName);
                        if (a) {
                            phone = a.phone;
                            wallet = a.wallet;
                        }
                    }

                    return `
                                    <tr style="border-top:1px solid #eee;">
                                        <td style="padding:15px;">
                                            <div style="font-weight:700;">${name}</div>
                                            <div style="font-size:0.8rem; color:#138808;"><i class="fas fa-phone-alt"></i> ${phone}</div>
                                            <div style="font-size:0.7rem; color:#999; text-transform:uppercase;">${type}</div>
                                        </td>
                                        <td style="padding:15px; color:#1a2a3a; font-weight:600;">Rs. ${wallet.toLocaleString()}</td>
                                        <td style="padding:15px;"><strong style="color:#138808;">Rs. ${r.amount}</strong></td>
                                        <td style="padding:15px; font-size:0.85rem; color:#666;">${r.date}</td>
                                        <td style="padding:15px;">
                                            <span style="padding:4px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; background:${r.status === 'approved' ? '#e8f5e9' : (r.status === 'rejected' ? '#ffebee' : '#fff3e0')}; color:${r.status === 'approved' ? '#2e7d32' : (r.status === 'rejected' ? '#D32F2F' : '#e65100')}; text-transform:uppercase;">
                                                ${r.status}
                                            </span>
                                            ${r.remark ? `<div style="font-size:0.7rem; color:#666; font-style:italic; margin-top:4px;">"${r.remark}"</div>` : ''}
                                        </td>
                                        <td style="padding:15px; text-align:right;">
                                            ${r.status === 'pending' ? `
                                                <button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer;" onclick="processWithdrawal(${r.id}, 'approved')">Approve</button>
                                                <button style="background:#D32F2F; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-left:5px;" onclick="processWithdrawal(${r.id}, 'rejected')">Reject</button>
                                            ` : '<span style="color:#999; font-size:0.8rem; font-weight:600;">PROCESSED</span>'}
                                        </td>
                                    </tr>
                                    `;
                }).join('')}
                                ${(State.withdrawalRequests || []).length === 0 ? `<tr><td colspan="5" style="padding:40px; text-align:center; color:#999;">No withdrawal requests found.</td></tr>` : ''}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
                ${tab === 'adminWallet' ? `
                    <div style="max-width:800px;">
                        <div class="stat-box" style="background:linear-gradient(135deg, #FF9933, #138808); color:white; padding:40px; border-radius:20px; text-align:center; margin-bottom:30px;">
                            <i class="fas fa-wallet" style="font-size:3rem; margin-bottom:15px; opacity:0.9;"></i>
                            <div style="font-size:0.9rem; opacity:0.9; text-transform:uppercase; letter-spacing:1px;">Admin Wallet Balance</div>
                            <div style="font-size:3rem; font-weight:900; margin:15px 0;">Rs. ${State.adminWallet.toLocaleString()}</div>
                            <button class="prop-btn" style="background:white; color:#138808; width:auto; padding:12px 30px; margin-top:10px; border-radius:50px; font-weight:800;" 
                                onclick="addAdminBalance()"><i class="fas fa-plus-circle"></i> Add Balance</button>
                        </div>
                        
                        <div style="background:white; border-radius:15px; padding:25px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                            <h3 style="margin-bottom:20px; color:#1a2a3a; display:flex; align-items:center; gap:10px;">
                                <i class="fas fa-history"></i> Transaction History
                            </h3>
                            ${(State.walletTransactions || [])
                .filter(t => t.type === 'admin_credit' || t.type === 'admin_debit')
                .sort((a, b) => b.id - a.id)
                .map(t => `
                                    <div style="display:flex; justify-content:space-between; align-items:center; padding:15px; border-bottom:1px solid #f0f0f0;">
                                        <div>
                                            <div style="font-weight:700; color:#1a2a3a; margin-bottom:4px;">
                                                ${t.type === 'admin_credit' ? '<span style="color:#138808;">+ Rs. ' + t.amount.toLocaleString() + '</span>' : '<span style="color:#D32F2F;">- Rs. ' + t.amount.toLocaleString() + '</span>'}
                                            </div>
                                            <div style="font-size:0.75rem; color:#999;">${t.date}</div>
                                            ${t.remark ? `<div style="font-size:0.75rem; color:#666; font-style:italic; margin-top:4px;">"${t.remark}"</div>` : ''}
                                        </div>
                                        <span style="font-size:0.75rem; font-weight:800; color:${t.type === 'admin_credit' ? '#138808' : '#D32F2F'}; text-transform:uppercase;">
                                            ${t.type === 'admin_credit' ? 'CREDIT' : 'DEBIT'}
                                        </span>
                                    </div>
                                `).join('')}
                            ${(State.walletTransactions || []).filter(t => t.type === 'admin_credit' || t.type === 'admin_debit').length === 0 ?
                `<div style="text-align:center; padding:40px; color:#999;">
                                    <i class="fas fa-inbox" style="font-size:3rem; margin-bottom:10px; opacity:0.3;"></i><br>
                                    No transactions yet
                                </div>` : ''}
                        </div>
                    </div>
                ` : ''}
                ${tab === 'exploreMgr' ? `
                    <div class="stat-box">
                        <h3 style="margin-bottom:20px; color:#1a2a3a;">Example Page Manager ('Other' Button)</h3>
                        
                        <div style="background:#f8f9fa; padding:20px; border-radius:15px; margin-bottom:30px; border:1px solid #eee;">
                            <h4 style="margin-bottom:15px; color:#138808;">Page Header</h4>
                            <div class="form-group">
                                <label>Main Heading</label>
                                <input id="ex-heading" class="login-input" value="${State.otherPage?.heading || 'Explore More'}">
                            </div>
                            <div class="form-group">
                                <label>Sub Heading</label>
                                <input id="ex-subheading" class="login-input" value="${State.otherPage?.subHeading || ''}">
                            </div>
                            <button class="login-btn" onclick="saveExploreHeader()" style="width:auto; padding:10px 30px;">Save Header</button>
                        </div>

                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                            <h4 style="margin:0; color:#138808;">Other Cards</h4>
                            <button class="login-btn" onclick="addExploreCard()" style="width:auto; padding:8px 20px; font-size:0.9rem;">
                                <i class="fas fa-plus"></i> Add New Card
                            </button>
                        </div>
                        <div class="property-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                            ${(State.otherPage?.cards || []).map((c, i) => `
                                <div style="background:white; border:1px solid #ddd; border-radius:12px; padding:15px; position:relative;">
                                    <div style="position:absolute; top:10px; right:10px; width:20px; height:20px; border-radius:50%; background:${c.bg || '#ffffff'}; border:1px solid #ccc;"></div>
                                    <h4 style="margin:0 0 5px 0;">${i + 1}. ${c.title} ${c.hidden ? '<span style="color:#D32F2F; font-size:0.7rem; font-weight:700;">(HIDDEN)</span>' : ''}</h4>
                                    <p style="font-size:0.8rem; color:#666; margin-bottom:15px; height:40px; overflow:hidden;">${c.desc}</p>
                                    <div style="display:flex; gap:10px;">
                                        <button class="prop-btn" onclick="editExploreCard(${i})" style="background:#e8f5e9; color:#138808; border:1px solid #138808; font-size:0.9rem;">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                        <button class="prop-btn" onclick="deleteExploreCard(${i})" style="background:#ffebee; color:#D32F2F; border:1px solid #D32F2F; font-size:0.9rem; width:auto; padding:0 15px;">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}


                ${tab === 'sellRentMgr' ? `
                    <div class="stat-box">
                        <h3 style="margin-bottom:20px; color:#1a2a3a;">'Sell/Rent' Page Manager</h3>
                        
                        <!-- Global Layout Settings -->
                        <div style="background:white; padding:25px; border-radius:20px; border:1px solid #eee; margin-bottom:30px; box-shadow:0 10px 30px rgba(0,0,0,0.03);">
                            <h4 style="margin-bottom:20px; color:#007bff; border-bottom:2px solid #f8f9fa; padding-bottom:10px;">
                                <i class="fas fa-th-large"></i> GLOBAL LAYOUT SETTINGS (Size & Style)
                            </h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
                                <div class="form-group">
                                    <label>Card Min Width (px)</label>
                                    <input id="sr-set-minwidth" type="number" class="login-input" value="${State.sellRentPage?.settings?.minWidth || 140}">
                                </div>
                                <div class="form-group">
                                    <label>Card Min Height (px)</label>
                                    <input id="sr-set-minheight" type="number" class="login-input" value="${State.sellRentPage?.settings?.minHeight || 120}">
                                </div>
                                <div class="form-group">
                                    <label>Icon Size (rem)</label>
                                    <input id="sr-set-iconsize" type="number" step="0.1" class="login-input" value="${State.sellRentPage?.settings?.iconSize || 2.2}">
                                </div>
                                <div class="form-group">
                                    <label>Icon Circle Box (px)</label>
                                    <input id="sr-set-iconbox" type="number" class="login-input" value="${State.sellRentPage?.settings?.iconBox || 70}">
                                </div>
                                <div class="form-group">
                                    <label>Font Size (rem)</label>
                                    <input id="sr-set-fontsize" type="number" step="0.05" class="login-input" value="${State.sellRentPage?.settings?.fontSize || 0.85}">
                                </div>
                                <div class="form-group">
                                    <label>Card Internal Padding (px)</label>
                                    <input id="sr-set-padding" type="number" class="login-input" value="${State.sellRentPage?.settings?.padding || 25}">
                                </div>
                            </div>
                            <button class="login-btn" onclick="saveSellRentGlobalSettings()" style="width:auto; padding:10px 30px; background:#007bff; border-radius:10px; margin-top:10px;">Save Layout Settings</button>
                        </div>

                        <!-- Customer Section -->
                        <div style="background:white; padding:25px; border-radius:20px; border:1px solid #eee; box-shadow:0 10px 30px rgba(0,0,0,0.03);">
                            <h4 style="margin-bottom:20px; color:#138808; border-bottom:2px solid #f8f9fa; padding-bottom:10px;">
                                <i class="fas fa-user"></i> CUSTOMER CARDS MANAGEMENT
                            </h4>
                            
                            <div style="background:#f8f9fa; padding:15px; border-radius:15px; margin-bottom:20px;">
                                <div class="form-group">
                                    <label>Page Main Heading</label>
                                    <input id="sr-heading" class="login-input" value="${State.sellRentPage?.heading || ''}">
                                </div>
                                <div class="form-group">
                                    <label>Page Sub Heading</label>
                                    <input id="sr-subheading" class="login-input" value="${State.sellRentPage?.subHeading || ''}">
                                </div>
                                <button class="login-btn" onclick="saveSellRentHeader('customer')" style="width:auto; padding:10px 30px;">Save Header Text</button>
                            </div>

                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <h5 style="margin:0; color:#1a2a3a;">Customer Option Buttons</h5>
                                <button class="login-btn" onclick="addSellRentCard('customer')" style="width:auto; padding:8px 20px; font-size:0.9rem;">
                                    <i class="fas fa-plus"></i> Add New Card
                                </button>
                            </div>
                            <div class="property-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                                ${(State.sellRentPage?.cards || []).map((c, i) => `
                                    <div style="background:white; border:1px solid #ddd; border-radius:12px; padding:15px; position:relative; box-shadow:0 4px 10px rgba(0,0,0,0.04);">
                                        <div style="position:absolute; top:10px; right:10px; width:25px; height:25px; border-radius:50%; background:${c.bgImg ? `url(${c.bgImg}) center/cover` : (c.bg || '#ffffff')}; border:1px solid #ccc;"></div>
                                        <h4 style="margin:0 0 5px 0; font-size:0.9rem; color:#1a2a3a;">${i + 1}. ${c.title}</h4>
                                        <p style="font-size:0.75rem; color:#666; margin:5px 0;">Icon: <i class="fas fa-${c.icon}"></i> (${c.icon})</p>
                                        <div style="display:flex; gap:10px; margin-top:15px;">
                                            <button class="prop-btn" onclick="editSellRentCard('customer', ${i})" style="background:#e8f5e9; color:#138808; border:1px solid #138808; font-size:0.8rem; padding:6px 15px;">Edit Card</button>
                                            <button class="prop-btn" onclick="deleteSellRentCard('customer', ${i})" style="background:#ffebee; color:#D32F2F; border:1px solid #D32F2F; font-size:0.8rem; width:auto; padding:0 15px;">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                ` : ''}

                ${tab === 'broadcast' ? `
                    <div style="max-width:600px;">
                        <div class="stat-box" style="padding:25px;">
                            <h3 style="margin-bottom:15px; color:#138808;"><i class="fas fa-bullhorn"></i> Send Global Broadcast</h3>
                            <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">Type a message below and select who should see it.</p>
                            <div class="form-group">
                                <label>Send To</label>
                                <select id="broadcast-recipient" class="login-input">
                                    <option value="all">Everyone (All Users & Agents)</option>
                                    <option value="agents">Agents Only</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Message Content</label>
                                <textarea id="broadcast-msg" class="login-input" style="height:120px; padding:15px;" placeholder="Type your announcement here..."></textarea>
                            </div>
                            <button class="login-btn" onclick="sendBroadcast()" style="margin-top:10px;">Send Broadcast Message</button>
                            
                            ${State.settings.broadcast && State.settings.broadcast.active ? `
                                <div style="margin-top:30px; border-top:1px solid #eee; padding-top:20px;">
                                    <h4 style="color:#D32F2F;">Current Active Message:</h4>
                                    <div style="background:#fff3e1; padding:15px; border-radius:10px; border-left:4px solid #FF9933; margin:10px 0;">
                                        ${State.settings.broadcast.message}
                                    </div>
                                    <button class="prop-btn" style="background:#f0f0f0; color:#444; width:auto; padding:8px 20px;" onclick="stopBroadcast()">Stop Showing Message</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${tab === 'premiumPlans' ? `
                    <div class="stat-box" style="padding:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;">
                            <div>
                                <h3 style="margin:0; color:#1a2a3a; font-size:1.4rem;"><i class="fas fa-gem" style="color:#FF9933;"></i> Manage Premium Plans</h3>
                                <p style="margin:5px 0 0; color:#666; font-size:0.9rem;">Configure subscription plans and pricing for agents.</p>
                            </div>
                            <button class="add-property-btn" onclick="openPlanModal()" style="width:auto; padding:10px 25px;">
                                <i class="fas fa-plus"></i> Add New Plan
                            </button>
                        </div>
                        
                        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:25px;">
                            ${(State.premiumPlans || []).map((p) => `
                                <div style="background:white; border:1px solid #eee; border-radius:15px; padding:0; position:relative; box-shadow:0 10px 25px rgba(0,0,0,0.05); overflow:hidden; transition:transform 0.2s;" onmouseover="this.style.transform='translateY(-5px)'" onmouseout="this.style.transform='translateY(0)'">
                                    <div style="height:6px; background:${p.color || '#138808'}; width:100%;"></div>
                                    <div style="padding:20px;">
                                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                                            <div style="display:flex; align-items:center; gap:8px;">
                                                <h4 style="margin:0; font-size:1.3rem; color:#1a2a3a; font-weight:800;">${p.name}</h4>
                                                ${p.isFeatured ? '<i class="fas fa-star" style="color:#FF9800; font-size:0.9rem;" title="Featured Plan"></i>' : ''}
                                            </div>
                                            <div style="background:${p.color || '#138808'}15; color:${p.color || '#138808'}; padding:5px 12px; border-radius:20px; font-weight:900; font-size:0.9rem;">
                                                ₹ ${p.price}
                                            </div>
                                        </div>
                                        <p style="color:#666; font-size:0.9rem; line-height:1.5; margin-bottom:20px; min-height:40px;">${p.description}</p>
                                        
                                        <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                                            <div style="display:flex; align-items:center; gap:10px; margin-bottom:8px; font-size:0.9rem; color:#555;">
                                                <i class="fas fa-clock" style="color:${p.color || '#138808'};"></i> 
                                                <strong>Duration:</strong> ${p.duration} Days
                                            </div>
                                            <div style="display:flex; align-items:center; gap:10px; font-size:0.9rem; color:#555;">
                                                <i class="fas fa-coins" style="color:${p.color || '#138808'};"></i> 
                                                <strong>Credits:</strong> ${p.credits} Pts
                                            </div>
                                            <div style="display:flex; align-items:center; gap:10px; margin-top:8px; font-size:0.9rem; color:#555;">
                                                <i class="fas fa-home" style="color:${p.color || '#138808'};"></i> 
                                                <strong>Limit:</strong> ${p.propertyLimit || 'Unlimited'} Props
                                            </div>
                                        </div>

                                        <div style="display:flex; gap:10px;">
                                             <button onclick="togglePlanFeature(${p.id})" style="flex:0 0 auto; background:${p.isFeatured ? '#FFF3E0' : '#f5f5f5'}; color:${p.isFeatured ? '#FF9800' : '#ccc'}; border:none; padding:10px; border-radius:8px; cursor:pointer; " title="Toggle Feature">
                                                <i class="fas fa-star"></i>
                                             </button>
                                             <button onclick="togglePlanVisibility(${p.id})" style="flex:0 0 auto; background:${p.isHidden ? '#ffebee' : '#e8f5e9'}; color:${p.isHidden ? '#D32F2F' : '#138808'}; border:none; padding:10px; border-radius:8px; cursor:pointer;" title="${p.isHidden ? 'Enable Plan' : 'Disable Plan'}">
                                                <i class="fas fa-${p.isHidden ? 'eye-slash' : 'eye'}"></i>
                                             </button>
                                             <button onclick="openPlanModal(${p.id})" style="flex:1; background:#e3f2fd; color:#1565C0; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s;">
                                                <i class="fas fa-edit"></i> Edit
                                             </button>
                                             <button onclick="deletePlan(${p.id})" style="flex:1; background:#ffebee; color:#D32F2F; border:none; padding:10px; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s;">
                                                <i class="fas fa-trash"></i> Delete
                                             </button>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                            
                            ${(!State.premiumPlans || State.premiumPlans.length === 0) ? `
                                <div style="grid-column:1/-1; text-align:center; padding:40px; color:#999; background:#fafafa; border-radius:15px; border:2px dashed #ddd;">
                                    <i class="fas fa-box-open" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i>
                                    <p>No Premium Plans Created Yet.</p>
                                    <button onclick="openPlanModal()" style="color:#138808; background:none; border:none; font-weight:700; cursor:pointer;">Create First Plan</button>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                ` : ''}

                ${tab === 'coupons' ? `
                    <div class="stat-box" style="padding:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; border-bottom:1px solid #eee; padding-bottom:15px;">
                            <div>
                                <h3 style="margin:0; color:#1a2a3a; font-size:1.4rem;"><i class="fas fa-tags" style="color:#FF9933;"></i> Manage Coupons</h3>
                                <p style="margin:5px 0 0; color:#666; font-size:0.9rem;">Create discount codes for agents.</p>
                            </div>
                            <button class="add-property-btn" onclick="openCouponModal()" style="width:auto; padding:10px 25px;">
                                <i class="fas fa-plus"></i> Create Coupon
                            </button>
                        </div>
                        
                        <div style="overflow-x:auto;">
                            <table style="width:100%; border-collapse:collapse; min-width:600px;">
                                <thead style="background:#f8f9fa;">
                                    <tr>
                                        <th style="padding:15px; text-align:left;">Code</th>
                                        <th style="padding:15px; text-align:left;">Discount</th>
                                        <th style="padding:15px; text-align:left;">Max Limit</th>
                                        <th style="padding:15px; text-align:left;">Status</th>
                                        <th style="padding:15px; text-align:right;">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(State.coupons || []).map(c => `
                                        <tr style="border-bottom:1px solid #eee;">
                                            <td style="padding:15px; font-weight:800; color:#1a2a3a; font-family:monospace; font-size:1.1rem;">${c.code}</td>
                                            <td style="padding:15px; color:#138808; font-weight:700;">${c.type === 'percentage' ? c.value + '%' : 'Rs. ' + c.value}</td>
                                            <td style="padding:15px; color:#666;">${c.maxDiscount ? 'Rs. ' + c.maxDiscount : '-'}</td>
                                            <td style="padding:15px;">
                                                <span style="padding:4px 10px; border-radius:15px; font-size:0.75rem; font-weight:700; background:${c.active ? '#e8f5e9' : '#ffebee'}; color:${c.active ? '#2e7d32' : '#D32F2F'};">
                                                    ${c.active ? 'ACTIVE' : 'INACTIVE'}
                                                </span>
                                            </td>
                                            <td style="padding:15px; text-align:right;">
                                                <button onclick="toggleCouponStatus(${c.id})" style="background:${c.active ? '#ffebee' : '#e8f5e9'}; color:${c.active ? '#D32F2F' : '#138808'}; border:none; padding:8px 12px; border-radius:5px; cursor:pointer; margin-right:5px; font-size:0.8rem; font-weight:700;">
                                                    ${c.active ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <button onclick="deleteCoupon(${c.id})" style="background:none; color:#D32F2F; border:none; cursor:pointer; font-size:0.9rem;" title="Delete">
                                                    <i class="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    `).join('')}
                                    ${(!State.coupons || State.coupons.length === 0) ? `<tr><td colspan="5" style="text-align:center; padding:30px; color:#999;">No coupons created yet.</td></tr>` : ''}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}
                ${tab === 'messages' ? (window.renderMessagesTab ? renderMessagesTab() : '<div style="padding:20px;">Messages module loading...</div>') : ''}

                ${tab === 'financialHistory' ? `
                    <div style="max-width:900px;">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                            <h2 style="color:#1a2a3a; font-size:1.5rem; font-weight:700;"><i class="fas fa-history"></i> All Financial Transactions</h2>
                            <div style="display:flex; align-items:center; gap:15px;">
                                <div style="background:white; border-radius:30px; padding:5px 15px; box-shadow:0 2px 10px rgba(0,0,0,0.05); display:flex; align-items:center;">
                                    <i class="fas fa-search" style="color:#999; margin-right:10px;"></i>
                                    <input type="text" placeholder="Search Name or Mobile..." oninput="updateAdminSearch(this.value)" value="${State.adminSearch || ''}" style="border:none; outline:none; font-size:0.9rem; width:200px;">
                                </div>
                                <div style="background:white; padding:10px 20px; border-radius:10px; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                                    <span style="color:#666; font-size:0.9rem;">Total Admin Balance</span>
                                    <div style="font-size:1.2rem; font-weight:800; color:#138808;">Rs. ${(State.adminWallet || 0).toLocaleString()}</div>
                                </div>
                            </div>
                        </div>

                        <div style="background:white; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.05); overflow:hidden;">
                            <table style="width:100%; border-collapse:collapse;">
                                <thead style="background:#f9f9f9; border-bottom:2px solid #eee;">
                                    <tr>
                                        <th style="padding:15px; text-align:left; color:#666;">Date</th>
                                        <th style="padding:15px; text-align:left; color:#666;">Transaction ID</th>
                                        <th style="padding:15px; text-align:left; color:#666;">Agent/User</th>
                                        <th style="padding:15px; text-align:left; color:#666;">Type</th>
                                        <th style="padding:15px; text-align:left; color:#666;">Amount</th>
                                        <th style="padding:15px; text-align:left; color:#666;">Remark</th>
                                        <th style="padding:15px; text-align:left; color:#666;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${(State.walletTransactions || []).length === 0 ?
                '<tr><td colspan="7" style="padding:30px; text-align:center; color:#999;">No transaction history found.</td></tr>' :
                (State.walletTransactions || [])
                    .sort((a, b) => b.id - a.id)
                    .filter(t => {
                        if (!State.adminSearch) return true;
                        const s = State.adminSearch.toLowerCase();
                        const agent = State.agents.find(a => a.id === t.agentId);
                        const customer = State.customers && t.customerId ? State.customers.find(c => c.id === t.customerId) : null;

                        const name = (agent ? agent.name : (customer ? customer.name : (t.userName || ''))).toLowerCase();
                        const phone = (agent ? agent.phone : (customer ? customer.phone : (t.userPhone || ''))).toLowerCase();
                        return name.includes(s) || phone.includes(s) || t.id.toString().includes(s);
                    })
                    .map(t => {
                        const agent = State.agents.find(a => a.id === t.agentId);
                        const customer = State.customers && t.customerId ? State.customers.find(c => c.id === t.customerId) : null;

                        const name = agent ? agent.name : (customer ? customer.name : (t.userName || 'Unknown User'));
                        const phone = agent ? agent.phone : (customer ? customer.phone : (t.userPhone || 'N/A'));

                        return `
                                            <tr style="border-bottom:1px solid #eee;">
                                                <td style="padding:15px; color:#555; font-size:0.85rem;">${new Date(t.id).toLocaleDateString()}</td>
                                                <td style="padding:15px; color:#999; font-size:0.8rem;">#${t.id.toString().slice(-6)}</td>
                                                <td style="padding:15px; font-weight:600; color:#1a2a3a;">
                                                    ${name}
                                                    <div style="font-size:0.75rem; color:#666;"><i class="fas fa-phone-alt" style="font-size:0.7rem;"></i> ${phone}</div>
                                                    <div style="font-size:0.75rem; color:#888;">ID: ${t.agentId || 'N/A'}</div>
                                                </td>
                                                <td style="padding:15px;">
                                                    <span style="padding:4px 10px; border-radius:15px; font-size:0.75rem; font-weight:700; background:${t.type === 'credit' ? '#e8f5e9' : '#ffebee'}; color:${t.type === 'credit' ? '#2e7d32' : '#c62828'};">
                                                        ${t.type === 'credit' ? 'CREDIT' : 'DEBIT'}
                                                    </span>
                                                </td>
                                                <td style="padding:15px; font-weight:700; color:${t.type === 'credit' ? '#2e7d32' : '#c62828'};">
                                                    ${t.type === 'credit' ? '+' : '-'} Rs. ${t.amount}
                                                </td>
                                                <td style="padding:15px; color:#555; font-size:0.9rem;">${t.remark}</td>
                                                <td style="padding:15px;">
                                                    <span style="font-size:0.8rem; color:${t.status === 'success' ? '#2e7d32' : (t.status === 'pending' ? '#ef6c00' : '#c62828')}; font-weight:600;">
                                                        ${t.status ? t.status.toUpperCase() : 'SUCCESS'}
                                                    </span>
                                                </td>
                                            </tr>
                                        `}).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                ${tab === 'settings' ? `
                    <div style="max-width:800px;">
                         <h2 style="margin-bottom:20px;">Contact & Founder Settings</h2>
                         <div class="stat-box" style="padding:25px;">
                            <h3 style="margin-bottom:15px; color:#138808;">App Branding</h3>
                            <div class="form-group">
                                <label>App Header Name</label>
                                <input id="set-app-name" type="text" value='${State.settings.appName || 'Bhumi<span style="color: #FF9933;">Dekho</span>'}' class="login-input">
                             </div>
                             <div class="form-group">
                                <label>About Us Description</label>
                                <textarea id="set-about-text" class="login-input" style="height:100px;">${State.settings.aboutText || ''}</textarea>
                             </div>
                            <div class="form-group">
                                <label>Banner Images (Comma separated URLs)</label>
                                <textarea id="set-banners" class="login-input" style="height:100px;">${(State.settings.appDetails && State.settings.appDetails.banners) ? State.settings.appDetails.banners.join(',\n') : ''}</textarea>
                                 <div style="font-size:0.75rem; color:#666; margin-top:5px;">Enter direct image links separated by comma.</div>
                             </div>
                          </div>

                          <div class="stat-box" style="padding:25px; margin-top:20px;">
                             <h3 style="margin-bottom:15px; color:#138808;">Loading & Connection Settings</h3>
                             <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">Customize the look and feel of loading screens and alerts.</p>
                             
                             <h4 style="margin:15px 0 10px; color:#1a2a3a;">Primary Loader (Circle)</h4>
                             <div class="form-group">
                                 <label>Loading Text</label>
                                 <input id="set-ux-load-text" type="text" value="${(State.settings.ux && State.settings.ux.loadingText) || State.loadingMessage}" class="login-input">
                             </div>
                             <div class="form-group">
                                 <label>Loading Icon Class (Default: loader-circle)</label>
                                 <input id="set-ux-load-icon" type="text" value="${(State.settings.ux && State.settings.ux.loadingIcon) || 'loader-circle'}" class="login-input">
                                 <div style="font-size:0.75rem; color:#666; margin-top:5px;">Use 'loader-circle' for animated ring, or FontAwesome class (e.g. fas fa-spinner fa-spin).</div>
                             </div>

                             <h4 style="margin:20px 0 10px; color:#1a2a3a; border-top:1px solid #eee; padding-top:15px;">Slow Connection Alert</h4>
                             <div class="form-group">
                                 <label>Alert Icon Class</label>
                                 <input id="set-ux-slow-icon" type="text" value="${(State.settings.ux && State.settings.ux.slowConnIcon) || 'fas fa-wifi-slash'}" class="login-input">
                             </div>
                             <div class="form-group">
                                 <label>Alert Heading</label>
                                 <input id="set-ux-slow-title" type="text" value="${(State.settings.ux && State.settings.ux.slowConnHeading) || 'Connection slow hai!'}" class="login-input">
                             </div>
                             <div class="form-group">
                                 <label>Alert Subtext</label>
                                 <input id="set-ux-slow-sub" type="text" value="${(State.settings.ux && State.settings.ux.slowConnSubtext) || 'Please Check Your Internet Connection'}" class="login-input">
                             </div>
                          </div>

                         <div class="stat-box" style="padding:25px; margin-top:20px;">
                            <h3 style="margin-bottom:15px; color:#138808;">Contact Information</h3>
                            <div class="form-group"><label>Main Phone</label><input id="set-phone" value="${State.settings.contactInfo.phone}" class="login-input"></div>
                            <div class="form-group"><label>Main Email</label><input id="set-email" value="${State.settings.contactInfo.email}" class="login-input"></div>
                            <h4 style="margin:15px 0 10px; color:#666;">Password Recovery Details</h4>
                            <div class="form-group"><label>Helpline Phone</label><input id="set-help-phone" value="${State.settings.contactInfo.helplinePhone || ''}" placeholder="+91..." class="login-input"></div>
                            <div class="form-group"><label>Support Email</label><input id="set-help-email" value="${State.settings.contactInfo.helplineEmail || ''}" placeholder="support@..." class="login-input"></div>
                         </div>

                         <div class="stat-box" style="padding:25px; margin-top:20px;">
                            <h3 style="margin-bottom:15px; color:#138808;">Social Media Links</h3>
                            <div class="form-group"><label>Instagram URL</label><input id="set-social-insta" value="${(State.settings.socialLinks && State.settings.socialLinks.insta) || ''}" class="login-input" placeholder="https://instagram.com/..."></div>
                            <div class="form-group"><label>YouTube URL</label><input id="set-social-yt" value="${(State.settings.socialLinks && State.settings.socialLinks.youtube) || ''}" class="login-input" placeholder="https://youtube.com/..."></div>
                            <div class="form-group"><label>Facebook URL</label><input id="set-social-fb" value="${(State.settings.socialLinks && State.settings.socialLinks.facebook) || ''}" class="login-input" placeholder="https://facebook.com/..."></div>
                            <div class="form-group"><label>X (Twitter) URL</label><input id="set-social-x" value="${(State.settings.socialLinks && State.settings.socialLinks.twitter) || ''}" class="login-input" placeholder="https://x.com/..."></div>
                         </div>

                         <div class="stat-box" style="padding:25px; margin-top:20px;">
                            <h3 style="margin-bottom:15px; color:#138808;">Admin Security</h3>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                                <div class="form-group"><label>Old Password</label><input id="set-old-pass" type="password" placeholder="Current Password" class="login-input"></div>
                                <div class="form-group"><label>New Password</label><input id="set-new-pass" type="password" placeholder="New Password" class="login-input"></div>
                            </div>
                            <div style="font-size:0.75rem; color:#666; margin-top:5px;">Leave empty if you don't want to change password.</div>
                         </div>

                         ${State.settings.contactInfo.founders.map((f, i) => `
                             <div class="stat-box" style="padding:25px; margin-top:20px;">
                                <div style="display:flex; justify-content:space-between; align-items:center;">
                                    <h3 style="margin-bottom:15px; color:#138808;">Founder ${i + 1}</h3>
                                    <button onclick="removeFounder(${i})" style="color:red; cursor:pointer; background:none; border:none;">Remove</button>
                                </div>
                                <div class="form-group"><label>Name</label><input class="login-input f-name" value="${f.name}"></div>
                                <div class="form-group"><label>Title</label><input class="login-input f-title" value="${f.title}"></div>
                                <div class="form-group"><label>Image URL</label><input class="login-input f-img" value="${f.image}"></div>
                                <div class="form-group"><label>Bio</label><textarea class="login-input f-bio" style="height:80px;">${f.bio}</textarea></div>
                             </div>
                         `).join('')}
                         
                         <button class="prop-btn" onclick="addFounder()" style="margin-top:20px; background:#f0f0f0; color:#333; width:100%;">+ Add Founder</button>
                         
                         <button class="login-btn" onclick="saveContactSettings()" style="margin-top:20px; width:auto; padding:12px 30px;">Save All Settings</button>
                         
                         <div style="margin-top:40px; border-top:2px solid #eee; padding-top:30px;">
                             <h2 style="margin-bottom:20px;">Navigation & Categories</h2>
                             
                            <div class="stat-box" style="padding:25px;">
                                 <h3 style="margin-bottom:15px; color:#138808;">'OTHER' Button Configuration</h3>
                                 <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">Customize the center button in the bottom navigation bar.</p>
                                 <div class="form-group">
                                     <label>Button Label</label>
                                     <input id="nav-other-label" value="${(State.settings.otherButton && State.settings.otherButton.label) || 'OTHER'}" class="login-input" placeholder="e.g. OFFERS">
                                 </div>
                                 <div class="form-group">
                                     <label>Icon Class (Font Awesome)</label>
                                     <input id="nav-other-icon" value="${(State.settings.otherButton && State.settings.otherButton.icon) || 'fas fa-ellipsis-h'}" class="login-input" placeholder="e.g. fas fa-star">
                                     <div style="font-size:0.75rem; color:#666; margin-top:5px;">
                                        Popular Icons: 
                                        <span style="cursor:pointer; color:#138808; text-decoration:underline;" onclick="document.getElementById('nav-other-icon').value='fas fa-ellipsis-h'">Ellipsis</span>, 
                                        <span style="cursor:pointer; color:#138808; text-decoration:underline;" onclick="document.getElementById('nav-other-icon').value='fas fa-star'">Star</span>, 
                                        <span style="cursor:pointer; color:#138808; text-decoration:underline;" onclick="document.getElementById('nav-other-icon').value='fas fa-bars'">Menu</span>
                                     </div>
                                 </div>
                                 <button class="login-btn" onclick="saveNavigationSettings()" style="margin-top:15px; width:auto;">Save Navigation</button>
                            </div>

                            <!-- Sell/Rent Button Configuration -->
                            <div class="stat-box" style="padding:25px; margin-top:20px;">
                                 <h3 style="margin-bottom:15px; color:#138808;">'Sell/Rent' Button Configuration</h3>
                                 <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">Customize the Sell/Rent button label and icon.</p>
                                 <div class="form-group">
                                     <label>Button Label</label>
                                     <input id="nav-sellrent-label" value="${(State.settings.sellRentButton && State.settings.sellRentButton.label) || 'Sell/Rent'}" class="login-input" placeholder="e.g. List Property">
                                 </div>
                                 <div class="form-group">
                                     <label>Icon Class (Font Awesome)</label>
                                     <input id="nav-sellrent-icon" value="${(State.settings.sellRentButton && State.settings.sellRentButton.icon) || 'fas fa-plus'}" class="login-input" placeholder="e.g. fas fa-plus">
                                 </div>
                                 <button class="login-btn" onclick="saveSellRentSettings()" style="margin-top:15px; width:auto;">Save Settings</button>
                            </div>
                            
                            <!-- Property Types Management -->
                             <div class="stat-box" style="padding:25px; margin-top:20px;">
                                 <h3 style="margin-bottom:15px; color:#138808;"><i class="fas fa-tags"></i> Property Types Management</h3>
                                 <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">Manage property categories shown on the home page filter.</p>
                                 
                                 <div style="margin-bottom:20px;">
                                     <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
                                         ${(State.settings.propertyTypes || ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House']).map((type, idx) => `
                                             <div style="background:#f0f0f0; padding:8px 15px; border-radius:20px; display:flex; align-items:center; gap:8px; border:1px solid #ddd;">
                                                 <span style="font-weight:600; color:#1a2a3a;">${type}</span>
                                                 ${type !== 'All' ? `<i class="fas fa-times-circle" onclick="deletePropertyType(${idx})" style="color:#D32F2F; cursor:pointer; font-size:0.9rem;" title="Delete"></i>` : '<span style="color:#999; font-size:0.7rem;">(Default)</span>'}
                                             </div>
                                         `).join('')}
                                     </div>
                                     
                                     <div style="display:flex; gap:10px; align-items:center;">
                                         <input type="text" id="new-property-type" placeholder="Enter new property type..." class="login-input" style="flex:1;">
                                         <button class="login-btn" onclick="addPropertyType()" style="width:auto; padding:12px 20px; margin:0;">
                                             <i class="fas fa-plus"></i> Add Type
                                         </button>
                                     </div>
                                 </div>
                            </div>

                            <!-- City Management -->
                            <div class="stat-box" style="padding:25px; margin-top:20px;">
                                 <h3 style="margin-bottom:15px; color:#138808;"><i class="fas fa-map-marker-alt"></i> City Management</h3>
                                 <p style="color:#666; margin-bottom:15px; font-size:0.9rem;">Manage cities available in the property form dropdown.</p>
                                 
                                 <div style="margin-bottom:20px;">
                                     <div style="display:flex; gap:10px; flex-wrap:wrap; margin-bottom:15px;">
                                         ${(State.settings.cities || []).map((city, idx) => `
                                             <div style="background:#e8f5e9; padding:8px 15px; border-radius:20px; display:flex; align-items:center; gap:8px; border:1px solid #c8e6c9;">
                                                 <span style="font-weight:600; color:#138808;">${city}</span>
                                                 <i class="fas fa-times-circle" onclick="deleteCity(${idx})" style="color:#D32F2F; cursor:pointer; font-size:0.9rem;" title="Delete"></i>
                                             </div>
                                         `).join('')}
                                         ${(!State.settings.cities || State.settings.cities.length === 0) ? '<span style="color:#999; font-style:italic;">No custom cities added. Using defaults from active properties.</span>' : ''}
                                     </div>
                                     
                                     <div style="display:flex; gap:10px; align-items:center;">
                                         <input type="text" id="new-city-name" placeholder="Enter new city name..." class="login-input" style="flex:1;">
                                         <button class="login-btn" onclick="addCity()" style="width:auto; padding:12px 20px; margin:0;">
                                             <i class="fas fa-plus"></i> Add City
                                         </button>
                                     </div>
                                 </div>
                            </div>
                         </div>
                         
                    </div>
                ` : ''}

                ${tab === 'walletRequests' ? `
                     <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h2 style="color:#1a2a3a; font-size:1.5rem; font-weight:700;">Wallet Requests</h2>
                    </div>
                    
                    <div style="background:white; border-radius:15px; box-shadow:0 5px 15px rgba(0,0,0,0.05); overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse;">
                            <thead style="background:#f9f9f9; border-bottom:2px solid #eee;">
                                <tr>
                                    <th style="padding:15px; text-align:left; color:#666;">ID</th>
                                    <th style="padding:15px; text-align:left; color:#666;">Agent</th>
                                    <th style="padding:15px; text-align:left; color:#666;">Amount</th>
                                    <th style="padding:15px; text-align:left; color:#666;">Proof</th>
                                    <th style="padding:15px; text-align:left; color:#666;">Status</th>
                                    <th style="padding:15px; text-align:left; color:#666;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${(State.walletRequests || []).length === 0 ?
                '<tr><td colspan="6" style="padding:30px; text-align:center; color:#999;">No recharge requests found.</td></tr>' :
                (State.walletRequests || []).sort((a, b) => b.id - a.id).map(r => `
                                    <tr style="border-bottom:1px solid #eee;">
                                        <td style="padding:15px; color:#999; font-size:0.85rem;">#${r.id.toString().slice(-6)}</td>
                                        <td style="padding:15px;">
                                            <div style="font-weight:700; color:#1a2a3a;">${r.agentName}</div>
                                            <div style="font-size:0.8rem; color:#666;">ID: ${r.agentId}</div>
                                        </td>
                                        <td style="padding:15px; font-weight:800; color:#138808;">Rs. ${r.amount}</td>
                                        <td style="padding:15px;">
                                            <a href="#" onclick="openImageModal('${r.proof}')" style="color:#1976D2; text-decoration:underline; font-size:0.9rem;">View Proof</a>
                                        </td>
                                        <td style="padding:15px;">
                                            <span style="padding:5px 10px; border-radius:20px; font-size:0.8rem; font-weight:700; 
                                                background:${r.status === 'pending' ? '#fff3e0' : (r.status === 'approved' ? '#e8f5e9' : '#ffebee')}; 
                                                color:${r.status === 'pending' ? '#ef6c00' : (r.status === 'approved' ? '#2e7d32' : '#c62828')};">
                                                ${r.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style="padding:15px;">
                                            ${r.status === 'pending' ? `
                                                <button onclick="approveWalletRequest(${r.id})" style="background:#2e7d32; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; margin-right:5px; font-size:0.8rem;">Approve</button>
                                                <button onclick="rejectWalletRequest(${r.id})" style="background:#c62828; color:white; border:none; padding:6px 12px; border-radius:5px; cursor:pointer; font-size:0.8rem;">Reject</button>
                                            ` : '<span style="color:#999; font-size:0.8rem;">No Action</span>'}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                ` : ''}
            </main>
        </div>
    `;
}

window.setAdminTab = (t) => { State.adminTab = t; render(); };
window.updateAdminSearch = (v) => { State.adminSearch = v; render(); };

window.updateDisplayOrder = async function (id, order) {
    const prop = State.properties.find(p => p.id === id);
    if (!prop) return;

    // Convert to number, or set to undefined if empty
    prop.displayOrder = order.trim() === '' ? undefined : parseInt(order);

    showGlobalLoader("अपडेट हो रहा है...");
    await saveGlobalData();
    hideGlobalLoader("Order Updated!");
    render();
};

window.toggleFeature = (id) => { const p = State.properties.find(x => x.id === id); if (p) { p.featured = !p.featured; saveGlobalData(); render(); } };

function renderAgent(container) {
    const tab = State.agentTab || 'dashboard';
    const agent = State.agents.find(a => a.id === State.user.id) || State.agents[0] || { name: State.user.name, wallet: 0 };
    const agentProps = State.properties.filter(p =>
        (p.agent === agent.name || p.agent.includes(agent.name.split(' ')[0])) &&
        p.title.toLowerCase().includes((State.agentSearch || '').toLowerCase())
    ).sort((a, b) => (b.createdTimestamp || b.id) - (a.createdTimestamp || a.id));

    // Calculate Stats
    const totalViews = agentProps.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLeads = agentProps.reduce((acc, p) => acc + (p.leads || 0), 0);

    const stats = [
        { label: 'My Properties', val: agentProps.length, icon: 'fa-building', color: '#138808' },
        // Replaced Total Views with Membership Status as per request
        {
            label: 'MEMBERSHIP',
            val: (agent.membershipStatus === 'active') ? 'ACTIVE' : 'INACTIVE',
            icon: (agent.membershipStatus === 'active') ? 'fa-check-circle' : 'fa-times-circle',
            color: (agent.membershipStatus === 'active') ? '#2e7d32' : '#D32F2F',
            valSize: '1.5rem' // Custom size for text value
        },
        { label: 'Add Property', val: '+', icon: 'fa-plus-circle', color: '#673AB7', isAction: true },
        { label: 'Wallet Balance', val: `Rs. ${agent.wallet || 0} `, icon: 'fa-wallet', color: '#138808' }
    ];

    container.innerHTML = `
        <div class="dashboard-layout">
            <div class="sidebar-overlay" onclick="toggleSidebar()"></div>
            <aside class="sidebar agent">
                <div class="logo-simple" style="margin-bottom:30px; color:white; font-size:1.5rem; font-weight: 900;">
                    <i class="fas fa-user-circle"></i> Agent Panel
                </div>
                <nav class="side-nav">
                    <a href="#" class="side-link ${tab === 'dashboard' ? 'active' : ''}" onclick="setAgentTab('dashboard'); toggleSidebar()">
                        <i class="fas fa-th-large"></i> Dashboard
                    </a>
                    <a href="#" class="side-link ${tab === 'properties' ? 'active' : ''}" onclick="setAgentTab('properties'); toggleSidebar()">
                        <i class="fas fa-building"></i> My Properties
                    </a>
                    <a href="#" class="side-link ${tab === 'wallet' ? 'active' : ''}" onclick="setAgentTab('wallet'); toggleSidebar()">
                        <i class="fas fa-wallet"></i> Wallet
                    </a>
                    <a href="#" class="side-link" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </nav>
            </aside>
            <main class="dash-main">
                <header style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                    <div style="display:flex; align-items:center; gap:15px;">
                        <i class="fas fa-bars mobile-menu-btn" style="display:none; margin-right:15px; font-size:1.5rem; cursor:pointer;" onclick="toggleSidebar()"></i>
                        
                        <!-- Agent Profile Photo with Edit -->
                        <div style="position:relative; width:70px; height:70px; flex-shrink:0;">
                            ${agent.photo ?
            `<img src="${agent.photo}" style="width:100%; height:100%; object-fit:cover; border-radius:50%; border:3px solid #138808; box-shadow:0 4px 15px rgba(0,0,0,0.1);">` :
            `<div style="width:100%; height:100%; background:#e8f5e9; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#138808; font-size:2rem; font-weight:800; border:3px solid #138808; box-shadow:0 4px 15px rgba(0,0,0,0.1);">${agent.name.charAt(0)}</div>`
        }
                            <label for="agent-profile-upload" style="position:absolute; bottom:0; right:0; background:#FF9933; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 2px 5px rgba(0,0,0,0.3); border:2px solid white;">
                                <i class="fas fa-camera" style="font-size:0.7rem; color:white;"></i>
                            </label>
                            <input type="file" id="agent-profile-upload" accept="image/*" style="display:none;" onchange="handleProfilePhotoUpload(this)">
                        </div>
                        
                        <div>
                            <div style="display:flex; align-items:center; gap:8px;">
                                <h1 style="font-size:1.6rem; color:#1a2a3a; margin:0;">Welcome, ${State.user.name}</h1>
                                <i class="fas fa-pen" onclick="editProfileName()" style="font-size:0.9rem; cursor:pointer; opacity:0.6; color:#138808;" title="Edit Name"></i>
                            </div>
                            <p style="font-size:0.85rem; color:#666; margin:5px 0 0 0;">Manage your listings and track performance.</p>
                        </div>
                    </div>
                ${(tab === 'properties' || tab === 'dashboard') ? `
                    <div style="display:flex; gap:10px; align-items:center;">
                        ${(!agent.kyc || agent.kyc.status === 'none' || agent.kyc.status === 'rejected') ?
                `<button class="prop-btn" style="width:auto; padding:12px 20px; background:#D32F2F;" onclick="renderProfile(document.getElementById('app'))"><i class="fas fa-exclamation-circle"></i> Complete KYC</button>` :
                (agent.kyc.status === 'pending' ? `<button class="prop-btn" style="width:auto; padding:12px 20px; background:#FF9933;" onclick="renderProfile(document.getElementById('app'))"><i class="fas fa-clock"></i> KYC Pending</button>` :
                    `<div style="color:#138808; font-weight:700; background:#e8f5e9; padding:8px 15px; border-radius:30px; font-size:0.85rem; border:1px solid #c8e6c9;"><i class="fas fa-check-circle"></i> KYC Verified</div>`)
            }
                    </div>
                ` : ''}
                </header>

                ${tab === 'dashboard' ? `
                    <div class="stats-row">
                        ${stats.map(s => s.isAction ? `
                            <div class="stat-box" style="border-left:5px solid ${s.color}; cursor:pointer; display:flex; flex-direction:column; align-items:center; justify-content:center; background:#f3e5f5;" onclick="showPropertyModal()">
                                <i class="fas ${s.icon}" style="font-size:2.5rem; color:${s.color}; margin-bottom:10px;"></i>
                                <div style="font-weight:700; color:${s.color}; font-size:1rem;">ADD PROPERTY</div>
                            </div>
                        ` : `
                            <div class="stat-box" style="border-left:5px solid ${s.color};">
                                <i class="fas ${s.icon}" style="float:right; color:#eee; font-size:2rem;"></i>
                                <div class="stat-num" style="color:${s.color}; font-size:${s.valSize || '2rem'};">${s.val}</div>
                                <div class="stat-tag">${s.label}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div style="margin-top:30px;">
                        <h3 style="margin-bottom:15px; color:#1a2a3a;">My Listings</h3>
                        <div class="property-grid">
                            ${agentProps.length === 0 ? `
                                <div style="grid-column:1/-1; text-align:center; padding:50px; background:white; border-radius:15px;">
                                    <i class="fas fa-building" style="font-size:3rem; color:#ddd; margin-bottom:15px;"></i><br>
                                    No properties found. Add your first listing!
                                </div>
                            ` : agentProps.map(p => `
                                <div class="prop-card">
                                    <div class="prop-img-box">
                                        <img src="${p.image}" alt="">
                                        <div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; align-items:end; gap:5px;">
                                            <div style="background:rgba(0,0,0,0.6); color:white; padding:4px 10px; border-radius:30px; font-size:0.7rem;">
                                                ${p.status.toUpperCase()}
                                            </div>
                                            ${p.status === 'disabled' && p.disableReason ? `<div style="background:#D32F2F; color:white; padding:4px 8px; border-radius:5px; font-size:0.6rem; font-weight:600; max-width:120px; text-align:right;">Reason: ${p.disableReason}</div>` : ''}
                                        </div>
                                    </div>
                                    <div class="prop-body">
                                        <div style="display:flex; justify-content:space-between; align-items:start;">
                                            <div style="color:#138808; font-weight:800; font-size:1.1rem; margin-bottom:5px;">Rs. ${p.price}</div>
                                            <div style="font-size:0.65rem; color:#999; text-align:right;">${p.createdAt || ''}</div>
                                        </div>
                                        <div style="font-size:0.7rem; color:#138808; font-weight:800; margin-bottom:2px;">ID: BD-${p.id}</div>
                                        <h4 style="color:white; font-size:1rem; margin-bottom:10px;">${p.title}</h4>
                                        <div style="display:flex; gap:8px;">
                                            <button class="prop-btn" style="background:#1a2a3a; font-size:0.75rem; flex:1;" onclick="editProperty(${p.id})">Edit Details</button>
                                            ${p.status !== 'sold' ? `<button class="prop-btn" style="background:#00796b; font-size:0.75rem; flex:1;" onclick="markAsSold(${p.id})">Mark Sold</button>` : ''}
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                ${tab === 'properties' ? `
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; flex-wrap:wrap; gap:10px;">
                        <h2 style="color:#1a2a3a; font-size:1.5rem; font-weight:700; margin:0;">My Properties</h2>
                        <button onclick="showPropertyModal()" style="display:flex; align-items:center; gap:8px; padding:10px 20px; background:linear-gradient(135deg, #FF9933, #138808); color:white; border:none; border-radius:50px; font-weight:700; cursor:pointer; box-shadow:0 4px 15px rgba(0,0,0,0.2);">
                            <i class="fas fa-plus-circle"></i> Add Property
                        </button>
                    </div>

                    ${window.getMembershipUI ? window.getMembershipUI(agent) : ''}
                    <div class="property-grid">
                        ${agentProps.length === 0 ? `
                            <div style="grid-column:1/-1; text-align:center; padding:50px; background:white; border-radius:15px;">
                                <i class="fas fa-building" style="font-size:3rem; color:#ddd; margin-bottom:15px;"></i><br>
                                No properties found. Add your first listing!
                            </div>
                        ` : agentProps.map(p => `
                            <div class="prop-card">
                                <div class="prop-img-box">
                                    <img src="${p.image}" alt="">
                                    <div style="position:absolute; top:10px; right:10px; display:flex; flex-direction:column; align-items:end; gap:5px;">
                                        <div style="background:rgba(0,0,0,0.6); color:white; padding:4px 10px; border-radius:30px; font-size:0.7rem;">
                                            ${p.status.toUpperCase()}
                                        </div>
                                        ${p.status === 'disabled' && p.disableReason ? `<div style="background:#D32F2F; color:white; padding:4px 8px; border-radius:5px; font-size:0.6rem; font-weight:600; max-width:120px; text-align:right;">Reason: ${p.disableReason}</div>` : ''}
                                    </div>
                                </div>
                                <div class="prop-body">
                                    <div style="display:flex; justify-content:space-between; align-items:start;">
                                        <div style="color:#138808; font-weight:800; font-size:1.1rem; margin-bottom:5px;">Rs. ${p.price}</div>
                                        <div style="font-size:0.65rem; color:#999; text-align:right;">${p.createdAt || ''}</div>
                                    </div>
                                    <div style="font-size:0.7rem; color:#138808; font-weight:800; margin-bottom:2px;">ID: BD-${p.id}</div>
                                    <h4 style="color:white; font-size:1rem; margin-bottom:10px;">${p.title}</h4>
                                    <div style="display:flex; gap:8px;">
                                        <button class="prop-btn" style="background:#1a2a3a; font-size:0.75rem; flex:1;" onclick="editProperty(${p.id})">Edit Details</button>
                                        ${p.status !== 'sold' ? `<button class="prop-btn" style="background:#00796b; font-size:0.75rem; flex:1;" onclick="markAsSold(${p.id})">Mark Sold</button>` : ''}
                                    </div>

                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}

                ${tab === 'wallet' ? `
                    <div style="max-width:600px;">
                        <div class="stat-box" style="background:linear-gradient(135deg, #138808, #28a745); color:white; padding:30px; border-radius:20px; text-align:center;">
                            <i class="fas fa-wallet" style="font-size:2.5rem; margin-bottom:15px; opacity:0.8;"></i>
                            <div style="font-size:0.9rem; opacity:0.9; text-transform:uppercase; letter-spacing:1px;">Available Balance</div>
                            <div style="font-size:2.5rem; font-weight:900; margin:10px 0;">Rs. ${agent.wallet || 0}</div>
                            <div style="display:flex; justify-content:center; gap:10px; margin-top:15px;">
                                <button class="prop-btn" style="background:white; color:#FF5722; width:auto; padding:12px 25px; border-radius:50px; border:2px solid white;" 
                                    onclick="openAddMoneyModal()">
                                    <i class="fas fa-plus"></i> Add Money
                                </button>
                                <button class="prop-btn" style="background:rgba(255,255,255,0.2); color:white; width:auto; padding:12px 25px; border-radius:50px;" 
                                    onclick="requestWithdrawal(${agent.id})">
                                    <i class="fas fa-arrow-down"></i> Withdraw
                                </button>
                            </div>
                        </div>
                        
                        <div style="margin-top:30px; background:white; border-radius:15px; padding:20px; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                            <h3 style="margin-bottom:15px; color:#1a2a3a;">Transaction History</h3>
                            ${[...(State.walletTransactions || []).filter(t => t.agentId === agent.id),
            ...(State.withdrawalRequests || []).filter(r => r.agentId === agent.id).map(r => ({
                id: r.id, agentId: r.agentId, amount: r.amount, type: 'withdrawal',
                status: r.status, date: r.date, remark: r.remark
            }))]
                .sort((a, b) => b.id - a.id)
                .map(t => `
                                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0f0f0;">
                                    <div>
                                        <div style="font-weight:700; color:#1a2a3a;">
                                            ${t.type === 'credit' ? '<span style="color:#138808;">+ Rs. ' + t.amount + '</span>' : '<span style="color:#D32F2F;">- Rs. ' + t.amount + '</span>'}
                                        </div>
                                        <div style="font-size:0.75rem; color:#999;">${t.date} • ${t.type.toUpperCase()}</div>
                                        ${t.remark ? `<div style="font-size:0.7rem; color:#666; font-style:italic;">"${t.remark}"</div>` : ''}
                                    </div>
                                    <span style="font-size:0.75rem; font-weight:800; color:${t.status === 'approved' ? '#138808' : (t.status === 'rejected' ? '#D32F2F' : (t.type === 'credit' ? '#138808' : '#FF9933'))}">
                                        ${t.status ? t.status.toUpperCase() : 'SUCCESS'}
                                    </span>
                                </div>
                            `).join('')}
                            ${((State.walletTransactions || []).filter(t => t.agentId === agent.id).length === 0 && (State.withdrawalRequests || []).filter(r => r.agentId === agent.id).length === 0) ? `<div style="text-align:center; padding:30px; color:#999;">No transaction history found.</div>` : ''}
                        </div>
                    </div>
                ` : ''}
            </main>
        </div>
    `;
}

window.setAgentTab = (tab) => { State.agentTab = tab; render(); };

window.toggleSidebar = () => {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) {
        sidebar.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }
};

function renderDetails(container) {
    const p = State.properties.find(x => x.id === State.selectedPropertyId) || State.properties[0];
    const activeTab = State.detailsTab || 'Details';

    const renderContent = () => {
        let contentHtml = '';
        if (activeTab === 'Details') {
            contentHtml = `
                <div style="margin-bottom:20px; display:flex; justify-content:space-between; align-items:flex-start;">
                    <div style="flex:1;">
                        <h2 style="color:#1a2a3a; font-size:1.6rem; font-weight:900; margin-bottom:5px; line-height:1.2;">${p.title}</h2>
                        <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                            <div style="background:#e8f5e9; color:#138808; font-weight:800; padding:4px 10px; border-radius:30px; font-size:0.8rem; border:1px solid #c8e6c9;"><i class="fas fa-fingerprint"></i> ID: BD-${p.id}</div>
                            <div style="color:#138808; font-weight:700; font-size:1rem;"><i class="fas fa-map-marker-alt"></i> ${p.city}${p.pincode ? ', ' + p.pincode : ''}</div>
                        </div>
                    </div>
                    <div onclick="toggleLike(event, ${p.id})" style="cursor:pointer; width:56px; height:56px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 25px rgba(0,0,0,0.12); flex-shrink:0; margin-left:15px; border:1px solid #eee;">
                        <i class="${State.likes.includes(p.id) ? 'fas' : 'far'} fa-heart" style="color:${State.likes.includes(p.id) ? '#FF5252' : '#666'}; font-size:1.8rem;"></i>
                    </div>
                </div>
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800; font-size:1.3rem;">विवरण एवं स्थान</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.area || 'Area'}</span>
                        <strong style="color:#138808; font-size:1.3rem;">${p.area}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.sqft || 'Price/sq.ft'}</span>
                        <strong style="color:#138808; font-size:1.3rem;">Rs. ${p.priceSqft}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.city || 'City'}</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.city}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.category || 'Type'}</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.category}</strong>
                    </div>
                    ${p.bhk ? `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">Bedrooms</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.bhk} BHK</strong>
                    </div>` : ''}
                    ${p.bathrooms ? `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">Bathrooms</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.bathrooms}</strong>
                    </div>` : ''}
                    ${p.furnishing ? `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">Furnishing</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.furnishing}</strong>
                    </div>` : ''}
                    ${p.floor ? `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">Floor</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.floor}</strong>
                    </div>` : ''}
                    ${p.facing ? `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">Facing</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.facing}</strong>
                    </div>` : ''}
                    ${p.roadWidth ? `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">Road Width</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.roadWidth}</strong>
                    </div>` : ''}
                    ${(p.extraDetails || []).map(e => `
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${e.label}</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${e.value}</strong>
                    </div>
                    `).join('')}
                </div>
                <div style="margin-top:25px; background:#ffffff; padding:20px; border-radius:18px; border:1.5px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom:12px; color:#138808; font-weight:800;"><i class="fas fa-file-alt"></i> ${p.labels?.description || 'विवरण (Description)'}</h4>
                    <p style="font-size:1rem; color:#444; line-height:1.8;">${p.description}</p>
                </div>

                ${p.video ? `
                <div style="margin-top:25px; background:#ffffff; padding:20px; border-radius:18px; border:1.5px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                    <h4 style="margin-bottom:15px; color:#138808; font-weight:800;"><i class="fas fa-play-circle"></i> Property Video Tour</h4>
                    <div id="inline-video-${p.id}" onclick="window.open('${p.video}', '_blank')" style="position:relative; padding-bottom:45%; height:0; border-radius:15px; overflow:hidden; border:1px solid #eee; background:#000; cursor:pointer; transition:transform 0.2s;">
                        <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center;">
                            <div style="width:100px; height:100px; background:rgba(255,255,255,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 30px rgba(255,255,255,0.1); border:3px solid #333;">
                                <i class="fab fa-youtube" style="color:#FF0000; font-size:4.5rem; margin-left:2px;"></i>
                            </div>
                        </div>
                    </div>
                     <div style="text-align:center; margin-top:10px;">
                        <span style="font-size:0.85rem; color:#666; font-weight:600;"><i class="fas fa-hand-pointer"></i> Click to watch on YouTube</span>
                    </div>
                </div>
                ` : ''}
`;
        } else if (activeTab === 'Photos') {
            const allImages = p.images || [p.image];
            contentHtml = `
            <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Gallery (${allImages.length} Photos)</h3>
        <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">
            ${allImages.map((img, idx) => `
                        <div style="background:white; padding:5px; border-radius:12px; border:1px solid #eee; ${idx === 0 ? 'grid-column: span 2;' : ''}">
                            <img src="${img}" style="width:100%; height:${idx === 0 ? '200px' : '120px'}; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="viewFullImage('${img}')">
                        </div>
                    `).join('')}
        </div>
`;
        } else if (activeTab === 'Video') {
            const vidId = getYouTubeID(p.video);
            contentHtml = `
            <div style="background:#ffffff; padding:20px; border-radius:18px; border:1.5px solid #eee; box-shadow:0 5px 15px rgba(0,0,0,0.05);">
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Video Tour</h3>
            ${vidId ? `
                        <div id="tab-video-${p.id}" onclick="window.open('${p.video}', '_blank')" style="position:relative; padding-bottom:45%; height:0; border-radius:15px; overflow:hidden; border:1px solid #eee; background:#000; cursor:pointer; transition:transform 0.2s;">
                            <div style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000; display:flex; align-items:center; justify-content:center;">
                                <div style="width:120px; height:120px; background:rgba(255,255,255,0.1); border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 40px rgba(255,255,255,0.1); border:4px solid #333;">
                                    <i class="fab fa-youtube" style="color:#FF0000; font-size:5.5rem; margin-left:2px;"></i>
                                </div>
                            </div>
                        </div>
                        <div style="text-align:center; margin-top:15px;">
                             <span style="font-size:0.9rem; color:#666; font-weight:600;"><i class="fas fa-hand-pointer"></i> Click above to watch video</span>
                        </div>
            ` : `
                    <div style="text-align:center; padding:50px; background:white; border-radius:15px; border:1px solid #eee; color:#999;">
                        <i class="fab fa-youtube" style="font-size:3rem; margin-bottom:10px;"></i><br>वीडियो उपलब्ध नहीं है
                    </div>
            `}
            </div>
`;
        } else if (activeTab === 'Map') {
            contentHtml = `
            <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Location Map</h3>
        <div style="text-align:center; padding:40px; background:white; border-radius:15px; border:1px solid #eee;">
            <i class="fas fa-map-marked-alt" style="font-size:3rem; color:#138808; margin-bottom:15px;"></i><br>
                <a href="${p.map || '#'}" target="_blank" class="btn-green-fill" style="padding:12px 25px; border-radius:30px; display:inline-flex; width:auto;">View on Google Maps</a>
        </div>
`;
        }

        const heroImages = p.images || [p.image];
        const hasMultipleImages = heroImages.length > 1;

        container.innerHTML = `
                <div class="details-view">
                <div class="details-hero" style="position:relative;">
                    <div id="hero-slider-container" style="display:flex; overflow-x:auto; scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;">
                        ${heroImages.map((img, idx) => `
                            <img src="${img}" alt="" style="min-width:100%; height:280px; object-fit:cover; scroll-snap-align:start;" onclick="viewFullImage('${img}')">
                        `).join('')}
                    </div>
                    ${hasMultipleImages ? `
                        <div style="position:absolute; bottom:15px; left:50%; transform:translateX(-50%); background:rgba(0,0,0,0.6); color:white; padding:5px 12px; border-radius:20px; font-size:0.8rem; font-weight:700;">
                            <i class="fas fa-images"></i> ${heroImages.length} Photos
                        </div>
                    ` : ''}
                    <div style="position:absolute; top:20px; left:20px; background:rgba(255,255,255,0.9); color:#1a2a3a; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.2); z-index:10;" onclick="navigate('home')">
                        <i class="fas fa-arrow-left"></i>
                    </div>
                </div>
                <div class="details-tabs" style="display:flex; gap:12px; padding:15px; background:white; position:sticky; top:60px; z-index:90; overflow-x:auto; box-shadow:0 10px 30px rgba(0,0,0,0.05); border-radius: 0 0 20px 20px; border-bottom:1px solid #f0f0f0;">
                    ${[
                { id: 'Details', icon: 'fas fa-info-circle', label: 'Details', color: '#1976D2' },
                { id: 'Photos', icon: 'fas fa-images', label: 'Photos', color: '#138808' },
                { id: 'Video', icon: 'fas fa-play-circle', label: 'Video', color: '#D32F2F' },
                { id: 'Map', icon: 'fas fa-map-marked-alt', label: 'Map', color: '#FF9933' }
            ].map(t => `
                        <button class="detail-tab ${activeTab === t.id ? 'active' : ''}" onclick="setDetailTab('${t.id}')" style="display:flex; flex-direction:column; align-items:center; gap:5px; padding:10px 15px; border-radius:12px; border:1.5px solid ${activeTab === t.id ? 'transparent' : t.color}; background:${activeTab === t.id ? 'linear-gradient(135deg, #FF9933, #138808)' : '#ffffff'}; color:${activeTab === t.id ? 'white' : t.color}; font-weight:700; cursor:pointer; min-width:80px; transition:transform 0.2s; box-shadow:${activeTab === t.id ? '0 5px 15px rgba(19, 136, 8, 0.3)' : '0 2px 8px rgba(0,0,0,0.05)'};">
                            <i class="${t.icon}" style="font-size:1.2rem; margin-bottom:2px;"></i>
                            <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">${t.label}</span>
                        </button>
                    `).join('')}
                </div>
                <div id="details-content-grid" style="padding:20px; padding-bottom:20px;">${contentHtml}</div>
                <div class="contact-footer" style="padding:15px 20px 25px; flex-direction:column; gap:12px;">
                    <div style="display:flex; gap:10px; width:100%;">
                        <button class="login-btn" style="background:#e8f5e9; color:#138808; border:1.5px solid #c8e6c9; margin:0; flex:1; border-radius:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; height:44px; font-size:0.95rem; box-shadow: none;" onclick="directWhatsAppEnquiry(${p.id})">
                            <i class="fas fa-paper-plane"></i> Enquiry (पूछताछ)
                        </button>
                        <button class="login-btn" style="background:#FFF9F3; color:#FF9933; border:1.5px solid #FFB366; margin:0; flex:1; border-radius:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; height:44px; font-size:0.95rem; box-shadow: none;" onclick="shareProperty(${p.id})">
                            <i class="fas fa-share-alt"></i> Share (शेयर)
                        </button>
                    </div>
                    <div style="display:flex; gap:10px; width:100%;">
                        <a href="tel:${p.mobile || '0000000000'}" class="btn-green-fill" style="flex:1;">
                            <i class="fas fa-phone-alt"></i> अभी कॉल करें
                        </a>
                        <a href="https://wa.me/91${p.whatsapp || '0000000000'}" target="_blank" class="btn-green-outline" style="flex:1;">
                            <i class="fab fa-whatsapp"></i> व्हाट्सऐप
                        </a>
                    </div>
                </div>`;
    };
    window.setDetailTab = (t) => { State.detailsTab = t; render(); };

    // Full screen image viewer
    window.viewFullImage = (imgSrc) => {
        const modal = document.getElementById('modal-container');
        modal.style.display = 'flex';
        modal.innerHTML = '<div style="position:relative; width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:rgba(0,0,0,0.95);" onclick="closeModal()"><img src="' + imgSrc + '" style="max-width:95%; max-height:90%; object-fit:contain; border-radius:10px;"><div style="position:absolute; top:20px; right:20px; background:white; width:40px; height:40px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:1.2rem;"><i class="fas fa-times"></i></div></div>';
    };

    window.shareProperty = (id) => {
        const p = State.properties.find(x => x.id === id);
        if (!p) return;
        const moneyBag = '\u{1F4B0}';
        const pin = '\u{1F4CD}';
        const ruler = '\u{1F4D0}';
        const clipboard = '\u{1F4CB}';
        const tv = '\u{1F4FA}';
        const worldMap = '\u{1F5FA}\uFE0F';
        const phone = '\u{1F4DE}';

        const msg = `* ${p.title}*\n` +
            `${moneyBag} Price: Rs.${p.price} \n` +
            `${pin} City: ${p.city} \n` +
            `${ruler} Area: ${p.area} \n` +
            `${clipboard} Type: ${p.category} \n\n` +
            `* Description:* ${p.description} \n\n` +
            (p.video ? `${tv} * Video Tour:* ${p.video} \n` : '') +
            (p.map ? `${worldMap} * Location Map:* ${p.map} \n` : '') +
            `${phone} * Contact:* ${p.mobile} \n\n` +
            `Shared via BhumiDekho`;

        if (navigator.share) {
            navigator.share({ title: p.title, text: msg, url: window.location.href })
                .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank'));
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
        }
    };
    renderContent();
}



// Allow Admin to populate properties for editing
window.setAdminProperties = (props) => {
    State.properties = props || [];
};

// Multi-step Property Form
window.propertyFormStep = 1;
window.editingPropId = null;

window.showPropertyModal = (propId = null) => {
    window.isRealTaskRunning = false;
    window.tempPropertyImages = []; // Reset images
    window.tempFormData = {}; // Reset form data
    window.editingPropId = propId;

    if (propId) {
        window.propertyFormStep = 1; // Start at Step 1 for Edit
        const prop = State.properties.find(p => p.id == propId);
        if (prop) {
            // Map property fields to form fields
            window.tempFormData['p-title'] = prop.title;
            window.tempFormData['p-desc'] = prop.description;
            window.tempFormData['p-price'] = prop.price;
            window.tempFormData['p-city'] = prop.city;
            window.tempFormData['p-pincode'] = prop.pincode;
            window.tempFormData['p-cat'] = prop.category || prop.type;
            window.tempFormData['p-area'] = prop.area;
            window.tempFormData['p-area'] = prop.area;
            window.tempFormData['p-area-unit'] = prop.areaUnit || 'Sq.ft'; // NEW FIELD area unit mapping
            window.tempFormData['p-sqft'] = prop.priceSqft;
            // Pre-fill new details
            window.tempFormData['p-bhk'] = prop.bhk;
            window.tempFormData['p-bath'] = prop.bathrooms;
            window.tempFormData['p-furnish'] = prop.furnishing;
            window.tempFormData['p-floor'] = prop.floor;
            window.tempFormData['p-facing'] = prop.facing;
            window.tempFormData['p-road'] = prop.roadWidth;
            window.tempFormData['p-sqft'] = prop.priceSqft;
            window.tempFormData['p-sqft'] = prop.priceSqft;
            window.tempFormData['p-unit-type'] = prop.priceUnit || 'Sq.ft';
            window.tempFormData['p-mobile'] = prop.mobile || prop.contact_mobile; // Check mobile
            window.tempFormData['p-whatsapp'] = prop.whatsapp || prop.contact_whatsapp;
            window.tempFormData['p-video'] = prop.video || prop.youtube_video; // Check video
            window.tempFormData['p-map'] = prop.map || prop.map_link;

            // Populate images
            if (prop.images && prop.images.length > 0) {
                window.tempPropertyImages = [...prop.images];
            } else if (prop.image) {
                window.tempPropertyImages = [prop.image];
            }

            // Handle custom fields (extra details)
            if (prop.extraDetails || prop.extra_details) {
                const details = prop.extraDetails || prop.extra_details;
                try {
                    window.tempFormData['extraDetails'] = typeof details === 'string' ? JSON.parse(details) : details;
                } catch (e) { console.error('Error parsing extra details', e); }
            }
        }
    } else {
        // ADD NEW PROPERTY - CHECK LIMITS (Premium Logic)
        if (State.user && State.user.role === 'agent') {
            const agent = State.agents.find(a => a.id === State.user.id);
            if (agent) {
                // 1. Check Expiry
                if (agent.planExpiry && Date.now() > agent.planExpiry) {
                    alert("Your Premium Membership has expired! Please renew your plan to add properties.");
                    return;
                }

                // 2. Check Listing Limits
                // 2. Check Listing Limits
                let limit = 0; // Free Plan default

                if (agent.currentPlan && agent.currentPlan !== 'Free') {
                    const plan = (State.premiumPlans || []).find(p => p.name === agent.currentPlan);
                    if (plan) limit = plan.propertyLimit !== undefined && plan.propertyLimit !== null ? plan.propertyLimit : 9999;
                    else {
                        // Legacy / Fallback logic for old plans
                        if (agent.currentPlan === 'Silver') limit = 3;
                        else if (agent.currentPlan === 'Gold') limit = 15;
                        else if (agent.currentPlan === 'Platinum') limit = 9999;
                        else if (agent.currentPlan === 'Starter') limit = 5;
                        else if (agent.currentPlan === 'Pro') limit = 15;
                        else if (agent.currentPlan === 'Business') limit = 50;
                    }
                }

                if (agent.listingsUsed >= limit) {
                    if (limit === 0) {
                        alert("Premium Membership Required!\nYou need an active Premium Plan to post properties.");
                    } else {
                        alert(`Limit Reached! (${agent.listingsUsed}/${limit})\nYou have used all listings in your ${agent.currentPlan} Plan.\nPlease upgrade to add more.`);
                    }
                    return;
                }
            }
        }
        window.propertyFormStep = 0; // Start at Step 0 (Category Selection) for Add
    }

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    // Set proper modal styling
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    modal.style.zIndex = '9999';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.overflow = 'auto';
    modal.style.padding = '20px';

    renderPropertyForm(true); // Initial Render
}

// Global handler for state change in property form
window.handleStateChange = (select) => {
    if (window.tempFormData) {
        window.tempFormData['p-state'] = select.value;
        window.tempFormData['p-district'] = ''; // Reset district
    }
    renderPropertyForm(); // Re-render to update districts
};

window.renderPropertyForm = (initial = false) => {
    const modal = document.getElementById('modal-container');
    const step = window.propertyFormStep;
    const isEditMode = !!window.editingPropId; // Check if we are in Edit Mode

    // Get existing values if any (to persist during step change)
    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : '';

    // Store current values in a temporary object if we are re-rendering
    if (!window.tempFormData) window.tempFormData = {};

    // Helper to capture data before re-rendering (only needed for multi-step)
    const captureData = () => {
        const inputs = document.querySelectorAll('#add-prop-form input, #add-prop-form select, #add-prop-form textarea');
        inputs.forEach(input => {
            if (input.id) window.tempFormData[input.id] = input.value;
        });
    };
    if (!initial) captureData(); // Capture data unless it's the initial load

    // ---------------------------------------------------------
    // RENDER CONTENT
    // ---------------------------------------------------------
    let contentHtml = '';

    // Unified Form Layout (Same for Add & Edit)
    // We removed the special "isEditMode" single-page layout to ensure
    // the Edit experience matches the Add experience (Multi-step).

    // Step Indicators
    const stepsIndicator = `
            <div style="display:flex; justify-content:space-between; margin-bottom:20px; padding:0 10px;">
                ${[1, 2, 3, 4].map(s => `
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <div style="width:30px; height:30px; border-radius:50%; background:${step >= s ? '#138808' : '#eee'}; color:${step >= s ? 'white' : '#999'}; display:flex; align-items:center; justify-content:center; font-weight:700; margin-bottom:5px;">${s}</div>
                        <span style="font-size:0.7rem; color:${step >= s ? '#138808' : '#999'}; font-weight:${step >= s ? '700' : '400'};">
                            ${s === 1 ? 'Location' : (s === 2 ? 'Details' : (s === 3 ? 'Price' : 'Media'))}
                        </span>
                    </div>
                `).join('<div style="flex:1; height:2px; background:#eee; margin-top:15px;"></div>')}
            </div>
        `;

    // Step 0: Category Selection
    if (step === 0) {
        const cats = (State.settings.propertyTypes || ['Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House']).filter(c => c !== 'All');
        const icons = {
            'Plot': 'fa-map-marked-alt',
            'Rented Room': 'fa-bed',
            'Agricultural Land': 'fa-seedling',
            'Residential': 'fa-home',
            'Commercial': 'fa-building',
            'Villa': 'fa-hotel',
            'Farm House': 'fa-tractor'
        };

        contentHtml = `
            <div style="text-align:center; padding:20px 0;">
                <h3 style="color:#1a2a3a; margin-bottom:10px;">Select Property Type</h3>
                <p style="color:#666; font-size:0.9rem; margin-bottom:30px;">Choose a category to proceed with relevant details.</p>
                
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:15px;">
                    ${cats.map(c => `
                        <div onclick="window.tempFormData['p-cat']='${c}'; window.propertyFormStep = 1; renderPropertyForm();" 
                             style="background:white; border:1px solid #eee; border-radius:15px; padding:20px; text-align:center; cursor:pointer; transition:all 0.2s; box-shadow:0 5px 15px rgba(0,0,0,0.05);"
                             onmouseover="this.style.transform='translateY(-5px)'; this.style.borderColor='#138808'; this.style.boxShadow='0 10px 25px rgba(19,136,8,0.15)';"
                             onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='#eee'; this.style.boxShadow='0 5px 15px rgba(0,0,0,0.05)';">
                            <div style="width:50px; height:50px; background:#e8f5e9; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 15px;">
                                <i class="fas ${icons[c] || 'fa-tag'}" style="color:#138808; font-size:1.5rem;"></i>
                            </div>
                            <div style="font-weight:700; color:#333; font-size:0.95rem;">${c}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    // Step 1: Title & Address (Location)
    else if (step === 1) {
        contentHtml = `
                ${stepsIndicator}
                <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-title" value="Property Title" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <input id="p-title" value="${window.tempFormData['p-title'] || ''}" required placeholder="e.g. 3BHK Luxury Apartment">
                </div>
                
                <!-- State & District -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-state" value="State" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <select id="p-state" onchange="window.handleStateChange(this)">
                            <option value="">Select State</option>
                            ${Object.keys(window.indianStates || {}).map(s => `<option value="${s}" ${window.tempFormData['p-state'] === s ? 'selected' : ''}>${s}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-district" value="District" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <select id="p-district" onchange="window.tempFormData['p-district']=this.value">
                            <option value="">Select District</option>
                            ${(window.indianStates && window.tempFormData['p-state'] ? window.indianStates[window.tempFormData['p-state']] || [] : []).map(d => `<option value="${d}" ${window.tempFormData['p-district'] === d ? 'selected' : ''}>${d}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Area Pincode & City -->
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                     <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-city" value="City/Town" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-city" value="${window.tempFormData['p-city'] || ''}" placeholder="Enter City Name">
                    </div>
                     <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-pincode" value="Pincode" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-pincode" type="number" value="${window.tempFormData['p-pincode'] || ''}" required placeholder="Enter Pincode">
                    </div>
                </div>
            `;
    }
    // Step 2: Property Details (Category, Area, Desc)
    else if (step === 2) {
        const cat = window.tempFormData['p-cat'] || 'Plot';
        const val = (id) => window.tempFormData[id] || '';

        let extraFields = '';

        if (['Rented Room', 'Residential', 'Villa', 'Farm House', 'Flat'].includes(cat)) {
            extraFields = `
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group">
                        <label>Bedrooms / BHK</label>
                        <select id="p-bhk" class="login-input" onchange="window.tempFormData['p-bhk']=this.value" style="padding:12px; border:1px solid #ddd; border-radius:10px; width:100%; background:white;">
                            <option value="">Select</option>
                            <option value="1 RK" ${val('p-bhk') == '1 RK' ? 'selected' : ''}>1 RK</option>
                            <option value="1 BHK" ${val('p-bhk') == '1 BHK' ? 'selected' : ''}>1 BHK</option>
                            <option value="2 BHK" ${val('p-bhk') == '2 BHK' ? 'selected' : ''}>2 BHK</option>
                            <option value="3 BHK" ${val('p-bhk') == '3 BHK' ? 'selected' : ''}>3 BHK</option>
                            <option value="4+ BHK" ${val('p-bhk') == '4+ BHK' ? 'selected' : ''}>4+ BHK</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Bathrooms</label>
                        <input type="number" id="p-bath" value="${val('p-bath')}" placeholder="e.g. 2">
                    </div>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group">
                        <label>Furnishing</label>
                        <select id="p-furnish" class="login-input" onchange="window.tempFormData['p-furnish']=this.value" style="padding:12px; border:1px solid #ddd; border-radius:10px; width:100%; background:white;">
                            <option value="Unfurnished" ${val('p-furnish') == 'Unfurnished' ? 'selected' : ''}>Unfurnished</option>
                            <option value="Semi-Furnished" ${val('p-furnish') == 'Semi-Furnished' ? 'selected' : ''}>Semi-Furnished</option>
                            <option value="Fully-Furnished" ${val('p-furnish') == 'Fully-Furnished' ? 'selected' : ''}>Fully-Furnished</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label>Floor No.</label>
                        <input id="p-floor" value="${val('p-floor')}" placeholder="e.g. 2nd Floor">
                    </div>
                </div>
            `;
        } else if (['Plot', 'Agricultural Land'].includes(cat)) {
            extraFields = `
                 <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                    <div class="form-group">
                        <label>Facing Direction</label>
                        <select id="p-facing" class="login-input" onchange="window.tempFormData['p-facing']=this.value" style="padding:12px; border:1px solid #ddd; border-radius:10px; width:100%; background:white;">
                            <option value="">Select</option>
                            <option value="East" ${val('p-facing') == 'East' ? 'selected' : ''}>East</option>
                             <option value="West" ${val('p-facing') == 'West' ? 'selected' : ''}>West</option>
                              <option value="North" ${val('p-facing') == 'North' ? 'selected' : ''}>North</option>
                               <option value="South" ${val('p-facing') == 'South' ? 'selected' : ''}>South</option>
                                <option value="North-East" ${val('p-facing') == 'North-East' ? 'selected' : ''}>North-East</option>
                                 <option value="South-East" ${val('p-facing') == 'South-East' ? 'selected' : ''}>South-East</option>
                        </select>
                    </div>
                     <div class="form-group">
                        <label>Front Road Width</label>
                        <input id="p-road" value="${val('p-road')}" placeholder="e.g. 20 ft">
                    </div>
                </div>
             `;
        } else if (cat === 'Commercial') {
            extraFields = `
                 <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                    <div class="form-group">
                        <label>Floor No.</label>
                        <input id="p-floor" value="${val('p-floor')}" placeholder="e.g. Ground Floor">
                    </div>
                    <div class="form-group">
                        <label>Furnishing</label>
                         <select id="p-furnish" class="login-input" onchange="window.tempFormData['p-furnish']=this.value" style="padding:12px; border:1px solid #ddd; border-radius:10px; width:100%; background:white;">
                            <option value="Shell" ${val('p-furnish') == 'Shell' ? 'selected' : ''}>Bare Shell</option>
                            <option value="Warm-Shell" ${val('p-furnish') == 'Warm-Shell' ? 'selected' : ''}>Warm Shell</option>
                            <option value="Furnished" ${val('p-furnish') == 'Furnished' ? 'selected' : ''}>Furnished</option>
                        </select>
                    </div>
                </div>
             `;
        }

        contentHtml = `
                ${stepsIndicator}
                 <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-cat" value="Category" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <select id="p-cat">
                            ${(State.settings.propertyTypes || ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House'])
                .filter(c => c !== 'All')
                .map(c => `<option ${window.tempFormData['p-cat'] === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select>
                    </div>
                     <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-area" value="Property Size / Area" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <div style="display:flex; gap:5px;">
                            <input id="p-area" value="${window.tempFormData['p-area'] || ''}" required placeholder="Size" style="flex:1;">
                            <select id="p-area-unit" style="width:80px; padding:8px 2px; border:1px solid #ddd; border-radius:10px; background:white; font-size:0.9rem;" onchange="window.tempFormData['p-area-unit']=this.value">
                                <option value="Sq.ft" ${window.tempFormData['p-area-unit'] === 'Sq.ft' ? 'selected' : ''}>Sq.ft</option>
                                <option value="Katha" ${window.tempFormData['p-area-unit'] === 'Katha' ? 'selected' : ''}>Katha</option>
                                <option value="Bigha" ${window.tempFormData['p-area-unit'] === 'Bigha' ? 'selected' : ''}>Bigha</option>
                                <option value="Acre" ${window.tempFormData['p-area-unit'] === 'Acre' ? 'selected' : ''}>Acre</option>
                                <option value="Decimal" ${window.tempFormData['p-area-unit'] === 'Decimal' ? 'selected' : ''}>Decimal</option>
                                <option value="Gaj" ${window.tempFormData['p-area-unit'] === 'Gaj' ? 'selected' : ''}>Gaj</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                ${extraFields}

                <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-desc" value="Description" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <textarea id="p-desc" rows="5" placeholder="Detailed description of the property...">${window.tempFormData['p-desc'] || ''}</textarea>
                </div>
            `;
    }
    // Step 3: Price & Contact
    else if (step === 3) {
        contentHtml = `
                ${stepsIndicator}
                <div style="display:grid; grid-template-columns:1fr; gap:10px;">
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-price" value="Total Price" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-price" value="${window.tempFormData['p-price'] || ''}" required placeholder="e.g. 50 Lakh">
                    </div>
                     <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-sqft" value="Price per Unit" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <div style="display:flex; gap:5px;">
                            <input id="p-sqft" value="${window.tempFormData['p-sqft'] || ''}" placeholder="Rate" style="flex:1;">
                            <select id="p-unit-type" style="width:80px; padding:8px 2px; border:1px solid #ddd; border-radius:10px; background:white; font-size:0.9rem;" onchange="window.tempFormData['p-unit-type']=this.value">
                                <option value="Sq.ft" ${window.tempFormData['p-unit-type'] === 'Sq.ft' ? 'selected' : ''}>Sq.ft</option>
                                <option value="Katha" ${window.tempFormData['p-unit-type'] === 'Katha' ? 'selected' : ''}>Katha</option>
                                <option value="Bigha" ${window.tempFormData['p-unit-type'] === 'Bigha' ? 'selected' : ''}>Bigha</option>
                                <option value="Acre" ${window.tempFormData['p-unit-type'] === 'Acre' ? 'selected' : ''}>Acre</option>
                                <option value="Decimal" ${window.tempFormData['p-unit-type'] === 'Decimal' ? 'selected' : ''}>Decimal</option>
                                <option value="Gaj" ${window.tempFormData['p-unit-type'] === 'Gaj' ? 'selected' : ''}>Gaj</option>
                            </select>
                        </div>
                    </div>
                </div>
                 <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-mobile" value="Mobile Number" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <input id="p-mobile" type="tel" value="${window.tempFormData['p-mobile'] || ''}" required placeholder="10 Digit Mobile">
                </div>
                 <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-whatsapp" value="WhatsApp Number" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <input id="p-whatsapp" type="tel" value="${window.tempFormData['p-whatsapp'] || ''}" required placeholder="WhatsApp Number">
                </div>
            `;
    }
    // Step 4: Media (Photos, Video, Map)
    else if (step === 4) {
        contentHtml = `
                ${stepsIndicator}
                 <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-img" value="Property Images" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <div id="image-preview-container" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; min-height:80px; background:#f9f9f9; border-radius:10px; padding:10px; border:1px dashed #ddd;"></div>
                    <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                        <div style="display:flex; gap:8px;">
                            <input id="p-img-url-input" placeholder="Paste Image URL" style="flex:1; padding:10px; border:1px solid #ccc; border-radius:8px;">
                            <button type="button" class="prop-btn" style="width:auto; background:#1a2a3a; font-size:0.8rem;" onclick="addUrlImage()">Add URL</button>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; color:#999; font-size:0.8rem;">
                            <div style="flex:1; height:1px; background:#ddd;"></div> OR <div style="flex:1; height:1px; background:#ddd;"></div>
                        </div>
                        <input type="file" id="p-img-single" accept="image/*" style="display:none;" onchange="addSingleImage(this)">
                        <button type="button" id="add-image-btn" class="prop-btn" style="background:#e8f5e9; color:#138808; border:2px dashed #138808;" onclick="document.getElementById('p-img-single').click()">
                            <i class="fas fa-camera"></i> Upload from Gallery (<span id="img-count">${window.tempPropertyImages.length}</span>/5)
                        </button>
                    </div>
                </div>
                <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-video" value="YouTube Link (Optional)" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <input id="p-video" value="${window.tempFormData['p-video'] || ''}" placeholder="https://youtube.com/...">
                </div>
                <div class="form-group">
                    <div class="label-edit-wrap"><input class="editable-label" id="l-map" value="Map Link (Optional)" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                    <input id="p-map" value="${window.tempFormData['p-map'] || ''}" placeholder="Google Maps Link">
                </div>
                 <div id="extra-fields-area"></div>
                 <button type="button" class="prop-btn" style="background:#f0f0f0; color:#1a2a3a; margin-bottom:20px; border:2px dashed #ccc;" onclick="addCustomField()">
                    <i class="fas fa-plus"></i> Add Info Field
                </button>
            `;
    }


    modal.innerHTML = `
        <div style="
            background: white;
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
            overflow: hidden;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
        ">
            <!-- Header -->
            <div style="
                background: linear-gradient(135deg, #138808 0%, #0d5c05 100%);
                color: white;
                padding: 20px;
                text-align: center;
                flex-shrink: 0;
            ">
                <h3 style="margin: 0; font-size: 1.4rem; font-weight: 700;">${isEditMode ? 'EDIT PROPERTY' : 'ADD PROPERTY'}</h3>
                ${isEditMode ? '<p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Modify Property Details</p>' : `<p style="margin: 8px 0 0 0; opacity: 0.9; font-size: 0.9rem;">Step ${step} of 4</p>`}
            </div>
            
            <!-- Scrollable Content -->
            <div style="
                flex: 1;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 25px;
                -webkit-overflow-scrolling: touch;
            ">
                <form id="add-prop-form">
                    ${contentHtml}

                    <div style="display:flex; gap:10px; margin-top:25px;">
                        ${step > 0 ? `<button type="button" class="login-btn" style="background:#ddd; color:#333; flex:1;" onclick="prevPropStep()"><i class="fas fa-arrow-left"></i> Previous</button>` : ''}
                        
                         ${step < 4 ?
            `<button type="button" class="login-btn" style="flex:1;" onclick="nextPropStep()">Next <i class="fas fa-arrow-right"></i></button>` :
            (isEditMode ?
                `<button type="button" class="login-btn" style="flex:1;" onclick="window.processPropertySubmit()">UPDATE PROPERTY</button>` :
                `<button type="button" class="login-btn" style="flex:1;" onclick="window.processPropertySubmit()">Submit Property</button>`)
        }
                    </div>
                </form>
            </div>
            
            <!-- Cancel Button -->
            <button type="button" onclick="closePropertyModal()" style="
                background: white;
                color: #D32F2F;
                border: none;
                border-top: 2px solid #eee;
                padding: 18px;
                font-weight: 700;
                font-size: 1rem;
                cursor: pointer;
                flex-shrink: 0;
                transition: background 0.2s;
            " onmouseover="this.style.background='#ffebee'" onmouseout="this.style.background='white'">
                CANCEL
            </button>
        </div>
    `;

    // Re-attach images if on step 4 or Edit Mode
    if (step === 4 || isEditMode) {
        updateImagePreviews();
        updateImageCount();

        // Populate custom fields if any
        const details = window.tempFormData['extraDetails'];
        const container = document.getElementById('extra-fields-area');
        if (details && Array.isArray(details) && container && container.children.length === 0) {
            details.forEach(d => {
                if (window.addCustomField) window.addCustomField(d.label || d.title, d.value);
            });
        }
    }
}

window.closePropertyModal = () => {
    const modal = document.getElementById('modal-container');
    if (modal) modal.style.display = 'none';
};

window.nextPropStep = () => {
    // Validate current step
    const inputs = document.querySelectorAll('#add-prop-form input[required], #add-prop-form select');
    let valid = true;
    inputs.forEach(i => {
        // Skip validation for hidden/disabled inputs
        if (i.disabled || i.style.display === 'none') return;

        if (!i.value.trim()) {
            i.style.borderColor = 'red';
            valid = false;
        } else {
            i.style.borderColor = '#ddd';
        }
    });

    // Specific check for district if state is selected
    if (window.propertyFormStep === 1) {
        const stateVal = document.getElementById('p-state').value;
        const districtEl = document.getElementById('p-district');
        if (stateVal && !districtEl.value) {
            districtEl.style.borderColor = 'red';
            valid = false;
        }
    }

    if (!valid) return alert("Please fill all required fields.");

    // Save current data
    const allInputs = document.querySelectorAll('#add-prop-form input, #add-prop-form select, #add-prop-form textarea');
    if (!window.tempFormData) window.tempFormData = {};
    allInputs.forEach(input => {
        if (input.id) window.tempFormData[input.id] = input.value;
    });

    window.propertyFormStep++;
    renderPropertyForm();
}

window.prevPropStep = () => {
    // Save current data even when going back
    const allInputs = document.querySelectorAll('#add-prop-form input, #add-prop-form select, #add-prop-form textarea');
    if (!window.tempFormData) window.tempFormData = {};
    allInputs.forEach(input => {
        if (input.id) window.tempFormData[input.id] = input.value;
    });

    window.propertyFormStep--;
    renderPropertyForm();
}

// Enable label editing when pen icon is clicked
window.enableLabelEdit = function (iconEl) {
    const wrapper = iconEl.parentElement;
    const input = wrapper.querySelector('.editable-label');

    if (input.hasAttribute('readonly')) {
        // Enable editing
        input.removeAttribute('readonly');
        input.style.borderColor = '#138808';
        input.style.background = '#e8f5e9';
        input.focus();
        input.select();

        // Change icon to check
        iconEl.className = 'fas fa-check label-edit-icon';
        iconEl.style.color = '#138808';
    } else {
        // Save and disable editing
        input.setAttribute('readonly', true);
        input.style.borderColor = 'transparent';
        input.style.background = 'transparent';

        // Change icon back to pen
        iconEl.className = 'fas fa-pen label-edit-icon';
        iconEl.style.color = '#999';
    }
};

window.addCustomField = (titleStr = "New Detail Title", valStr = "") => {
    const container = document.getElementById('extra-fields-area');
    if (!container) return;

    const id = Date.now();
    const div = document.createElement('div');
    div.className = 'form-group extra-field-group';
    div.style.cssText = 'position: relative; border: 1px solid #eee; padding: 15px; padding-top: 20px; border-radius: 10px; margin-bottom: 15px; background: #f9f9f9;';
    div.innerHTML = `
        <button type="button" onclick="this.parentElement.remove()" style="position: absolute; top: 8px; right: 8px; background: #D32F2F; color: white; border: none; border-radius: 50%; width: 26px; height: 26px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; box-shadow: 0 2px 5px rgba(211,47,47,0.3); z-index: 10;">
            <i class="fas fa-times"></i>
        </button>
        <div style="margin-bottom: 10px; padding-right: 35px;">
            <div class="label-edit-wrap" style="position: relative; display: flex; align-items: center; gap: 8px; background: white; padding: 8px 12px; border-radius: 8px; border: 1px solid #ddd;">
                <input type="text" class="editable-label custom-title-${id}" value="${titleStr}" placeholder="e.g. Parking, Furnishing" readonly style="flex: 1; color: #138808; font-weight: 600; border: none; background: transparent; padding: 0; font-size: 1rem; outline: none;">
                <i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)" style="color: #999; font-size: 0.9rem; flex-shrink: 0; cursor: pointer; transition: color 0.2s;" onmouseover="this.style.color='#138808'" onmouseout="this.style.color='#999'"></i>
            </div>
        </div>
        <div>
            <label style="font-size: 0.85rem; color: #666; font-weight: 600; display: block; margin-bottom: 5px;">Field Value</label>
            <input type="text" class="extra-field-value" value="${valStr}" placeholder="e.g. Available, Fully Furnished" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; font-size: 0.95rem; cursor: text;">
        </div>
    `;
    container.appendChild(div);

    // Auto-focus and enable edit mode only if it is a NEW field
    if (titleStr === "New Detail Title") {
        setTimeout(() => {
            const titleInput = div.querySelector(`.custom-title-${id}`);
            const penIcon = titleInput?.nextElementSibling;
            if (titleInput && penIcon) {
                // Trigger edit mode
                enableLabelEdit(penIcon);
                titleInput.focus();
                titleInput.select();
            }
        }, 100);
    }
};

// Handle City Select Change
window.toggleCityInput = (selectEl) => {
    const inputEl = document.getElementById('p-city');
    if (selectEl.value === 'Other') {
        inputEl.style.display = 'block';
        inputEl.value = '';
        inputEl.focus();
    } else {
        inputEl.style.display = 'none';
        inputEl.value = selectEl.value;
    }
};

window.showPropertyModal = showPropertyModal;

// Temporary storage for images during property add
window.tempPropertyImages = [];

// NEW: Add image from URL input
window.addUrlImage = function () {
    const input = document.getElementById('p-img-url-input');
    const url = input.value.trim();

    if (!url) {
        alert("Please enter a valid Image URL first.");
        return;
    }

    if (window.tempPropertyImages.length >= 5) {
        alert('Maximum 5 images allowed!');
        return;
    }

    // Basic URL check
    if (!url.match(/\.(jpeg|jpg|gif|png|webp)$/i) && !url.includes('imgur') && !url.includes('ibb')) {
        // Just a warning, still allow it as some CDNs don't have extensions
        console.warn('URL might not be an image');
    }

    window.tempPropertyImages.push(url);
    updateImagePreviews();
    updateImageCount();
    input.value = ''; // Clear input
};

// Add single image function
window.addSingleImage = function (input) {
    if (!input.files || !input.files[0]) return;

    if (window.tempPropertyImages.length >= 5) {
        alert('Maximum 5 images allowed!');
        input.value = '';
        return;
    }

    const file = input.files[0];
    if (file.size > 5 * 1024 * 1024) {
        alert('Image too large! Maximum 5MB per image.');
        input.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        window.tempPropertyImages.push(e.target.result);
        updateImagePreviews();
        updateImageCount();
    };
    reader.readAsDataURL(file);
    input.value = ''; // Reset input to allow same file again
};

// Remove image from preview
window.removePropertyImage = function (index) {
    window.tempPropertyImages.splice(index, 1);
    updateImagePreviews();
    updateImageCount();
};

// Update image previews display
window.updateImagePreviews = function () {
    const container = document.getElementById('image-preview-container');
    if (!container) return;

    container.innerHTML = window.tempPropertyImages.map((img, idx) => `
        <div style="position:relative; width:70px; height:70px; border-radius:10px; overflow:hidden; border:2.5px solid ${idx === 0 ? '#138808' : '#ddd'}; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
            <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
            ${idx === 0 ? '<span style="position:absolute; bottom:0; left:0; right:0; background:#138808; color:white; font-size:0.55rem; text-align:center; padding:2px; font-weight:700;">MAIN</span>' : ''}
            <div style="position:absolute; top:-5px; right:-5px; background:#D32F2F; color:white; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:0.7rem; box-shadow:0 2px 5px rgba(0,0,0,0.3);" onclick="removePropertyImage(${idx})">
                <i class="fas fa-times"></i>
            </div>
        </div>
    `).join('');
};

// Update image count display
window.updateImageCount = function () {
    const countEl = document.getElementById('img-count');
    const addBtn = document.getElementById('add-image-btn');
    if (countEl) countEl.textContent = window.tempPropertyImages.length;

    if (addBtn) {
        if (window.tempPropertyImages.length >= 5) {
            addBtn.style.display = 'none';
        } else {
            addBtn.style.display = 'block';
        }
    }
};

window.processPropertySubmit = async function () {
    if (window.isRealTaskRunning) return;

    // Final sanity check for user
    if (!State.user) {
        alert("Session expired. Please login again.");
        navigate('login');
        return;
    }

    // Basic validation check
    // Sync current step data first
    const allSyncInputs = document.querySelectorAll('#add-prop-form input, #add-prop-form select, #add-prop-form textarea');
    if (!window.tempFormData) window.tempFormData = {};
    allSyncInputs.forEach(input => {
        if (input.id) window.tempFormData[input.id] = input.value;
    });

    const getValCheck = (id) => window.tempFormData[id] ? window.tempFormData[id].trim() : '';

    // Validation
    if (!getValCheck('p-title')) return alert("Please fill the Title field.");
    if (!getValCheck('p-state')) return alert("Please select a State.");
    if (!getValCheck('p-district')) return alert("Please select a District.");
    if (!getValCheck('p-pincode')) return alert("Please fill the Pincode field.");
    if (!getValCheck('p-city')) return alert("Please fill the City field.");

    if (!getValCheck('p-price')) return alert("Please fill the Price field.");
    if (!getValCheck('p-area')) return alert("Please fill the Size/Area field.");
    if (!getValCheck('p-mobile')) return alert("Please fill the Mobile field.");
    if (!getValCheck('p-whatsapp')) return alert("Please fill the WhatsApp field.");

    // Check if at least one image is added
    if (!window.tempPropertyImages || window.tempPropertyImages.length === 0) {
        alert("Please add at least one property image.");
        return;
    }

    // Customer Payment Logic (Charge Rs. 99 for Self Listing)
    if (State.user.role === 'customer' && !window.editingPropId) {
        const customer = State.customers.find(c => c.id === State.user.id);
        if (!customer) return alert("Customer not found."); // Should not happen if logged in

        if ((customer.wallet || 0) < 99) {
            alert("Insufficient Wallet Balance! Listing Charge: Rs. 99.\nPlease recharge your wallet.");
            return;
        }

        if (!confirm("Confirm Listing Charge: Rs. 99 will be deducted from your wallet.\nProceed?")) return;

        // Deduct
        customer.wallet = (customer.wallet || 0) - 99;

        // Record Transaction
        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now() + 1, // +1 to ensure unique if fast
            customerId: customer.id,
            amount: 99,
            type: 'debit',
            remark: 'Property Listing Fees (Rs. 99)',
            date: new Date().toLocaleString(),
            status: 'success'
        });
    }

    window.isRealTaskRunning = true;
    showGlobalLoader("प्रॉपर्टी अपलोड की जा रही है... (Images: " + window.tempPropertyImages.length + ")");

    try {
        // Use images from tempPropertyImages (already base64)
        const allImages = window.tempPropertyImages;

        // Ensure form data is synced one last time if we are on the final step
        const allInputs = document.querySelectorAll('#add-prop-form input, #add-prop-form select, #add-prop-form textarea');
        if (!window.tempFormData) window.tempFormData = {};
        allInputs.forEach(input => {
            if (input.id) window.tempFormData[input.id] = input.value;
        });

        // Determine ID: Use existing if editing, else generate new
        let newId = window.editingPropId;
        let existingProp = null;

        if (newId) {
            existingProp = State.properties.find(p => p.id == newId);
        } else {
            const existingIds = State.properties.map(p => p.id);
            do {
                newId = Math.floor(1000 + Math.random() * 9000);
            } while (existingIds.includes(newId));
        }

        const getVal = (id) => window.tempFormData[id] ? window.tempFormData[id].trim() : '';
        const getRaw = (id) => window.tempFormData[id] || '';

        const propData = {
            id: newId,
            title: getVal('p-title'),
            state: getVal('p-state'),
            district: getVal('p-district'),
            city: getVal('p-city'),
            pincode: getVal('p-pincode'),
            category: getRaw('p-cat'),
            price: getVal('p-price'),
            area: getVal('p-area'),
            areaUnit: getVal('p-area-unit') || 'Sq.ft', // NEW FIELD to store area unit
            priceSqft: getVal('p-sqft'),
            priceUnit: getVal('p-unit-type') || 'Sq.ft', // NEW FIELD to store unit type
            mobile: getVal('p-mobile'),
            whatsapp: getVal('p-whatsapp'),
            description: getVal('p-desc'),
            image: allImages[0],
            images: allImages,
            video: getVal('p-video'),
            map: getVal('p-map'),
            // Save new fields
            bhk: getVal('p-bhk'),
            bathrooms: getVal('p-bath'),
            furnishing: getVal('p-furnish'),
            floor: getVal('p-floor'),
            facing: getVal('p-facing'),
            roadWidth: getVal('p-road'),
            map: getVal('p-map'),
            // Preserve status if editing, else default
            // If Admin: preserve existing status or approve. Else (Agent/Customer): always set to pending for approval
            status: State.user.role === 'admin' ? (existingProp ? existingProp.status : 'approved') : 'pending',
            agent: State.user.name || 'Unknown Agent',
            agentId: State.user.id,
            role: State.user.role || 'customer',
            featured: existingProp ? existingProp.featured : false,
            views: existingProp ? existingProp.views : 0,
            leads: existingProp ? existingProp.leads : 0,
            createdTimestamp: existingProp ? existingProp.createdTimestamp : Date.now(),
            showAgentContact: existingProp ? existingProp.showAgentContact : false,
            createdAt: existingProp ? existingProp.createdAt : new Date().toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }),
            labels: {
                title: getVal('l-title') || 'Property Title',
                state: getVal('l-state') || 'State',
                district: getVal('l-district') || 'District',
                city: getVal('l-city') || 'City',
                pincode: getVal('l-pincode') || 'Area Pincode',
                category: getVal('l-cat') || 'Category',
                price: getVal('l-price') || 'Total Price',
                area: getVal('l-area') || 'Size / Area',
                sqft: getVal('l-sqft') || 'Price per Sq.ft',
                mobile: getVal('l-mobile') || 'Mobile Number',
                whatsapp: getVal('l-whatsapp') || 'WhatsApp Number',
                video: getVal('l-video') || 'YouTube Link',
                map: getVal('l-map') || 'Map Link'
            },
            extraDetails: Array.from(document.querySelectorAll('.extra-field-group')).map(div => ({
                label: div.querySelector('.editable-label').value.trim(),
                value: div.querySelector('.extra-field-value').value.trim()
            }))
        };

        // Sanitize data based on category (remove fields that don't belong)
        const cat = propData.category;
        if (['Plot', 'Agricultural Land'].includes(cat)) {
            propData.bhk = null;
            propData.bathrooms = null;
            propData.furnishing = null;
            propData.floor = null;
        } else if (['Commercial'].includes(cat)) {
            propData.bhk = null;
            propData.bathrooms = null;
            propData.facing = null;
            propData.roadWidth = null;
        } else {
            // Residential, Villa, Rented Room, etc.
            propData.facing = null;
            propData.roadWidth = null;
        }

        // Add new city to admin list if it's new
        if (propData.city && !State.settings.cities?.includes(propData.city)) {
            if (!State.settings.cities) State.settings.cities = [];
            State.settings.cities.push(propData.city);
        }

        if (existingProp) {
            // Update existing property
            Object.assign(existingProp, propData);
        } else {
            // Create new property
            if (!State.properties) State.properties = [];
            State.properties.push(propData);

            // Increment Usage Count for Agent
            if (State.user.role === 'agent') {
                const agent = State.agents.find(a => a.id === State.user.id);
                if (agent) {
                    if (!agent.listingsUsed) agent.listingsUsed = 0;
                    agent.listingsUsed++;
                }
            }
        }

        await saveGlobalData();

        hideGlobalLoader(existingProp ? "प्रॉपर्टी अपडेट सफल!" : "प्रॉपर्टी सफलतापूर्वक अपलोड!");

        setTimeout(() => {
            window.tempPropertyImages = []; // Reset images array
            closeModal();
            render();
            if (existingProp) {
                // No alert needed for simple update, usually
                // But maybe good to confirm
            } else if (State.user.role === 'agent') {
                setAgentTab('properties');
                alert(`Success: Property submitted for approval!\nProperty ID: BD-${newId}\nStatus: Pending Approval`);
            } else if (State.user.role === 'customer') {
                alert(`Success! Your property has been submitted.\nIt will be visible after Admin approval.\nProperty ID: BD-${newId}`);
            } else {
                alert(`Success: Property has been added!\\nProperty ID: BD-${newId}`);
            }
        }, 200);

    } catch (err) {
        console.error("Critical Upload Error:", err);
        hideGlobalLoader(null);
        setTimeout(() => alert("Error: Connection issue or memory full. Please try again."), 200);
    } finally {
        window.isRealTaskRunning = false;
    }
};

function editProperty(id) {
    // Redirect to main property form for editing (same design as Add Property)
    showPropertyModal(id);
    return;

    // OLD SIMPLIFIED EDIT LOGIC BELOW (Deprecated but kept for reference if needed, though unreachable now)
    const p = State.properties.find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.style.display = 'flex';

    // Check for admin role
    const isAdmin = State.user && State.user.role === 'admin';
    const allImages = p.images || [p.image]; // Fallback to single image if array missing

    modal.innerHTML = `

        <div class="modal-content scale-in" style="display:flex; flex-direction:column; padding:0 !important; max-height:85vh; overflow:hidden;">
            <div class="prop-form-header" style="flex-shrink:0; margin:0; border-radius:0;">
                <h3>Edit Property</h3>
            </div>
            <div style="overflow-y:auto; padding:20px; flex:1;">
                <form id="edit-prop-form">
                    <div class="form-group"><label>Title</label><input id="pe-title" value="${p.title}" required></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div class="form-group"><label>City</label><input id="pe-city" value="${p.city}" required></div>
                        <div class="form-group"><label>Pincode</label><input id="pe-pincode" value="${p.pincode || ''}" required></div>
                    </div>
                    <div class="form-group"><label>Category</label><select id="pe-cat">
                            ${(State.settings.propertyTypes || ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House'])
            .filter(c => c !== 'All')
            .map(c => `<option ${p.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                        </select></div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div class="form-group"><label>Total Price</label><input id="pe-price" value="${p.price}" required></div>
                        <div class="form-group"><label>Area (Sq.ft/Bigha)</label><input id="pe-area" value="${p.area}" required></div>
                    </div>
                    <div class="form-group"><label>Price per Sq.ft</label><input id="pe-sqft" value="${p.priceSqft}" required></div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div class="form-group"><label>Mobile Number</label><input id="pe-mobile" type="tel" value="${p.mobile || ''}" required></div>
                        <div class="form-group"><label>WhatsApp Number</label><input id="pe-whatsapp" type="tel" value="${p.whatsapp || ''}" required></div>
                    </div>
                    <div class="form-group"><label>Description</label><textarea id="pe-desc" rows="3">${p.description}</textarea></div>
                    <div class="form-group"><label>YouTube Link</label><input id="pe-video" value="${p.video || ''}"></div>
                    <div class="form-group"><label>Map Link</label><input id="pe-map" value="${p.map || ''}"></div>

                    ${isAdmin ? `
                        <div style="margin-top:20px; padding-top:20px; border-top:1px solid #eee;">
                            <h4 style="margin-bottom:10px; color:#D32F2F;">Admin: Edit Images</h4>
                            <div class="form-group">
                                <label>Main Image URL</label>
                                <input id="pe-img-main" value="${allImages[0] || ''}" placeholder="Main Image URL">
                            </div>
                            <div id="pe-extra-images">
                                ${allImages.slice(1).map((img, idx) => `
                                    <div class="form-group">
                                        <label>Image ${idx + 2} URL</label>
                                        <input class="pe-img-extra" value="${img}" placeholder="Image URL">
                                    </div>
                                `).join('')}
                            </div>
                            <button type="button" class="prop-btn" style="background:#eee; color:#333; margin-top:5px;" onclick="addExtraImageField()">+ Add Another Image</button>
                        </div>
                    ` : ''}

                    <button type="submit" class="login-btn">Update Details</button>
                    <button type="button" class="prop-btn" style="background:#D32F2F; color:white; margin-top:10px; padding:15px; font-weight:800; border-radius:12px;" onclick="closeModal()">CLOSE</button>
                </form>
            </div>
        </div > `;
    document.getElementById('edit-prop-form').onsubmit = (e) => {
        e.preventDefault();
        p.title = document.getElementById('pe-title').value;
        p.city = document.getElementById('pe-city').value;
        p.pincode = document.getElementById('pe-pincode').value;
        p.category = document.getElementById('pe-cat').value;
        p.price = document.getElementById('pe-price').value;
        p.area = document.getElementById('pe-area').value;
        p.priceSqft = document.getElementById('pe-sqft').value;
        p.mobile = document.getElementById('pe-mobile').value;
        p.whatsapp = document.getElementById('pe-whatsapp').value;
        p.description = document.getElementById('pe-desc').value;
        p.video = document.getElementById('pe-video').value;
        p.map = document.getElementById('pe-map').value;

        // Admin Image Update Logic
        if (isAdmin) {
            const mainImg = document.getElementById('pe-img-main').value.trim();
            const extraImgs = Array.from(document.querySelectorAll('.pe-img-extra')).map(i => i.value.trim()).filter(x => x);

            if (mainImg) {
                p.image = mainImg;
                p.images = [mainImg, ...extraImgs];
            } else if (extraImgs.length > 0) {
                p.image = extraImgs[0];
                p.images = extraImgs;
            }
        }

        // If agent edits an approved property, send it back for admin approval
        if (State.user && State.user.role === 'agent' && p.status === 'approved') {
            p.status = 'pending';
            p.editedAt = new Date().toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });
            p.editedBy = State.user.name || 'Agent';
        }

        showGlobalLoader("अपडेट किया जा रहा है...");
        saveGlobalData().then(() => {
            hideGlobalLoader("अपडेट सफल!");
            closeModal();
            render();

            // Show appropriate message based on user role
            if (State.user && State.user.role === 'agent') {
                setTimeout(() => alert("Property updated! It has been sent for Admin approval again."), 200);
            }
        }).catch(err => {
            console.error(err);
            hideGlobalLoader(null);
            setTimeout(() => alert("Update failed."), 200);
        });
    };
}

window.openSearchModal = () => {
    const modal = document.getElementById('modal-container');
    const states = Object.keys(INDIA_LOCATIONS).sort();

    // Get current search state or defaults
    const sState = State.searchState || '';
    const sDistrict = State.searchDistrict || '';
    const districts = sState ? (INDIA_LOCATIONS[sState] || []).sort() : [];

    // Get cities filtered by state and district
    let filteredCities = State.properties.map(p => p.city).filter(c => c && c.trim());

    if (sState) {
        filteredCities = State.properties
            .filter(p => p.state === sState)
            .map(p => p.city)
            .filter(c => c && c.trim());
    }

    if (sDistrict) {
        filteredCities = State.properties
            .filter(p => p.state === sState && p.district === sDistrict)
            .map(p => p.city)
            .filter(c => c && c.trim());
    }

    const allCities = [...new Set(filteredCities)].sort();

    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-height:90vh; display:flex; flex-direction:column; overflow:hidden;">
            <h3 style="margin-bottom:20px; color:#138808; text-align:center;">Find Your Property</h3>

            <div style="overflow-y:auto; flex:1; padding-right:5px;">
                <div class="form-group">
                    <label>State</label>
                    <select id="search-state" class="login-input" onchange="updateSearchDistricts(this)">
                        <option value="">All States</option>
                        ${states.map(s => `<option value="${s}" ${sState === s ? 'selected' : ''}>${s}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>District</label>
                    <select id="search-district" class="login-input" ${!sState ? 'disabled' : ''} onchange="updateSearchCities()">
                        <option value="">All Districts</option>
                        ${districts.map(d => `<option value="${d}" ${sDistrict === d ? 'selected' : ''}>${d}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>City / Location</label>
                    <select id="search-city" class="login-input">
                        <option value="">All Cities</option>
                        ${allCities.map(c => `<option value="${c}" ${State.homeSearch === c ? 'selected' : ''}>${c}</option>`).join('')}
                    </select>
                </div>

                <div class="form-group">
                    <label>Property Type</label>
                    <select id="search-type" class="login-input">
                        <option value="">All Types</option>
                        ${(State.settings.propertyTypes || []).map(t => `<option value="${t}" ${State.searchType === t ? 'selected' : ''}>${t}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div style="padding-top:15px; border-top:1px solid #eee; margin-top:10px;">
                <button class="login-btn" onclick="applySearch()" style="width:100%; margin-bottom:10px;">
                    <i class="fas fa-search"></i> Search Properties
                </button>
                <button class="prop-btn" onclick="closeModal()" style="width:100%; padding:15px; border:none; color:#666; background:#f5f5f5;">Cancel</button>
            </div>
        </div>
    `;
    modal.style.display = 'flex';
};

window.updateSearchDistricts = (stateSelect) => {
    const val = stateSelect.value;
    const districtSelect = document.getElementById('search-district');

    // Update State in memory
    State.searchState = val;
    State.searchDistrict = ''; // Reset district when state changes

    if (!val) {
        districtSelect.innerHTML = '<option value="">All Districts</option>';
        districtSelect.disabled = true;
        updateSearchCities(); // Update cities when state is cleared
        return;
    }

    const districts = (INDIA_LOCATIONS[val] || []).sort();
    districtSelect.innerHTML = '<option value="">All Districts</option>' +
        districts.map(d => `<option value="${d}">${d}</option>`).join('');
    districtSelect.disabled = false;

    updateSearchCities(); // Update cities when state changes
};

window.updateSearchCities = () => {
    const stateVal = document.getElementById('search-state').value;
    const districtVal = document.getElementById('search-district').value;
    const citySelect = document.getElementById('search-city');

    // Update District in memory
    State.searchDistrict = districtVal;

    // Filter cities based on state and district
    let filteredCities = State.properties.map(p => p.city).filter(c => c && c.trim());

    if (stateVal) {
        filteredCities = State.properties
            .filter(p => p.state === stateVal)
            .map(p => p.city)
            .filter(c => c && c.trim());
    }

    if (districtVal) {
        filteredCities = State.properties
            .filter(p => p.state === stateVal && p.district === districtVal)
            .map(p => p.city)
            .filter(c => c && c.trim());
    }

    const uniqueCities = [...new Set(filteredCities)].sort();

    citySelect.innerHTML = '<option value="">All Cities</option>' +
        uniqueCities.map(c => `<option value="${c}">${c}</option>`).join('');
};

window.applySearch = () => {
    const stateVal = document.getElementById('search-state').value;
    const districtVal = document.getElementById('search-district').value;
    const cityVal = document.getElementById('search-city').value;
    const typeVal = document.getElementById('search-type').value;

    State.searchState = stateVal;
    State.searchDistrict = districtVal;
    State.homeSearch = cityVal;
    State.searchType = typeVal;

    closeModal();
    render(); // Main render will handle the filtering
};

function closeModal() { document.getElementById('modal-container').style.display = 'none'; }

// Helpers
// Helpers
// Optimized Image Compression & Conversion (Reduces data size drastically)
const toBase64 = (file, maxWidth = 800, quality = 0.5) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;

            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxWidth) {
                    width *= maxWidth / height;
                    height = maxWidth;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Compress as JPEG
            const dataUrl = canvas.toDataURL('image/jpeg', quality);
            resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
    };
    reader.onerror = error => reject(error);
});

window.playPropertyVideo = (videoId, containerId) => {
    // Open YouTube app/site directly since embedding is restricted for some videos or causing errors
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
};

function getYouTubeID(input) {
    if (!input) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = input.match(regExp);
    return (match && match[2].length === 11) ? match[2] : input;
}

function logout() {
    State.user = null;
    // Revert to guest likes
    const parsed = JSON.parse(localStorage.getItem('bhumi_v2_state'));
    State.likes = parsed?.guestLikes || [];
    saveGlobalData();
    navigate('home');
}
function approveProperty(id) {
    const p = State.properties.find(x => x.id === id);
    if (!p) return;

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Approve Property</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">
                Property: <strong>${p.title}</strong><br>
                Agent: <strong>${p.agent}</strong><br>
                Mobile: <strong>${p.mobile || 'N/A'}</strong><br>
                WhatsApp: <strong>${p.whatsapp || 'N/A'}</strong>
            </p>
            <p style="font-size: 0.8rem; color: #138808; margin-bottom: 20px;">
                Note: The contact numbers provided by the agent (${p.mobile}) will be displayed to customers.
            </p>
            <button class="login-btn" onclick="confirmApproveProperty(${p.id})" style="background:#138808;">Approve Property</button>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>`;
}

function confirmApproveProperty(id) {
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'approved';
        delete p.disableReason;
        saveGlobalData();
        closeModal();
        render();
        alert(`Property approved successfully!`);
    }
}
function markAsSold(id) {
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'sold';
        saveGlobalData();
        render();
        alert("Property marked as SOLD and hidden from app.");
    }
}
function markAsUnsold(id) {
    if (State.user.role !== 'admin') return alert("Only Admin can mark a property as Unsold.");
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'approved';
        saveGlobalData();
        render();
        alert("Property marked as UNSOLD and re-enabled.");
    }
}

function deleteProperty(id) {
    const p = State.properties.find(x => x.id === id);
    if (!p) return;

    if (confirm(`Are you sure you want to PERMANENTLY DELETE this property?\n\nTitle: ${p.title}\nCity: ${p.city}\n\nThis action CANNOT be undone!`)) {
        showGlobalLoader("Deleting property...");

        // Remove from State
        State.properties = State.properties.filter(x => x.id !== id);

        // Save and refresh
        saveGlobalData().then(() => {
            hideGlobalLoader("Property Deleted!");
            render();
            setTimeout(() => alert("Property has been permanently deleted."), 300);
        });
    }
}
function disableProperty(id) {
    const p = State.properties.find(x => x.id === id);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Disable Property</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">Please provide a reason for disabling <strong>${p.title}</strong></p>
            <div class="form-group">
                <label>Reason / Remark</label>
                <textarea id="disable-remark" class="login-input" style="height:100px; padding:10px;" placeholder="Enter reason here..."></textarea>
            </div>
            <button class="login-btn" onclick="confirmDisable(${p.id})" style="background:#D32F2F;">Disable Now</button>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>`;
}
function confirmDisable(id) {
    const remark = document.getElementById('disable-remark').value;
    if (!remark) return alert("Please enter a reason");
    const p = State.properties.find(x => x.id === id);
    if (p) {
        p.status = 'disabled';
        p.disableReason = remark;
        saveGlobalData();
        closeModal();
        render();
    }
}

// --- Customer Management ---
window.editCustomer = (id) => {
    const c = State.customers.find(x => x.id === id);
    if (!c) return;
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; width:90%;">
            <h3 style="margin-bottom:20px;">Edit Customer</h3>
            <div class="form-group"><label>Name</label><input id="ec-name" value="${c.name}" class="login-input"></div>
            <div class="form-group"><label>Phone</label><input id="ec-phone" value="${c.phone}" class="login-input"></div>
            <div class="form-group"><label>Email</label><input id="ec-email" value="${c.email}" class="login-input"></div>
            <div class="form-group"><label>Password</label><input id="ec-pass" value="${c.password}" class="login-input"></div>
            <button class="login-btn" onclick="saveCustomer(${c.id})" style="background:#138808; margin-top:10px;">Save Changes</button>
            <button class="prop-btn" style="background:none; color:#D32F2F; width:100%;" onclick="closeModal()">Cancel</button>
        </div>
    `;
};

window.saveCustomer = (id) => {
    const c = State.customers.find(x => x.id === id);
    if (c) {
        c.name = document.getElementById('ec-name').value;
        c.phone = document.getElementById('ec-phone').value;
        c.email = document.getElementById('ec-email').value;
        c.password = document.getElementById('ec-pass').value;
        saveGlobalData();
        closeModal();
        render();
        alert("Customer updated!");
    }
};

window.toggleCustomerStatus = (id) => {
    const c = State.customers.find(x => x.id === id);
    if (c) {
        c.status = c.status === 'active' ? 'blocked' : 'active';
        saveGlobalData();
        render();
        alert(`Customer ${c.status === 'active' ? 'Unblocked' : 'Blocked'}`);
    }
};

const findUser = (id) => State.customers.find(x => x.id === id) || State.agents.find(x => x.id === id);

window.verifyKYC = (id) => {
    const c = findUser(id);
    if (!c || !c.kyc) return alert("No KYC data found.");

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px;">
            <h3 style="margin-bottom:15px; color:#1a2a3a;">Verify KYC: ${c.name}</h3>
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:15px; font-size:0.9rem;">
                <p style="margin-bottom:5px;"><strong>Account Name:</strong> ${c.kyc.accountName}</p>
                <p style="margin-bottom:5px;"><strong>Account No:</strong> ${c.kyc.accountNumber}</p>
                <p style="margin-bottom:5px;"><strong>IFSC Code:</strong> ${c.kyc.ifsc}</p>
                <p style="color:#666; font-size:0.8rem;">Submitted: ${c.kyc.submittedAt}</p>
            </div>
            <div style="margin-bottom:20px;">
                <p style="font-weight:700; margin-bottom:5px;">Document:</p>
                <a href="${c.kyc.doc}" target="_blank">
                    <img src="${c.kyc.doc}" style="width:100%; height:200px; object-fit:contain; border:1px solid #ddd; border-radius:10px; background:#ddd;">
                </a>
            </div>
            <div style="margin-bottom:15px;">
                <label style="font-size:0.85rem; font-weight:700; display:block; margin-bottom:5px;">Admin Remark:</label>
                <textarea id="kyc-admin-remark" placeholder="Enter reason for rejection or note for approval..." style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-family:inherit; min-height:60px;"></textarea>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="login-btn" onclick="approveKYC(${c.id})" style="background:#138808; flex:1;">Approve</button>
                <button class="login-btn" onclick="rejectKYC(${c.id})" style="background:#D32F2F; flex:1;">Reject</button>
            </div>
            <button class="prop-btn" onclick="closeModal()" style="margin-top:10px; width:100%; color:#666; background:none;">Close</button>
        </div>
    `;
};

window.approveKYC = (id) => {
    const c = findUser(id);
    const remark = document.getElementById('kyc-admin-remark').value;
    if (c && c.kyc) {
        c.kyc.status = 'approved';
        c.kyc.adminRemark = remark;
        saveGlobalData(); closeModal(); render();
        alert("KYC Approved!");
    }
};

window.rejectKYC = (id) => {
    const c = findUser(id);
    const remark = document.getElementById('kyc-admin-remark').value;
    if (!remark) return alert("Please enter a remark for rejection.");

    if (c && c.kyc) {
        c.kyc.status = 'rejected';
        c.kyc.rejectReason = remark;
        saveGlobalData(); closeModal(); render();
        alert("KYC Rejected.");
    }
};

window.manageCustomerWallet = (id) => {
    const c = findUser(id);
    if (!c) return;
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; width:90%;">
            <h3 style="margin-bottom:20px;">Manage Wallet: ${c.name}</h3>
            <p style="margin-bottom:15px;">Current Balance: <strong style="color:#138808; font-size:1.2rem;">Rs. ${(c.wallet || 0).toLocaleString()}</strong></p>
            <div class="form-group"><label>Amount (?)</label><input type="number" id="wc-amount" class="login-input" placeholder="Enter Amount"></div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="login-btn" style="background:#138808; flex:1;" onclick="updateCustomerWallet(${c.id}, 'credit')">Add (+)</button>
                <button class="login-btn" style="background:#D32F2F; flex:1;" onclick="updateCustomerWallet(${c.id}, 'debit')">Deduct (-)</button>
            </div>
            <button class="prop-btn" style="background:none; color:#666; width:100%; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>
    `;
};

window.updateCustomerWallet = async (id, type) => {
    const c = State.customers.find(x => x.id === id);
    const amountVal = document.getElementById('wc-amount').value;
    if (!c || !amountVal || isNaN(amountVal) || Number(amountVal) <= 0) return alert("Invalid Amount");
    const amount = Number(amountVal);

    // Show Confirmation Modal
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Confirm Wallet ${type === 'credit' ? 'Addition' : 'Reduction'}</h3>
            <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin-bottom:20px; border-left:4px solid ${type === 'credit' ? '#138808' : '#D32F2F'};">
                <div style="margin-bottom:10px;"><strong>Customer:</strong> ${c.name}</div>
                <div style="margin-bottom:10px;"><strong>Mobile:</strong> ${c.phone || 'N/A'}</div>
                <div style="margin-bottom:10px;"><strong>Action:</strong> <span style="color:${type === 'credit' ? '#138808' : '#D32F2F'}; font-weight:700;">${type === 'credit' ? 'ADD' : 'REDUCE'}</span></div>
                <div><strong>Amount:</strong> <span style="font-size:1.2rem; color:#FF9933; font-weight:800;">Rs. ${amount.toLocaleString()}</span></div>
            </div>
            <div class="form-group">
                <label>Enter Admin Password</label>
                <input type="password" id="wallet-auth-pwd" class="login-input" placeholder="Password">
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="login-btn" onclick="executeCustomerWalletUpdate(${id}, '${type}', ${amount})" style="flex:1; background:#138808;">Submit</button>
                <button class="prop-btn" onclick="closeModal(); manageCustomerWallet(${id})" style="flex:1; background:#999; color:white;">Cancel</button>
            </div>
        </div>
    `;
};

window.executeCustomerWalletUpdate = async (id, type, amount) => {
    const pwd = document.getElementById('wallet-auth-pwd').value;
    if (pwd !== '252325') return alert("Incorrect Password!");

    const c = State.customers.find(x => x.id === id);
    if (!c) return;

    showGlobalLoader(type === 'credit' ? "Processing credit..." : "Processing debit...");

    if (type === 'credit') {
        if (State.adminWallet < amount) {
            hideGlobalLoader(null);
            setTimeout(() => alert("Insufficient Admin Wallet Balance!"), 200);
            return;
        }
        State.adminWallet -= amount;
        c.wallet = (c.wallet || 0) + amount;

        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now(),
            type: 'customer_credit',
            customerId: c.id,
            amount: amount,
            date: new Date().toLocaleString(),
            desc: 'Admin credited funds'
        });
    } else {
        if ((c.wallet || 0) < amount) {
            hideGlobalLoader(null);
            setTimeout(() => alert("Insufficient Customer Balance!"), 200);
            return;
        }
        c.wallet = (c.wallet || 0) - amount;
        State.adminWallet += amount;

        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now(),
            type: 'customer_debit',
            customerId: c.id,
            amount: amount,
            date: new Date().toLocaleString(),
            desc: 'Admin deducted funds'
        });

        // Record admin credit transaction
        State.walletTransactions.push({
            id: Date.now() + 1,
            amount: amount,
            type: 'admin_credit',
            date: new Date().toLocaleString(),
            remark: `Recovered from customer ${c.name}`
        });
    }
    await saveGlobalData();
    hideGlobalLoader("Wallet Updated!");
    closeModal();
    render();
    setTimeout(() => alert("Wallet Updated Successfully!"), 200);
};

function approveAgent(id) { const a = State.agents.find(x => x.id === id); if (a) a.status = 'approved'; saveGlobalData(); render(); }

async function editAgent(id) {
    const a = State.agents.find(x => x.id === id);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Edit Agent Details</h3>
            <form id="edit-agent-form">
                <div class="form-group"><label>Agent Name</label><input id="ae-name" value="${a.name}" required></div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    <div class="form-group"><label>Phone</label><input id="ae-phone" value="${a.phone || ''}" required></div>
                    <div class="form-group"><label>City</label><input id="ae-city" value="${a.city || ''}" required></div>
                </div>
                <div class="form-group"><label>Email Address</label><input id="ae-email" value="${a.email}" required></div>
                <div class="form-group"><label>Password</label><input id="ae-pass" type="text" value="${a.password}" required></div>
                <div class="form-group"><label>Update Photo (Optional)</label><input type="file" id="ae-photo" accept="image/*"></div>
                <button type="submit" class="login-btn">Update Agent</button>
                <button type="button" class="prop-btn" style="background:none; color:#D32F2F;" onclick="closeModal()">Cancel</button>
            </form>
        </div>`;

    document.getElementById('edit-agent-form').onsubmit = async (e) => {
        e.preventDefault();
        a.name = document.getElementById('ae-name').value;
        a.phone = document.getElementById('ae-phone').value;
        a.city = document.getElementById('ae-city').value;
        a.email = document.getElementById('ae-email').value;
        a.password = document.getElementById('ae-pass').value;

        const photoFile = document.getElementById('ae-photo').files[0];
        if (photoFile) {
            a.photo = await toBase64(photoFile);
        }

        saveGlobalData(); closeModal(); render();
        alert("Agent Details Updated!");
    };
}

function blockAgent(id) { const a = State.agents.find(x => x.id === id); if (a) a.status = 'blocked'; saveGlobalData(); render(); }
function rejectAgent(id) { State.agents = State.agents.filter(x => x.id !== id); saveGlobalData(); render(); }

function toggleLike(e, id) {
    e.stopPropagation();

    // Check if user is logged in as customer
    if (State.user && State.user.role === 'customer') {
        const cust = State.customers.find(c => c.id === State.user.id);
        if (cust) {
            if (!cust.likes) cust.likes = [];
            if (cust.likes.includes(id)) cust.likes = cust.likes.filter(x => x !== id);
            else cust.likes.push(id);

            // Sync with current view state
            State.likes = cust.likes;
        }
    } else {
        // Guest User
        if (State.likes.includes(id)) State.likes = State.likes.filter(x => x !== id);
        else State.likes.push(id);
    }

    saveGlobalData(); render();
}

window.updateHomeSearch = (val) => {
    State.homeSearch = val;
    const grid = document.getElementById('home-prop-grid');
    if (!grid) return;

    const q = val.toLowerCase();
    let props = State.properties.filter(p => p.status === 'approved');
    props.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

    const filtered = props.filter(p => p.title.toLowerCase().includes(q) || p.city.toLowerCase().includes(q));
    grid.innerHTML = filtered.map(p => renderPropertyCard(p)).join('');
};

window.navigate = navigate;
window.toggleLike = toggleLike;
window.approveProperty = approveProperty;
window.confirmApproveProperty = confirmApproveProperty;
window.markAsSold = markAsSold;
window.markAsUnsold = markAsUnsold;
window.disableProperty = disableProperty;
window.confirmDisable = confirmDisable;
window.showPropertyModal = showPropertyModal;
window.approveAgent = approveAgent;
window.editAgent = editAgent;
window.blockAgent = blockAgent;
window.rejectAgent = rejectAgent;
window.openSearchModal = openSearchModal;
window.closeModal = closeModal;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.logout = logout;
window.editProperty = editProperty;
window.manageWallet = manageWallet;
window.deleteProperty = (id) => { State.properties = State.properties.filter(x => x.id !== id); saveGlobalData(); render(); };

window.toggleCustomerStatus = (id) => {
    const c = State.customers.find(x => x.id === id);
    if (c) {
        c.status = c.status === 'active' ? 'blocked' : 'active';
        saveGlobalData(); render();
    }
};

function manageWallet(agentId) {
    const a = State.agents.find(x => x.id === agentId);
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px;">
            <h3 style="margin-bottom:20px;">Manage Wallet: ${a.name}</h3>
            <p>Current Balance: <strong>Rs. ${a.wallet}</strong></p>
            <div class="form-group">
                <label>Amount (?)</label>
                <input type="number" id="w-amount" class="login-input" placeholder="Enter amount">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <button class="login-btn" onclick="adjustWallet(${a.id}, 'add')" style="background:#138808;">Add Money</button>
                <button class="login-btn" onclick="adjustWallet(${a.id}, 'reduce')" style="background:#D32F2F;">Reduce Money</button>
            </div>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px;" onclick="closeModal()">Cancel</button>
        </div>`;
}

async function adjustWallet(id, type) {
    const a = State.agents.find(x => x.id === id);
    const amountVal = document.getElementById('w-amount').value;
    if (!amountVal || isNaN(amountVal) || parseInt(amountVal) <= 0) {
        return alert("Please enter a valid amount!");
    }
    const amount = parseInt(amountVal);

    // Show Confirmation Modal
    const modal = document.getElementById('modal-container');
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">Confirm Agent Wallet Transfer</h3>
            <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin-bottom:20px; border-left:4px solid ${type === 'add' ? '#138808' : '#D32F2F'};">
                <div style="margin-bottom:10px;"><strong>Agent:</strong> ${a.name}</div>
                <div style="margin-bottom:10px;"><strong>Mobile:</strong> ${a.phone || 'N/A'}</div>
                <div style="margin-bottom:10px;"><strong>Action:</strong> <span style="color:${type === 'add' ? '#138808' : '#D32F2F'}; font-weight:700;">${type === 'add' ? 'ADD' : 'REDUCE'}</span></div>
                <div><strong>Amount:</strong> <span style="font-size:1.2rem; color:#FF9933; font-weight:800;">Rs. ${amount.toLocaleString()}</span></div>
            </div>
            <div class="form-group">
                <label>Remark (Optional)</label>
                <input type="text" id="wallet-remark" class="login-input" placeholder="e.g. Bonus, Penalty, Correction...">
            </div>
            <div class="form-group">
                <label>Enter Admin Password</label>
                <input type="password" id="agent-auth-pwd" class="login-input" placeholder="Password">
            </div>
            <div style="display:flex; gap:10px; margin-top:20px;">
                <button class="login-btn" onclick="executeAgentWalletUpdate(${id}, '${type}', ${amount})" style="flex:1; background:#138808;">Submit</button>
                <button class="prop-btn" onclick="closeModal(); manageWallet(${id})" style="flex:1; background:#999; color:white;">Cancel</button>
            </div>
        </div>
    `;
}

window.executeAgentWalletUpdate = async (id, type, amount) => {
    const pwd = document.getElementById('agent-auth-pwd').value;
    const remarkVal = document.getElementById('wallet-remark').value;
    const remark = remarkVal ? remarkVal : (type === 'add' ? 'Added by Admin' : 'Reduced by Admin');

    if (pwd !== '252325') return alert("Incorrect Password!");

    const a = State.agents.find(x => x.id === id);
    if (!a) return;

    showGlobalLoader("Processing adjustment...");

    if (type === 'add') {
        // Check if admin has sufficient balance
        if (State.adminWallet < amount) {
            hideGlobalLoader(null);
            setTimeout(() => alert("Insufficient admin wallet balance!"), 200);
            return;
        }

        // Deduct from admin wallet
        State.adminWallet -= amount;

        // Add to agent wallet
        a.wallet = (a.wallet || 0) + amount; // Ensure wallet is initialized

        // Record agent credit transaction
        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now(),
            agentId: a.id,
            amount: amount,
            type: 'credit',
            date: new Date().toLocaleString(),
            remark: remark,
            status: 'success'
        });

        // Record admin debit transaction
        State.walletTransactions.push({
            id: Date.now() + 1,
            amount: amount,
            type: 'admin_debit',
            date: new Date().toLocaleString(),
            remark: `Transferred to ${a.name}: ${remark}`,
            status: 'success'
        });
    } else {
        if ((a.wallet || 0) < amount) {
            hideGlobalLoader(null);
            setTimeout(() => alert("Insufficient agent balance"), 200);
            return;
        }
        a.wallet -= amount;
        State.adminWallet += amount; // Add back to admin wallet

        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now(),
            agentId: a.id,
            amount: amount,
            type: 'debit',
            date: new Date().toLocaleString(),
            remark: remark,
            status: 'success'
        });

        // Record admin credit transaction
        State.walletTransactions.push({
            id: Date.now() + 1,
            amount: amount,
            type: 'admin_credit',
            date: new Date().toLocaleString(),
            remark: `Recovered from ${a.name}: ${remark}`,
            status: 'success'
        });
    }
    await saveGlobalData();
    hideGlobalLoader("Wallet Updated!");
    closeModal();
    render();
    setTimeout(() => alert(`Wallet updated! New Balance: Rs. ${a.wallet}`), 200);
};

async function requestWithdrawal(id) {
    const a = State.agents.find(x => x.id === id);
    let amountStr = prompt("Enter amount to withdraw (?):", a.wallet);
    if (amountStr === null) return; // User cancelled prompt

    if (!amountStr.trim() || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("Please enter a valid amount!");
    }

    const amount = parseInt(amountStr);
    if (amount > a.wallet) return alert("Insufficient balance");

    showGlobalLoader("Processing Withdrawal Request...");

    // Deduct immediately
    a.wallet -= amount;

    if (!State.withdrawalRequests) State.withdrawalRequests = [];
    const reqId = Date.now();
    State.withdrawalRequests.push({
        id: reqId,
        agentId: a.id,
        agentName: a.name,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'pending',
        remark: ''
    });

    if (!State.walletTransactions) State.walletTransactions = [];
    State.walletTransactions.push({
        id: reqId,
        agentId: a.id,
        amount: amount,
        type: 'withdrawal',
        status: 'pending',
        date: new Date().toLocaleString(),
        remark: 'Withdrawal Request Initiated'
    });

    await saveGlobalData();
    hideGlobalLoader("Request Successful!");
    render();
    setTimeout(() => alert("Withdrawal request sent! Amount deducted from wallet and held for approval."), 200);
}

function processWithdrawal_Old(reqId, status) {
    const r = State.withdrawalRequests.find(x => x.id === reqId);
    if (!r) return;
    const remark = prompt(`Enter remark for ${status === 'approved' ? 'Approval' : 'Rejection'}:`);
    if (remark === null) return;

    showGlobalLoader("à¤¨à¤¿à¤•à¤¾à¤¸à¥€ à¤ªà¥à¤°à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¶à¥à¤°à¥‚..."); // Withdrawal being processed...

    const a = State.agents.find(x => x.id === r.agentId);
    const transaction = State.walletTransactions.find(t => t.id === r.id);

    if (status === 'approved') {
        if (transaction) {
            transaction.status = 'approved';
            transaction.remark = 'Withdrawal Approved: ' + remark;
        }
    } else if (status === 'rejected') {
        // Refund back to wallet
        a.wallet += r.amount;
        if (transaction) {
            transaction.status = 'rejected';
            transaction.remark = 'Withdrawal Rejected (Refunded): ' + remark;
        }
    }

    r.status = status;
    r.remark = remark;

    // Save and show success
    saveGlobalData().then(() => {
        hideGlobalLoader(status === 'approved' ? "à¤¨à¤¿à¤•à¤¾à¤¸à¥€ à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤!" : "à¤¨à¤¿à¤•à¤¾à¤¸à¥€ à¤…à¤¸à¥à¤µà¥€à¤•à¥ƒà¤¤!");
        setTimeout(() => {
            alert(`Withdrawal request ${status}!`);
            render();
        }, 500);
    }).catch(err => {
        console.error(err);
        hideGlobalLoader(null);
        alert("Failed to process withdrawal. Please try again.");
    });
}

function addAdminBalance() {
    const password = prompt("Enter Admin Password to add balance:");
    if (password === null) return; // User cancelled

    if (password !== "Ajay@6341#") {
        return alert("Incorrect Password! Access Denied.");
    }

    const amountStr = prompt("Enter amount to add to Admin Wallet (?):");
    if (amountStr === null) return;

    if (!amountStr.trim() || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("Please enter a valid amount!");
    }

    const amount = parseInt(amountStr);
    State.adminWallet += amount;

    // Record admin credit transaction
    if (!State.walletTransactions) State.walletTransactions = [];
    State.walletTransactions.push({
        id: Date.now(),
        amount: amount,
        type: 'admin_credit',
        date: new Date().toLocaleString(),
        remark: 'Balance Added by Admin'
    });

    saveGlobalData();
    render();
    alert(`â‚¹ ${amount.toLocaleString()} successfully added to Admin Wallet!`);
}

function toggleDateSetting() {
    State.settings.showDate = !State.settings.showDate;
    saveGlobalData();
    render();
}

window.toggleDateSetting = toggleDateSetting;

window.setHomeCategory = (c, btn) => {
    State.homeCategory = c;
    render();

    // Auto-scroll to center the selected category
    setTimeout(() => {
        const activeBtn = document.getElementById(`category-btn-${c.replace(/\s+/g, '-')}`);
        if (activeBtn) {
            activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
    }, 100);
};
window.addAdminBalance = addAdminBalance;
window.manageWallet = manageWallet;
window.adjustWallet = adjustWallet;
window.requestWithdrawal = requestWithdrawal;
// window.processWithdrawal = processWithdrawal;
window.setAdminTab = setAdminTab;
window.setAgentTab = setAgentTab;
window.updateAdminSearch = updateAdminSearch;
window.toggleFeature = toggleFeature;

// --- Customer Wallet Functions ---
window.openCustomerWalletModal = () => {
    if (!State.user || State.user.role !== 'customer') return;

    const customer = State.customers.find(c => c.id === State.user.id);
    if (!customer) return;

    // Get customer's withdrawal requests
    const customerWithdrawals = (State.withdrawalRequests || []).filter(r => r.customerId === customer.id);

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:500px; max-height:80vh; overflow-y:auto;">
            <h3 style="margin-bottom:20px; color:#1a2a3a;">My Wallet</h3>
            
            <div style="background:linear-gradient(135deg, #FF9933, #FFB366); padding:25px; border-radius:15px; margin-bottom:25px; color:white; text-align:center;">
                <div style="font-size:0.9rem; opacity:0.9; margin-bottom:8px;">Available Balance</div>
                <div style="font-size:2.5rem; font-weight:800;">Rs. ${(customer.wallet || 0).toLocaleString()}</div>
            </div>
            
            <div style="margin-bottom:25px;">
                <h4 style="margin-bottom:15px; color:#1a2a3a;">Add Money</h4>
                <div class="form-group" style="display:flex; gap:10px; flex-wrap:wrap;">
                     <button onclick="document.getElementById('cw-amount').value='100'" style="padding:8px 15px; border:1px solid #ddd; background:white; border-radius:20px; font-size:0.9rem;">+100</button>
                     <button onclick="document.getElementById('cw-amount').value='500'" style="padding:8px 15px; border:1px solid #ddd; background:white; border-radius:20px; font-size:0.9rem;">+500</button>
                     <button onclick="document.getElementById('cw-amount').value='1000'" style="padding:8px 15px; border:1px solid #ddd; background:white; border-radius:20px; font-size:0.9rem;">+1000</button>
                </div>
                 <div class="form-group">
                    <label>Amount (Rs.)</label>
                    <input type="number" id="cw-add-amount" class="login-input" placeholder="Enter amount to add">
                </div>
                <button class="login-btn" onclick="openAddMoneyModal()" style="background:#138808; width:100%;">
                    <i class="fas fa-wallet"></i> Add Money
                </button>
            </div>

            <div style="margin-bottom:25px; border-top:1px solid #eee; padding-top:20px;">
                <h4 style="margin-bottom:15px; color:#1a2a3a;">Request Withdrawal</h4>
                <div class="form-group">
                    <label>Amount (Rs.)</label>
                    <input type="number" id="cw-amount" class="login-input" placeholder="Enter amount" max="${customer.wallet || 0}">
                </div>
                <button class="login-btn" onclick="requestCustomerWithdrawal()" style="background:#138808; width:100%;">
                    <i class="fas fa-paper-plane"></i> Submit Request
                </button>
            </div>
            
            <div style="border-top:2px solid #eee; padding-top:20px;">
                <h4 style="margin-bottom:15px; color:#1a2a3a;">Withdrawal History</h4>
                ${customerWithdrawals.length > 0 ? `
                    <div style="max-height:250px; overflow-y:auto;">
                        ${customerWithdrawals.sort((a, b) => b.id - a.id).map(r => `
                            <div style="background:#f8f9fa; padding:15px; border-radius:10px; margin-bottom:10px; border-left:4px solid ${r.status === 'approved' ? '#28a745' : (r.status === 'rejected' ? '#D32F2F' : '#FF9933')};">
                                <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                                    <strong style="color:#1a2a3a;">Rs. ${r.amount.toLocaleString()}</strong>
                                    <span style="padding:3px 10px; border-radius:50px; font-size:0.7rem; font-weight:800; background:${r.status === 'approved' ? '#e8f5e9' : (r.status === 'rejected' ? '#ffebee' : '#fff3e0')}; color:${r.status === 'approved' ? '#2e7d32' : (r.status === 'rejected' ? '#D32F2F' : '#e65100')}; text-transform:uppercase;">
                                        ${r.status}
                                    </span>
                                </div>
                                <div style="font-size:0.8rem; color:#666;">${r.date}</div>
                                ${r.remark ? `<div style="font-size:0.75rem; color:#999; margin-top:5px; font-style:italic;">${r.remark}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align:center; padding:30px; color:#999;">
                        <i class="fas fa-inbox" style="font-size:2rem; margin-bottom:10px; opacity:0.5;"></i>
                        <div>No withdrawal requests yet</div>
                    </div>
                `}
            </div>
            
            <button class="prop-btn" style="background:none; color:#999; margin-top:15px; width:100%;" onclick="closeModal()">Close</button>
        </div>`;
};

window.requestCustomerWithdrawal = () => {
    if (!State.user || State.user.role !== 'customer') return;

    const customer = State.customers.find(c => c.id === State.user.id);
    if (!customer) return;

    const amountStr = document.getElementById('cw-amount').value;
    if (!amountStr || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("Please enter a valid amount!");
    }

    const amount = parseInt(amountStr);
    if (amount > (customer.wallet || 0)) {
        return alert("Insufficient balance!");
    }

    showGlobalLoader("Sending withdrawal request...");

    // Deduct from customer wallet immediately
    customer.wallet -= amount;

    // Create withdrawal request
    if (!State.withdrawalRequests) State.withdrawalRequests = [];
    const reqId = Date.now();
    State.withdrawalRequests.push({
        id: reqId,
        customerId: customer.id,
        customerName: customer.name,
        amount: amount,
        date: new Date().toLocaleDateString(),
        status: 'pending',
        remark: ''
    });

    // Record transaction
    if (!State.walletTransactions) State.walletTransactions = [];
    State.walletTransactions.push({
        id: reqId,
        customerId: customer.id,
        amount: amount,
        type: 'debit',
        remark: 'Withdrawal Request',
        status: 'pending', // Pending approval
        date: new Date().toLocaleString()
    });

    // --- SYNC TO PHP ---
    const fd = new FormData();
    fd.append('action', 'request_withdrawal');
    fd.append('amount', amount);
    fetch('api/wallet.php', { method: 'POST', body: fd }).catch(console.error);
    // -------------------

    saveGlobalData();
    closeModal();
    openCustomerWalletModal(); // Refresh modal to show history
    showAlert('modal-container', 'Request Sent Successfully!', 'success');
};



window.deleteCustomer = (id) => {
    const customer = State.customers.find(c => c.id === id);
    if (!customer) return;

    if (confirm(`Are you sure you want to PERMANENTLY DELETE this customer?\n\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email}\n\nThis will also delete:\n- All their wallet balance (Rs. ${(customer.wallet || 0).toLocaleString()})\n- All their liked properties\n- All their KYC data\n\nThis action CANNOT be undone!`)) {
        showGlobalLoader("Deleting customer...");

        // Remove from State
        State.customers = State.customers.filter(c => c.id !== id);

        // Also remove their withdrawal requests
        if (State.withdrawalRequests) {
            State.withdrawalRequests = State.withdrawalRequests.filter(r => r.customerId !== id);
        }

        // Save and refresh
        saveGlobalData().then(() => {
            hideGlobalLoader("Customer Deleted!");
            render();
            setTimeout(() => alert("Customer has been permanently deleted."), 300);
        });
    }
};

window.dismissBroadcast = (id) => {
    localStorage.setItem('dismissed_broadcast_' + id, 'true');
    closeModal();
};

window.sendBroadcast = () => {
    const msg = document.getElementById('broadcast-msg').value;
    const recipient = document.getElementById('broadcast-recipient').value;
    if (!msg) return alert("Please enter a message");

    if (!State.settings) State.settings = {};
    State.settings.broadcast = {
        id: Date.now(),
        message: msg,
        recipient: recipient,
        active: true
    };
    saveGlobalData();
    alert(`Broadcast sent to ${recipient === 'all' ? 'everyone' : 'agents only'}!`);
    render();
};

window.stopBroadcast = () => {
    if (State.settings && State.settings.broadcast) {
        State.settings.broadcast.active = false;
        saveGlobalData();
        render();
        alert("Broadcast stopped. Users will no longer see this message.");
    }
};

window.saveContactSettings = () => {
    State.settings.appName = document.getElementById('set-app-name').value;
    State.settings.aboutText = document.getElementById('set-about-text').value;

    // Save Banners
    let banners = [];
    const bannerEl = document.getElementById('set-banners');
    if (bannerEl) {
        banners = bannerEl.value.split(',').map(s => s.trim()).filter(s => s);
    }

    const phone = document.getElementById('set-phone').value;
    const email = document.getElementById('set-email').value;
    const oldPass = document.getElementById('set-old-pass').value;
    const newPass = document.getElementById('set-new-pass').value;

    // Social Links
    const insta = document.getElementById('set-social-insta')?.value.trim();
    const yt = document.getElementById('set-social-yt')?.value.trim();
    const fb = document.getElementById('set-social-fb')?.value.trim();
    const tw = document.getElementById('set-social-x')?.value.trim();
    State.settings.socialLinks = { insta: insta, youtube: yt, facebook: fb, twitter: tw };

    const names = document.querySelectorAll('.f-name');
    const titles = document.querySelectorAll('.f-title');
    const imgs = document.querySelectorAll('.f-img');
    const bios = document.querySelectorAll('.f-bio');

    const newFounders = [];
    names.forEach((n, i) => {
        newFounders.push({
            name: n.value,
            title: titles[i].value,
            image: imgs[i].value,
            bio: bios[i].value
        });
    });

    const helplinePhone = document.getElementById('set-help-phone').value;
    const helplineEmail = document.getElementById('set-help-email').value;

    State.settings.contactInfo = {
        phone, email,
        helplinePhone, helplineEmail,
        founders: newFounders
    };

    // Navigation Settings are now saved in saveNavigationSettings()
    // State.settings.otherButton is handled there.
    // Removed old block to prevent overwriting with nulls if inputs are missing.

    // UX Settings
    State.settings.ux = {
        loadingText: document.getElementById('set-ux-load-text')?.value || State.settings.ux.loadingText,
        loadingIcon: document.getElementById('set-ux-load-icon')?.value || State.settings.ux.loadingIcon,
        slowConnIcon: document.getElementById('set-ux-slow-icon')?.value || State.settings.ux.slowConnIcon,
        slowConnHeading: document.getElementById('set-ux-slow-title')?.value || State.settings.ux.slowConnHeading,
        slowConnSubtext: document.getElementById('set-ux-slow-sub')?.value || State.settings.ux.slowConnSubtext
    };

    if (oldPass && newPass) {
        const current = State.settings.adminPassword || 'admin123';
        if (oldPass === current) {
            State.settings.adminPassword = newPass;
            alert("Security: Admin Password Updated!");
        } else {
            alert("Security Error: Old Password does not match! Password NOT updated.");
        }
    }
    if (!State.settings.appDetails) State.settings.appDetails = {};
    State.settings.appDetails.banners = banners;

    saveGlobalData();
    render();
    saveGlobalData();
    render();
    if (!State.suppressSettingsAlert) alert("Settings Saved Successfully!");
    State.suppressSettingsAlert = false;
};

window.saveNavigationSettings = () => {
    const label = document.getElementById('nav-other-label').value;
    const icon = document.getElementById('nav-other-icon').value;

    State.settings.otherButton = {
        label: label || 'OTHER',
        icon: icon || 'fas fa-ellipsis-h'
    };

    saveGlobalData();
    render();
    updateOtherButton();
    alert("Navigation Settings Info Saved!");
};

window.addFounder = () => {
    State.suppressSettingsAlert = true;
    saveContactSettings(); // Save existing input first
    State.settings.contactInfo.founders.push({ name: '', title: '', image: '', bio: '' });
    saveGlobalData();
    render();
};

window.removeFounder = (index) => {
    State.suppressSettingsAlert = true;
    saveContactSettings(); // Save existing input first (optional but safer)
    State.settings.contactInfo.founders.splice(index, 1);
    saveGlobalData();
    render();
};

// --- Download Functions for Admin Panel ---
window.downloadAgentsList = () => {
    if (!State.agents || State.agents.length === 0) {
        alert('No agents to download!');
        return;
    }

    // CSV Header
    let csv = 'S.No,Name,Email,Phone,City,Status,Wallet,KYC Status,Experience,Joined Date\n';

    // Add data rows
    State.agents.forEach((a, index) => {
        const kyc = a.kyc || { status: 'none' };
        csv += `${index + 1},"${a.name || ''}","${a.email || ''}","${a.phone || ''}","${a.city || ''}","${a.status || ''}","${a.wallet || 0}","${kyc.status || 'none'}","${a.experience || ''}","${a.joinedAt || ''}"\n`;
    });

    // Download
    downloadCSV(csv, 'BhumiDekho_Agents_List.csv');
    alert('Agents list downloaded successfully!');
};

window.downloadCustomersList = () => {
    if (!State.customers || State.customers.length === 0) {
        alert('No customers to download!');
        return;
    }

    // CSV Header
    let csv = 'S.No,Name,Phone,Email,City,Status,Wallet,KYC Status,Joined Date\n';

    // Add data rows
    State.customers.forEach((c, index) => {
        const kyc = c.kyc || { status: 'none' };
        csv += `${index + 1},"${c.name || ''}","${c.phone || ''}","${c.email || ''}","${c.city || ''}","${c.status || ''}","${c.wallet || 0}","${kyc.status || 'none'}","${c.joinedAt || ''}"\n`;
    });

    // Download
    downloadCSV(csv, 'BhumiDekho_Customers_List.csv');
    alert('Customers list downloaded successfully!');
};

function downloadCSV(csvContent, filename) {
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// --- Helper for Edit Property Modal (Admin) ---
window.addExtraImageField = function () {
    const div = document.createElement('div');
    div.className = 'form-group';
    div.innerHTML = '<label>New Image URL</label><input class="pe-img-extra" placeholder="Image URL">';
    const container = document.getElementById('pe-extra-images');
    if (container) container.appendChild(div);
};
// --- Membership Toggle (Admin) ---
window.toggleMembership = async function (id) {
    const agent = State.agents.find(a => a.id === id);
    if (!agent) return;

    // Toggle status
    agent.membershipStatus = (agent.membershipStatus === 'active') ? 'inactive' : 'active';

    await saveGlobalData();
    render(); // Re-render to show updated button state
};

// --- Property Types Management ---
window.addPropertyType = async function () {
    const input = document.getElementById('new-property-type');
    const newType = input.value.trim();

    if (!newType) {
        alert('Please enter a property type name!');
        return;
    }

    // Initialize if not exists
    if (!State.settings.propertyTypes) {
        State.settings.propertyTypes = ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House'];
    }

    // Check for duplicates
    if (State.settings.propertyTypes.includes(newType)) {
        alert('This property type already exists!');
        return;
    }

    showGlobalLoader('Adding Property Type...');
    State.settings.propertyTypes.push(newType);

    await saveGlobalData();
    hideGlobalLoader('Property Type Added!');
    input.value = '';
    render();
};

window.deletePropertyType = async function (index) {
    if (!State.settings.propertyTypes || index < 0 || index >= State.settings.propertyTypes.length) return;

    const typeToDelete = State.settings.propertyTypes[index];

    // Cannot delete 'All'
    if (typeToDelete === 'All') {
        alert('Cannot delete the default "All" category!');
        return;
    }

    if (!confirm(`Are you sure you want to delete "${typeToDelete}" property type?`)) return;

    showGlobalLoader('Deleting Property Type...');
    State.settings.propertyTypes.splice(index, 1);

    await saveGlobalData();
    hideGlobalLoader('Property Type Deleted!');
    render();
};

// --- Dynamic UX Updates ---
window.updateOtherButton = () => {
    // Update Other Button
    const btnOther = document.querySelector('.nav-item[data-page="other"]');
    if (btnOther) {
        const label = (State.settings.otherButton && State.settings.otherButton.label) || 'OTHER';
        const icon = (State.settings.otherButton && State.settings.otherButton.icon) || 'fas fa-ellipsis-h';

        const span = btnOther.querySelector('span');
        const i = btnOther.querySelector('i');

        if (span) span.innerText = label;
        if (i) i.className = icon;
    }

    // Update Sell/Rent Button
    const btnSellRent = document.querySelector('.nav-item[data-page="sell-rent"]');
    if (btnSellRent) {
        const label = (State.settings.sellRentButton && State.settings.sellRentButton.label) || 'Sell/Rent';
        const icon = (State.settings.sellRentButton && State.settings.sellRentButton.icon) || 'fas fa-plus';

        const span = btnSellRent.querySelector('span');
        const i = btnSellRent.querySelector('i');

        if (span) span.innerText = label;
        if (i) i.className = icon;
    }
};

window.saveExploreHeader = function () {
    const h = document.getElementById('ex-heading').value;
    const s = document.getElementById('ex-subheading').value;

    if (!State.otherPage) State.otherPage = { cards: [] };
    State.otherPage.heading = h;
    State.otherPage.subHeading = s;

    showGlobalLoader("Saving Header...");
    saveGlobalData().then(() => {
        hideGlobalLoader("Header Updated!");
    });
};

window.editExploreCard = function (index) {
    if (!State.otherPage || !State.otherPage.cards) {
        if (!State.otherPage) State.otherPage = { cards: [] };
    }
    const c = State.otherPage.cards[index] || { title: '', desc: '', bg: '#ffffff', icon: 'star' };
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.style.display = 'flex';
    // Use single quotes for JS strings, double for HTML attributes
    // Ensure values are safe to inject
    const safeTitle = (c.title || '').replace(/"/g, '&quot;');
    const safeDesc = (c.desc || '').replace(/</g, '&lt;');
    const safeBg = (c.bg || '#ffffff');
    const safeBgImg = (c.bgImg || '');
    const safeSize = (c.size || 160);
    const safeHtml = (c.htmlContent || '');
    const isHidden = c.hidden ? 'checked' : '';
    const isHideIcon = c.hideIcon ? 'checked' : '';
    const isHideText = c.hideText ? 'checked' : '';

    // Common icons list
    const icons = ['star', 'home', 'building', 'user', 'cog', 'heart', 'bell', 'search', 'map-marker-alt', 'phone', 'envelope', 'camera', 'wallet', 'history', 'shield-alt', 'question-circle', 'share-alt', 'bookmark', 'calendar', 'check-circle'];
    const currentIcon = c.icon || 'star';

    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:20px; max-height:85vh; overflow-y:auto;">
            <h3 style="margin-bottom:15px; color:#1a2a3a;">Edit Card ${index + 1}</h3>
            <div class="form-group">
                <label>Card Title</label>
                <input id="ec-title" class="login-input" value="${safeTitle}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="ec-desc" class="login-input" rows="3">${safeDesc}</textarea>
            </div>
            <div class="form-group">
                <label>Select Icon</label>
                <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; max-height:100px; overflow-y:auto; padding:5px; border:1px solid #eee; border-radius:8px;">
                    ${icons.map(icon => `
                        <div onclick="selectExploreIcon(this, '${icon}')" class="icon-option ${icon === currentIcon ? 'selected' : ''}" style="cursor:pointer; padding:8px; text-align:center; border-radius:6px; background:${icon === currentIcon ? '#e8f5e9' : 'transparent'}; border:${icon === currentIcon ? '1px solid #138808' : '1px solid transparent'};">
                            <i class="fas fa-${icon}" style="color:${icon === currentIcon ? '#138808' : '#666'};"></i>
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="ec-icon" value="${currentIcon}">
            </div>
            <div class="form-group">
                <label>Custom HTML Functionality (Optional)</label>
                <textarea id="ec-html" class="login-input" rows="5" placeholder="<div>My Custom Content</div><script>alert('Hello')</script>" style="font-family:monospace; font-size:0.85rem;">${safeHtml}</textarea>
                <div style="font-size:0.75rem; color:#666; margin-top:4px;">Enter HTML/Type script here. When clicked, this code will replace the entire page view.</div>
            </div>
            <div class="form-group">
                <label>Background Color (Default)</label>
                <input type="color" id="ec-bg" value="${safeBg}" style="width:100%; height:50px; border:none; border-radius:8px; cursor:pointer;">
            </div>
            <div class="form-group">
                <label>Background Image URL (Optional)</label>
                <input id="ec-bg-img" class="login-input" value="${safeBgImg}" placeholder="https://example.com/image.jpg">
                <div style="font-size:0.75rem; color:#666; margin-top:4px;">Paste an image URL here to override the background color.</div>
            </div>
            <div class="form-group">
                <label>Box Height (Size): <span id="size-val">${safeSize}px</span></label>
                <input type="range" id="ec-size" min="100" max="300" step="10" value="${safeSize}" oninput="document.getElementById('size-val').innerText = this.value + 'px'" style="width:100%;">
            </div>
            <div class="form-group" style="background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #eee;">
                <label style="margin-bottom:8px; display:block; font-weight:600;">Display Options:</label>
                <div style="display:flex; flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="checkbox" id="ec-hide-icon" ${isHideIcon} style="cursor:pointer;">
                        <label for="ec-hide-icon" style="margin:0; cursor:pointer; font-size:0.9rem;">Hide Icon</label>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="checkbox" id="ec-hide-text" ${isHideText} style="cursor:pointer;">
                        <label for="ec-hide-text" style="margin:0; cursor:pointer; font-size:0.9rem;">Hide Text</label>
                    </div>
                </div>
            </div>
            <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="ec-hidden" ${isHidden} style="width:20px; height:20px; cursor:pointer;">
                <label for="ec-hidden" style="margin:0; font-weight:700; color:#D32F2F; cursor:pointer;">Disable (Hide) this Card</label>
            </div>
            <button class="login-btn" onclick="saveExploreCard(${index})">Save Changes</button>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px; width:100%;" onclick="closeModal()">Cancel</button>
        </div>
    `;
};

window.selectExploreIcon = function (el, icon) {
    document.querySelectorAll('.icon-option').forEach(d => {
        d.style.background = 'transparent';
        d.style.border = '1px solid transparent';
        d.querySelector('i').style.color = '#666';
    });
    el.style.background = '#e8f5e9';
    el.style.border = '1px solid #138808';
    el.querySelector('i').style.color = '#138808';
    document.getElementById('ec-icon').value = icon;
};

window.saveExploreCard = function (index) {
    const title = document.getElementById('ec-title').value;
    const desc = document.getElementById('ec-desc').value;
    const htmlContent = document.getElementById('ec-html').value;
    const bg = document.getElementById('ec-bg').value;
    const bgImg = document.getElementById('ec-bg-img').value;
    const icon = document.getElementById('ec-icon').value;
    const size = document.getElementById('ec-size').value;
    const hidden = document.getElementById('ec-hidden').checked;
    const hideIcon = document.getElementById('ec-hide-icon').checked;
    const hideText = document.getElementById('ec-hide-text').checked;

    // Ensure array exists
    if (!State.otherPage) State.otherPage = { cards: [] };
    if (!State.otherPage.cards) State.otherPage.cards = [];

    // Fill gaps if any (up to index)
    // The previous loop condition was <= index, which adds one too many if length == index
    // Correct logic: if length is 0 and index is 0, we need to push 1 item.
    // If length is 0 and index is 1, we push 2 items (0, 1).
    while (State.otherPage.cards.length <= index) {
        State.otherPage.cards.push({ title: 'New Card', desc: 'Description', bg: '#ffffff', icon: 'star' });
    }

    const card = State.otherPage.cards[index];
    card.title = title;
    card.desc = desc;
    card.htmlContent = htmlContent;
    card.bg = bg;
    card.bgImg = bgImg;
    card.icon = icon;
    card.size = size;
    card.hidden = hidden;
    card.hideIcon = hideIcon;
    card.hideText = hideText;

    showGlobalLoader("Saving Card...");
    saveGlobalData().then(() => {
        hideGlobalLoader("Card Updated!");
        closeModal();
        render(); // Should refresh admin view if we are on admin tab or other view
    });
};

window.addExploreCard = function () {
    if (!State.otherPage) State.otherPage = { cards: [] };
    if (!State.otherPage.cards) State.otherPage.cards = [];

    State.otherPage.cards.push({
        title: 'New Card',
        desc: 'New Description',
        bg: '#ffffff',
        icon: 'star',
        size: 160
    });

    showGlobalLoader("Adding Card...");
    saveGlobalData().then(() => {
        hideGlobalLoader("Card Added!");
        render();
    });
};

window.handleCardClick = function (index) {
    const card = State.otherPage?.cards[index];
    if (!card) return;

    if (card.htmlContent && card.htmlContent.trim()) {
        const app = document.getElementById('app');

        // Render Custom Layout - integrated between header and footer
        app.innerHTML = `
            <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
                <button onclick="navigate('other')" style="background:none; border:none; color:#138808; padding:0; font-size:0.9rem; font-weight:600; cursor:pointer; margin-bottom:20px; display:inline-flex; align-items:center; gap:8px;">
                    <span style="width:24px; height:24px; background:#e8f5e9; border-radius:50%; display:flex; align-items:center; justify-content:center;"><i class="fas fa-arrow-left" style="font-size:0.8rem;"></i></span>
                    Back to Explore
                </button>
                
                <div id="custom-card-container" style="width:100%;">
                    ${card.htmlContent}
                </div>
            </div>
        `;

        // Execute Scripts safely
        const scripts = app.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

    } else {
        alert(`You clicked ${card.title}. No custom content defined.`);
    }
};

window.deleteExploreCard = function (index) {
    if (!confirm("Are you sure you want to delete this card?")) return;

    if (State.otherPage && State.otherPage.cards) {
        State.otherPage.cards.splice(index, 1);

        showGlobalLoader("Deleting Card...");
        saveGlobalData().then(() => {
            hideGlobalLoader("Card Deleted!");
            render();
        });
    }
};


// --- Boost Modal Logic ---
window.openBoostModal = function () {
    if (!State.user || State.user.role !== 'agent') {
        alert("Only Agents can boost properties.");
        return;
    }

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';

    // Filter my properties (Support both myProperties array and full properties list)
    let myProps = [];
    if (State.user && State.user.myProperties) {
        myProps = State.user.myProperties;
    }
    // Fallback: search in main properties list
    if (myProps.length === 0) {
        myProps = State.properties.filter(p => p.agentEmail === State.user.email || p.agentId === State.user.id || (p.user_id && p.user_id == State.user.id));
    }

    // Fallback: If no real properties, show demo property for preview
    if (myProps.length === 0) {
        myProps = [
            { id: 9991, title: 'Demo Property 1', price: '45 Lakh', location: 'Jaipur', featured: false, image: 'https://placehold.co/100' },
            { id: 9992, title: 'Demo Property 2', price: '1.2 Cr', location: 'Kota', featured: true, image: 'https://placehold.co/100' }
        ];
    }

    let propListHtml = '';
    if (myProps.length === 0) {
        propListHtml = '<p style="text-align:center; color:#666;">No properties found to boost.</p>';
    } else {
        propListHtml = myProps.map(p => `
            <div onclick="processBoost('${p.id}')" style="display:flex; gap:10px; padding:10px; border:1px solid #eee; margin-bottom:10px; border-radius:8px; cursor:pointer; align-items:center; background:${p.featured ? '#fff8e1' : 'white'};">
                <img src="${p.image || 'https://placehold.co/100'}" style="width:60px; height:60px; object-fit:cover; border-radius:5px;">
                <div style="flex:1;">
                    <div style="font-weight:bold; font-size:0.9rem;">${p.title}</div>
                    <div style="font-size:0.8rem; color:#666;">Price: ${p.price || 'N/A'}</div>
                    ${p.featured ? '<span style="color:orange; font-size:0.7rem; font-weight:bold;"><i class="fas fa-star"></i> Featured</span>' : '<span style="color:green; font-size:0.7rem; font-weight:bold;"><i class="fas fa-arrow-up"></i> Click to Boost (₹100)</span>'}
                </div>
                ${!p.featured ? '<i class="fas fa-chevron-right" style="color:#ccc;"></i>' : ''}
            </div>
        `).join('');
    }

    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:0; overflow:hidden; border-radius:15px;">
            <div style="background:linear-gradient(135deg, #FF9933, #FF7700); padding:20px; color:white; text-align:center;">
                <h3 style="margin:0; font-size:1.3rem;"><i class="fas fa-rocket"></i> Boost Property</h3>
                <p style="margin:5px 0 0; opacity:0.9; font-size:0.9rem;">Get 10x more visibility on Home Page</p>
            </div>
            
            <div style="padding:15px; background:#f9f9f9; border-bottom:1px solid #eee;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:#555;">Wallet Balance:</span>
                    <span style="font-weight:bold; color:#138808; font-size:1.1rem;">₹ ${(State.user.wallet || 0).toLocaleString()}</span>
                </div>
            </div>

            <div style="max-height:300px; overflow-y:auto; padding:15px;">
                <p style="font-size:0.85rem; color:#888; margin-bottom:10px;">Select a property to boost:</p>
                ${propListHtml}
            </div>
            
            <div style="padding:15px; text-align:center; border-top:1px solid #eee;">
                <button class="prop-btn" style="background:#555; color:white; width:100%; border-radius:10px; padding:12px;" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
};

window.processBoost = function (pid) {
    const p = State.properties.find(x => x.id == pid) || { id: pid, title: 'Demo Property', price: '0', featured: false }; // Fallback for demo

    if (p.featured) {
        alert("This property is already featured!");
        return;
    }

    // Find actual agent object to deduct wallet
    const agent = State.agents.find(a => a.id == State.user.id) || State.user;

    if ((agent.wallet || 0) < 100) {
        alert("Insufficient Wallet Balance! Please Recharge your wallet.");
        return;
    }

    if (!confirm(`Confirm boost for ₹100?\n\nProperty: ${p.title}\nBalance after: ₹ ${(agent.wallet - 100)}`)) return;

    // Deduct
    agent.wallet = (agent.wallet || 0) - 100;

    // Update Property Status
    p.featured = true;

    // In real scenario, update database via API
    // saveToFirebase(); OR fetch('api/property.php?action=boost'...)

    // Show Success
    const modal = document.querySelector('.modal-content');
    modal.innerHTML = `
        <div style="text-align:center; padding:40px 20px;">
            <div style="width:80px; height:80px; background:#fff8e1; color:#FF9933; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:2.5rem; animation: popIn 0.5s ease-out;">
                <i class="fas fa-rocket"></i>
            </div>
            <h3 style="color:#1a2a3a; margin-bottom:10px;">Boost Successful!</h3>
            <div style="color:#4caf50; font-weight:700; margin-bottom:5px;">
                <i class="fas fa-check-circle"></i> Property Featured
            </div>
            <p style="color:#666; margin-bottom:25px;">"${p.title}" will now appear at the top of the feed.</p>
            <button class="login-btn" onclick="closeModal(); render();" style="background:#138808; width:auto; padding:10px 40px;">Awesome!</button>
        </div>
    `;

    // Save Local State
    saveToLocalStorage();
};

// --- Sell/Rent Page Management Functions ---

window.saveSellRentSettings = () => {
    const label = document.getElementById('nav-sellrent-label').value;
    const icon = document.getElementById('nav-sellrent-icon').value;

    State.settings.sellRentButton = {
        label: label || 'Sell/Rent',
        icon: icon || 'fas fa-plus'
    };

    saveGlobalData();
    render();
    alert("Sell/Rent Settings Info Saved!");
};

window.saveSellRentHeader = function () {
    const h = document.getElementById('sr-heading').value;
    const s = document.getElementById('sr-subheading').value;

    if (!State.sellRentPage) State.sellRentPage = { cards: [] };
    State.sellRentPage.heading = h;
    State.sellRentPage.subHeading = s;

    showGlobalLoader("Saving Header...");
    saveGlobalData().then(() => {
        hideGlobalLoader("Header Updated!");
    });
};

window.addSellRentCard = function () {
    if (!State.sellRentPage) State.sellRentPage = { cards: [] };
    if (!State.sellRentPage.cards) State.sellRentPage.cards = [];

    State.sellRentPage.cards.push({
        title: 'New Option',
        desc: 'Description',
        bg: '#ffffff',
        icon: 'star',
        size: 160
    });

    showGlobalLoader("Adding Option...");
    saveGlobalData().then(() => {
        hideGlobalLoader("Option Added!");
        render();
    });
};

window.editSellRentCard = function (index) {
    if (!State.sellRentPage || !State.sellRentPage.cards) {
        if (!State.sellRentPage) State.sellRentPage = { cards: [] };
    }
    const c = State.sellRentPage.cards[index] || { title: '', desc: '', bg: '#ffffff', icon: 'star' };
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.style.display = 'flex';
    const safeTitle = (c.title || '').replace(/"/g, '&quot;');
    const safeDesc = (c.desc || '').replace(/</g, '&lt;');
    const safeBg = (c.bg || '#ffffff');
    const safeBgImg = (c.bgImg || '');
    const safeSize = (c.size || 160);
    const safeHtml = (c.htmlContent || '');
    const isHidden = c.hidden ? 'checked' : '';
    const isHideIcon = c.hideIcon ? 'checked' : '';
    const isHideText = c.hideText ? 'checked' : '';

    const icons = ['star', 'home', 'building', 'user', 'cog', 'heart', 'bell', 'search', 'map-marker-alt', 'phone', 'envelope', 'camera', 'wallet', 'history', 'shield-alt', 'question-circle', 'share-alt', 'bookmark', 'calendar', 'check-circle', 'plus', 'list'];
    const currentIcon = c.icon || 'star';

    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:20px; max-height:85vh; overflow-y:auto;">
            <h3 style="margin-bottom:15px; color:#1a2a3a;">Edit Option ${index + 1}</h3>
            <div class="form-group">
                <label>Option Title</label>
                <input id="src-title" class="login-input" value="${safeTitle}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea id="src-desc" class="login-input" rows="3">${safeDesc}</textarea>
            </div>
            <div class="form-group">
                <label>Select Icon</label>
                <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:8px; max-height:100px; overflow-y:auto; padding:5px; border:1px solid #eee; border-radius:8px;">
                    ${icons.map(icon => `
                        <div onclick="selectSellRentIcon(this, '${icon}')" class="icon-option-sr ${icon === currentIcon ? 'selected' : ''}" style="cursor:pointer; padding:8px; text-align:center; border-radius:6px; background:${icon === currentIcon ? '#e8f5e9' : 'transparent'}; border:${icon === currentIcon ? '1px solid #138808' : '1px solid transparent'};">
                            <i class="fas fa-${icon}" style="color:${icon === currentIcon ? '#138808' : '#666'};"></i>
                        </div>
                    `).join('')}
                </div>
                <input type="hidden" id="src-icon" value="${currentIcon}">
            </div>
            <div class="form-group">
                <label>Custom HTML Functionality</label>
                <textarea id="src-html" class="login-input" rows="5" placeholder="<div>My Custom Content</div><script>alert('Hello')</script>" style="font-family:monospace; font-size:0.85rem;">${safeHtml}</textarea>
                <div style="font-size:0.75rem; color:#666; margin-top:4px;">Enter HTML/Type script here. When clicked, this code will replace the entire page view.</div>
            </div>
            <div class="form-group">
                <label>Background Color</label>
                <input type="color" id="src-bg" value="${safeBg}" style="width:100%; height:50px; border:none; border-radius:8px; cursor:pointer;">
            </div>
            <div class="form-group">
                <label>Background Image URL (Optional)</label>
                <input id="src-bg-img" class="login-input" value="${safeBgImg}" placeholder="https://example.com/image.jpg">
            </div>
            <div class="form-group">
                <label>Box Height: <span id="src-size-val">${safeSize}px</span></label>
                <input type="range" id="src-size" min="100" max="300" step="10" value="${safeSize}" oninput="document.getElementById('src-size-val').innerText = this.value + 'px'" style="width:100%;">
            </div>
            <div class="form-group" style="background:#f9f9f9; padding:10px; border-radius:8px; border:1px solid #eee;">
                <label style="margin-bottom:8px; display:block; font-weight:600;">Display Options:</label>
                <div style="display:flex; flex-wrap:wrap; gap:15px;">
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="checkbox" id="src-hide-icon" ${isHideIcon} style="cursor:pointer;">
                        <label for="src-hide-icon" style="margin:0; cursor:pointer; font-size:0.9rem;">Hide Icon</label>
                    </div>
                    <div style="display:flex; align-items:center; gap:6px;">
                        <input type="checkbox" id="src-hide-text" ${isHideText} style="cursor:pointer;">
                        <label for="src-hide-text" style="margin:0; cursor:pointer; font-size:0.9rem;">Hide Text</label>
                    </div>
                </div>
            </div>
            <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="src-hidden" ${isHidden} style="width:20px; height:20px; cursor:pointer;">
                <label for="src-hidden" style="margin:0; font-weight:700; color:#D32F2F; cursor:pointer;">Disable (Hide) this Option</label>
            </div>
            <button class="login-btn" onclick="saveSellRentCard(${index})">Save Changes</button>
            <button class="prop-btn" style="background:none; color:#999; margin-top:10px; width:100%;" onclick="closeModal()">Cancel</button>
        </div>
    `;
};

window.selectSellRentIcon = function (el, icon) {
    document.querySelectorAll('.icon-option-sr').forEach(d => {
        d.style.background = 'transparent';
        d.style.border = '1px solid transparent';
        d.querySelector('i').style.color = '#666';
    });
    el.style.background = '#e8f5e9';
    el.style.border = '1px solid #138808';
    el.querySelector('i').style.color = '#138808';
    document.getElementById('src-icon').value = icon;
};

window.saveSellRentCard = function (index) {
    const title = document.getElementById('src-title').value;
    const desc = document.getElementById('src-desc').value;
    const htmlContent = document.getElementById('src-html').value;
    const bg = document.getElementById('src-bg').value;
    const bgImg = document.getElementById('src-bg-img').value;
    const icon = document.getElementById('src-icon').value;
    const size = document.getElementById('src-size').value;
    const hidden = document.getElementById('src-hidden').checked;
    const hideIcon = document.getElementById('src-hide-icon').checked;
    const hideText = document.getElementById('src-hide-text').checked;

    if (!State.sellRentPage) State.sellRentPage = { cards: [] };
    if (!State.sellRentPage.cards) State.sellRentPage.cards = [];
    while (State.sellRentPage.cards.length <= index) {
        State.sellRentPage.cards.push({ title: 'New Option', desc: 'Description', bg: '#ffffff', icon: 'star' });
    }

    const card = State.sellRentPage.cards[index];
    card.title = title;
    card.desc = desc;
    card.htmlContent = htmlContent;
    card.bg = bg;
    card.bgImg = bgImg;
    card.icon = icon;
    card.size = size;
    card.hidden = hidden;
    card.hideIcon = hideIcon;
    card.hideText = hideText;

    showGlobalLoader("Saving Option...");
    saveGlobalData().then(() => {
        hideGlobalLoader("Option Updated!");
        closeModal();
        render();
    });
};

window.deleteSellRentCard = function (index) {
    if (!confirm("Are you sure you want to delete this option?")) return;

    if (State.sellRentPage && State.sellRentPage.cards) {
        State.sellRentPage.cards.splice(index, 1);

        showGlobalLoader("Deleting Option...");
        saveGlobalData().then(() => {
            hideGlobalLoader("Option Deleted!");
            render();
        });
    }
};

window.handleSellRentCardClick = function (index) {
    const card = State.sellRentPage?.cards[index];
    if (!card) return;

    if (card.htmlContent && card.htmlContent.trim()) {
        const app = document.getElementById('app');

        app.innerHTML = `
            <div style="padding: 20px; max-width: 800px; margin: 0 auto;">
                <button onclick="navigate('sell-rent')" style="background:none; border:none; color:#138808; padding:0; font-size:0.9rem; font-weight:600; cursor:pointer; margin-bottom:20px; display:inline-flex; align-items:center; gap:8px;">
                    <span style="width:24px; height:24px; background:#e8f5e9; border-radius:50%; display:flex; align-items:center; justify-content:center;"><i class="fas fa-arrow-left" style="font-size:0.8rem;"></i></span>
                    Back
                </button>
                
                <div id="custom-card-container" style="width:100%;">
                    ${card.htmlContent}
                </div>
            </div>
        `;

        const scripts = app.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            oldScript.parentNode.replaceChild(newScript, oldScript);
        });

    } else {
        alert(`You clicked ${card.title}. No functionality (script) defined.`);
    }
};

window.openImageModal = (src) => {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div style="position:relative; max-width:90%; max-height:90%; animation: zoomIn 0.2s ease-out;">
             <button onclick="closeModal()" style="position:absolute; right:-15px; top:-15px; background:white; border:none; width:30px; height:30px; border-radius:50%; font-size:1.2rem; cursor:pointer; box-shadow:0 2px 10px rgba(0,0,0,0.3); z-index:10;">&times;</button>
             <img src="${src}" style="max-width:100%; max-height:80vh; border-radius:5px; box-shadow:0 10px 40px rgba(0,0,0,0.5);">
        </div>
    `;
};




// --- Messenger Popup Logic (User Side) ---
window.openMessenger = () => {
    if (!State.user) {
        showGlobalLoader("Please Login to chat with us!");
        setTimeout(() => { navigate('login'); hideGlobalLoader(); }, 1500);
        return;
    }

    const userId = State.user.id;
    State.activeChatId = userId;

    // Mark as seen when opening
    markMessagesAsSeen(userId, 'Admin');

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:0; border-radius:20px; overflow:hidden; border:none; background:#f0f2f5;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #FF9933, #138808); padding:15px 20px; color:white; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:40px; height:40px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#FF9933;">
                        <i class="fab fa-facebook-messenger" style="font-size:1.5rem;"></i>
                    </div>
                    <div>
                        <div style="font-weight:800; font-size:1rem;">BhumiDekho Support</div>
                        <div style="font-size:0.7rem; opacity:0.9;">Online | Direct Admin Contact</div>
                    </div>
                </div>
                <i class="fas fa-times" onclick="State.activeChatId=null; closeModal(); checkUnseenMessages();" style="cursor:pointer; font-size:1.2rem;"></i>
            </div>

            <!-- Chat Body -->
            <div id="chat-messages" style="height:350px; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:15px;">
                <!-- Messages will be injected here -->
            </div>

            <!-- Input Area -->
            <div style="background:white; padding:15px; display:flex; gap:10px; align-items:center; border-top:1px solid #eee;">
                <div onclick="openFileUpload(State.activeChatId)" style="width:40px; height:40px; background:#f0f2f5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#666; cursor:pointer; flex-shrink:0;">
                    <i class="fas fa-paperclip"></i>
                </div>
                <input type="text" id="chat-input" placeholder="Type a message..." style="flex:1; border:none; background:#f0f2f5; padding:10px 15px; border-radius:30px; outline:none; font-size:0.9rem;">
                <div onclick="sendMessageToAdmin()" style="width:40px; height:40px; background:#138808; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; box-shadow:0 4px 10px rgba(19, 136, 8, 0.2); flex-shrink:0;">
                    <i class="fas fa-paper-plane"></i>
                </div>
            </div>
        </div>
    `;

    renderChatMessages(userId);

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessageToAdmin();
    });
};

window.sendMessageToAdmin = () => {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !State.user) return;

    const userId = State.user.id;
    if (!State.messages[userId]) State.messages[userId] = [];

    State.messages[userId].push({
        sender: State.user.name,
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';
    renderChatMessages(userId);
    saveToFirebase();
};

window.openMessengerForUser = (userName, userId) => {
    State.activeChatId = userId;

    // Mark as seen by Admin
    markMessagesAsSeen(userId, userName);

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:0; border-radius:20px; overflow:hidden; border:none; background:#f0f2f5;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg, #138808, #1a2a3a); padding:15px 20px; color:white; display:flex; justify-content:space-between; align-items:center;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:40px; height:40px; background:white; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#138808;">
                        <i class="fas fa-user"></i>
                    </div>
                    <div>
                        <div style="font-weight:800; font-size:1rem;">Chat with ${userName}</div>
                        <div style="font-size:0.7rem; opacity:0.9;">Direct Message from Admin</div>
                    </div>
                </div>
                <i class="fas fa-times" onclick="State.activeChatId=null; closeModal(); checkUnseenMessages();" style="cursor:pointer; font-size:1.2rem;"></i>
            </div>

            <!-- Chat Body -->
            <div id="chat-messages-user" style="height:350px; overflow-y:auto; padding:20px; display:flex; flex-direction:column; gap:15px;">
                <!-- Messages will be injected here -->
            </div>

            <!-- Input Area -->
            <div style="background:white; padding:15px; display:flex; gap:10px; align-items:center; border-top:1px solid #eee;">
                <div onclick="openFileUpload('${userId}')" style="width:40px; height:40px; background:#f0f2f5; border-radius:50%; display:flex; align-items:center; justify-content:center; color:#666; cursor:pointer; flex-shrink:0;">
                    <i class="fas fa-paperclip"></i>
                </div>
                <input type="text" id="chat-input-user" placeholder="Type a message to ${userName}..." style="flex:1; border:none; background:#f0f2f5; padding:10px 15px; border-radius:30px; outline:none; font-size:0.9rem;">
                <div onclick="sendAdminUserRealMessage('${userId}')" style="width:40px; height:40px; background:#1a2a3a; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; cursor:pointer; box-shadow:0 4px 10px rgba(26, 42, 58, 0.2); flex-shrink:0;">
                    <i class="fas fa-paper-plane"></i>
                </div>
            </div>
        </div>
    `;

    renderChatMessages(userId);

    document.getElementById('chat-input-user').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAdminUserRealMessage(userId);
    });
};

window.sendAdminUserRealMessage = (userId, inputId = 'chat-input-user') => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    if (!State.messages[userId]) State.messages[userId] = [];

    State.messages[userId].push({
        sender: 'Admin',
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    input.value = '';

    // Update both views if open
    renderChatMessages(userId); // For modal
    render(); // For desktop view

    saveToFirebase();
};

// --- Notification System ---

window.markMessagesAsSeen = (chatId, otherUserName) => {
    if (!State.messages || !State.messages[chatId]) return;

    let changed = false;
    // Determine my name strictly
    let myName = 'Guest';
    if (State.user) myName = State.user.name;
    else if (State.view === 'admin') myName = 'Admin';

    State.messages[chatId].forEach(m => {
        // If message is NOT from me, and not seen, mark seen
        if (m.sender !== myName && !m.seen) {
            m.seen = true;
            changed = true;
        }
    });

    if (changed) {
        saveToFirebase(); // Sync to Firebase
        // Re-render only if current chat is open to show ticks update immediately
        if (State.activeChatId === chatId) {
            renderChatMessages(chatId);
        }
        checkUnseenMessages();
    }
};

// Send Broadcast Message to All Users
window.sendBroadcastMessage = (messageText) => {
    if (!messageText || messageText.trim() === '') {
        alert('Please enter a message!');
        return;
    }

    const broadcastMsg = {
        id: Date.now(),
        sender: 'BhumiDekho',
        text: messageText.trim(),
        time: new Date().toLocaleString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short'
        }),
        timestamp: Date.now(),
        seen: false
    };

    // Add to broadcast messages array
    State.broadcastMessages.push(broadcastMsg);

    // Save to Firebase
    saveToFirebase();

    // Show notification to all active users
    if ('Notification' in navigator && Notification.permission === 'granted') {
        new Notification('📢 BhumiDekho Announcement', {
            body: messageText.trim(),
            icon: 'logo.png',
            vibrate: [200, 100, 200],
            tag: 'broadcast-' + broadcastMsg.id
        });
    }

    // Vibrate
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
    }

    alert('Broadcast message sent to all users!');

    // Clear input if exists
    const input = document.getElementById('broadcast-input');
    if (input) input.value = '';
};

window.checkUnseenMessages = () => {
    if (!State.messages) return;

    // Determine who 'me' is
    let myName = 'Guest';
    let isAdmin = false;

    if (State.user) {
        myName = State.user.name;
    } else if (State.view === 'admin') {
        myName = 'Admin';
        isAdmin = true;
    }

    let hasUnseen = false;
    let latestMessage = null; // Track the latest unread message

    // Check all conversations
    Object.keys(State.messages).forEach(chatId => {
        const msgs = State.messages[chatId];
        // Look for messages NOT from me, and NOT seen
        // Fix: Ensure we don't count my own messages as unseen

        let participantName = 'Admin'; // Default sender to check against if I am User
        if (isAdmin) {
            // If I am Admin, I want to see if User sent me something
            // In State.messages, messages don't store sender ID, just name.
            // But we know if I am Admin, 'Admin' sent messages are mine.
            // So any message where sender != 'Admin' is from user.
            const unreadMessages = msgs.filter(m => m.sender !== 'Admin' && !m.seen);
            if (unreadMessages.length > 0) {
                hasUnseen = true;
                // Get the latest unread message
                latestMessage = unreadMessages[unreadMessages.length - 1];
            }
        } else {
            // If I am User, I want to see if 'Admin' sent me something.
            // And ONLY in my own chat thread (chatId == my userId)
            if (chatId == State.user?.id) {
                const unreadMessages = msgs.filter(m => m.sender === 'Admin' && !m.seen);
                if (unreadMessages.length > 0) {
                    hasUnseen = true;
                    // Get the latest unread message
                    latestMessage = unreadMessages[unreadMessages.length - 1];
                }
            }
        }
    });

    // Update UI - Green Dot
    const dot = document.getElementById('chat-notification-dot');

    if (hasUnseen) {
        const wasUnseen = document.body.classList.contains('has-unread-messages');
        document.body.classList.add('has-unread-messages');

        if (dot) dot.style.display = 'block';

        // Specific Button Targets
        const supportBtn = document.querySelector('.float-support-btn'); // If exists
        if (supportBtn) supportBtn.classList.add('pulse-green');

        // Admin sidebar messages link
        const adminMsgLink = document.querySelector('a[onclick*="renderAdminMessages"]');
        if (adminMsgLink) {
            let badge = adminMsgLink.querySelector('.badge-dot');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'badge-dot';
                badge.style.cssText = 'width:10px; height:10px; background:#138808; border-radius:50%; margin-left:10px; display:inline-block; animation: blink 1s infinite;';
                adminMsgLink.appendChild(badge);
            }
        }


        // Notification for new messages with vibration
        if (!wasUnseen && latestMessage) {
            let senderName = latestMessage.sender || "Someone";

            // Replace "Admin" with "BhumiDekho" for better branding
            if (senderName === "Admin") {
                senderName = "BhumiDekho";
            }

            const messageText = latestMessage.text || "New message";

            console.log('🔔 New message detected!');
            console.log('Sender:', senderName);
            console.log('Message:', messageText);
            console.log('Notification permission:', Notification.permission);

            // Vibrate on new message (mobile support)
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
                console.log('📳 Vibration triggered');
            }

            // Play notification sound
            if (typeof playNotificationSound === 'function') {
                playNotificationSound();
            }

            // Show in-app notification (WhatsApp style)
            if (typeof showInAppNotification === 'function') {
                showInAppNotification(senderName, messageText, latestMessage.time);
            }

            // Browser Notification
            if ("Notification" in window) {
                if (Notification.permission === "granted") {
                    console.log('✅ Showing notification...');
                    try {
                        const notification = new Notification(`💬 ${senderName}`, {
                            body: messageText,
                            icon: "logo.png",
                            badge: "logo.png",
                            vibrate: [200, 100, 200],
                            tag: 'chat-message',
                            requireInteraction: false,
                            silent: false,
                            data: { chatId: State.activeChatId || 'admin' }
                        });

                        notification.onclick = () => {
                            window.focus();
                            notification.close();

                            // Open chat when notification clicked
                            if (State.user) {
                                // User view - open messenger
                                State.view = 'home';
                                render();
                                setTimeout(() => {
                                    const messengerBtn = document.querySelector('[onclick*="openMessenger"]');
                                    if (messengerBtn) messengerBtn.click();
                                }, 100);
                            }

                            console.log('📱 Notification clicked - opening chat');
                        };

                        console.log('✅ Notification shown successfully!');
                    } catch (error) {
                        console.error('❌ Error showing notification:', error);
                    }
                } else if (Notification.permission === "default") {
                    console.log('⚠️ Requesting notification permission...');
                    Notification.requestPermission().then(permission => {
                        console.log('Permission result:', permission);
                        if (permission === "granted") {
                            new Notification(`💬 ${senderName}`, {
                                body: messageText,
                                icon: "logo.png",
                                vibrate: [200, 100, 200]
                            });
                        }
                    });
                } else {
                    console.log('❌ Notification permission denied');
                }
            }
        } else {
            console.log('ℹ️ No new message to notify - wasUnseen:', wasUnseen, 'latestMessage:', !!latestMessage);
        }

    } else {
        document.body.classList.remove('has-unread-messages');
        if (dot) dot.style.display = 'none';

        const adminMsgLink = document.querySelector('a[onclick*="renderAdminMessages"]');
        if (adminMsgLink) {
            const badge = adminMsgLink.querySelector('.badge-dot');
            if (badge) badge.remove();
        }
    }
};

// Request Notification Permission on load (Standard System)
if ("Notification" in window) {
    if (Notification.permission === "default") {
        // Ask for permission after a short delay for better UX
        setTimeout(() => {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Notification permission granted!");
                    // Show a welcome notification
                    new Notification("🎉 BhumiDekho", {
                        body: "Notifications enabled! You'll receive updates for new messages.",
                        icon: "logo.png",
                        vibrate: [200, 100, 200]
                    });
                }
            });
        }, 2000); // Wait 2 seconds after page load
    }
}

// Initial check on load
setInterval(checkUnseenMessages, 3000); // Periodic check every 3s

window.addSellRentCard = (role) => {
    const title = prompt('1. Enter Card Title:');
    if (!title) return;
    const icon = prompt('2. Enter Icon Class (e.g., home, plus):', 'star');
    const bg = prompt('3. Enter Background Color (Hex):', '#ffffff');
    const bgImg = prompt('4. Enter Background Image URL (Optional):', '');
    const hideIcon = confirm('5. Hide Icon?');
    const desc = prompt('6. Description (Internal):', '');

    const target = State.sellRentPage;
    if (!target.cards) target.cards = [];
    target.cards.push({ title, desc, icon, bg, bgImg, hideIcon, hidden: false });
    saveGlobalData();
    render();
};

window.editSellRentCard = (role, index) => {
    const target = State.sellRentPage;
    const card = target.cards[index];
    card.title = prompt('1. Title:', card.title) || card.title;
    card.icon = prompt('2. Icon Class:', card.icon) || card.icon;
    card.bg = prompt('3. BG Color:', card.bg) || card.bg;
    card.bgImg = prompt('4. BG Image URL:', card.bgImg || '') || card.bgImg;
    card.hideIcon = confirm('5. Hide Icon?');
    card.desc = prompt('6. Description:', card.desc) || card.desc;
    saveGlobalData();
    render();
};

window.deleteSellRentCard = (role, index) => {
    if (confirm('Delete this card?')) {
        State.sellRentPage.cards.splice(index, 1);
        saveGlobalData();
        render();
    }
};

window.saveSellRentHeader = (role) => {
    if (!State.sellRentPage) State.sellRentPage = { cards: [] };
    State.sellRentPage.heading = document.getElementById('sr-heading').value;
    State.sellRentPage.subHeading = document.getElementById('sr-subheading').value;
    saveGlobalData();
    alert('Header Saved!');
    render();
};

window.saveSellRentGlobalSettings = () => {
    if (!State.sellRentPage) State.sellRentPage = { cards: [] };
    if (!State.sellRentPage.settings) State.sellRentPage.settings = {};

    State.sellRentPage.settings = {
        minWidth: parseInt(document.getElementById('sr-set-minwidth').value),
        minHeight: parseInt(document.getElementById('sr-set-minheight').value),
        iconSize: parseFloat(document.getElementById('sr-set-iconsize').value),
        iconBox: parseInt(document.getElementById('sr-set-iconbox').value),
        fontSize: parseFloat(document.getElementById('sr-set-fontsize').value),
        padding: parseInt(document.getElementById('sr-set-padding').value)
    };

    saveGlobalData();
    alert('Layout Settings Saved!');
    render();
};

window.addCity = () => {
    const input = document.getElementById('new-city-name');
    const val = input.value.trim();
    if (!val) return alert("Please enter a city name");

    if (!State.settings.cities) State.settings.cities = [];
    if (State.settings.cities.includes(val)) return alert("City already exists!");

    State.settings.cities.push(val);
    saveGlobalData();
    input.value = '';
    render();
    alert("City Added!");
};

window.deleteCity = (idx) => {
    if (confirm("Remove this city from the list?")) {
        State.settings.cities.splice(idx, 1);
        saveGlobalData();
        render();
    }
};

window.addPropertyType = () => {
    const input = document.getElementById('new-property-type');
    const val = input.value.trim();
    if (!val) return alert("Please enter a property type");

    if (!State.settings.propertyTypes) State.settings.propertyTypes = ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House'];
    if (State.settings.propertyTypes.includes(val)) return alert("Type already exists!");

    State.settings.propertyTypes.push(val);
    saveGlobalData();
    input.value = '';
    render();
    alert("Property Type Added!");
};

window.deletePropertyType = (idx) => {
    if (confirm("Remove this property type?")) {
        State.settings.propertyTypes.splice(idx, 1);
        saveGlobalData();
        render();
    }
};
// Indian States and Districts Data
const INDIA_LOCATIONS = {
    "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Prakasam", "Srikakulam", "Sri Potti Sriramulu Nellore", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR District", "Kadapa (Cuddapah)"],
    "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kra Daadi", "Kurung Kumey", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Papum Pare", "Siang", "Tawang", "Tirap", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang", "Itanagar"],
    "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao (North Cachar Hills)", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
    "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran (Motihari)", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur (Bhabua)", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger (Monghyr)", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia (Purnea)", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
    "Chhattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada (South Bastar)", "Dhamtari", "Durg", "Gariyaband", "Janjgir-Champa", "Jashpur", "Kabirdham (Kawardha)", "Kanker (North Bastar)", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
    "Goa": ["North Goa", "South Goa"],
    "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha (Palanpur)", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang (Ahwa)", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kachchh", "Kheda (Nadiad)", "Mahisagar", "Mehsana", "Morbi", "Narmada (Rajpipla)", "Navsari", "Panchmahal (Godhra)", "Patan", "Porbandar", "Rajkot", "Sabarkantha (Himmatnagar)", "Surat", "Surendranagar", "Tapi (Vyara)", "Vadodara", "Valsad"],
    "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram (Gurgaon)", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Nuh", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
    "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul &amp; Spiti", "Mandi", "Shimla", "Sirmaur (Sirmour)", "Solan", "Una"],
    "Jammu & Kashmir": ["Anantnag", "Bandipora", "Baramulla", "Budgam", "Doda", "Ganderbal", "Jammu", "Kathua", "Kishtwar", "Kulgam", "Kupwara", "Poonch", "Pulwama", "Rajouri", "Ramban", "Reasi", "Samba", "Shopian", "Srinagar", "Udhampur"],
    "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum (Jamshedpur)", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribag", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela-Kharsawan", "Simdega", "West Singhbhum (Chaibasa)"],
    "Karnataka": ["Bagalkot", "Ballari (Bellary)", "Belagavi (Belgaum)", "Bengaluru (Bangalore) Rural", "Bengaluru (Bangalore) Urban", "Bidar", "Chamarajanagar", "Chikballapur", "Chikkamagaluru (Chikmagalur)", "Chitradurga", "Dakshina Kannada", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru (Mysore)", "Raichur", "Ramanagara", "Shivamogga (Shimoga)", "Tumakuru (Tumkur)", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"],
    "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
    "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
    "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
    "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
    "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
    "Mizoram": ["Aizawl", "Champhai", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Serchhip"],
    "Nagaland": ["Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Peren", "Phek", "Tuensang", "Wokha", "Zunheboto"],
    "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar (Keonjhar)", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur (Sonepur)", "Sundargarh"],
    "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Nawanshahr (Shahid Bhagat Singh Nagar)", "Pathankot", "Patiala", "Rupnagar", "Sahibzada Ajit Singh Nagar (Mohali)", "Sangrur", "Tarn Taran"],
    "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
    "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
    "Tamil Nadu": ["Ariyalur", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kanchipuram", "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Salem", "Sivaganga", "Thanjavur", "Theni", "Thoothukudi (Tuticorin)", "Tiruchirappalli", "Tirunelveli", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
    "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhoopalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahabubnagar", "Mancherial", "Medak", "Medchal", "Nagarkurnool", "Nalgonda", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal (Rural)", "Warangal (Urban)", "Yadadri Bhuvanagiri"],
    "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
    "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
    "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Faizabad", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
    "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur (South Dinajpur)", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Medinipur (West Medinipur)", "Paschim (West) Burdwan (Bardhaman)", "Purba Medinipur (East Medinipur)", "Purba (East) Burdwan (Bardhaman)", "Purulia", "South 24 Parganas", "Uttar Dinajpur (North Dinajpur)"],
};
window.indianStates = INDIA_LOCATIONS;

// Helper to handle state change updates
window.handleStateChange = (selectEl) => {
    // We need to capture existing data first!
    const allInputs = document.querySelectorAll('#add-prop-form input, #add-prop-form select, #add-prop-form textarea');
    if (!window.tempFormData) window.tempFormData = {};
    allInputs.forEach(input => {
        if (input.id) window.tempFormData[input.id] = input.value;
    });

    // Update specific changed value
    window.tempFormData['p-state'] = selectEl.value;
    window.tempFormData['p-district'] = ''; // Reset district

    // Re-render
    renderPropertyForm();
};

// Clear all search filters
window.clearAllFilters = () => {
    State.searchState = '';
    State.searchDistrict = '';
    State.homeSearch = '';
    State.searchType = '';
    render();
};

// ==========================================
// ADMIN EDIT PROPERTY (FRESH IMPLEMENTATION)
// ==========================================

// Helper: Set properties from admin list (called by admin.php)
window.setAdminProperties = (list) => { State.properties = list || []; };

window.openAdminEditProperty = (propId) => {
    console.log('Opening Admin Edit for:', propId);

    // Find Property
    const prop = State.properties.find(p => p.id == propId);
    if (!prop) {
        alert('Property data not found in local state. Please wait for list to load or refresh.');
        return;
    }

    // Parse Extra Details safely
    let extraDetails = [];
    try {
        extraDetails = typeof prop.extra_details === 'string' ? JSON.parse(prop.extra_details) : (prop.extra_details || []);
    } catch (e) { console.error(e); }

    // RENDER MODAL HTML
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    modal.style.display = 'block'; // Make sure container is visible
    modal.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
            box-sizing: border-box;
            backdrop-filter: blur(5px);
        ">
            <div style="
                background: white;
                width: 100%;
                max-width: 700px;
                max-height: 90vh;
                border-radius: 12px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                overflow: hidden;
                animation: slideUp 0.3s ease-out;
            ">
                <!-- Header -->
                <div style="padding: 15px 20px; background: linear-gradient(135deg, #1a2a3a 0%, #2c3e50 100%); color: white; display:flex; justify-content:space-between; align-items:center; flex-shrink: 0;">
                    <h3 style="margin:0; font-size:1.1rem; font-weight:600;"><i class="fas fa-edit"></i> Edit Property #${propId}</h3>
                    <button onclick="document.getElementById('modal-container').style.display='none'" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">&times;</button>
                </div>

                <!-- Scrollable Form -->
                <div style="flex: 1; overflow-y: auto; padding: 25px; background: #f8f9fa;">
                    <form id="admin-edit-form" onsubmit="event.preventDefault(); window.submitAdminEdit(${propId});">
                        
                        <!-- 1. Basic Info -->
                        <div class="edit-section" style="background:white; padding:20px; border-radius:10px; margin-bottom:20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <h4 style="margin:0 0 15px 0; color:#138808; border-bottom:1px solid #eee; padding-bottom:10px; font-size:1rem;">Basic Details</h4>
                            
                            <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Title</label>
                            <input type="text" id="ae-title" value="${prop.title}" required style="width:100%; padding:12px; margin-bottom:15px; border:1px solid #ddd; border-radius:6px; font-size:1rem;">

                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Category</label>
                                    <select id="ae-cat" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                        ${(State.settings.propertyTypes || ['Plot', 'Residential', 'Commercial', 'Agricultural Land']).map(c =>
        `<option value="${c}" ${prop.type === c ? 'selected' : ''}>${c}</option>`
    ).join('')}
                                    </select>
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Area / Size</label>
                                    <input type="text" id="ae-area" value="${prop.area}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                            </div>
                            
                            <label style="display:block; margin-top:15px; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Description</label>
                            <textarea id="ae-desc" rows="4" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px; resize:vertical;">${prop.description}</textarea>
                        </div>

                        <!-- 2. Location -->
                        <div class="edit-section" style="background:white; padding:20px; border-radius:10px; margin-bottom:20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <h4 style="margin:0 0 15px 0; color:#138808; border-bottom:1px solid #eee; padding-bottom:10px; font-size:1rem;">Location</h4>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">State</label>
                                    <select id="ae-state" onchange="updateAdminDistricts(this.value)" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                        ${Object.keys(window.indianStates || {}).length > 0 ? Object.keys(window.indianStates).map(s => `<option value="${s}" ${prop.state === s ? 'selected' : ''}>${s}</option>`).join('') : '<option value="Bihar">Bihar</option>'}
                                    </select>
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">District</label>
                                    <select id="ae-district" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                        <option value="${prop.district}">${prop.district}</option>
                                    </select>
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">City</label>
                                    <input type="text" id="ae-city" value="${prop.city}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Pincode</label>
                                    <input type="number" id="ae-pincode" value="${prop.pincode || ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                            </div>
                        </div>

                        <!-- 3. Price & Contacts -->
                        <div class="edit-section" style="background:white; padding:20px; border-radius:10px; margin-bottom:20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <h4 style="margin:0 0 15px 0; color:#138808; border-bottom:1px solid #eee; padding-bottom:10px; font-size:1rem;">Price & Contacts</h4>
                             <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Total Price</label>
                                    <input type="text" id="ae-price" value="${prop.price}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Price per Sq.ft</label>
                                    <input type="text" id="ae-sqft" value="${prop.price_per_sqft || ''}" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                            </div>
                            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px; margin-top:15px;">
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Contact Mobile</label>
                                    <input type="tel" id="ae-mobile" value="${prop.contact_mobile}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                                <div>
                                    <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">WhatsApp</label>
                                    <input type="tel" id="ae-whatsapp" value="${prop.contact_whatsapp}" required style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                                </div>
                            </div>
                        </div>

                        <!-- 4. Media & Links -->
                        <div class="edit-section" style="background:white; padding:20px; border-radius:10px; margin-bottom:20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <h4 style="margin:0 0 15px 0; color:#138808; border-bottom:1px solid #eee; padding-bottom:10px; font-size:1rem;">Media & Links</h4>
                            
                            <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">YouTube Video URL</label>
                            <input type="text" id="ae-video" value="${prop.youtube_video || ''}" placeholder="https://youtube.com/..." style="width:100%; padding:10px; margin-bottom:15px; border:1px solid #ddd; border-radius:6px;">

                            <label style="display:block; margin-bottom:5px; font-weight:600; font-size:0.9rem;">Map Location URL</label>
                            <input type="text" id="ae-map" value="${prop.map_link || ''}" placeholder="Google Maps Link" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:6px;">
                        </div>

                        <!-- 5. Custom Details -->
                        <div class="edit-section" style="background:white; padding:20px; border-radius:10px; margin-bottom:20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #eee; padding-bottom:10px; margin-bottom:15px;">
                                <h4 style="margin:0; color:#138808; font-size:1rem;">Extra Details</h4>
                                <button type="button" onclick="addAdminCustomField()" style="background:#e8f5e9; color:#138808; border:1px dashed #138808; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:600;">+ Add Field</button>
                            </div>
                            <div id="ae-custom-fields"></div>
                        </div>

                        <!-- Action Buttons -->
                        <div style="display:flex; gap:15px; margin-top:10px;">
                            <button type="submit" style="flex:1; background:#138808; color:white; padding:15px; border:none; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer; box-shadow: 0 4px 10px rgba(19,136,8,0.3);">UPDATE PROPERTY</button>
                            <button type="button" onclick="document.getElementById('modal-container').style.display='none'" style="flex:1; background:white; color:#D32F2F; border:1px solid #D32F2F; padding:15px; border-radius:8px; font-size:1rem; font-weight:600; cursor:pointer;">CANCEL</button>
                        </div>

                    </form>
                </div>
            </div>
            <style>
                @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            </style>
        </div>
    `;

    // Populate Custom Fields
    const customContainer = document.getElementById('ae-custom-fields');
    if (extraDetails && extraDetails.length > 0) {
        extraDetails.forEach(d => {
            appendAdminCustomField(d.label || d.title, d.value);
        });
    }

    // Populate District options properly
    updateAdminDistricts(prop.state, prop.district);
};

// Helper: Update Districts in Admin Edit
window.updateAdminDistricts = (state, selectedDist = null) => {
    const dSelect = document.getElementById('ae-district');
    if (!dSelect) return;

    // Add check to ensure state exists in INDIAN_LOCATIONS (window.indianStates might be undefined if not initialized yet, but it should be)
    // Using global check
    const statesMap = window.indianStates || window.INDIA_LOCATIONS || {};
    const districts = statesMap[state] || [];

    dSelect.innerHTML = districts.map(d => `<option value="${d}" ${d === selectedDist ? 'selected' : ''}>${d}</option>`).join('');

    // If no selected district provided, select first
    if (!selectedDist && districts.length > 0) dSelect.value = districts[0];
    // If selected provided, it is set by 'selected' attr above
};

// Helper: Add Custom Field in Admin Edit
window.addAdminCustomField = () => {
    appendAdminCustomField("New Title", "");
};

window.appendAdminCustomField = (label, val) => {
    const container = document.getElementById('ae-custom-fields');
    const div = document.createElement('div');
    div.className = 'ae-extra-row';
    div.style.cssText = 'display:flex; gap:10px; margin-bottom:10px; align-items:center;';

    // Very simple input structure
    div.innerHTML = `
        <div style="flex:1;">
            <input type="text" class="ae-extra-label" value="${label}" placeholder="Label" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
        <div style="flex:2;">
            <input type="text" class="ae-extra-val" value="${val}" placeholder="Value" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:4px;">
        </div>
        <button type="button" onclick="this.parentElement.remove()" style="color:#D32F2F; border:none; background:none; cursor:pointer; font-size:1.2rem; padding:0 5px;">&times;</button>
    `;
    container.appendChild(div);
};

// Submit Logic
window.submitAdminEdit = async (propId) => {
    if (!confirm('Save changes to this property?')) return;

    // Collect Data
    const formData = new FormData();
    formData.append('is_admin_edit', '1');
    formData.append('action', 'edit_property_full'); // Using a specific action name helps backend distinguishing
    // Note: ensure api/property.php handles 'edit_property_full' OR uses fallback to 'add_property' + id update logic. 
    // I will stick to 'add_user_property' if that is what was used, but that might imply user logic.
    // Safest is 'edit_property' + check for ID.
    formData.append('action', 'edit_property');

    formData.append('id', propId);
    formData.append('title', document.getElementById('ae-title').value);
    formData.append('category', document.getElementById('ae-cat').value);
    formData.append('area', document.getElementById('ae-area').value);
    formData.append('description', document.getElementById('ae-desc').value);
    formData.append('state', document.getElementById('ae-state').value);
    formData.append('district', document.getElementById('ae-district').value);
    formData.append('city', document.getElementById('ae-city').value);
    formData.append('pincode', document.getElementById('ae-pincode').value);
    formData.append('price', document.getElementById('ae-price').value);
    formData.append('price_per_sqft', document.getElementById('ae-sqft').value);
    formData.append('contact_mobile', document.getElementById('ae-mobile').value);
    formData.append('contact_whatsapp', document.getElementById('ae-whatsapp').value);
    formData.append('youtube_video', document.getElementById('ae-video').value);
    formData.append('map_link', document.getElementById('ae-map').value);

    // Custom Details
    const extras = [];
    document.querySelectorAll('.ae-extra-row').forEach(row => {
        extras.push({
            label: row.querySelector('.ae-extra-label').value,
            value: row.querySelector('.ae-extra-val').value
        });
    });
    formData.append('extra_details', JSON.stringify(extras));

    try {
        // Show loader
        const btn = document.querySelector('#admin-edit-form button[type="submit"]');
        const oldText = btn.innerText;
        btn.innerText = 'SAVING...';
        btn.disabled = true;

        const res = await fetch('api/property.php', { method: 'POST', body: formData });

        // Handle non-JSON response (e.g. PHP warnings)
        const text = await res.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch (e) {
            console.error('Server returned invalid JSON:', text);
            alert('Server Error (Check Console for details)');
            btn.innerText = oldText;
            btn.disabled = false;
            return;
        }

        if (result.status === 'success') {
            alert('Property Updated Successfully!');
            document.getElementById('modal-container').style.display = 'none';
            // Reload list
            if (window.loadAdminProps) window.loadAdminProps();
        } else {
            alert('Error: ' + (result.message || 'Update failed'));
        }

        btn.innerText = oldText;
        btn.disabled = false;

    } catch (err) {
        console.error(err);
        alert('Request Failed');
    }
};

// =========================================================================
// PREMIUM MEMBERSHIP PLAN MANAGEMENT (ADMIN)
// =========================================================================

window.manageAgentPlan = (agentId) => {
    const agent = State.agents.find(a => a.id === agentId);
    if (!agent) return;

    const modal = document.getElementById('modal-container');
    if (!modal) return;

    // Set proper modal styling (Override any previous inline styles)
    modal.style.display = 'flex';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.style.zIndex = '9999';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    const currentPlan = agent.currentPlan || 'Free';

    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:15px; width:90%; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; animation: slideIn 0.3s ease-out;">
            <button onclick="closeModal()" style="position:absolute; right:15px; top:15px; background:none; border:none; font-size:1.2rem; cursor:pointer; color:#666;">&times;</button>
            
            <h3 style="margin-top:0; color:#1a2a3a; text-align:center; border-bottom:1px solid #eee; padding-bottom:15px; display:flex; align-items:center; justify-content:center; gap:10px;">
                <i class="fas fa-crown" style="color:#FFD700;"></i> Manage Plan
            </h3>
            
            <div style="text-align:center; margin-bottom:20px; background:#f9f9f9; padding:10px; border-radius:10px;">
                <div style="font-size:1.1rem; font-weight:700;">${agent.name}</div>
                <div style="font-size:0.9rem; color:#666; margin-top:5px;">Current: <span style="color:#138808; font-weight:700; text-transform:uppercase;">${currentPlan}</span></div>
                 ${agent.planExpiry ? `<div style="font-size:0.8rem; color:${Date.now() > agent.planExpiry ? 'red' : '#888'}">Exp: ${new Date(agent.planExpiry).toLocaleDateString()}</div>` : ''}
            </div>
            
            <div style="margin-bottom:15px;">
                <label style="display:block; font-weight:600; margin-bottom:5px; color:#333;">Select New Plan:</label>
                <select id="new-plan-select" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:1rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='#138808'">
                    <option value="Free" ${currentPlan === 'Free' ? 'selected' : ''}>Free (0 Listings)</option>
                    <option value="Silver" ${currentPlan === 'Silver' ? 'selected' : ''}>Silver (3 Listings)</option>
                    <option value="Gold" ${currentPlan === 'Gold' ? 'selected' : ''}>Gold (10 Listings)</option>
                    <option value="Platinum" ${currentPlan === 'Platinum' ? 'selected' : ''}>Platinum (Unlimited)</option>
                </select>
            </div>

            <div style="margin-bottom:25px;">
                <label style="display:block; font-weight:600; margin-bottom:5px; color:#333;">Validity (Days):</label>
                <input type="number" id="plan-days" value="30" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; font-size:1rem; outline:none; transition:border 0.2s;" onfocus="this.style.borderColor='#138808'">
            </div>

            <button onclick="saveAgentPlan(${agentId})" style="width:100%; padding:12px; background:linear-gradient(135deg, #FFD700, #FDB931); color:#333; font-weight:700; border:none; border-radius:8px; cursor:pointer; margin-bottom:10px; font-size:1rem; box-shadow:0 4px 10px rgba(255, 215, 0, 0.3); transition:transform 0.1s;" onmousedown="this.style.transform='scale(0.98)'" onmouseup="this.style.transform='scale(1)'">
                UPDATE PLAN
            </button>
        </div>
    `;
};

window.saveAgentPlan = async (agentId) => {
    const agent = State.agents.find(a => a.id === agentId);
    const planSelect = document.getElementById('new-plan-select');
    const daysInput = document.getElementById('plan-days');

    if (!agent || !planSelect || !daysInput) return;

    const plan = planSelect.value;
    const days = parseInt(daysInput.value) || 30;

    // Update Agent Data
    agent.currentPlan = plan;
    if (plan !== 'Free') {
        agent.planExpiry = Date.now() + (days * 24 * 60 * 60 * 1000);
        // Reset usage on plan upgrade/renewal
        agent.listingsUsed = 0;

        // Ensure status is active/approved
        if (agent.status !== 'blocked') agent.status = 'approved';

        // Un-hide properties if they were hidden due to expiry
        if (State.properties) {
            State.properties.forEach(p => {
                if (p.agentId === agent.id && p.status === 'hidden' && p.disableReason === 'Plan Expired') {
                    p.status = 'approved';
                    delete p.disableReason;
                }
            });
        }
    } else {
        agent.planExpiry = null;
    }

    await saveGlobalData();
    closeModal();
    render(); // Re-render admin view

    alert(`Success! Plan updated to ${plan} for ${agent.name}.`);
};

// =========================================================================
// AGENT SELF-MEMBERSHIP PURCHASE
// =========================================================================

// =========================================================================
// AGENT SELF-MEMBERSHIP PURCHASE
// =========================================================================

window.buyMembership = async (planName, price, limit, duration = 30) => {
    const agent = State.agents.find(a => a.id === State.user.id);
    if (!agent) return;

    if (agent.currentPlan === planName && agent.planExpiry > Date.now()) {
        alert("You already have this active plan!");
        return;
    }

    if ((agent.wallet || 0) < price) {
        alert(`Insufficient Balance!\nYou need Rs. ${price} but have only Rs. ${agent.wallet || 0}.\nPlease recharge your wallet.`);
        setAgentTab('wallet'); // Redirect to wallet
        return;
    }

    if (confirm(`Confirm Purchase?\nPlan: ${planName}\nPrice: Rs. ${price}\nValidity: ${duration} Days`)) {
        // Deduct Balance
        agent.wallet -= price;

        // Update Plan
        agent.currentPlan = planName;
        agent.planExpiry = Date.now() + (duration * 24 * 60 * 60 * 1000);
        agent.listingsUsed = 0; // Reset usage for new plan

        // Ensure Approved Status if blocked due to expiry
        if (agent.status === 'blocked' || agent.currentPlan === 'Expired') {
            agent.status = 'approved';
        }

        // Unhide properties if they were hidden
        if (State.properties) {
            State.properties.forEach(p => {
                if (p.agentId === agent.id && p.status === 'hidden' && p.disableReason === 'Plan Expired') {
                    p.status = 'approved';
                    delete p.disableReason;
                }
            });
        }

        // Record Transaction
        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now(),
            agentId: agent.id,
            amount: price,
            type: 'debit',
            remark: `Purchased ${planName} Plan (${duration} Days)`,
            date: new Date().toLocaleString(),
            status: 'success'
        });

        await saveGlobalData();
        render(); // Re-render to show new status

        // Success Message
        alert(`Congratulations! You are now a ${planName} Member.\nYour plan is active for ${duration} days.`);
    }
};

// --- Premium Plans Management Actions ---

window.openPlanModal = (id = null) => {
    const modal = document.getElementById('modal-container');
    const p = id ? State.premiumPlans.find(x => x.id == id) : { name: '', price: '', duration: 30, credits: 0, description: '', color: '#138808' };
    const isEdit = !!id;

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:25px; max-height:85vh; overflow-y:auto;">
            <h3 style="margin-top:0; color:#1a2a3a; margin-bottom:20px;">
                ${isEdit ? '<i class="fas fa-edit"></i> Edit Plan' : '<i class="fas fa-plus-circle"></i> Create New Plan'}
            </h3>
            
            <input type="hidden" id="plan-id" value="${id || ''}">
            
            <div class="form-group">
                <label>Plan Name</label>
                <input type="text" id="plan-name" class="login-input" value="${p.name}" placeholder="e.g. Gold Plan">
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div class="form-group">
                    <label>Price (₹)</label>
                    <input type="number" id="plan-price" class="login-input" value="${p.price}" placeholder="e.g. 999">
                </div>
                <div class="form-group">
                    <label>Duration (Days)</label>
                    <input type="number" id="plan-duration" class="login-input" value="${p.duration}" placeholder="e.g. 30">
                </div>
            </div>

            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                <div class="form-group">
                    <label>Credits</label>
                    <input type="number" id="plan-credits" class="login-input" value="${p.credits}" placeholder="e.g. 500">
                </div>
                <div class="form-group">
                    <label>Prop. Limit</label>
                    <input type="number" id="plan-limit" class="login-input" value="${p.propertyLimit || ''}" placeholder="Empty = Unlimited">
                </div>
            </div>
            <div class="form-group">
                <label>Color Theme</label>
                <input type="color" id="plan-color" class="login-input" value="${p.color || '#138808'}" style="height:45px; padding:5px; width:100%;">
            </div>

            <div class="form-group">
                <label>Description & Benefits</label>
                <textarea id="plan-desc" class="login-input" style="height:80px;" placeholder="Describe plan benefits...">${p.description}</textarea>
            </div>

            <button class="login-btn" onclick="savePremiumPlan()">
                ${isEdit ? 'Update Plan' : 'Create Plan'}
            </button>
            <button class="prop-btn" onclick="closeModal()" style="margin-top:10px; width:100%; border:1px solid #ddd; background:none; color:#666;">Cancel</button>
        </div>
    `;
};

window.savePremiumPlan = async () => {
    const id = document.getElementById('plan-id').value;
    const name = document.getElementById('plan-name').value;
    const price = Number(document.getElementById('plan-price').value);
    const duration = Number(document.getElementById('plan-duration').value);
    const credits = Number(document.getElementById('plan-credits').value);
    const propertyLimit = document.getElementById('plan-limit').value ? Number(document.getElementById('plan-limit').value) : null;
    const color = document.getElementById('plan-color').value;
    const desc = document.getElementById('plan-desc').value;

    if (!name || isNaN(price) || isNaN(duration)) {
        alert("Please fill all required fields correctly.");
        return;
    }

    if (!State.premiumPlans) State.premiumPlans = [];

    if (id) {
        // Edit
        const idx = State.premiumPlans.findIndex(x => x.id == id);
        if (idx !== -1) {
            State.premiumPlans[idx] = { ...State.premiumPlans[idx], name, price, duration, credits, propertyLimit, color, description: desc };
        }
    } else {
        // Add
        State.premiumPlans.push({
            id: Date.now(),
            name, price, duration, credits, propertyLimit, color, description: desc
        });
    }

    showGlobalLoader("Saving Plan...");
    await saveGlobalData();
    hideGlobalLoader("Plan Saved!");
    closeModal();
    render(); // Update Admin UI
};

window.deletePlan = async (id) => {
    if (!confirm("Are you sure you want to delete this plan? Agents currently on this plan will not be affected until expiry.")) return;

    if (State.premiumPlans) {
        State.premiumPlans = State.premiumPlans.filter(p => p.id != id);
        showGlobalLoader("Deleting Plan...");
        await saveGlobalData();
        hideGlobalLoader("Plan Deleted!");
        render();
    }
};

window.togglePlanFeature = async (id) => {
    const plan = State.premiumPlans.find(p => p.id === id);
    if (plan) {
        plan.isFeatured = !plan.isFeatured;
        await saveGlobalData();
        render();
    }
};

window.togglePlanVisibility = async (id) => {
    const plan = State.premiumPlans.find(p => p.id === id);
    if (plan) {
        plan.isHidden = !plan.isHidden; // Toggle
        await saveGlobalData();
        render();
    }
};

window.getMembershipUI = (agent) => {
    const isExpired = agent.planExpiry && Date.now() > agent.planExpiry;
    const daysLeft = agent.planExpiry ? Math.ceil((agent.planExpiry - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    // Usage Stats
    let limit = 0;
    if (agent.currentPlan && agent.currentPlan !== 'Free') {
        const plan = (State.premiumPlans || []).find(p => p.name === agent.currentPlan);
        if (plan) limit = plan.propertyLimit || 9999;
        else {
            // Legacy fallbacks
            if (agent.currentPlan === 'Silver') limit = 3; // Old Silver 
            else if (agent.currentPlan === 'Gold') limit = 10; // Old Gold
            else if (agent.currentPlan === 'Platinum') limit = 9999;
            else if (agent.currentPlan === 'Starter') limit = 5;
            else if (agent.currentPlan === 'Pro') limit = 15;
            else if (agent.currentPlan === 'Business') limit = 50;
        }
    }

    const usagePercent = limit > 0 ? Math.min(100, Math.round((agent.listingsUsed / limit) * 100)) : 100;

    return `
        <div style="background:white; border-radius:15px; padding:20px; box-shadow:0 5px 15px rgba(0,0,0,0.05); margin-bottom:25px; border:1px solid #138808;">
            <h3 style="margin:0 0 15px 0; color:#1a2a3a; display:flex; align-items:center; gap:10px;">
                <i class="fas fa-crown" style="color:#FFD700;"></i> Membership Status
                ${(isExpired || agent.currentPlan === 'Expired') ? '<span style="background:#D32F2F; color:white; font-size:0.7rem; padding:3px 8px; border-radius:10px;">EXPIRED</span>' : ''}
            </h3>
            
            <div style="margin-bottom:20px; background:linear-gradient(135deg, #e8f5e9, #c8e6c9); padding:15px; border-radius:12px; display:flex; justify-content:space-between; align-items:center; border:1px solid #138808;">
                <div>
                    <div style="font-size:0.85rem; color:#138808; font-weight:700; text-transform:uppercase;">Wallet Balance</div>
                    <div style="font-size:1.6rem; font-weight:900; color:#1a2a3a;">Rs. ${agent.wallet || 0}</div>
                </div>
                <button onclick="setAgentTab('wallet'); navigate('agent');" style="background:#138808; color:white; border:none; padding:10px 20px; border-radius:50px; font-weight:700; cursor:pointer; box-shadow:0 4px 10px rgba(19, 136, 8, 0.3);">
                    <i class="fas fa-plus-circle"></i> Recharge
                </button>
            </div>

            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:20px;">
                <!-- Current Status -->
                <div style="background:#f9f9f9; padding:15px; border-radius:12px;">
                    <div style="font-size:0.9rem; color:#666;">Current Plan</div>
                    <div style="font-size:1.4rem; font-weight:800; color:#138808;">${agent.currentPlan || 'Free Plan'}</div>
                    ${agent.planExpiry && !isExpired ? `<div style="font-size:0.8rem; color:#444; margin-top:5px;">Expires in <strong>${daysLeft} days</strong> (${new Date(agent.planExpiry).toLocaleDateString()})</div>` : ''}
                    
                    ${agent.currentPlan !== 'Free' ? `
                        <div style="margin-top:15px;">
                            <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:5px;">
                                <span>Listings Used</span>
                                <span>${agent.listingsUsed} / ${limit === 9999 ? '∞' : limit}</span>
                            </div>
                            <div style="background:#ddd; height:8px; border-radius:5px; overflow:hidden;">
                                <div style="background:linear-gradient(90deg, #138808, #8BC34A); width:${usagePercent}%; height:100%;"></div>
                            </div>
                        </div>
                    ` : '<div style="margin-top:10px; color:#D32F2F; font-size:0.85rem;"><i class="fas fa-exclamation-circle"></i> Upgrade to add properties</div>'}
                </div>

                <!-- Upgrade Options -->
                <div>
                     <div style="font-size:0.9rem; color:#666; margin-bottom:10px; font-weight:700;">Upgrade / Renew Plan</div>
                     <div style="display:flex; gap:15px; overflow-x:auto; padding:10px 5px; scroll-behavior:smooth;">
                        ${(State.premiumPlans || []).filter(p => !p.isHidden).sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)).map(p => `
                            <div style="min-width:270px; background:white; padding:20px; border-radius:18px; border:${p.isFeatured ? '3px solid ' + (p.color || '#138808') : '1px solid #E0E0E0'}; text-align:center; box-shadow:0 6px 20px rgba(0,0,0,0.06); position:relative; overflow:hidden; transform:scale(${p.isFeatured ? 1.02 : 1}); transition:transform 0.2s; margin:10px 0;">
                                ${p.isFeatured ? '<div style="position:absolute; top:0; right:0; background:#FF9800; color:white; font-size:0.65rem; font-weight:900; padding:4px 12px; border-bottom-left-radius:10px; z-index:2; box-shadow: -2px 2px 5px rgba(0,0,0,0.1);">MOST POPULAR</div>' : ''}
                                <div style="position:absolute; top:0; left:0; width:100%; height:8px; background:${p.color || '#138808'};"></div>
                                
                                <div style="font-weight:900; color:#333; margin-top:5px; font-size:1.2rem; letter-spacing:0.5px; text-transform:uppercase;">${p.name}</div>
                                <div style="font-size:1.8rem; font-weight:900; margin:10px 0; color:${p.color || '#138808'};">Rs. ${p.price}</div>
                                
                                <div style="background:#f8f9fa; padding:12px; border-radius:10px; margin-bottom:15px; border:1px dashed #ddd;">
                                    <div style="font-size:1rem; color:#333; font-weight:800; margin-bottom:5px;">
                                        <i class="fas fa-home" style="color:${p.color || '#138808'}; margin-right:5px;"></i>
                                        ${p.propertyLimit ? p.propertyLimit + ' Listings' : 'UNLIMITED Listings'}
                                    </div>
                                    <div style="font-size:0.85rem; color:#666; font-weight:600;">
                                        <i class="fas fa-clock" style="color:#888; margin-right:5px;"></i>
                                        Validity: ${p.duration} Days
                                    </div>
                                </div>

                                ${(p.description && p.description.length > 5) ? `
                                    <div style="font-size:0.85rem; color:#666; margin-bottom:15px; line-height:1.4; min-height:40px; display:flex; align-items:center; justify-content:center; font-style:italic;">
                                        "${p.description}"
                                    </div>
                                ` : '<div style="margin-bottom:20px;"></div>'}

                                <button onclick="buyMembership('${p.name}', ${p.price}, ${p.propertyLimit || 9999}, ${p.duration || 30})" style="width:100%; background:${p.color || '#138808'}; color:white; border:none; padding:16px; border-radius:12px; font-size:1.15rem; cursor:pointer; font-weight:800; box-shadow:0 4px 15px rgba(0,0,0,0.2); transition:0.2s;">
                                    BUY PLAN
                                </button>
                            </div>
                        `).join('')}
                     </div>
                </div>
            </div>
        </div>
    `;
};

// =========================================================================
// MANUAL PAYMENT REQUEST (QR CODE)
// =========================================================================

window.openAddMoneyModal = () => {
    const modal = document.getElementById('modal-container');
    if (!modal) return;

    // QR Code Image (Placeholder - Replace with actual QR if available)
    const qrCodeUrl = "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=bhumidekho@upi&pn=BhumiDekho&mc=0000&tid=0000&tr=0000&tn=WalletRecharge&am=0&cu=INR";

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div style="background:white; padding:25px; border-radius:15px; width:90%; max-width:400px; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; animation: slideIn 0.3s ease-out; text-align:center;">
            <button onclick="closeModal()" style="position:absolute; right:15px; top:15px; background:none; border:none; font-size:1.2rem; cursor:pointer; color:#666;">&times;</button>
            
            <h3 style="margin-top:0; color:#1a2a3a; margin-bottom:10px;">Add Money to Wallet</h3>
            <p style="font-size:0.9rem; color:#666; margin-bottom:20px;">Scan QR to Pay & Upload Screenshot</p>
            
            <div style="background:#f5f5f5; padding:15px; border-radius:10px; display:inline-block; margin-bottom:20px; border:1px dashed #ccc;">
                <img src="${qrCodeUrl}" alt="Payment QR" style="width:180px; height:180px; display:block;">
                <div style="margin-top:5px; font-weight:700; color:#333;">BHUMI DEKHO UPI</div>
            </div>

            <div style="margin-bottom:15px; text-align:left;">
                <label style="font-size:0.85rem; font-weight:700; color:#333; display:block; margin-bottom:5px;">Check Amount Paid (Rs.)</label>
                <input type="number" id="pay-amount" placeholder="e.g. 500" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px;">
            </div>

            <div style="margin-bottom:20px; text-align:left;">
                 <label style="font-size:0.85rem; font-weight:700; color:#333; display:block; margin-bottom:5px;">Upload Screenshot (Proof)</label>
                 <input type="file" id="pay-proof" accept="image/*" style="width:100%; padding:10px; background:#f9f9f9; border-radius:8px; border:1px solid #ddd;">
            </div>

            <button onclick="submitPaymentRequest()" style="width:100%; padding:12px; background:#138808; color:white; font-weight:700; border:none; border-radius:8px; cursor:pointer; font-size:1rem; box-shadow:0 4px 10px rgba(19, 136, 8, 0.3);">
                SUBMIT REQUEST
            </button>
            <div style="margin-top:15px; font-size:0.75rem; color:#888; line-height:1.4;">
                <i class="fas fa-info-circle"></i> Once submitted, Admin will verify and credit the amount to your wallet within 10-15 minutes.
            </div>
        </div>
    `;
};

window.submitPaymentRequest = async () => {
    const amount = document.getElementById('pay-amount').value;
    const proofInput = document.getElementById('pay-proof');

    if (!amount || amount <= 0) {
        alert("Please enter valid amount.");
        return;
    }
    if (proofInput.files.length === 0) {
        alert("Please upload payment screenshot.");
        return;
    }

    const file = proofInput.files[0];
    showGlobalLoader("Uploading Proof...");

    try {
        const proofUrl = await toBase64(file); // Reuse existing helper

        // Save Request
        if (!State.walletRequests) State.walletRequests = [];

        State.walletRequests.push({
            id: Date.now(),
            agentId: State.user.id,
            agentName: State.user.name,
            amount: parseInt(amount),
            proof: proofUrl,
            status: 'pending',
            date: new Date().toLocaleString()
        });

        // Also add to local transactions as pending
        if (!State.walletTransactions) State.walletTransactions = [];
        State.walletTransactions.push({
            id: Date.now(),
            agentId: State.user.id,
            amount: parseInt(amount),
            type: 'credit', // It's a credit request
            remark: 'Manual Recharge (Pending)',
            date: new Date().toLocaleString(),
            status: 'pending'
        });

        // --- NEW: Send to PHP API (Backend Sync) ---
        const fd = new FormData();
        fd.append('action', 'request_recharge');
        fd.append('amount', amount);
        fd.append('proof', proofUrl); // Base64 string

        fetch('api/wallet.php', { method: 'POST', body: fd })
            .then(res => res.json())
            .then(data => console.log('PHP API Response:', data))
            .catch(err => console.error('PHP API Error:', err));
        // -------------------------------------------

        await saveGlobalData();
        hideGlobalLoader();
        closeModal();
        alert("Request Submitted! Admin will verify and update wallet.");
        render(); // Refresh UI to show pending transaction

    } catch (e) {
        console.error(e);
        hideGlobalLoader();
        alert("Error uploading proof. Try again.");
    }
};

// =========================================================================
// WALLET REQUEST MANAGEMENT (ADMIN)
// =========================================================================

window.approveWalletRequest_Old = async (id) => {
    if (!confirm("Are you sure you want to approve this request?")) return;

    const req = State.walletRequests.find(r => r.id === id);
    if (!req) return;

    showGlobalLoader("Approving...");

    // Update Request Status
    req.status = 'approved';

    // Update Agent Wallet
    const agent = State.agents.find(a => a.id === req.agentId);
    if (agent) {
        agent.wallet = (agent.wallet || 0) + req.amount;
    }

    // Update Admin Wallet (Add Balance - Money Received)
    if (typeof State.adminWallet !== 'undefined') {
        State.adminWallet = (State.adminWallet || 0) + req.amount;
    }

    // Update Transaction History
    if (!State.walletTransactions) State.walletTransactions = [];
    // Find the pending transaction if exists
    // Note: We use the timestamp ID from the request as the ID for the transaction too
    const txn = State.walletTransactions.find(t => t.id === req.id);
    if (txn) {
        txn.status = 'success';
        txn.remark = 'Manual Recharge (Approved)';
    } else {
        // Fallback if not found
        State.walletTransactions.push({
            id: Date.now(),
            agentId: req.agentId,
            amount: req.amount,
            type: 'credit',
            remark: 'Manual Recharge (Approved)',
            date: new Date().toLocaleString(),
            status: 'success'
        });
    }

    await saveGlobalData();
    hideGlobalLoader();
    alert("Request Approved! Wallet updated.");
    render();
};

window.rejectWalletRequest_Old = async (id) => {
    if (!confirm("Reject this request?")) return;

    const req = State.walletRequests.find(r => r.id === id);
    if (!req) return;

    showGlobalLoader("Rejecting...");

    req.status = 'rejected';

    // Update Transaction History
    const txn = State.walletTransactions.find(t => t.id === req.id);
    if (txn) {
        txn.status = 'failed';
        txn.remark = 'Manual Recharge (Rejected)';
    }

    await saveGlobalData();
    hideGlobalLoader();
    render();
};

// =========================================================================
// NEW WALLET FUNCTIONS (WITH REMARKS & MODALS)
// =========================================================================

// --- Withdrawal Processing (Customers & Agents) ---
window.processWithdrawal = function (reqId, action) {
    const r = (State.withdrawalRequests || []).find(x => x.id === reqId);
    if (!r) return;

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px;">
            <h3 style="margin-bottom:20px; color:${action === 'approved' ? '#138808' : '#D32F2F'};">
                ${action === 'approved' ? 'Approve' : 'Reject'} Withdrawal
            </h3>
            <div style="background:#f5f5f5; padding:15px; border-radius:10px; margin-bottom:15px;">
                <p><strong>User:</strong> ${r.agentName || r.customerName || 'Unknown'}</p>
                <p><strong>Amount:</strong> Rs. ${r.amount}</p>
            </div>
            <div class="form-group">
                <label>Remark (Required)</label>
                <textarea id="withdraw-remark" class="login-input" style="height:80px;" placeholder="Transaction ID / Rejection Reason..."></textarea>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="login-btn" onclick="confirmProcessWithdrawal(${reqId}, '${action}')" style="background:${action === 'approved' ? '#138808' : '#D32F2F'}; flex:1;">${action === 'approved' ? 'Approve' : 'Reject'}</button>
                <button class="prop-btn" onclick="closeModal()" style="background:none; color:#666; flex:1;">Cancel</button>
            </div>
        </div>
    `;
};

window.confirmProcessWithdrawal = async (reqId, status) => {
    const r = State.withdrawalRequests.find(x => x.id === reqId);
    const remark = document.getElementById('withdraw-remark').value;

    if (!remark) return alert("Please enter a remark.");
    if (!r) return;

    showGlobalLoader("Processing...");

    // Identify User (Agent or Customer)
    let user;
    if (r.agentId) user = State.agents.find(x => x.id === r.agentId);
    else if (r.customerId) user = State.customers.find(x => x.id === r.customerId);

    let transaction = State.walletTransactions ? State.walletTransactions.find(t => t.id === r.id) : null;

    if (status === 'approved') {
        // --- SYNC TO PHP ---
        if (r.isPhp) {
            const fd = new FormData();
            fd.append('action', 'admin_withdraw_action');
            fd.append('req_id', r.id);
            fd.append('status', 'approved');
            await fetch('api/wallet.php', { method: 'POST', body: fd });
        }
        // -------------------

        if (transaction) {
            transaction.status = 'approved';
            transaction.remark = remark;
            transaction.date = new Date().toLocaleString(); // Update date to show as recent processing
        } else {
            // Create if missing (Log for History)
            if (!State.walletTransactions) State.walletTransactions = [];
            State.walletTransactions.push({
                id: r.id,
                agentId: r.agentId,
                customerId: r.customerId,
                amount: r.amount,
                type: r.customerId ? 'customer_withdrawal' : 'withdrawal',
                status: 'approved',
                date: new Date().toLocaleString(),
                remark: remark
            });
        }
    } else if (status === 'rejected') {
        // --- SYNC TO PHP ---
        if (r.isPhp) {
            const fd = new FormData();
            fd.append('action', 'admin_withdraw_action');
            fd.append('req_id', r.id);
            fd.append('status', 'rejected');
            await fetch('api/wallet.php', { method: 'POST', body: fd });
        }
        // -------------------
        // Refund back to wallet
        if (user) {
            user.wallet = (user.wallet || 0) + r.amount;
        }

        if (transaction) {
            transaction.status = 'rejected';
            transaction.remark = 'Rejected: ' + remark;
            transaction.date = new Date().toLocaleString();
        } else {
            if (!State.walletTransactions) State.walletTransactions = [];
            State.walletTransactions.push({
                id: Date.now(), // New ID for refund record
                agentId: r.agentId,
                customerId: r.customerId,
                amount: r.amount,
                type: 'credit', // Refund is credit
                status: 'success',
                date: new Date().toLocaleString(),
                remark: 'Withdrawal Refund: ' + remark
            });
        }
    }

    r.status = status;
    r.remark = remark;

    try {
        await saveGlobalData();
        hideGlobalLoader();
        closeModal();
        alert(`Withdrawal request ${status}!`);
        render();
    } catch (err) {
        console.error(err);
        hideGlobalLoader();
        alert("Error processing withdrawal.");
    }
};

// --- Wallet Request Processing (Recharge Approval/Rejection) ---
window.approveWalletRequest = function (id) {
    openWalletRequestModal(id, 'approve');
};

window.rejectWalletRequest = function (id) {
    openWalletRequestModal(id, 'reject');
};

window.openWalletRequestModal = function (id, action) {
    const req = State.walletRequests.find(r => r.id === id);
    if (!req) return;

    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:350px;">
            <h3 style="margin-bottom:20px; color:${action === 'approve' ? '#138808' : '#D32F2F'};">
                ${action === 'approve' ? 'Approve' : 'Reject'} Recharge Request
            </h3>
            <div style="background:#f5f5f5; padding:15px; border-radius:10px; margin-bottom:15px;">
                <p><strong>Agent:</strong> ${req.agentName || 'Unknown'}</p>
                <p><strong>Amount:</strong> Rs. ${req.amount}</p>
                <p><strong>Date:</strong> ${req.date}</p>
            </div>
            <div class="form-group">
                <label>Remark (Optional)</label>
                <textarea id="wal-req-remark" class="login-input" style="height:80px;" placeholder="${action === 'approve' ? 'e.g. Received via UPI' : 'e.g. Payment not received'}">${action === 'approve' ? 'Manual Recharge (Approved)' : 'Manual Recharge (Rejected)'}</textarea>
            </div>
            <div style="display:flex; gap:10px;">
                <button class="login-btn" onclick="confirmWalletRequestProcess(${id}, '${action}')" style="background:${action === 'approve' ? '#138808' : '#D32F2F'}; flex:1;">${action === 'approve' ? 'Approve' : 'Reject'}</button>
                <button class="prop-btn" onclick="closeModal()" style="background:none; color:#666; flex:1;">Cancel</button>
            </div>
        </div>
    `;
};

window.confirmWalletRequestProcess = async function (id, action) {
    const req = State.walletRequests.find(r => r.id === id);
    const remark = document.getElementById('wal-req-remark').value;
    if (!req) return;

    showGlobalLoader(action === 'approve' ? "Approving..." : "Rejecting...");

    req.status = action === 'approve' ? 'approved' : 'rejected';

    if (action === 'approve') {
        // Try finding agent first
        let user = State.agents.find(a => a.id === req.agentId);
        // If not found, try customer (since we use agentId field for both currently)
        if (!user) user = State.customers.find(c => c.id === req.agentId);

        if (user) {
            user.wallet = (user.wallet || 0) + req.amount;
        }

        // --- SYNC TO PHP MYSQL ---
        if (req.isPhp) {
            const fd = new FormData();
            fd.append('action', 'approve_recharge');
            fd.append('req_id', req.id);
            fd.append('status', 'approved');
            // approve_recharge updates wallet in DB too
            await fetch('api/wallet.php', { method: 'POST', body: fd });
        } else {
            // Legacy / Offline
            const fd = new FormData();
            fd.append('action', 'admin_adjust_wallet');
            fd.append('user_id', req.agentId);
            fd.append('amount', req.amount);
            fd.append('type', 'credit');
            fetch('api/wallet.php', { method: 'POST', body: fd }).catch(console.error);
        }
        // -------------------------

        if (typeof State.adminWallet !== 'undefined') {
            State.adminWallet = (State.adminWallet || 0) + req.amount;
        }
    } else if (action === 'reject' && req.isPhp) {
        // Handle rejection status in PHP too
        const fd = new FormData();
        fd.append('action', 'approve_recharge');
        fd.append('req_id', req.id);
        fd.append('status', 'rejected');
        await fetch('api/wallet.php', { method: 'POST', body: fd });
    }

    // Update Transaction
    if (!State.walletTransactions) State.walletTransactions = [];
    let txn = State.walletTransactions.find(t => t.id === req.id);

    // If not found (legacy data), ensure we create/update one
    if (txn) {
        txn.status = action === 'approve' ? 'success' : 'failed';
        txn.remark = remark;
        txn.date = new Date().toLocaleString(); // Update to now
    } else {
        txn = {
            id: req.id, // Keep ID same as request ID usually
            // If ID conflict with timestamp, use req.id is safer for linking
            agentId: req.agentId,
            amount: req.amount,
            type: 'credit',
            remark: remark,
            date: new Date().toLocaleString(),
            status: action === 'approve' ? 'success' : 'failed'
        };
        State.walletTransactions.push(txn);
    }

    await saveGlobalData();
    hideGlobalLoader();
    closeModal();
    alert(`Request ${action}ed!`);
    render();
};

// =========================================================================
// COUPON MANAGEMENT & PAYMENT MODAL
// =========================================================================

window.openCouponModal = (id = null) => {
    const modal = document.getElementById('modal-container');
    const c = id ? State.coupons.find(x => x.id == id) : { code: '', type: 'percentage', value: 0, maxDiscount: 0, active: true };
    const isEdit = !!id;

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:25px;">
            <h3 style="margin-top:0; color:#1a2a3a; margin-bottom:20px;">
                ${isEdit ? '<i class="fas fa-edit"></i> Edit Coupon' : '<i class="fas fa-plus-circle"></i> Create New Coupon'}
            </h3>
            <input type="hidden" id="coupon-id" value="${id || ''}">
            <div class="form-group">
                <label>Coupon Code</label>
                <input type="text" id="coupon-code" class="login-input" value="${c.code}" placeholder="e.g. WELCOME50" style="text-transform:uppercase;">
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
                 <div class="form-group">
                    <label>Type</label>
                    <select id="coupon-type" class="login-input" onchange="document.getElementById('coupon-symbol').innerText = this.value === 'percentage' ? '%' : 'Rs.'">
                        <option value="percentage" ${c.type === 'percentage' ? 'selected' : ''}>Percentage (%)</option>
                        <option value="flat" ${c.type === 'flat' ? 'selected' : ''}>Flat Amount (Rs)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Value (<span id="coupon-symbol">${c.type === 'percentage' ? '%' : 'Rs.'}</span>)</label>
                    <input type="number" id="coupon-value" class="login-input" value="${c.value}" placeholder="e.g. 10">
                </div>
            </div>
            <div class="form-group">
                <label>Max Discount (Optional for %)</label>
                <input type="number" id="coupon-max" class="login-input" value="${c.maxDiscount || ''}" placeholder="e.g. 100">
            </div>
            <button class="login-btn" onclick="saveCoupon()">
                ${isEdit ? 'Update Coupon' : 'Create Coupon'}
            </button>
            <button class="prop-btn" onclick="closeModal()" style="margin-top:10px; width:100%; border:1px solid #ddd; background:none; color:#666;">Cancel</button>
        </div>
    `;
};

window.saveCoupon = async () => {
    const id = document.getElementById('coupon-id').value;
    const code = document.getElementById('coupon-code').value.trim().toUpperCase();
    const type = document.getElementById('coupon-type').value;
    const value = Number(document.getElementById('coupon-value').value);
    const maxDiscount = document.getElementById('coupon-max').value ? Number(document.getElementById('coupon-max').value) : 0;

    if (!code || isNaN(value)) return alert("Please fill code and value!");

    if (!State.coupons) State.coupons = [];

    if (id) {
        const idx = State.coupons.findIndex(x => x.id == id);
        if (idx !== -1) State.coupons[idx] = { ...State.coupons[idx], code, type, value, maxDiscount };
    } else {
        if (State.coupons.find(c => c.code === code)) return alert("Coupon code already exists!");
        State.coupons.push({ id: Date.now(), code, type, value, maxDiscount, active: true });
    }
    await saveGlobalData();
    closeModal();
    render();
};

window.deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    State.coupons = State.coupons.filter(c => c.id != id);
    await saveGlobalData();
    render();
};

window.toggleCouponStatus = async (id) => {
    const c = State.coupons.find(x => x.id == id);
    if (c) {
        c.active = !c.active;
        await saveGlobalData();
        render();
    }
};

// --- Agent Payment Modal -----------------

window.openPaymentModal = (planName, price, limit, duration) => {
    const modal = document.getElementById('modal-container');
    const agent = State.agents.find(a => a.id === State.user.id);

    // Store temp data
    window.tempPurchase = { planName, price, limit, duration, finalPrice: price, coupon: null };

    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:25px;">
             <h3 style="margin-top:0; color:#1a2a3a; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px;">
                <i class="fas fa-shopping-cart" style="color:#138808;"></i> Order Summary
            </h3>
            
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:#666;">Plan</span>
                    <strong style="color:#333;">${planName}</strong>
                </div>
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <span style="color:#666;">Validity</span>
                    <strong style="color:#333;">${duration} Days</strong>
                </div>
                 <div style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:1.1rem;">
                    <span style="color:#666;">Price</span>
                    <strong style="color:#333;">Rs. ${price}</strong>
                </div>
                <div id="payment-discount-row" style="display:none; justify-content:space-between; margin-bottom:10px; color:#138808;">
                    <span>Discount</span>
                    <strong id="payment-discount-val">- Rs. 0</strong>
                </div>
                <div style="border-top:1px dashed #ccc; margin:10px 0;"></div>
                 <div style="display:flex; justify-content:space-between; font-size:1.3rem;">
                    <span style="color:#333; font-weight:700;">Total</span>
                    <strong style="color:#138808;" id="payment-total">Rs. ${price}</strong>
                </div>
            </div>

            <div class="form-group" style="position:relative;">
                <label>Have a coupon code?</label>
                <div style="display:flex; gap:10px;">
                    <input type="text" id="apply-coupon-code" class="login-input" placeholder="Enter Coupon" style="text-transform:uppercase;">
                    <button onclick="applyCoupon()" style="background:#333; color:white; border:none; padding:0 20px; border-radius:5px; cursor:pointer; font-weight:700;">Apply</button>
                </div>
                <div id="coupon-msg" style="font-size:0.8rem; margin-top:5px; height:15px;"></div>
            </div>

            <div style="background:#e3f2fd; padding:10px; border-radius:8px; margin-bottom:20px; font-size:0.9rem; color:#0d47a1;">
                <i class="fas fa-wallet"></i> Wallet Balance: <strong>Rs. ${(agent.wallet || 0).toLocaleString()}</strong>
            </div>

            <button id="pay-plan-btn" class="login-btn" onclick="processMembershipPurchase()" style="width:100%; background:#138808; font-size:1.1rem; padding:12px;">
                Pay & Activate
            </button>
             <button class="prop-btn" onclick="closeModal()" style="margin-top:10px; width:100%; border:1px solid #ddd; background:none; color:#666;">Cancel</button>
        </div>
     `;
};

window.applyCoupon = () => {
    const codeInput = document.getElementById('apply-coupon-code');
    const msg = document.getElementById('coupon-msg');

    if (!codeInput || !msg) return;
    const code = codeInput.value.trim().toUpperCase();

    const coupon = (State.coupons || []).find(c => c.code === code);

    if (!coupon) {
        msg.style.color = 'red';
        msg.innerText = "Invalid coupon code";
        window.tempPurchase.finalPrice = window.tempPurchase.price;
        window.tempPurchase.coupon = null;
        document.getElementById('payment-discount-row').style.display = 'none';
        document.getElementById('payment-total').innerText = `Rs. ${window.tempPurchase.price}`;
    } else if (!coupon.active) {
        msg.style.color = 'red';
        msg.innerText = "Coupon is inactive/expired";
        window.tempPurchase.finalPrice = window.tempPurchase.price;
        window.tempPurchase.coupon = null;
        document.getElementById('payment-discount-row').style.display = 'none';
        document.getElementById('payment-total').innerText = `Rs. ${window.tempPurchase.price}`;
    } else {
        // Calculate Discount
        let discount = 0;
        if (coupon.type === 'percentage') {
            discount = (window.tempPurchase.price * coupon.value) / 100;
            if (coupon.maxDiscount && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
        } else {
            discount = coupon.value;
        }

        // Ensure discount doesn't exceed price
        if (discount > window.tempPurchase.price) discount = window.tempPurchase.price;

        window.tempPurchase.finalPrice = window.tempPurchase.price - discount;
        window.tempPurchase.coupon = coupon.code;

        msg.style.color = 'green';
        msg.innerText = `Coupon Applied! You saved Rs. ${discount}`;

        // Update UI
        document.getElementById('payment-discount-row').style.display = 'flex';
        document.getElementById('payment-discount-val').innerText = `- Rs. ${Math.round(discount)}`;
        document.getElementById('payment-total').innerText = `Rs. ${Math.round(window.tempPurchase.finalPrice)}`;
    }
};

window.processMembershipPurchase = async () => {
    const { planName, finalPrice, limit, duration, coupon } = window.tempPurchase;
    const agent = State.agents.find(a => a.id === State.user.id);

    if ((agent.wallet || 0) < finalPrice) {
        alert(`Insufficient Balance!\nYou need Rs. ${finalPrice} but have only Rs. ${agent.wallet || 0}.\nPlease recharge your wallet.`);
        closeModal();
        setAgentTab('wallet');
        return;
    }

    if (!confirm(`Confirm Payment of Rs. ${finalPrice} for ${planName}?`)) return;

    // UI Feedback
    const btn = document.getElementById('pay-plan-btn');
    if (btn) {
        btn.disabled = true;
        btn.innerText = "Processing...";
    }
    closeModal();
    showGlobalLoader("Activating Plan...");

    // Deduct
    agent.wallet = (agent.wallet || 0) - finalPrice;

    // Activate
    agent.currentPlan = planName;
    agent.planExpiry = Date.now() + (duration * 24 * 60 * 60 * 1000);
    agent.listingsUsed = 0;

    if (agent.status === 'blocked' || agent.currentPlan === 'Expired') agent.status = 'approved';

    // Record Transaction
    if (!State.walletTransactions) State.walletTransactions = [];
    State.walletTransactions.push({
        id: Date.now(),
        agentId: agent.id,
        amount: finalPrice,
        type: 'debit',
        remark: `Purchased ${planName} Plan (${duration} Days)${coupon ? ' with Coupon ' + coupon : ''}`,
        date: new Date().toLocaleString(),
        status: 'success'
    });

    // Unhide properties
    if (State.properties) {
        State.properties.forEach(p => {
            if (p.agentId === agent.id && p.status === 'hidden' && p.disableReason === 'Plan Expired') {
                p.status = 'approved';
                delete p.disableReason;
            }
        });
    }

    await saveGlobalData();
    hideGlobalLoader("Plan Activated!");
    render();

    setTimeout(() => alert(`Success! ${planName} Plan Activated for ${duration} days.`), 100);
};

// Override original buyMembership to open Modal
window.buyMembership = (planName, price, limit, duration) => {
    const agent = State.agents.find(a => a.id === State.user.id);
    if (agent.currentPlan === planName && agent.planExpiry > Date.now()) {
        alert("You already have this active plan!");
        return;
    }
    openPaymentModal(planName, price, limit, duration);
};



// =========================================================================
// CUSTOMER LISTING & CONTACT
// =========================================================================
window.startCustomerListing = () => {
    if (!State.user || State.user.role !== 'customer') return alert("Access Denied");
    const customer = State.customers.find(c => c.id === State.user.id);
    if (!customer) return;

    if ((customer.wallet || 0) < 99) {
        if (confirm("Insufficient Balance! Listing charges are Rs. 99.\nDo you want to add money?")) {
            openCustomerWalletModal();
        }
        return;
    }
    // Proceed to open modal
    // Reset editing state
    window.editingPropId = null;
    window.tempFormData = {};
    window.tempPropertyImages = [];
    window.propertyFormStep = 0;

    // Open Modal
    showPropertyModal();
};

window.openContactAdminModal = () => {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width:400px; padding:25px;">
             <h3 style="margin-top:0; color:#1a2a3a; border-bottom:1px solid #eee; padding-bottom:15px; margin-bottom:20px;">
                <i class="fas fa-headset" style="color:#138808;"></i> Contact BhumiDekho
            </h3>
            
            <div style="background:#f9f9f9; padding:15px; border-radius:10px; margin-bottom:20px;">
                <div style="margin-bottom:10px; font-size:1.1rem; color:#333;">
                    <i class="fas fa-phone-alt" style="color:#138808; width:20px;"></i>
                    <strong>${State.settings.contactInfo.phone || '+91 98765 43210'}</strong>
                </div>
                 <div style="margin-bottom:5px; font-size:1rem; color:#666;">
                    <i class="fas fa-envelope" style="color:#138808; width:20px;"></i>
                    ${State.settings.contactInfo.email || 'support@bhumidekho.com'}
                </div>
            </div>

            <p style="font-size:0.9rem; color:#666; margin-bottom:15px;">
                Enter your property details below. Our team will contact you shortly.
            </p>

            <div class="form-group">
                <textarea id="contact-prop-desc" rows="5" class="login-input" placeholder="E.g. I have a 2BHK flat in Indirapuram for sale. Expected price 50L..."></textarea>
            </div>

            <button class="login-btn" onclick="submitContactQuery()" style="width:100%; background:#138808;">
                Submit Request
            </button>
             <button class="prop-btn" onclick="closeModal()" style="margin-top:10px; width:100%; border:1px solid #ddd; background:none; color:#666;">Cancel</button>
        </div>
    `;
};

window.submitContactQuery = async () => {
    const desc = document.getElementById('contact-prop-desc').value.trim();
    if (!desc) return alert("Please enter details.");

    showGlobalLoader("Sending Request...");

    // Save to State (ensure array exists)
    if (!State.contactQueries) State.contactQueries = [];
    State.contactQueries.push({
        id: Date.now(),
        userId: State.user.id,
        userName: State.user.name,
        userPhone: State.user.phone,
        message: desc,
        date: new Date().toLocaleString(),
        status: 'pending'
    });

    await saveGlobalData();
    hideGlobalLoader("Sent Successfully!");
    closeModal();
    alert("Thank you! Our team will contact you soon.");
};
