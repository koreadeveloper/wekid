import type { FieldValue, Timestamp } from 'firebase/firestore';
import type { CareerAnswer, CareerAnswerSnapshot, CareerFieldResult, DreamChoice } from './career';

export type FirestoreTimestampValue = Date | FieldValue | Timestamp | null;

export type TestResultAnswer = {
  questionId: number | string;
  choice: string;
};

type TestResultBase = {
  participantName: string | null;
  participantEmail?: string | null;
  centerName: string | null;
  centerKey: string | null;
  centerSource: 'url' | 'manual' | 'none';
  startedAt: Date | Timestamp;
  completedAt: Date | Timestamp;
  resultSummary: string;
};

export type TestResultDraftV1 = TestResultBase & {
  answers: TestResultAnswer[];
  scores: Record<string, number>;
  topCareer: string | Record<string, unknown>;
  recommendedCareers: Array<string | Record<string, unknown>>;
};

export type TestResultAnswerSnapshot = CareerAnswerSnapshot & {
  choice: CareerAnswer;
};

export type TestResultDraftV2 = TestResultBase & {
  questionnaireVersion: 2;
  answerSnapshots: TestResultAnswerSnapshot[];
  fieldResults: CareerFieldResult[];
  recommendedFieldResults: CareerFieldResult[];
  dreamChoice: DreamChoice;
};

export type TestResultDraft = TestResultDraftV1 | TestResultDraftV2;

export type TestResultV1Document = TestResultDraftV1 & {
  createdAt: FirestoreTimestampValue;
  schemaVersion: 1;
};

export type TestResultV2Document = TestResultDraftV2 & {
  createdAt: FirestoreTimestampValue;
  schemaVersion: 2;
};

export type TestResultDocument = TestResultV1Document | TestResultV2Document;

type StoredTestResultV1Record = Omit<TestResultV1Document, 'createdAt' | 'startedAt' | 'completedAt'> & {
  id: string;
  startedAt: Date | Timestamp;
  completedAt: Date | Timestamp;
  createdAt: Date | Timestamp | null;
};

type LegacyDisplayFields = {
  answers: TestResultAnswer[];
  scores: Record<string, number>;
  topCareer: string | Record<string, unknown>;
  recommendedCareers: Array<string | Record<string, unknown>>;
};

type StoredTestResultV2Record = Omit<TestResultV2Document, 'createdAt' | 'startedAt' | 'completedAt'> & LegacyDisplayFields & {
  id: string;
  startedAt: Date | Timestamp;
  completedAt: Date | Timestamp;
  createdAt: Date | Timestamp | null;
};

export type StoredTestResultRecord = StoredTestResultV1Record | StoredTestResultV2Record;

export type AdminRole = 'admin' | 'owner';

export type AdminDocument = {
  email: string;
  role: AdminRole;
  createdAt: FirestoreTimestampValue;
};

export type AdminProfile = AdminDocument & {
  uid: string;
};
