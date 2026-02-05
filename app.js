window.showGlobalLoader = (message = "कृपया प्रतीक्षा करें...") => {
    const loader = document.getElementById('global-loader');
    const text = document.getElementById('loader-text');
    if (text) text.innerText = message;
    if (loader) {
        loader.style.display = 'flex';
        loader.classList.remove('success');
        loader.classList.add('active'); // No more timeout delay
    }
};

window.hideGlobalLoader = (message = "सफलतापूर्वक संपन्न!", duration = 100) => {
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
    isLoading: true, // NEW: Tracks if we are waiting for data
    user: null,
    selectedPropertyId: null,
    likes: [],
    selectedPropertyId: null,
    likes: [],
    properties: [], // Cloud-First: Init empty, wait for Firebase
    withdrawalRequests: [],
    withdrawalRequests: [],
    agents: [
        { id: 101, name: "John Agent", email: "john.agent@bhumidekho.com", password: "admin123", phone: "9876543210", status: "approved", wallet: 5000 }
    ],
    adminTab: 'dashboard',
    adminSearch: '',
    agentTab: 'dashboard',
    agentSearch: '',
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
        }
    },
    walletTransactions: [],
    adminWallet: 100000, // Initial admin balance
    customers: [
        { id: 201, name: "Rahul Sharma", phone: "9800012345", email: "rahul@gmail.com", password: "123", status: "active", joinedAt: "01/01/2026" },
        { id: 202, name: "Priya Singh", phone: "9800054321", email: "priya@gmail.com", password: "123", status: "active", joinedAt: "15/01/2026" }
    ]
};

// --- Firebase Helper Functions ---
function saveToFirebase() {
    if (typeof database === 'undefined' || !database) return Promise.resolve();

    const dataToSync = {
        agents: State.agents,
        settings: State.settings,
        withdrawalRequests: State.withdrawalRequests || [],
        walletTransactions: State.walletTransactions || [],
        adminWallet: State.adminWallet,
        customers: State.customers || [],
        properties: State.properties || []
    };

    return database.ref('bhumi_v2').set(dataToSync)
        .then(() => console.log("?? Firebase Sync: SUCCESS!"))
        .catch(err => console.error("?? Firebase Sync: FAILED!", err));
}

function loadFromFirebase(callback) {
    if (typeof database === 'undefined' || !database) {
        State.isLoading = false; // Stop loading if FB missing
        if (callback) callback(false);
        return;
    }

    State.isLoading = true; // Ensure loading mode on start

    database.ref('bhumi_v2').once('value')
        .then(snapshot => {
            const data = snapshot.val();
            if (data) {
                if (data.agents) State.agents = data.agents;
                if (data.settings) State.settings = data.settings;
                if (data.withdrawalRequests) State.withdrawalRequests = data.withdrawalRequests;
                if (data.walletTransactions) State.walletTransactions = data.walletTransactions;
                if (data.adminWallet !== undefined) State.adminWallet = data.adminWallet;
                if (data.customers) State.customers = data.customers;

                // CRITICAL: Ensure we get an array, even if empty
                State.properties = data.properties || [];

                saveToLocalStorage(); // Sync back to local storage (Settings/Session only)
                State.isLoading = false; // DATA LOADED
                render(); // Explicitly re-render to remove skeleton and show data
                if (callback) callback(true);
            } else {
                State.isLoading = false; // NO DATA FOUND (But loaded successfully)
                if (callback) callback(false);
            }
        })
        .catch(err => {
            console.error("Firebase Load Error:", err);
            State.isLoading = false; // ERROR, STOP LOADING
            if (callback) callback(false);
        });
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
            State.properties = data.properties || State.properties;

            // We usually don't want to live-sync settings or customers while user is active 
            // unless we handle merge conflicts/state refresh carefully.
            // For now, let's keep it simple.
            render();
        }
    });
}


// Save to localStorage (backup - ONLY Session & Settings, NO Properties/Images)
function saveToLocalStorage() {
    // We do NOT save State.properties or State.agents here anymore to avoid 5MB limit.
    // They are saved ONLY to Firebase.
    localStorage.setItem('bhumi_v2_state', JSON.stringify({
        guestLikes: (!State.user) ? State.likes : (JSON.parse(localStorage.getItem('bhumi_v2_state'))?.guestLikes || []),
        user: State.user, // Keep user logged in
        settings: State.settings, // Keep settings cached
        // agents: State.agents, // Removed to save space
        // withdrawalRequests: State.withdrawalRequests, // Removed
        // walletTransactions: State.walletTransactions, // Removed
        adminWallet: State.adminWallet
        // customers: State.customers // Removed
    }));
    // localStorage.setItem('bhumi_v2_props', JSON.stringify(State.properties)); // DISABLED: Cloud Only Mode
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
            State.agents = parsed.agents || [];

            // Load customers
            State.customers = parsed.customers || [
                { id: 201, name: "Rahul Sharma", phone: "9800012345", email: "rahul@gmail.com", password: "123", status: "active", joinedAt: "01/01/2026", likes: [], wallet: 0 },
                { id: 202, name: "Priya Singh", phone: "9800054321", email: "priya@gmail.com", password: "123", status: "active", joinedAt: "15/01/2026", likes: [], wallet: 0 }
            ];

            // Determine likes source
            if (State.user && State.user.role === 'customer') {
                const cust = State.customers.find(c => c.id === State.user.id);
                State.likes = (cust && cust.likes) ? cust.likes : [];
            } else {
                State.likes = parsed.guestLikes || parsed.likes || [];
            }

            State.settings = parsed.settings || { showDate: true };
            State.withdrawalRequests = parsed.withdrawalRequests || [];
            State.walletTransactions = parsed.walletTransactions || [];
            State.adminWallet = parsed.adminWallet !== undefined ? parsed.adminWallet : 100000;
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

    // Cloud-First Mode: We do NOT load properties from localStorage anymore.
    // This forces the UI to wait for Firebase (showing Skeletons).
    State.properties = [];

    // Only load critical session data
    /*
    try {
        const savedProps = localStorage.getItem('bhumi_v2_props');
        if (savedProps) {
            let props = JSON.parse(savedProps);
            if (Array.isArray(props) && props.length > 0) {
                props.forEach(p => {
                    if (!p.status) p.status = 'approved';
                    if (p.featured === undefined) p.featured = false;
                });
                State.properties = props;
            } else {
                // Empty array is valid, just use it
                State.properties = [];
            }
        } else {
            // No saved properties yet
            State.properties = [];
        }
    } catch (e) {
        console.error("Error loading properties:", e);
        // DON'T delete - keep whatever is in State.properties
        // Only reset if State.properties is undefined
        if (!State.properties) {
            State.properties = [];
        }
    }
    */
}

function saveGlobalData() {
    // Save to localStorage (instant)
    try {
        saveToLocalStorage();
    } catch (e) {
        console.error("Storage Error:", e);
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            alert("Storage Full! Some data may not be saved locally. Please delete old properties or images.");
        }
    }

    // Trigger Firebase sync in background
    saveToFirebase();
    return Promise.resolve(); // Resolve immediately for 'fast' feel
}

function updateUIForUser() {
    const profileAction = document.getElementById('profile-action');
    const nameSpan = document.getElementById('user-name-h');
    const loginText = document.getElementById('login-text');

    if (!profileAction || !nameSpan) return;
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
function navigate(view, params = null) {
    State.view = view;
    if (params) State.selectedPropertyId = params;
    window.scrollTo(0, 0);

    const header = document.getElementById('main-header');
    header.style.display = (view === 'login' || view === 'admin' || view === 'agent') ? 'none' : 'block';

    const profileAction = document.getElementById('profile-action');
    const nameSpan = document.getElementById('user-name-h');
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

    const loginText = document.getElementById('login-text');
    loginText.innerText = State.user ? State.user.role.toUpperCase() : 'LOGIN';

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
            if (view === 'search') openSearchModal();
            else if (view === 'login' && State.user) {
                if (State.user.role === 'customer') navigate('profile');
                else navigate(State.user.role);
            }
            else navigate(view);
        };
    });
}

// --- Main Render Function ---
function render() {
    const app = document.getElementById('app');

    // Broadcast check
    if (State.settings.broadcast && State.settings.broadcast.active) {
        const b = State.settings.broadcast;
        const recipient = b.recipient || 'all';
        const userRole = State.user ? State.user.role : 'guest';

        let shouldShow = false;
        if (recipient === 'all') shouldShow = true;
        else if (recipient === 'agents' && userRole === 'agent') shouldShow = true;

        if (shouldShow && !localStorage.getItem('dismissed_broadcast_' + b.id)) {
            // Show broadcast modal if not already showing something else
            const modal = document.getElementById('modal-container');
            if (modal && modal.style.display !== 'flex') {
                modal.style.display = 'flex';
                modal.innerHTML = `
                    <div class="modal-content scale-in" style="max-width:400px; text-align:center; padding:30px; border-radius:20px; border-top: 5px solid #138808;">
                        <i class="fas fa-bullhorn" style="font-size:3rem; color:#138808; margin-bottom:20px;"></i>
                        <h2 style="color:#1a2a3a; margin-bottom:15px; font-size:1.2rem;">Important Message</h2>
                        <div style="font-size:1.1rem; color:#000; font-weight:700; line-height:1.6; margin-bottom:25px; white-space:pre-wrap;">${b.message}</div>
                        <button class="login-btn" onclick="dismissBroadcast(${b.id})" style="padding:8px 20px; font-size:0.9rem; width:auto; height:auto; min-height:0;">Close</button>
                    </div>
                `;
            }
        }
    }

    const logoText = document.getElementById('app-logo-text');
    if (logoText) logoText.innerHTML = State.settings.appName || 'Bhumi<span style="color: #FF9933;">Dekho</span>';
    app.innerHTML = '';

    switch (State.view) {
        case 'home': renderHome(app); break;
        case 'likes': renderLikes(app); break;
        case 'login': renderLogin(app); break;
        case 'admin': renderAdmin(app); break;
        case 'agent': renderAgent(app); break;
        case 'details': renderDetails(app); break;
        case 'signup': renderSignup(app); break;
        case 'signup': renderSignup(app); break;
        case 'profile': renderProfile(app); break;
        case 'contact': renderContactUs(app); break;
    }
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
                                    <div style="font-size:1.8rem; font-weight:800;">₹ ${(userDetails.wallet || 0).toLocaleString()}</div>
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

        showGlobalLoader("केवाईसी अपडेट किया जा रहा है..."); // Updating KYC...

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
function renderPropertyCard(p) {
    const isLiked = State.likes.includes(p.id);
    return `
        <div class="prop-card" onclick="navigate('details', ${p.id})">
            <div class="prop-img-box">
                <img src="${p.image}" alt="" loading="lazy">
                <div class="prop-like-btn" onclick="toggleLike(event, ${p.id})">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart" style="color:${isLiked ? '#D32F2F' : 'white'}"></i>
                </div>
            </div>
            <div class="prop-body">
                <div class="prop-price">
                    ₹ ${p.priceSqft} / sq. ft.
                </div>
                <div class="prop-sub">
                    Price: ₹ ${p.price} | Area: ${p.area}
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
                <button class="prop-btn">विवरण देखें</button>
            </div>
        </div>
    `;
}

// --- Views Implementation ---

function renderHome(container) {
    let props = State.properties.filter(p => p.status === 'approved');
    props.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        return b.id - a.id;
    });

    const banners = (State.settings.appDetails && State.settings.appDetails.banners && State.settings.appDetails.banners.length > 0) ?
        State.settings.appDetails.banners.map(url => ({ img: url, title: "Property" })) :
        [
            { img: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200", title: "Dream Home Awaits" },
            { img: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200", title: "Luxury Villas" },
            { img: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200", title: "Prime Plots" }
        ];

    // Categories
    const categories = ['All', 'Plot', 'Rented Room', 'Agricultural Land', 'Residential', 'Commercial', 'Villa', 'Farm House'];
    const activeCat = State.homeCategory || 'All';
    const searchQuery = (State.homeSearch || '').toLowerCase();

    const filteredProps = props.filter(p => {
        const matchesSearch = !searchQuery || p.title.toLowerCase().includes(searchQuery) || p.city.toLowerCase().includes(searchQuery);
        const matchesCat = activeCat === 'All' ||
            p.category === activeCat ||
            (activeCat === 'Villa' && p.title.toLowerCase().includes('villa')) ||
            (activeCat === 'Rented Room' && (p.description.toLowerCase().includes('rent') || p.title.toLowerCase().includes('rent'))) ||
            (activeCat === 'Agricultural Land' && (p.title.toLowerCase().includes('agri') || p.description.toLowerCase().includes('agri') || p.title.toLowerCase().includes('farm'))) ||
            (activeCat === 'Farm House' && p.title.toLowerCase().includes('farm'));
        return matchesSearch && matchesCat;
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
                    <button onclick="setHomeCategory('${cat}')" class="cat-btn ${activeCat === cat ? 'active' : ''}">
                        <i class="fas ${icons[cat] || 'fa-tag'}"></i> ${cat}
                    </button>
                `).join('');
        })()}
        </div>

        <!-- Search Box (Now below categories) -->
        <div style="padding: 0 20px; margin-bottom: 20px; position: relative; z-index: 10;">
            <div style="background: #ffffff; border-radius: 50px; padding: 5px 10px; box-shadow: 0 10px 20px rgba(0,0,0,0.15); display: flex; align-items: center; gap: 10px; height: 50px;">
                <input type="text" placeholder="Search Property, City..." 
                    value="${State.homeSearch || ''}"
                    oninput="updateHomeSearch(this.value)"
                    style="border: none; outline: none; flex: 1; font-size: 0.9rem; padding-left: 10px; background: transparent;">
                
                <div onclick="openSearchModal()" style="width: 38px; height: 38px; background: #FF9933; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; box-shadow: 0 4px 10px rgba(255, 153, 51, 0.3);">
                    <i class="fas fa-sliders-h" style="color: white; font-size: 0.9rem;"></i>
                </div>
            </div>
        </div>

        <div class="property-grid" id="home-prop-grid">
            ${initialProps.length > 0
            ? initialProps.map(p => renderPropertyCard(p)).join('')
            : (State.isLoading
                ? `<!-- Skeleton Loading When Data is Fetching -->
                       <div class="prop-card skeleton-card"><div class="prop-img-box skeleton" style="height:160px;"></div><div class="prop-body"><div class="skeleton sk-price"></div><div class="skeleton sk-title"></div><div class="skeleton sk-text"></div></div></div>
                       <div class="prop-card skeleton-card"><div class="prop-img-box skeleton" style="height:160px;"></div><div class="prop-body"><div class="skeleton sk-price"></div><div class="skeleton sk-title"></div><div class="skeleton sk-text"></div></div></div>
                       <div class="prop-card skeleton-card"><div class="prop-img-box skeleton" style="height:160px;"></div><div class="prop-body"><div class="skeleton sk-price"></div><div class="skeleton sk-title"></div><div class="skeleton sk-text"></div></div></div>
                       <div class="prop-card skeleton-card"><div class="prop-img-box skeleton" style="height:160px;"></div><div class="prop-body"><div class="skeleton sk-price"></div><div class="skeleton sk-title"></div><div class="skeleton sk-text"></div></div></div>`
                : '<div style="grid-column:1/-1; text-align:center; padding:50px; color:#999;">No properties found in this category.</div>'
            )
        }
        </div>
        
        ${hasMore ? `
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
            ${likedProps.length === 0 ? `<div style="text-align:center; padding:50px; color:#999;">कोई पसंदीदा प्रॉपर्टी नहीं मिली</div>` : `<div class="property-grid">${likedProps.map(p => renderPropertyCard(p)).join('')}</div>`}
        </div>
    `;
}

function renderLogin(container) {
    let activeRole = 'customer';
    const renderContent = () => {
        container.innerHTML = `
            <div class="login-wrap">
                <div class="login-box">
                    <div class="role-tab-switcher">
                        <button class="role-tab ${activeRole === 'customer' ? 'active' : ''}" onclick="setRole('customer')">Customer</button>
                        <button class="role-tab ${activeRole === 'agent' ? 'active' : ''}" onclick="setRole('agent')">Agent</button>
                        <button class="role-tab ${activeRole === 'admin' ? 'active' : ''}" onclick="setRole('admin')">Admin</button>
                    </div>
                    <h2 class="login-title">Welcome Back!</h2>
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
                        ${activeRole !== 'admin' ? `<a href="#" onclick="navigate('signup')" class="signup-link">Create Account</a>` : ''}
                    </div>
                    <button class="prop-btn" style="background:none; color:#999; margin-top:15px; width:100%; border:1px solid #eee;" onclick="navigate('home')">Close</button>
                </div>
            </div>
        `;
    };
    window.setRole = (r) => { activeRole = r; renderContent(); };
    renderContent();
}

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
                    State.user = { role: 'admin', name: 'Super Admin' };
                    await saveGlobalData();
                    hideGlobalLoader("लॉगिन सफल!");
                    navigate('admin');
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
                    State.user = { role: 'customer', name: cust.name, id: cust.id, phone: cust.phone, photo: null };
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
    let signupRole = 'customer';
    const renderForm = () => {
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
    };
    window.setSignupRole = (r) => { signupRole = r; renderForm(); };
    renderForm();
}

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
                    experience: experience, status: 'pending', wallet: 0
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
        { label: 'Wallet Balance', val: '₹ ' + State.adminWallet.toLocaleString() }
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
                    <a href="#" class="side-link ${tab === 'withdrawals' ? 'active' : ''}" onclick="setAdminTab('withdrawals'); toggleSidebar()"><i class="fas fa-money-bill-wave"></i> Withdrawals</a>
                    <a href="#" class="side-link ${tab === 'adminWallet' ? 'active' : ''}" onclick="setAdminTab('adminWallet'); toggleSidebar()"><i class="fas fa-wallet"></i> My Wallet</a>
                    <a href="#" class="side-link ${tab === 'broadcast' ? 'active' : ''}" onclick="setAdminTab('broadcast'); toggleSidebar()"><i class="fas fa-bullhorn"></i> Broadcast</a>
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
                                <i class="fas fa-wallet"></i> Wallet Balance: ₹ ${State.adminWallet.toLocaleString()}
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
                            <thead style="background:#f8f9fa;"><tr><th style="padding:15px; text-align:left;">S.No</th><th style="padding:15px; text-align:left;">Property</th><th style="padding:15px; text-align:left;">Agent Info</th><th style="padding:15px; text-align:left;">Price</th><th style="padding:15px; text-align:left;">Status</th><th style="padding:15px; text-align:left;">Featured</th><th style="padding:15px; text-align:right;">Action</th></tr></thead>
                            <tbody>
                                ${[...State.properties].sort((a, b) => b.id - a.id).filter(p => p.title.toLowerCase().includes(State.adminSearch.toLowerCase())).map((p, index) => {
        const agent = State.agents.find(a => a.name === p.agent);
        const agentPhone = agent ? agent.phone : (p.agent.includes('John') ? '9876543210' : 'N/A');
        return `
                                        <tr style="border-top:1px solid #eee;">
                                            <td style="padding:15px; font-weight:700; color:#138808;">#${index + 1}</td>
                                            <td style="padding:15px;">
                                                <div><strong>${p.title}</strong></div>
                                                <div style="font-size:0.75rem; color:#999;">${p.city}</div>
                                                <div style="font-size:0.7rem; color:#666; margin-top:4px;"><i class="fas fa-calendar-alt"></i> ${p.createdAt || 'N/A'}</div>
                                            </td>
                                            <td style="padding:15px;"><div><strong>${p.agent}</strong></div><div style="font-size:0.75rem; color:#138808; font-weight:700;"><i class="fas fa-phone-alt"></i> ${agentPhone}</div></td>
                                            <td style="padding:15px;">₹ ${p.price}</td>
                                            <td style="padding:15px;">
                                                <span style="padding:4px 10px; border-radius:50px; font-size:0.7rem; font-weight:700; background:${p.status === 'approved' ? '#e8f5e9' : (p.status === 'disabled' ? '#ffebee' : (p.status === 'sold' ? '#e0f2f1' : '#fff3e0'))}; color:${p.status === 'approved' ? '#2e7d32' : (p.status === 'disabled' ? '#D32F2F' : (p.status === 'sold' ? '#00796b' : '#e65100'))};">${p.status.toUpperCase()}</span>
                                                ${p.status === 'disabled' && p.disableReason ? `<div style="font-size:0.7rem; color:#D32F2F; margin-top:5px; font-weight:600; max-width:150px; line-height:1.2;">Reason: ${p.disableReason}</div>` : ''}
                                            </td>
                                            <td style="padding:15px;"><button onclick="toggleFeature(${p.id})" style="border:none; padding:5px 10px; border-radius:4px; font-weight:700; background:${p.featured ? '#FF9933' : '#eee'}; color:${p.featured ? 'white' : '#999'};">${p.featured ? 'FEATURED' : 'MARK FEATURED'}</button></td>
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
                                    <th style="padding:15px; text-align:right;">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${State.agents.map((a, index) => {
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
                                            <td style="padding:15px; text-align:right;">
                                                <div style="display:flex; justify-content:flex-end;">
                                                ${kyc.status !== 'none' ? `<button onclick="verifyKYC(${a.id})" style="background:${kyc.status === 'pending' ? '#673AB7' : (kyc.status === 'approved' ? '#2e7d32' : '#D32F2F')}; color:white; border:none; padding:6px 12px; border-radius:6px; margin-right:5px; font-weight:700; cursor:pointer; font-size:0.8rem;">${kyc.status === 'pending' ? 'KYC Request' : 'View KYC'}</button>` : ''}
                                                ${a.status === 'pending' ? `<button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="approveAgent(${a.id})">Approve</button>` : ''}
                                                ${a.status === 'approved' ? `<button style="background:#1a2a3a; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="blockAgent(${a.id})">Block</button>` : ''}
                                                 ${a.status === 'blocked' ? `<button style="background:#FF9933; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="approveAgent(${a.id})">Unblock</button>` : ''}
                                                 <button style="background:#138808; color:white; border:none; padding:6px 12px; border-radius:6px; font-weight:700; cursor:pointer; margin-right:5px;" onclick="manageWallet(${a.id})"><i class="fas fa-wallet"></i></button>
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

                                        <td style="padding:15px; font-weight:700;">₹ ${(c.wallet || 0).toLocaleString()}</td>
                                        <td style="padding:15px;">
                                            <span style="padding:5px 12px; border-radius:50px; font-size:0.75rem; font-weight:800; background:${c.status === 'active' ? '#e8f5e9' : '#ffebee'}; color:${c.status === 'active' ? '#2e7d32' : '#D32F2F'}; text-transform:uppercase;">
                                                ${c.status}
                                            </span>
                                        </td>
                                        <td style="padding:15px; text-align:right;">
                                            <div style="display:flex; justify-content:flex-end; gap:5px;">
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
                                        <td style="padding:15px; color:#1a2a3a; font-weight:600;">₹ ${wallet.toLocaleString()}</td>
                                        <td style="padding:15px;"><strong style="color:#138808;">₹ ${r.amount}</strong></td>
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
                            <div style="font-size:3rem; font-weight:900; margin:15px 0;">₹ ${State.adminWallet.toLocaleString()}</div>
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
                                                ${t.type === 'admin_credit' ? '<span style="color:#138808;">+ ₹ ' + t.amount.toLocaleString() + '</span>' : '<span style="color:#D32F2F;">- ₹ ' + t.amount.toLocaleString() + '</span>'}
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
                    </div>
                ` : ''}
            </main>
        </div>
    `;
}

window.setAdminTab = (t) => { State.adminTab = t; render(); };
window.updateAdminSearch = (v) => { State.adminSearch = v; render(); };
window.toggleFeature = (id) => { const p = State.properties.find(x => x.id === id); if (p) { p.featured = !p.featured; saveGlobalData(); render(); } };

function renderAgent(container) {
    const tab = State.agentTab || 'dashboard';
    const agent = State.agents.find(a => a.id === State.user.id) || State.agents[0] || { name: State.user.name, wallet: 0 };
    const agentProps = State.properties.filter(p =>
        (p.agent === agent.name || p.agent.includes(agent.name.split(' ')[0])) &&
        p.title.toLowerCase().includes((State.agentSearch || '').toLowerCase())
    ).sort((a, b) => b.id - a.id);

    // Calculate Stats
    const totalViews = agentProps.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLeads = agentProps.reduce((acc, p) => acc + (p.leads || 0), 0);

    const stats = [
        { label: 'My Properties', val: agentProps.length, icon: 'fa-building', color: '#138808' },
        { label: 'Total Views', val: totalViews, icon: 'fa-eye', color: '#FF9933' },
        { label: 'Total Leads', val: totalLeads, icon: 'fa-user-tie', color: '#1a2a3a' },
        { label: 'Wallet Balance', val: `₹ ${agent.wallet || 0}`, icon: 'fa-wallet', color: '#138808' }
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
                    <div style="display:flex; align-items:center;">
                        <i class="fas fa-bars mobile-menu-btn" style="display:none; margin-right:15px; font-size:1.5rem; cursor:pointer;" onclick="toggleSidebar()"></i>
                        <div>
                            <h1 style="font-size:1.6rem; color:#1a2a3a;">Welcome, ${State.user.name}</h1>
                            <p style="font-size:0.85rem; color:#666;">Manage your listings and track performance.</p>
                        </div>
                    </div>
                ${(tab === 'properties' || tab === 'dashboard') ? `
                    <div style="display:flex; gap:10px; align-items:center;">
                        ${(!agent.kyc || agent.kyc.status === 'none' || agent.kyc.status === 'rejected') ?
                `<button class="prop-btn" style="width:auto; padding:12px 20px; background:#D32F2F;" onclick="renderProfile(document.getElementById('app'))"><i class="fas fa-exclamation-circle"></i> Complete KYC</button>` :
                (agent.kyc.status === 'pending' ? `<button class="prop-btn" style="width:auto; padding:12px 20px; background:#FF9933;" onclick="renderProfile(document.getElementById('app'))"><i class="fas fa-clock"></i> KYC Pending</button>` :
                    `<div style="color:#138808; font-weight:700; background:#e8f5e9; padding:8px 15px; border-radius:30px; font-size:0.85rem; border:1px solid #c8e6c9;"><i class="fas fa-check-circle"></i> KYC Verified</div>`)
            }
                        <button class="add-property-btn" onclick="showPropertyModal()">
                            <span class="add-prop-icon"><i class="fas fa-plus"></i></span>
                            <span class="add-prop-text">Add New Property</span>
                            <span class="add-prop-shine"></span>
                        </button>
                    </div>
                ` : ''}
                </header>

                ${tab === 'dashboard' ? `
                    <div class="stats-row">
                        ${stats.map(s => `
                            <div class="stat-box" style="border-left:5px solid ${s.color};">
                                <i class="fas ${s.icon}" style="float:right; color:#eee; font-size:2rem;"></i>
                                <div class="stat-num" style="color:${s.color}">${s.val}</div>
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
                                            <div style="color:#138808; font-weight:800; font-size:1.1rem; margin-bottom:5px;">₹ ${p.price}</div>
                                            <div style="font-size:0.65rem; color:#999; text-align:right;">${p.createdAt || ''}</div>
                                        </div>
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
                                        <div style="color:#138808; font-weight:800; font-size:1.1rem; margin-bottom:5px;">₹ ${p.price}</div>
                                        <div style="font-size:0.65rem; color:#999; text-align:right;">${p.createdAt || ''}</div>
                                    </div>
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
                            <div style="font-size:2.5rem; font-weight:900; margin:10px 0;">₹ ${agent.wallet || 0}</div>
                            <button class="prop-btn" style="background:white; color:#138808; width:auto; padding:12px 30px; margin-top:10px; border-radius:50px;" 
                                onclick="requestWithdrawal(${agent.id})">Request Withdrawal</button>
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
                                            ${t.type === 'credit' ? '<span style="color:#138808;">+ ₹ ' + t.amount + '</span>' : '<span style="color:#D32F2F;">- ₹ ' + t.amount + '</span>'}
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
    let activeTab = 'Details';

    const renderContent = () => {
        let contentHtml = '';
        if (activeTab === 'Details') {
            contentHtml = `
                <div style="margin-bottom:20px;">
                    <h2 style="color:#1a2a3a; font-size:1.6rem; font-weight:900; margin-bottom:5px; line-height:1.2;">${p.title}</h2>
                    <div style="color:#138808; font-weight:700; font-size:1.1rem;"><i class="fas fa-map-marker-alt"></i> ${p.city}</div>
                </div>
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800; font-size:1.3rem;">विवरण एवं स्थान</h3>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.area || 'Area'}</span>
                        <strong style="color:#138808; font-size:1.3rem;">${p.area}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.sqft || 'Price/sq.ft'}</span>
                        <strong style="color:#138808; font-size:1.3rem;">₹ ${p.priceSqft}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.city || 'City'}</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.city}</strong>
                    </div>
                    <div style="background:#ffffff; padding:15px; border-radius:15px; border:1px solid #eee; box-shadow:0 4px 10px rgba(0,0,0,0.03);">
                        <span style="color:#666; font-size:1rem; text-transform:uppercase; font-weight:800; display:block; margin-bottom:4px;">${p.labels?.category || 'Type'}</span>
                        <strong style="color:#1a2a3a; font-size:1.2rem;">${p.category}</strong>
                    </div>
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
                <h3 style="color:#1a2a3a; margin-bottom:15px; font-weight:800;">Video Tour</h3>
                ${vidId ? `
                    <div style="position:relative; padding-bottom:56.25%; height:0; border-radius:15px; overflow:hidden; border:1px solid #eee;">
                        <iframe style="position:absolute; top:0; left:0; width:100%; height:100%;" 
                            src="https://www.youtube.com/embed/${vidId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                ` : `
                    <div style="text-align:center; padding:50px; background:white; border-radius:15px; border:1px solid #eee; color:#999;">
                        <i class="fab fa-youtube" style="font-size:3rem; margin-bottom:10px;"></i><br>वीडियो उपलब्ध नहीं है
                    </div>
                `}
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
                <div class="details-tabs" style="display:flex; gap:8px; padding:12px; background:white; position:sticky; top:0; z-index:100; box-shadow:0 2px 10px rgba(0,0,0,0.05);">
                    ${['Details', 'Photos', 'Video', 'Map'].map(t => `
                        <button class="detail-tab ${activeTab === t ? 'active' : ''}" onclick="setDetailTab('${t}')">${t}</button>
                    `).join('')}
                </div>
                <div style="padding:20px; padding-bottom:120px;">${contentHtml}</div>
                <div class="contact-footer" style="padding:15px 20px 25px; flex-direction:column; gap:12px;">
                    <button class="login-btn" style="background:#FFF9F3; color:#FF9933; border:1.5px solid #FFB366; margin:0 0 5px 0; width:100%; border-radius:12px; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px; height:44px; font-size:0.95rem; box-shadow: none;" onclick="shareProperty(${p.id})">
                        <i class="fas fa-share-alt"></i> Share Details (शेयर विवरण)
                    </button>
                    <div style="display:flex; gap:10px; width:100%;">
                        <a href="tel:${p.mobile || '0000000000'}" class="btn-green-fill" style="flex:1;">
                            <i class="fas fa-phone-alt"></i> अभी कॉल करें
                        </a>
                        <a href="https://wa.me/91${p.whatsapp || '0000000000'}" target="_blank" class="btn-green-outline" style="flex:1;">
                            <i class="fab fa-whatsapp"></i> व्हाट्सएप
                        </a>
                    </div>
            </div>`;
    };
    window.setDetailTab = (t) => { activeTab = t; renderContent(); };

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



function showPropertyModal() {
    window.isRealTaskRunning = false; // Reset to ensure submission works
    window.tempPropertyImages = []; // Reset images array for new property
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.style.display = 'flex';
    modal.innerHTML = `
        <div class="modal-content scale-in" style="display:flex; flex-direction:column; padding:0 !important; max-height:85vh; overflow:hidden;">
            <div class="prop-form-header" style="flex-shrink:0; margin:0; border-radius:0;">
                <h3>ADD PROPERTY</h3>
                <p><i class="fas fa-edit"></i> Tap labels to rename them</p>
            </div>
            <div style="overflow-y:auto; padding:20px; flex:1;">
                <form id="add-prop-form">
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-title" value="Property Title" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-title" required placeholder="Please Enter Property Title">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div class="form-group">
                            <div class="label-edit-wrap"><input class="editable-label" id="l-city" value="City" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                            <input id="p-city" required placeholder="Please Enter City">
                        </div>
                        <div class="form-group">
                            <div class="label-edit-wrap"><input class="editable-label" id="l-cat" value="Category" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                            <select id="p-cat">
                                <option>Plot</option>
                                <option>Rented Room</option>
                                <option>Agricultural Land</option>
                                <option>Residential</option>
                                <option>Commercial</option>
                                <option>Villa</option>
                                <option>Farm House</option>
                            </select>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div class="form-group">
                            <div class="label-edit-wrap"><input class="editable-label" id="l-price" value="Total Price" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                            <input id="p-price" required placeholder="Please Enter Total Price">
                        </div>
                        <div class="form-group">
                            <div class="label-edit-wrap"><input class="editable-label" id="l-area" value="Area (Sq.ft/Bigha)" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                            <input id="p-area" required placeholder="Please Enter Area">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-sqft" value="Price per Sq.ft" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-sqft" required placeholder="Please Enter Price per Sq.ft">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        <div class="form-group">
                            <div class="label-edit-wrap"><input class="editable-label" id="l-mobile" value="Mobile Number" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                            <input id="p-mobile" type="tel" required placeholder="Please Enter Mobile Number">
                        </div>
                        <div class="form-group">
                            <div class="label-edit-wrap"><input class="editable-label" id="l-whatsapp" value="WhatsApp Number" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                            <input id="p-whatsapp" type="tel" required placeholder="Please Enter WhatsApp Number">
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-desc" value="Description" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <textarea id="p-desc" rows="3" placeholder="Please Enter Description"></textarea>
                    </div>
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-img" value="Property Images" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        
                        <!-- Image Preview Area -->
                        <div id="image-preview-container" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:10px; min-height:80px; background:#f9f9f9; border-radius:10px; padding:10px; border:1px dashed #ddd;"></div>
                        
                        <div style="display:flex; flex-direction:column; gap:10px; margin-top:15px;">
                            <!-- Option 1: URL Input -->
                            <div style="display:flex; gap:8px;">
                                <input id="p-img-url-input" placeholder="Paste Image URL (e.g. from ImgBB)" style="flex:1; padding:10px; border:1px solid #ccc; border-radius:8px;">
                                <button type="button" class="prop-btn" style="width:auto; background:#1a2a3a; font-size:0.8rem;" onclick="addUrlImage()">
                                    <i class="fas fa-link"></i> Add URL
                                </button>
                            </div>

                            <div style="display:flex; align-items:center; gap:10px; color:#999; font-size:0.8rem;">
                                <div style="flex:1; height:1px; background:#ddd;"></div> OR <div style="flex:1; height:1px; background:#ddd;"></div>
                            </div>

                            <!-- Option 2: Gallery Upload -->
                            <input type="file" id="p-img-single" accept="image/*" style="display:none;" onchange="addSingleImage(this)">
                            <button type="button" id="add-image-btn" class="prop-btn" style="background:#e8f5e9; color:#138808; border:2px dashed #138808;" onclick="document.getElementById('p-img-single').click()">
                                <i class="fas fa-camera"></i> Upload from Gallery (<span id="img-count">0</span>/5)
                            </button>
                        </div>
                        
                        <p style="font-size:0.75rem; color:#666; margin-top:8px;">
                            <i class="fas fa-info-circle"></i> Use URL loads faster. First image will be main. Max 5 images.
                        </p>
                    </div>
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-video" value="YouTube Link (Optional)" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-video" placeholder="Please Enter YouTube Link">
                    </div>
                    <div class="form-group">
                        <div class="label-edit-wrap"><input class="editable-label" id="l-map" value="Map Link (Optional)" readonly><i class="fas fa-pen label-edit-icon" onclick="enableLabelEdit(this)"></i></div>
                        <input id="p-map" placeholder="Please Enter Map Link">
                    </div>
                    
                    <div id="extra-fields-area"></div>
                    
                    <button type="button" class="prop-btn" style="background:#f0f2f5; color:#1a2a3a; margin-bottom:20px; border:2px dashed #ccc;" onclick="addCustomField()">
                        <i class="fas fa-plus"></i> Add More Details
                    </button>

                    <button type="button" class="login-btn" onclick="window.processPropertySubmit()">Submit Property</button>
                    <button type="button" class="prop-btn" style="background:#D32F2F; color:white; margin-top:10px; padding:15px; font-weight:800; border-radius:12px;" onclick="closeModal()">CLOSE</button>
                </form>
            </div>
        </div>`;
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

window.addCustomField = () => {
    const container = document.getElementById('extra-fields-area');
    const id = Date.now();
    const div = document.createElement('div');
    div.className = 'form-group extra-field-group';
    div.style.position = 'relative';
    div.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
             <input class="editable-label" value="New Detail Title" style="width:80%; color:#138808;">
             <i class="fas fa-times" style="color:#D32F2F; cursor:pointer;" onclick="this.parentElement.parentElement.remove()"></i>
        </div>
        <input class="extra-field-value" placeholder="Please Enter Value">
    `;
    container.appendChild(div);
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
    const fields = [
        { id: 'p-title', name: 'Title' },
        { id: 'p-city', name: 'City' },
        { id: 'p-price', name: 'Price' },
        { id: 'p-area', name: 'Area' },
        { id: 'p-mobile', name: 'Mobile' },
        { id: 'p-whatsapp', name: 'WhatsApp' }
    ];

    for (const f of fields) {
        const el = document.getElementById(f.id);
        if (!el || !el.value.trim()) {
            alert(`Please fill the ${f.name} field.`);
            return;
        }
    }

    // Check if at least one image is added
    if (!window.tempPropertyImages || window.tempPropertyImages.length === 0) {
        alert("Please add at least one property image.");
        return;
    }

    window.isRealTaskRunning = true;
    showGlobalLoader("प्रॉपर्टी अपलोड की जा रही है... (Images: " + window.tempPropertyImages.length + ")");

    try {
        // Use images from tempPropertyImages (already base64)
        const allImages = window.tempPropertyImages;

        const newProp = {
            id: Date.now(),
            title: document.getElementById('p-title').value.trim(),
            city: document.getElementById('p-city').value.trim(),
            category: document.getElementById('p-cat').value,
            price: document.getElementById('p-price').value.trim(),
            area: document.getElementById('p-area').value.trim(),
            priceSqft: document.getElementById('p-sqft').value.trim(),
            mobile: document.getElementById('p-mobile').value.trim(),
            whatsapp: document.getElementById('p-whatsapp').value.trim(),
            description: document.getElementById('p-desc').value.trim(),
            image: allImages[0], // Main image (backward compatibility)
            images: allImages,   // All images array
            video: document.getElementById('p-video').value.trim(),
            map: document.getElementById('p-map').value.trim(),
            status: State.user.role === 'admin' ? 'approved' : 'pending',
            agent: State.user.name || 'Unknown Agent',
            featured: false,
            views: 0,
            leads: 0,
            showAgentContact: false,
            createdAt: new Date().toLocaleString('en-IN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            }),
            labels: {
                title: document.getElementById('l-title').value.trim(),
                city: document.getElementById('l-city').value.trim(),
                category: document.getElementById('l-cat').value.trim(),
                price: document.getElementById('l-price').value.trim(),
                area: document.getElementById('l-area').value.trim(),
                sqft: document.getElementById('l-sqft').value.trim(),
                mobile: document.getElementById('l-mobile').value.trim(),
                whatsapp: document.getElementById('l-whatsapp').value.trim(),
                video: document.getElementById('l-video').value.trim(),
                map: document.getElementById('l-map').value.trim()
            },
            extraDetails: Array.from(document.querySelectorAll('.extra-field-group')).map(div => ({
                label: div.querySelector('.editable-label').value.trim(),
                value: div.querySelector('.extra-field-value').value.trim()
            }))
        };

        if (!State.properties) State.properties = [];
        State.properties.push(newProp);

        await saveGlobalData();

        hideGlobalLoader("प्रॉपर्टी सफलतापूर्वक अपलोड!");

        setTimeout(() => {
            window.tempPropertyImages = []; // Reset images array
            closeModal();
            render();
            if (State.user.role === 'agent') setAgentTab('properties');
            alert("Success: Property has been added!");
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
    const p = State.properties.find(x => x.id === id);
    if (!p) return;
    const modal = document.getElementById('modal-container');
    if (!modal) return;
    modal.style.display = 'flex';
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
                        <div class="form-group"><label>Category</label><select id="pe-cat">
                            <option ${p.category === 'Plot' ? 'selected' : ''}>Plot</option>
                            <option ${p.category === 'Rented Room' ? 'selected' : ''}>Rented Room</option>
                            <option ${p.category === 'Agricultural Land' ? 'selected' : ''}>Agricultural Land</option>
                            <option ${p.category === 'Residential' ? 'selected' : ''}>Residential</option>
                            <option ${p.category === 'Commercial' ? 'selected' : ''}>Commercial</option>
                            <option ${p.category === 'Villa' ? 'selected' : ''}>Villa</option>
                            <option ${p.category === 'Farm House' ? 'selected' : ''}>Farm House</option>
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
                    <button type="submit" class="login-btn">Update Details</button>
                    <button type="button" class="prop-btn" style="background:#D32F2F; color:white; margin-top:10px; padding:15px; font-weight:800; border-radius:12px;" onclick="closeModal()">CLOSE</button>
                </form>
            </div>
        </div>`;
    document.getElementById('edit-prop-form').onsubmit = (e) => {
        e.preventDefault();
        p.title = document.getElementById('pe-title').value;
        p.city = document.getElementById('pe-city').value;
        p.category = document.getElementById('pe-cat').value;
        p.price = document.getElementById('pe-price').value;
        p.area = document.getElementById('pe-area').value;
        p.priceSqft = document.getElementById('pe-sqft').value;
        p.mobile = document.getElementById('pe-mobile').value;
        p.whatsapp = document.getElementById('pe-whatsapp').value;
        p.description = document.getElementById('pe-desc').value;
        p.video = document.getElementById('pe-video').value;
        p.map = document.getElementById('pe-map').value;

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

function openSearchModal() {
    const modal = document.getElementById('modal-container');
    modal.style.display = 'flex';

    // Get unique cities from all properties
    const cities = [...new Set(State.properties.map(p => p.city).filter(c => c && c.trim() !== ''))];
    const cityOptions = cities.map(city => `<option>${city}</option>`).join('');

    modal.innerHTML = `
        <div class="modal-content scale-in" style="max-width: 350px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3 style="margin:0;">Advanced Search</h3>
                <i class="fas fa-times" onclick="closeModal()" style="cursor:pointer; color:#999;"></i>
            </div>
            <div class="form-group">
                <label>Select City</label>
                <select id="s-city" class="login-input">
                    <option>All Cities</option>
                    ${cityOptions}
                </select>
            </div>
            <div class="form-group">
                <label>Property Type</label>
                <select id="s-type" class="login-input">
                    <option>All Types</option>
                    <option>Plot</option>
                    <option>Rented Room</option>
                    <option>Agricultural Land</option>
                    <option>Residential</option>
                    <option>Commercial</option>
                    <option>Villa</option>
                    <option>Farm House</option>
                </select>
            </div>
            <button class="login-btn" onclick="closeModal()" style="background:#138808; margin-top:20px;">Apply Search</button>
            <button class="prop-btn" style="background:none; color:#D32F2F;" onclick="closeModal()">Close</button>
        </div>`;
}

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
            <p style="margin-bottom:15px;">Current Balance: <strong style="color:#138808; font-size:1.2rem;">₹ ${(c.wallet || 0).toLocaleString()}</strong></p>
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
    const amount = Number(document.getElementById('wc-amount').value);
    if (!c || !amount || amount <= 0) return alert("Invalid Amount");

    showGlobalLoader(type === 'credit' ? "वॉलेट में राशि जोड़ी जा रही है..." : "वॉलेट से राशि निकाली जा रही है...");

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
    }
    await saveGlobalData();
    hideGlobalLoader("वॉलेट अपडेट सफल!");
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
            <p>Current Balance: <strong>₹ ${a.wallet}</strong></p>
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
        return alert("कृपया एक सही राशि (Amount) दर्ज करें!");
    }
    const amount = parseInt(amountVal);
    showGlobalLoader("वॉलेट अपडेट किया जा रहा है...");
    if (type === 'add') {
        // Check if admin has sufficient balance
        if (State.adminWallet < amount) {
            return alert("Admin wallet में पर्याप्त बैलेंस नहीं है!");
        }

        // Deduct from admin wallet
        State.adminWallet -= amount;

        // Add to agent wallet
        a.wallet += amount;

        // Record agent credit transaction
        State.walletTransactions.push({
            id: Date.now(),
            agentId: a.id,
            amount: amount,
            type: 'credit',
            date: new Date().toLocaleString(),
            remark: 'Added by Admin'
        });

        // Record admin debit transaction
        State.walletTransactions.push({
            id: Date.now() + 1,
            amount: amount,
            type: 'admin_debit',
            date: new Date().toLocaleString(),
            remark: `Transferred to ${a.name}`
        });
    } else {
        if (a.wallet < amount) return alert("Insufficient balance");
        a.wallet -= amount;
        State.walletTransactions.push({
            id: Date.now(),
            agentId: a.id,
            amount: amount,
            type: 'debit',
            date: new Date().toLocaleString(),
            remark: 'Reduced by Admin'
        });
    }
    await saveGlobalData();
    hideGlobalLoader("वॉलेट अपडेट सफल!");
    closeModal();
    render();
    setTimeout(() => alert(`Wallet updated! New Balance: ₹ ${a.wallet}`), 200);
}

async function requestWithdrawal(id) {
    const a = State.agents.find(x => x.id === id);
    let amountStr = prompt("Enter amount to withdraw (?):", a.wallet);
    if (amountStr === null) return; // User cancelled prompt

    if (!amountStr.trim() || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("कृपया एक सही राशि (Amount) दर्ज करें!");
    }

    const amount = parseInt(amountStr);
    if (amount > a.wallet) return alert("Insufficient balance");

    showGlobalLoader("निकासी अनुरोध भेजा जा रहा है...");

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
    hideGlobalLoader("अनुरोध सफल!");
    render();
    setTimeout(() => alert("Withdrawal request sent! Amount deducted from wallet and held for approval."), 200);
}

function processWithdrawal(reqId, status) {
    const r = State.withdrawalRequests.find(x => x.id === reqId);
    if (!r) return;
    const remark = prompt(`Enter remark for ${status === 'approved' ? 'Approval' : 'Rejection'}:`);
    if (remark === null) return;

    showGlobalLoader("निकासी प्रक्रिया शुरू..."); // Withdrawal being processed...

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
        hideGlobalLoader(status === 'approved' ? "निकासी स्वीकृत!" : "निकासी अस्वीकृत!");
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
        return alert("गलत पासवर्ड! Access Denied.");
    }

    const amountStr = prompt("Enter amount to add to Admin Wallet (?):");
    if (amountStr === null) return;

    if (!amountStr.trim() || isNaN(amountStr) || parseInt(amountStr) <= 0) {
        return alert("कृपया एक सही राशि (Amount) दर्ज करें!");
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
    alert(`₹ ${amount.toLocaleString()} successfully added to Admin Wallet!`);
}

function toggleDateSetting() {
    State.settings.showDate = !State.settings.showDate;
    saveGlobalData();
    render();
}

window.toggleDateSetting = toggleDateSetting;
window.setHomeCategory = (c) => { State.homeCategory = c; render(); };
window.addAdminBalance = addAdminBalance;
window.manageWallet = manageWallet;
window.adjustWallet = adjustWallet;
window.requestWithdrawal = requestWithdrawal;
window.processWithdrawal = processWithdrawal;
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
                <div style="font-size:2.5rem; font-weight:800;">₹ ${(customer.wallet || 0).toLocaleString()}</div>
            </div>
            
            <div style="margin-bottom:25px;">
                <h4 style="margin-bottom:15px; color:#1a2a3a;">Request Withdrawal</h4>
                <div class="form-group">
                    <label>Amount (₹)</label>
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
                                    <strong style="color:#1a2a3a;">₹ ${r.amount.toLocaleString()}</strong>
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

    showGlobalLoader("निकासी अनुरोध भेजा जा रहा है...");

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
        type: 'customer_withdrawal',
        status: 'pending',
        date: new Date().toLocaleString(),
        remark: 'Withdrawal Request Initiated'
    });

    // Save and show success
    saveGlobalData().then(() => {
        hideGlobalLoader("निकासी अनुरोध सफल!");
        setTimeout(() => {
            alert("Withdrawal request submitted successfully!");
            closeModal();
            render();
        }, 500);
    }).catch(err => {
        console.error(err);
        hideGlobalLoader(null);
        alert("Failed to submit request. Please try again.");
    });
};

window.deleteCustomer = (id) => {
    const customer = State.customers.find(c => c.id === id);
    if (!customer) return;

    if (confirm(`Are you sure you want to PERMANENTLY DELETE this customer?\n\nName: ${customer.name}\nPhone: ${customer.phone}\nEmail: ${customer.email}\n\nThis will also delete:\n- All their wallet balance (₹${(customer.wallet || 0).toLocaleString()})\n- All their liked properties\n- All their KYC data\n\nThis action CANNOT be undone!`)) {
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
