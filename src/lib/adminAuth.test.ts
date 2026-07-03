import { describe, expect, it, vi } from 'vitest';
import { getAdminProfile, isOwnerAdmin } from './adminAuth';

describe('getAdminProfile', () => {
  it('skips admin lookup when Firebase is not configured', async () => {
    const getAdminDocument = vi.fn();

    const result = await getAdminProfile('uid-1', { db: null, getAdminDocument });

    expect(result).toEqual({ ok: false, status: 'firebase-not-configured' });
    expect(getAdminDocument).not.toHaveBeenCalled();
  });

  it('returns admin-not-found when there is no admins document', async () => {
    const result = await getAdminProfile('uid-1', {
      db: {} as never,
      getAdminDocument: vi.fn().mockResolvedValue(null),
    });

    expect(result).toEqual({ ok: false, status: 'admin-not-found', uid: 'uid-1' });
  });
});

describe('isOwnerAdmin', () => {
  it('accepts only owner role for the MVP dashboard', () => {
    expect(isOwnerAdmin({ role: 'owner' })).toBe(true);
    expect(isOwnerAdmin({ role: 'admin' })).toBe(false);
  });
});
