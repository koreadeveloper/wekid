import { describe, expect, it, vi } from 'vitest';
import { getOptionalDevToolWarning, loadOptionalDevTools } from './optionalDevTools';

describe('getOptionalDevToolWarning', () => {
  it('includes the tool name and error message when an optional tool fails', () => {
    expect(getOptionalDevToolWarning('react-scan', new Error('missing export'))).toBe(
      'Optional dev tool "react-scan" could not be loaded: missing export',
    );
  });
});

describe('loadOptionalDevTools', () => {
  it('does not load visual dev tools by default', async () => {
    const logger = { warn: vi.fn() };
    const loadReactGrab = vi.fn().mockResolvedValue(undefined);
    const loadReactScan = vi.fn().mockResolvedValue(undefined);

    loadOptionalDevTools({ loadReactGrab, loadReactScan, logger });
    await Promise.resolve();

    expect(loadReactGrab).not.toHaveBeenCalled();
    expect(loadReactScan).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('loads React Grab when enabled', async () => {
    const logger = { warn: vi.fn() };
    const loadReactGrab = vi.fn().mockResolvedValue(undefined);
    const loadReactScan = vi.fn().mockResolvedValue(undefined);

    loadOptionalDevTools({ enableReactGrab: true, loadReactGrab, loadReactScan, logger });
    await Promise.resolve();

    expect(loadReactGrab).toHaveBeenCalledTimes(1);
    expect(loadReactScan).not.toHaveBeenCalled();
  });

  it('keeps loading other tools when an enabled optional tool rejects', async () => {
    const logger = { warn: vi.fn() };
    const loadReactGrab = vi.fn().mockResolvedValue(undefined);
    const loadReactScan = vi.fn().mockRejectedValue(new Error('missing export'));

    loadOptionalDevTools({ enableReactGrab: true, enableReactScan: true, loadReactGrab, loadReactScan, logger });
    await Promise.resolve();

    expect(loadReactGrab).toHaveBeenCalledTimes(1);
    expect(loadReactScan).toHaveBeenCalledTimes(1);
    expect(logger.warn).toHaveBeenCalledWith('Optional dev tool "react-scan" could not be loaded: missing export');
  });
});
