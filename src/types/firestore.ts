import type { FieldValue, Timestamp } from 'firebase/firestore';
import type { ChoiceKey } from './career';

export type FirestoreTimestampValue = Date | FieldValue | Timestamp | null;

export type TestResultAnswer = {
  questionId: number | string;
  choice: ChoiceKey | string;
};

export type TestResultDraft = {
  participantName: string | null;
  centerName: string | null;
  centerKey: string | null;
  centerSource: 'url' | 'manual' | 'none';
  startedAt: Date | Timestamp;
  completedAt: Date | Timestamp;
  answers: TestResultAnswer[];
  scores: Record<string, number>;
  topCareer: string | Record<string, unknown>;
  recommendedCareers: Array<string | Record<string, unknown>>;
  resultSummary: string;
};

export type TestResultDocument = TestResultDraft & {
  createdAt: FirestoreTimestampValue;
  schemaVersion: 1;
};

export type StoredTestResultRecord = Omit<TestResultDocument, 'createdAt' | 'startedAt' | 'completedAt'> & {
  id: string;
  startedAt: Date | Timestamp;
  completedAt: Date | Timestamp;
  createdAt: Date | Timestamp | null;
};

export type AdminRole = 'admin' | 'owner';

export type AdminDocument = {
  email: string;
  role: AdminRole;
  createdAt: FirestoreTimestampValue;
};

export type AdminProfile = AdminDocument & {
  uid: string;
};
