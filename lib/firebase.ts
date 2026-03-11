import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBOT08OAzdTsXN1wnMhPE0zW2u2BlXfWGY",
  authDomain: "village-app-6c3d4.firebaseapp.com",
  projectId: "village-app-6c3d4",
  storageBucket: "village-app-6c3d4.firebasestorage.app",
  messagingSenderId: "1082418589367",
  appId: "1:1082418589367:web:d95a3a087eeb5753dde732",
  measurementId: "G-XR49SVL47C",
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
