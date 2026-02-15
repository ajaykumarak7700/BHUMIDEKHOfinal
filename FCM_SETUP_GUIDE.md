# Firebase Cloud Messaging (FCM) Setup for Background Notifications

Agar aap chahte hain ki **App BAND hone par bhi notification aaye** (jaise WhatsApp), toh Firebase Cloud Messaging (FCM) setup karna padega.

---

## ✅ Step 1: Firebase Project Settings

1. Firebase Console kholein: [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Project Settings (⚙️ icon) → **Cloud Messaging** tab par click karein.
3. **"Web configuration"** section search karein.
4. **"Generate key pair"** button par click karein.
5. **Key Pair (Public Key)** copy karein.

---

## ✅ Step 2: Code Update

1. `index.html` mein Firebase Messaging script add karein:
   ```html
   <script src="https://www.gstatic.com/firebasejs/9.22.0/firebase-messaging-compat.js"></script>
   ```

2. `app.js` mein Messaging Initialize karein:
   ```javascript
   const messaging = firebase.messaging();
   
   messaging.getToken({ vapidKey: 'YOUR_PUBLIC_KEY_HERE' }).then((currentToken) => {
       if (currentToken) {
           console.log('FCM Token:', currentToken);
           // Save this token to your database for the user
           saveTokenToDatabase(currentToken);
       } else {
           console.log('No registration token available. Request permission to generate one.');
       }
   }).catch((err) => {
       console.log('An error occurred while retrieving token. ', err);
   });
   
   messaging.onMessage((payload) => {
       console.log('Message received. ', payload);
       // Customize notification here
       const notificationTitle = payload.notification.title;
       const notificationOptions = {
           body: payload.notification.body,
           icon: payload.notification.icon
       };
   
       new Notification(notificationTitle, notificationOptions);
   });
   ```

---

## ✅ Step 3: Send Notification (Server Side)

App band hone par notification bhejne ke liye aapko **Server** ya **Cloud Function** chahiye hoga.

Example (Node.js):
```javascript
const admin = require("firebase-admin");

const message = {
  notification: {
    title: "New Message",
    body: "Hello from BhumiDekho!"
  },
  token: registrationToken
};

admin.messaging().send(message)
  .then((response) => {
    console.log("Successfully sent message:", response);
  })
  .catch((error) => {
    console.log("Error sending message:", error);
  });
```

---

## ⚠️ IMPORTANT NOTE

Client-side code (JavaScript) se hum **Direct Push Notification** nahi bhej sakte jab app completely band ho. Yeh security reason hai.

**Alternative Solution Without Server:**
Agar server setup nahi kar sakte, toh **Service Worker Background Sync** use kar sakte hain, lekin woh limited hai. Best solution FCM + Cloud Functions hai.

---

## 🚀 CURRENT STATUS

Abhi jo code humne likha hai woh:
1. **Background Tab**: Notification aayega ✅
2. **Minimized Window**: Notification aayega ✅
3. **App Active**: In-App Notification aayega ✅
4. **Completely Closed**: Notification **NAHI** aayega ❌ (Iske liye upar wala setup chahiye)

Agar aap chahte hain ki main **Client-Side Simulation** add karun jo Service Worker use karke koshish kare, toh bataiye!
