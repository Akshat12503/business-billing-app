// ===== Firebase Init =====
// Uses the compat SDKs (loaded via <script> tags in index.html) so no
// build step / bundler is needed — works the same as your other plain JS files.

const firebaseConfig = {
    apiKey: "AIzaSyBtgtqBzZ00E8GrKsSkRISy0k4YZQkFpGA",
    authDomain: "billbook-rck1955.firebaseapp.com",
    projectId: "billbook-rck1955",
    storageBucket: "billbook-rck1955.firebasestorage.app",
    messagingSenderId: "711192622968",
    appId: "1:711192622968:web:90c3c828e3b9e8a44e7a8d"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db   = firebase.firestore();

// Keep the app usable offline / on flaky shop wifi — Firestore will queue
// writes and sync automatically when back online.
db.enablePersistence({ synchronizeTabs: true }).catch((err) => {
    console.warn("Offline persistence not enabled:", err.code);
});