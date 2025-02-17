import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCHElzxNEbHUvlKCx_GhD_89EO8NZGOJ1Q",
  authDomain: "project-connect-app.firebaseapp.com",
  projectId: "project-connect-app-c1370",
  storageBucket: "project-connect-app.appspot.com",
  messagingSenderId: "772389918244",
  appId: "1:772389918244:android:d945a8124f5e596ffd6ab1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
