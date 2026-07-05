import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

function getFirebaseManualChunk(id: string): string | undefined {
  const normalizedId = id.replaceAll('\\', '/');

  if (!normalizedId.includes('/node_modules/@firebase/') && !normalizedId.includes('/node_modules/firebase/')) {
    return undefined;
  }

  if (normalizedId.includes('/@firebase/auth') || normalizedId.includes('/firebase/auth')) {
    return 'firebase-auth';
  }

  if (normalizedId.includes('/@firebase/firestore') || normalizedId.includes('/firebase/firestore')) {
    return 'firebase-firestore';
  }

  return 'firebase-core';
}

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: getFirebaseManualChunk,
      },
    },
  },
});
