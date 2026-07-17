import { addDoc, collection, serverTimestamp, type Firestore } from 'firebase/firestore';
import { createCenterKey, normalizeCenterName } from './centerContext';
import { firestore } from './firebase';
import type {
  TestResultDocument,
  TestResultDraft,
  TestResultDraftV1,
  TestResultDraftV2,
  TestResultV1Document,
  TestResultV2Document,
} from '../types/firestore';

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

function isV2Draft(draft: TestResultDraft): draft is TestResultDraftV2 {
  return 'questionnaireVersion' in draft && draft.questionnaireVersion === 2;
}

function normalizedBase(draft: TestResultDraft, createdAt: TestResultDocument['createdAt']) {
  return {
    participantName: emptyStringToNull(draft.participantName),
    participantEmail: emptyStringToNull(draft.participantEmail ?? null),
    centerName: normalizeCenterName(draft.centerName),
    centerKey: createCenterKey(draft.centerKey ?? draft.centerName),
    centerSource: draft.centerName ? draft.centerSource : 'none' as const,
    startedAt: draft.startedAt,
    completedAt: draft.completedAt,
    resultSummary: draft.resultSummary.trim(),
    createdAt,
  };
}

function serializeV1(draft: TestResultDraftV1, createdAt: TestResultDocument['createdAt']): TestResultV1Document {
  return {
    ...normalizedBase(draft, createdAt),
    answers: draft.answers,
    scores: draft.scores,
    topCareer: draft.topCareer,
    recommendedCareers: draft.recommendedCareers,
    schemaVersion: 1,
  };
}

function serializeV2(draft: TestResultDraftV2, createdAt: TestResultDocument['createdAt']): TestResultV2Document {
  const dreamChoice = draft.dreamChoice.kind === 'undecided'
    ? draft.dreamChoice
    : { ...draft.dreamChoice, careerName: draft.dreamChoice.careerName.trim() };

  return {
    ...normalizedBase(draft, createdAt),
    questionnaireVersion: 2,
    answerSnapshots: draft.answerSnapshots,
    fieldResults: draft.fieldResults,
    recommendedFieldResults: draft.recommendedFieldResults,
    dreamChoice,
    schemaVersion: 2,
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
  const createdAt = getServerTimestamp();
  const document: TestResultDocument = isV2Draft(draft)
    ? serializeV2(draft, createdAt)
    : serializeV1(draft, createdAt);

  try {
    const created = await addTestResult(document);
    return { ok: true, resultId: created.id };
  } catch (error) {
    return { ok: false, reason: 'write-failed', error };
  }
}
