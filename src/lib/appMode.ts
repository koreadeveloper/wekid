export type AppMode = 'career' | 'business-card' | 'admin';

export function readAppModeFromSearch(search: string): AppMode {
  const mode = new URLSearchParams(search).get('mode');

  switch (mode) {
    case 'business-card':
      return 'business-card';
    case 'admin':
      return 'admin';
    default:
      return 'career';
  }
}

export function readCurrentAppMode(): AppMode {
  if (typeof window === 'undefined') {
    return 'career';
  }

  return readAppModeFromSearch(window.location.search);
}

export function writeAppModeToHistory(nextMode: AppMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  const url = new URL(window.location.href);
  if (nextMode === 'career') {
    url.searchParams.delete('mode');
  } else {
    url.searchParams.set('mode', nextMode);
  }

  window.history.pushState(null, '', `${url.pathname}${url.search}${url.hash}`);
}
