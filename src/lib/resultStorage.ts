import { addDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';
import { createCenterKey, normalizeCenterName } from './centerContext';
import { firestore } from './firebaseFirestore';
import type { TestResultDocument, TestResultDraft } from '../types/firestore';

export type SaveTestResultResult =
  | {
      ok: true;
      resultId: string;
    }
  | {
      ok: false;
      reason: 'firebase-not-configured';
    }
  | {
      ok: false;
      reason: 'write-failed';
      error: unknown;
    };

export type AddTestResultDocument = (data: TestResultDocument) => Promise<{ id: string }>;

export type ResultStorageDependencies = {
  db?: Firestore | null;
  addTestResult?: AddTestResultDocument;
  getServerTimestamp?: () => TestResultDocument['createdAt'];
};

function emptyStringToNull(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function createFirestoreTestResultAdder(db: Firestore): AddTestResultDocument {
  return async (data) => {
    const documentReference = await addDoc(collection(db, 'testResults'), data);
    return { id: documentReference.id };
  };
}

export async function saveTestResult(
  draft: TestResultDraft,
  dependencies: ResultStorageDependencies = {},
): Promise<SaveTestResultResult> {
  const db = dependencies.db === undefined ? firestore : dependencies.db;

  if (!db) {
    return { ok: false, reason: 'firebase-not-configured' };
  }

  const addTestResult = dependencies.addTestResult ?? createFirestoreTestResultAdder(db);
  const getServerTimestamp = dependencies.getServerTimestamp ?? serverTimestamp;
  const document: TestResultDocument = {
    ...draft,
    participantName: emptyStringToNull(draft.participantName),
    centerName: normalizeCenterName(draft.centerName),
    centerKey: createCenterKey(draft.centerKey ?? draft.centerName),
    centerSource: draft.centerName ? draft.centerSource : 'none',
    createdAt: getServerTimestamp(),
    schemaVersion: 1,
  };

  try {
    const created = await addTestResult(document);
    return { ok: true, resultId: created.id };
  } catch (error) {
    return { ok: false, reason: 'write-failed', error };
  }
}
