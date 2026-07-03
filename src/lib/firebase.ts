import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export const firebaseEnvKeys = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
] as const;

type FirebaseEnvKey = (typeof firebaseEnvKeys)[number];
type FirebaseEnv = Partial<Record<FirebaseEnvKey, string | undefined>>;

export type FirebaseConfigStatus =
  | {
      configured: true;
      config: FirebaseOptions;
      missingKeys: [];
    }
  | {
      configured: false;
      config: null;
      missingKeys: FirebaseEnvKey[];
    };

export function createFirebaseConfigFromEnv(env: FirebaseEnv): FirebaseConfigStatus {
  const values = Object.fromEntries(
    firebaseEnvKeys.map((key) => [key, typeof env[key] === 'string' ? env[key]?.trim() : '']),
  ) as Record<FirebaseEnvKey, string>;
  const missingKeys = firebaseEnvKeys.filter((key) => !values[key]);

  if (missingKeys.length > 0) {
    return {
      configured: false,
      config: null,
      missingKeys,
    };
  }

  return {
    configured: true,
    missingKeys: [],
    config: {
      apiKey: values.VITE_FIREBASE_API_KEY,
      authDomain: values.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: values.VITE_FIREBASE_PROJECT_ID,
      storageBucket: values.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: values.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: values.VITE_FIREBASE_APP_ID,
    },
  };
}

function warnIfFirebaseIsMissing(status: FirebaseConfigStatus) {
  if (status.configured || !import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  console.warn(
    `[Firebase] Missing Vite environment values: ${status.missingKeys.join(
      ', ',
    )}. Firestore/Auth features are disabled, but the app can continue locally.`,
  );
}

export const firebaseConfigStatus = createFirebaseConfigFromEnv(import.meta.env as FirebaseEnv);

let initializedApp: FirebaseApp | null = null;
let initializedFirestore: Firestore | null = null;
let initializedAuth: Auth | null = null;

if (firebaseConfigStatus.configured) {
  try {
    initializedApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfigStatus.config);
    initializedFirestore = getFirestore(initializedApp);
    initializedAuth = getAuth(initializedApp);
  } catch (error) {
    initializedApp = null;
    initializedFirestore = null;
    initializedAuth = null;

    if (import.meta.env.DEV && typeof window !== 'undefined') {
      console.warn('[Firebase] Firebase initialization failed. Firestore/Auth features are disabled.', error);
    }
  }
} else {
  warnIfFirebaseIsMissing(firebaseConfigStatus);
}

export const firebaseApp = initializedApp;
export const firestore = initializedFirestore;
export const auth = initializedAuth;
export const isFirebaseConfigured = Boolean(firebaseApp && firestore && auth);
