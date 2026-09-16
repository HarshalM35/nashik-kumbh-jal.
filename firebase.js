// =========================================================
// NASHIK KUMBH JAL - FIREBASE CONFIG
// =========================================================

import { initializeApp } from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    getAuth,
    signInAnonymously
} from
    "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// Firebase configuration

const firebaseConfig = {

    apiKey: "AIzaSyADwdHTP8N6CEyEg_hgHjKE6eYLxUxNK5w",

    authDomain:
        "nashik-kumbh-jal-523b1.firebaseapp.com",

    projectId:
        "nashik-kumbh-jal-523b1",

    storageBucket:
        "nashik-kumbh-jal-523b1.firebasestorage.app",

    messagingSenderId:
        "670762299096",

    appId:
        "1:670762299096:web:44b38588b71f1b74e1f1ad"
};


// Initialize Firebase

const app =
    initializeApp(firebaseConfig);


// Firestore

const db =
    getFirestore(app);


// Authentication

const auth =
    getAuth(app);


// Export

export {
    db,
    auth,
    signInAnonymously
};