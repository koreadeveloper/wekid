import { describe, expect, it } from 'vitest';
import { createResultSaveSession, type SaveTestResultResult } from './resultStorage';

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });

  return { promise, resolve };
}

describe('createResultSaveSession', () => {
  it('ignores a previous session completion and adopts only the current session result', async () => {
    const session = createResultSaveSession();
    const previousSave = deferred<SaveTestResultResult>();
    const currentSave = deferred<SaveTestResultResult>();
    const acceptedResultIds: string[] = [];

    const previousCompletion = session.enqueue(
      () => previousSave.promise,
      (result) => result.ok && acceptedResultIds.push(result.resultId),
    );

    session.invalidate();

    let currentSaveResultId: string | null | undefined;
    const currentCompletion = session.enqueue(
      (resultId) => {
        currentSaveResultId = resultId;
        return currentSave.promise;
      },
      (result) => result.ok && acceptedResultIds.push(result.resultId),
    );

    await Promise.resolve();

    expect(currentSaveResultId).toBeNull();
    expect(acceptedResultIds).toEqual([]);

    currentSave.resolve({ ok: true, resultId: 'current-result' });
    await currentCompletion;

    expect(acceptedResultIds).toEqual(['current-result']);

    previousSave.resolve({ ok: true, resultId: 'previous-result' });
    await previousCompletion;

    expect(acceptedResultIds).toEqual(['current-result']);

    let adoptedResultId: string | null | undefined;
    await session.enqueue(
      async (resultId) => {
        adoptedResultId = resultId;
        return { ok: true, resultId: resultId! };
      },
      () => undefined,
    );

    expect(adoptedResultId).toBe('current-result');
  });

  it('serializes rapid choices so the final dream write runs last', async () => {
    const session = createResultSaveSession();
    const automaticSave = deferred<SaveTestResultResult>();
    const firstDreamSave = deferred<SaveTestResultResult>();
    const callOrder: string[] = [];
    const acceptedResultIds: string[] = [];

    const automaticCompletion = session.enqueue(
      () => {
        callOrder.push('automatic');
        return automaticSave.promise;
      },
      (result) => result.ok && acceptedResultIds.push(result.resultId),
    );
    const firstDreamCompletion = session.enqueue(
      (resultId) => {
        callOrder.push(`first:${resultId}`);
        return firstDreamSave.promise;
      },
      (result) => result.ok && acceptedResultIds.push(result.resultId),
    );
    const finalDreamCompletion = session.enqueue(
      async (resultId) => {
        callOrder.push(`final:${resultId}`);
        return { ok: true, resultId: resultId! };
      },
      (result) => result.ok && acceptedResultIds.push(result.resultId),
    );

    automaticSave.resolve({ ok: true, resultId: 'current-result' });
    await automaticCompletion;
    await Promise.resolve();

    expect(callOrder).toEqual(['automatic', 'first:current-result']);
    expect(acceptedResultIds).toEqual([]);

    firstDreamSave.resolve({ ok: true, resultId: 'current-result' });
    await Promise.all([firstDreamCompletion, finalDreamCompletion]);

    expect(callOrder).toEqual([
      'automatic',
      'first:current-result',
      'final:current-result',
    ]);
    expect(acceptedResultIds).toEqual(['current-result']);
  });
});
