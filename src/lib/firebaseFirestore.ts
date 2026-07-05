import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseApp } from './firebase';

function createFirestoreInstance(): Firestore | null {
  if (!firebaseApp) {
    return null;
  }

  try {
    return getFirestore(firebaseApp);
  } catch (error) {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      console.warn('[Firebase] Firestore initialization failed. Firestore features are disabled.', error);
    }

    return null;
  }
}

export const firestore = createFirestoreInstance();
export const isFirestoreConfigured = Boolean(firestore);
