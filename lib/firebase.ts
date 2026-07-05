import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyA-oP5hm_hVFd_lShfSAqSblkH5HVI4E3Q",
    authDomain: "navik-bro.firebaseapp.com",
    projectId: "navik-bro",
    storageBucket: "navik-bro.firebasestorage.app",
    messagingSenderId: "864304238896",
    appId: "1:864304238896:web:33728bfabaf5bcfc5f78f5",
    measurementId: "G-L0P830TCQJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;