import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCOGS2LaaMI9RFPwL_6y5KyTtzwnsVwgys",
  authDomain: "glpy-app.firebaseapp.com",
  projectId: "glpy-app",
  storageBucket: "glpy-app.firebasestorage.app",
  messagingSenderId: "300237738938",
  appId: "1:300237738938:web:ebbefd8dd6243544d28383",
  measurementId: "G-RVGGY2ZT0G"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

export default app;
