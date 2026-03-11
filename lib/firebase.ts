import { initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBOT08OAzdTsXN1wnMhPE0zW2u2BlXfWGY',
  authDomain: 'village-app-6c3d4.firebaseapp.com',
  projectId: 'village-app-6c3d4',
  storageBucket: 'village-app-6c3d4.firebasestorage.app',
  messagingSenderId: '1082418589367',
  appId: '1:1082418589367:web:d95a3a087eeb5753dde732',
};

const app = initializeApp(firebaseConfig);

// Use in-memory persistence — session is managed via SecureStore in auth-context
export const auth = initializeAuth(app, {
  persistence: inMemoryPersistence,
});

export const db = getFirestore(app);
