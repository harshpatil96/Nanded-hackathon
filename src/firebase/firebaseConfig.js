import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA2bKWS7AtGWUNqkLvulYgBNF7C7Tw7N1E",
  authDomain: "nanded-hackathon.firebaseapp.com",
  projectId: "nanded-hackathon",
  storageBucket: "nanded-hackathon.firebasestorage.app",
  messagingSenderId: "140328645970",
  appId: "1:140328645970:web:d8826075b7c034fa58768b",
  measurementId: "G-4T55YBGCYH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export{auth,db,storage};


// import { initializeApp } from "firebase/app";
// import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
// import { getFirestore, doc, setDoc } from "firebase/firestore";

// const firebaseConfig = {
//     apiKey: "AIzaSyA2bKWS7AtGWUNqkLvulYgBNF7C7Tw7N1E",
//     authDomain: "nanded-hackathon.firebaseapp.com",
//     projectId: "nanded-hackathon",
//     storageBucket: "nanded-hackathon.firebasestorage.app",
//     messagingSenderId: "140328645970",
//     appId: "1:140328645970:web:d8826075b7c034fa58768b",
//     measurementId: "G-4T55YBGCYH"
//   };

//   const app = initializeApp(firebaseConfig);

// // Initialize Firebase services
// const auth = getAuth(app);
// const db = getFirestore(app)

// async function createDummyUsers() {
//   for (let i = 1; i <= 1; i++) {
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, `harshalpatil668243@gmail.com`, "123456");
//       const user = userCredential.user;

//       // Store user details in Firestore
//       await setDoc(doc(db, "users", user.uid), {
//         uid: user.uid,
//         email: user.email,
//         displayName: `Harshal`,
//         createdAt: new Date(),
//       });

//       console.log(`Dummy User ${i} Created & Stored in Firestore`);
//     } catch (error) {
//       console.error(`Error Creating Dummy User ${i}:`, error.message);
//     }
//   }
// }

// createDummyUsers();