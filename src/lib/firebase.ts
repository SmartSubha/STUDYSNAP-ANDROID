import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with robust multi-tab offline persistence enabled and proxy-friendly long-polling
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  }),
  experimentalForceLongPolling: true
}, firebaseConfig.firestoreDatabaseId);

export const googleProvider = new GoogleAuthProvider();

// Connection test
async function testConnection() {
  try {
    // Try to fetch a non-existent doc from server to test connectivity
    // Using getDocFromServer ensures we are actually hitting the backend
    await getDocFromServer(doc(db, '_internal_', 'connection_test'));
    console.log("Firestore connection verified.");
  } catch (error: any) {
    if (error?.code === 'unavailable' || error?.message?.includes('offline')) {
      console.warn("Firestore is currently running offline or is unavailable. Local cache will be used.");
    } else if (error?.code === 'permission-denied') {
      console.log("Firestore connection verified (Permission denied is expected for internal test path).");
    } else {
      console.error("Firestore connection error:", error);
    }
  }
}
testConnection();
