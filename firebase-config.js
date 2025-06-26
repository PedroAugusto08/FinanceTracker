import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDH-B49zR7lnCUY4oCuBPSQtKZWlOYPOYQ",
  authDomain: "finance-tracker-54928.firebaseapp.com",
  projectId: "finance-tracker-54928",
  storageBucket: "finance-tracker-54928.firebasestorage.app",
  messagingSenderId: "444635466957",
  appId: "1:444635466957:web:c2ec024144a1905a10ad84"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, app };