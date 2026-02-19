// FIREBASE CONFIGURATION
const firebaseConfig = {
    apiKey: "AIzaSyDSBrVmENKDiE52iDEw9znCaxp4p8Cmamo",
    authDomain: "bhumidekho.firebaseapp.com",
    databaseURL: "https://bhumidekho-default-rtdb.firebaseio.com",
    projectId: "bhumidekho",
    storageBucket: "bhumidekho.firebasestorage.app",
    messagingSenderId: "258412071321",
    appId: "1:258412071321:web:1ced03961683a80c3eeb08"
};

// Initialize only if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
// Export references for other scripts to use
const auth = firebase.auth();
const db = firebase.database();
const storage = firebase.storage();
