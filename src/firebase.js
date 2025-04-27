import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCbVIi_4FcUJ5qDNownlzxy2jQR0Z9YuDA",
  authDomain: "absen-277bf.firebaseapp.com",
  projectId: "absen-277bf",
  storageBucket: "absen-277bf.firebasestorage.app",
  messagingSenderId: "209791477393",
  appId: "1:209791477393:web:40ea2495646c5510694130"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
