'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ProjectMode = 'developer' | 'creative';

interface ProjectModeContextType {
  mode: ProjectMode;
  setMode: (mode: ProjectMode) => void;
  toggleMode: () => void;
  mounted: boolean;
}

const ProjectModeContext = createContext<ProjectModeContextType | undefined>(undefined);

export function ProjectModeProvider({ children }: { children: React.ReactNode }) {
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
        const saved = localStorage.getItem('portfolio-project-mode') as ProjectMode;
        if (saved === 'creative' || saved === 'developer') {
          setModeState(saved);
        }
      }
    }
  }, []);

  const setMode = (newMode: ProjectMode) => {
    setModeState(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio-project-mode', newMode);
      window.dispatchEvent(new CustomEvent('project-mode-change', { detail: newMode }));
    }
  };

  const toggleMode = () => {
    setMode(mode === 'developer' ? 'creative' : 'developer');
  };

  return (
    <ProjectModeContext.Provider value={{ mode, setMode, toggleMode, mounted }}>
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
