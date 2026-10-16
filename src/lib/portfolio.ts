export type ProjectMode = 'developer' | 'creative';

export function portfolioModeForPath(pathname: string): ProjectMode | null {
  if (pathname === '/dev' || pathname.startsWith('/dev/')) return 'developer';
  if (pathname === '/creative' || pathname.startsWith('/creative/')) return 'creative';
  return null;
}

export function portfolioPath(mode: ProjectMode) {
  return mode === 'creative' ? '/creative' : '/dev';
}
