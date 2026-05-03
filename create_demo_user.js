
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBXYqzTDq2eU2KGgnJ325WHP3oQIQUpsH0",
  authDomain: "sigorta-cuzdanim-aeeeb.firebaseapp.com",
  projectId: "sigorta-cuzdanim-aeeeb",
  storageBucket: "sigorta-cuzdanim-aeeeb.firebasestorage.app",
  messagingSenderId: "706002704074",
  appId: "1:706002704074:web:82a359fe9a3a05b5f04633"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const email = "demo@sigortacuzdani.net";
const password = "123456";

createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    console.log("User created:", userCredential.user.uid);
    process.exit(0);
  })
  .catch((error) => {
    if (error.code === 'auth/email-already-in-use') {
      console.log("User already exists.");
      process.exit(0);
    }
    console.error("Error creating user:", error.message);
    process.exit(1);
  });
