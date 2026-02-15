const translations = {
    en: {
        app_title: "Bhumi Dekho App",
        choose_account: "Choose Account",
        login_as: "Login as",
        user_role: "User",
        agent_role: "Agent",
        admin_role: "Admin",
        cancel: "Cancel",
        search_placeholder: "Search land, village, khasra number...",
        loading: "Loading Properties...",
        my_liked_properties: "My Liked Properties",
        login_to_view_saved: "Login to view saved properties.",
        helpline: "Helpline",
        call_us: "Call us:",
        call_now: "Call Now",
        home: "Home",
        like: "Like",
        help: "Help",
        profile: "Profile",
        login: "Login",
        admin: "Admin",
        wallet: "Wallet",
        view_details: "View Property",
        photos: "Photos",
        video: "Video",
        sold: "SOLD",
        land_details: "Land Details",
        city: "City",
        type: "Type",
        area: "Area",
        address: "Address",
        description: "Description",
        sold_by: "Sold By",
        mobile: "Mobile",
        login_to_view: "Login to view",
        open_maps: "Open Google Maps",
        call_btn: "Call",
        whatsapp_btn: "WhatsApp",
        prop_plot: "Plot",
        prop_house: "House",
        prop_flat: "Flat",
        prop_commercial: "Commercial",
        prop_agriculture: "Agriculture",
        filter_all_cities: "All Cities",
        filter_all_types: "All Types",
        filter_all_prices: "All Prices",
        no_properties_found: "No properties found.",
        login_alert: "Please login first",
        connection_error: "Connection Error",
        confirm_logout: "Are you sure you want to logout?",
        select_city: "Select City",
        select_type: "Select Type",
        select_budget: "Select Budget",
        reset: "Reset",
        no_description_provided: "No description provided.",
        real_estate_simple: "Real Estate Made Simple",
        mobile_number: "Mobile Number",
        password: "Password",
        sign_up: "Sign Up",
        no_account: "Don't have an account?",
        skip_home: "Skip to Home",
        full_name: "Full Name",
        create_account: "Create Account",
        role: "Role",
        role_customer: "Customer (Buyer)",
        role_agent_seller: "Agent (Seller)",
        already_have_account: "Already have an account?"
    },
    hi: {
        app_title: "भूमि देखो App",
        choose_account: "खाता चुनें",
        login_as: "के रूप में लॉगिन करें",
        user_role: "ग्राहक",
        agent_role: "एजेंट",
        admin_role: "एडमिन",
        cancel: "रद्द करें",
        search_placeholder: "खोजें जमीन, गांव, खसरा नंबर...",
        loading: "प्रॉपर्टी लोड हो रही है...",
        my_liked_properties: "मेरी पसंदीदा प्रॉपर्टी",
        login_to_view_saved: "सेव की गई प्रॉपर्टी देखने के लिए लॉगिन करें।",
        helpline: "सहायता / हेल्पलाइन",
        call_us: "हमें कॉल करें:",
        call_now: "अभी कॉल करें",
        home: "होम",
        like: "पसंद",
        help: "सहायता",
        profile: "प्रोफाइल",
        login: "लॉगिन",
        admin: "एडमिन",
        wallet: "वॉलेट",
        view_details: "View Property",
        photos: "फोटो",
        video: "वीडियो",
        sold: "बिक गया",
        land_details: "भूमि का विवरण",
        city: "शहर",
        type: "प्रकार",
        area: "क्षेत्रफल",
        address: "पता",
        description: "विवरण",
        sold_by: "विक्रेता",
        mobile: "मोबाइल",
        login_to_view: "देखने के लिए लॉगिन करें",
        open_maps: "गूगल मैप्स खोलें",
        call_btn: "कॉल करें",
        whatsapp_btn: "व्हाट्सएप",
        prop_plot: "प्लॉट",
        prop_house: "घर",
        prop_flat: "फ्लैट",
        prop_commercial: "व्यावसायिक",
        prop_agriculture: "कृषि",
        filter_all_cities: "सभी शहर",
        filter_all_types: "सभी प्रकार",
        filter_all_prices: "सभी कीमतें",
        no_properties_found: "कोई प्रॉपर्टी नहीं मिली।",
        login_alert: "कृपया पहले लॉगिन करें",
        connection_error: "कनेक्शन त्रुटि",
        confirm_logout: "क्या आप लॉगआउट करना चाहते हैं?",
        select_city: "शहर चुनें",
        select_type: "प्रकार चुनें",
        select_budget: "बजट चुनें",
        reset: "रीसेट",
        no_description_provided: "कोई विवरण उपलब्ध नहीं है।",
        real_estate_simple: "रियल एस्टेट हुआ आसान",
        mobile_number: "मोबाइल नंबर",
        password: "पासवर्ड",
        sign_up: "साइन अप",
        no_account: "क्या खाता नहीं है?",
        skip_home: "होम पर जाएं",
        full_name: "पूरा नाम",
        create_account: "खाता बनाएं",
        role: "भूमिका",
        role_customer: "ग्राहक (खरीदार)",
        role_agent_seller: "एजेंट (विक्रेता)",
        already_have_account: "क्या पहले से खाता है?"
    }
};

let currentLang = localStorage.getItem('appRange') || 'hi';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    localStorage.setItem('appRange', lang);
    applyTranslations();
    updateContentDynamic(); // Hook for dynamic content
}

function t(key) {
    return translations[currentLang][key] || key;
}

function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            if (el.tagName === 'INPUT' && el.getAttribute('placeholder')) {
                el.placeholder = translations[currentLang][key];
            } else {
                el.textContent = translations[currentLang][key];
            }
        }
    });

    // Toggle button text update (if we have a button displaying current lang)
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
        langBtn.textContent = currentLang === 'hi' ? 'English' : 'हिंदी';
    }
}

// Helper to translate property types dynamically if needed
function translatePropType(type) {
    const key = 'prop_' + type.toLowerCase();
    return translations[currentLang][key] || type;
}

// Initial apply
document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
});
