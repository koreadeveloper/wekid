import { getAuth, type Auth } from 'firebase/auth';
import { firebaseApp } from './firebase';

function createAuthInstance(): Auth | null {
  if (!firebaseApp) {
    return null;
  }

  try {
    return getAuth(firebaseApp);
  } catch (error) {
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      console.warn('[Firebase] Auth initialization failed. Auth features are disabled.', error);
    }

    return null;
  }
}

export const auth = createAuthInstance();
export const isAuthConfigured = Boolean(auth);
