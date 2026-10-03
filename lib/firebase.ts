import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCnUk4a0iGrq8b1uQvQJAbQdTslXSjV4LM",
  authDomain: "crm-ka-fe376.firebaseapp.com",
  projectId: "crm-ka-fe376",
  storageBucket: "crm-ka-fe376.firebasestorage.app",
  messagingSenderId: "680074622292",
  appId: "1:680074622292:web:87eefc422a9fec7f7bc4c1"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
