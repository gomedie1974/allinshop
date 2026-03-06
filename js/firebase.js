// js/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWbt9LEfEl1uMQvlWbXlcS-_jFvPK4Xk4",
  authDomain: "allinshop-dc0b4.firebaseapp.com",
  projectId: "allinshop-dc0b4",
  storageBucket: "allinshop-dc0b4.firebasestorage.app",
  messagingSenderId: "54718990341",
  appId: "1:54718990341:web:9f15abb7c7cef1cd53f46c",
  measurementId: "G-1HRTRY7KVL" 
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);