import { describe, expect, it } from 'vitest';
import { createFirebaseConfigFromEnv } from './firebase';

const completeEnv = {
  VITE_FIREBASE_API_KEY: 'api-key',
  VITE_FIREBASE_AUTH_DOMAIN: 'wekid.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'wekid',
  VITE_FIREBASE_STORAGE_BUCKET: 'wekid.appspot.com',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '123456789',
  VITE_FIREBASE_APP_ID: '1:123456789:web:abcdef',
};

describe('createFirebaseConfigFromEnv', () => {
  it('reports missing Vite Firebase env values without throwing', () => {
    const result = createFirebaseConfigFromEnv({});

    expect(result.configured).toBe(false);
    expect(result.config).toBeNull();
    expect(result.missingKeys).toEqual([
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID',
    ]);
  });

  it('builds a Firebase config when every required value is present', () => {
    const result = createFirebaseConfigFromEnv(completeEnv);

    expect(result).toEqual({
      configured: true,
      missingKeys: [],
      config: {
        apiKey: 'api-key',
        authDomain: 'wekid.firebaseapp.com',
        projectId: 'wekid',
        storageBucket: 'wekid.appspot.com',
        messagingSenderId: '123456789',
        appId: '1:123456789:web:abcdef',
      },
    });
  });
});
