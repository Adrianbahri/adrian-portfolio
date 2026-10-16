'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { portfolioModeForPath, portfolioPath, type ProjectMode } from '@/lib/portfolio';

export type { ProjectMode } from '@/lib/portfolio';

interface ProjectModeContextType {
  mode: ProjectMode;
  setMode: (mode: ProjectMode) => void;
  toggleMode: () => void;
  mounted: boolean;
}

const ProjectModeContext = createContext<ProjectModeContextType | undefined>(undefined);

export function ProjectModeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setModeState] = useState<ProjectMode>('developer');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const queryMode = urlParams.get('mode')?.toLowerCase();
      if (queryMode === 'creative' || queryMode === 'developer') {
        setModeState(queryMode as ProjectMode);
      } else {
        let saved: string | null = null;
        try { saved = localStorage.getItem('portfolio-project-mode'); } catch { /* Storage is optional. */ }
        if (saved === 'creative' || saved === 'developer') {
          setModeState(saved);
        }
      }
    }
  }, []);

  // A shareable portfolio URL always wins over a previous browser preference.
  const routeMode = portfolioModeForPath(pathname);
  const activeMode = routeMode || mode;

  useEffect(() => {
    if (!routeMode) return;
    setModeState(routeMode);
    try { localStorage.setItem('portfolio-project-mode', routeMode); } catch { /* Storage is optional. */ }
  }, [routeMode]);

  const setMode = (newMode: ProjectMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('portfolio-project-mode', newMode); } catch { /* Storage is optional. */ }
      window.dispatchEvent(new CustomEvent('project-mode-change', { detail: newMode }));
    }
    if (routeMode) router.push(portfolioPath(newMode));
  };

  const toggleMode = () => {
    setMode(activeMode === 'developer' ? 'creative' : 'developer');
  };

  return (
    <ProjectModeContext.Provider value={{ mode: activeMode, setMode, toggleMode, mounted }}>
      {children}
    </ProjectModeContext.Provider>
  );
}

export function useProjectMode() {
  const context = useContext(ProjectModeContext);
  if (!context) {
    return {
      mode: 'developer' as ProjectMode,
      setMode: () => {},
      toggleMode: () => {},
      mounted: false,
    };
  }
  return context;
}
