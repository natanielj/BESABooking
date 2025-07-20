// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyC_Kbo16hYrwdgMQSO4TpRwa_y3AiAsHmU",
  authDomain: "besa-booking-fec9f.firebaseapp.com",
  projectId: "besa-booking-fec9f",
  storageBucket: "besa-booking-fec9f.firebasestorage.app",
  messagingSenderId: "858727290009",
  appId: "1:858727290009:web:df97b6ecfd92935434d408",
  measurementId: "G-VWHR6VE2XP"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);

export { auth };
