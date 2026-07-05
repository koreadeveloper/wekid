import type { TestResultDraft } from '../types/firestore';

export async function persistTestResult(draft: TestResultDraft) {
  const { saveTestResult } = await import('./resultStorage');
  return saveTestResult(draft);
}
