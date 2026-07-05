import { doc, getDoc, type Firestore } from 'firebase/firestore';
import type { Auth, User } from 'firebase/auth';
import { auth } from './firebaseAuth';
import { firestore } from './firebaseFirestore';
import type { AdminDocument, AdminProfile } from '../types/firestore';

export type AdminProfileResult =
  | {
      ok: true;
      status: 'admin';
      admin: AdminProfile;
    }
  | {
      ok: false;
      status: 'firebase-not-configured' | 'unauthenticated';
    }
  | {
      ok: false;
      status: 'admin-not-found';
      uid: string;
    }
  | {
      ok: false;
      status: 'lookup-failed';
      uid: string;
      error: unknown;
    };

export type AdminLookupDependencies = {
  db?: Firestore | null;
  getAdminDocument?: (uid: string) => Promise<AdminProfile | null>;
};

export type CurrentAdminDependencies = AdminLookupDependencies & {
  auth?: Auth | null;
  user?: User | null;
};

function createFirestoreAdminReader(db: Firestore): (uid: string) => Promise<AdminProfile | null> {
  return async (uid) => {
    const snapshot = await getDoc(doc(db, 'admins', uid));

    if (!snapshot.exists()) {
      return null;
    }

    return {
      uid,
      ...(snapshot.data() as AdminDocument),
    };
  };
}

export async function getAdminProfile(
  uid: string | null | undefined,
  dependencies: AdminLookupDependencies = {},
): Promise<AdminProfileResult> {
  if (!uid) {
    return { ok: false, status: 'unauthenticated' };
  }

  const db = dependencies.db === undefined ? firestore : dependencies.db;

  if (!db) {
    return { ok: false, status: 'firebase-not-configured' };
  }

  const getAdminDocument = dependencies.getAdminDocument ?? createFirestoreAdminReader(db);

  try {
    const admin = await getAdminDocument(uid);

    if (!admin) {
      return { ok: false, status: 'admin-not-found', uid };
    }

    return { ok: true, status: 'admin', admin };
  } catch (error) {
    return { ok: false, status: 'lookup-failed', uid, error };
  }
}

export async function getCurrentAdminProfile(
  dependencies: CurrentAdminDependencies = {},
): Promise<AdminProfileResult> {
  const activeAuth = dependencies.auth === undefined ? auth : dependencies.auth;
  const user = dependencies.user === undefined ? activeAuth?.currentUser : dependencies.user;

  return getAdminProfile(user?.uid, dependencies);
}

export function isOwnerAdmin(admin: Pick<AdminProfile, 'role'>) {
  return admin.role === 'owner';
}
