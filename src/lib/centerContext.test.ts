import { describe, expect, it } from 'vitest';
import { createCenterKey, getCenterNameFromSearch, resolveCenterContext } from './centerContext';

describe('getCenterNameFromSearch', () => {
  it('uses centerName before center from URL parameters', () => {
    expect(getCenterNameFromSearch('?center=강남 청소년센터&centerName=서초 청소년센터')).toBe('서초 청소년센터');
  });

  it('falls back to center when centerName is missing', () => {
    expect(getCenterNameFromSearch('?center=강남 청소년센터')).toBe('강남 청소년센터');
  });
});

describe('createCenterKey', () => {
  it('normalizes spacing and English case without slugging Korean names', () => {
    expect(createCenterKey('  WEKID   강남!!  청소년센터  ')).toBe('wekid 강남 청소년센터');
  });
});

describe('resolveCenterContext', () => {
  it('uses untouched URL values as url sourced center data', () => {
    expect(resolveCenterContext({ centerInput: '강남 청소년센터', initialUrlCenterName: '강남 청소년센터', isManual: false })).toEqual({
      centerName: '강남 청소년센터',
      centerKey: '강남 청소년센터',
      centerSource: 'url',
    });
  });

  it('uses edited values as manual center data', () => {
    expect(resolveCenterContext({ centerInput: '서초 청소년센터', initialUrlCenterName: '강남 청소년센터', isManual: true })).toEqual({
      centerName: '서초 청소년센터',
      centerKey: '서초 청소년센터',
      centerSource: 'manual',
    });
  });

  it('returns explicit none values when the center input is empty', () => {
    expect(resolveCenterContext({ centerInput: '   ', initialUrlCenterName: '강남 청소년센터', isManual: true })).toEqual({
      centerName: null,
      centerKey: null,
      centerSource: 'none',
    });
  });
});
