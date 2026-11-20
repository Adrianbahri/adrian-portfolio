'use client';

import { useEffect, useState } from 'react';

interface AgentSpec {
  id: string;
  name: string;
  color: string;
  textColor: string;
  startX: number;
  startY: number;
  slot: string;
  status: string;
  revealAtMs: number;
}

interface BoxRect {
  left: number;
  top: number;
  width: number;
  height: number;
  color: string;
  label: string;
}

const AGENTS: AgentSpec[] = [
  {
    id: 'layout',
    name: 'Layout Agent',
    color: '#ff5a3d',
    textColor: '#ffffff',
    startX: 12,
    startY: 14,
    slot: 'hero',
    status: 'framing hero',
    revealAtMs: 360,
  },
  {
    id: 'ui',
    name: 'UI Agent',
    color: '#38bdf8',
    textColor: '#0b1116',
    startX: 86,
    startY: 20,
    slot: 'top-tiles',
    status: 'snapping grid',
    revealAtMs: 760,
  },
  {
    id: 'content',
    name: 'Content Agent',
    color: '#34d399',
    textColor: '#081711',
    startX: 14,
    startY: 78,
    slot: 'writing',
    status: 'hydrating blog',
    revealAtMs: 1120,
  },
  {
    id: 'systems',
    name: 'Systems Agent',
    color: '#fbbf24',
    textColor: '#1a1304',
    startX: 85,
    startY: 82,
    slot: 'bottom-tiles',
    status: 'wiring stack',
    revealAtMs: 1460,
  },
];

const SESSION_KEY = 'dri4n-agent-intro-v1';

export default function AgentBuilderIntro({
  active,
}: {
  active: boolean;
}) {
  const [phase, setPhase] = useState<'idle' | 'running' | 'fading' | 'done'>('idle');
  const [cursorCoords, setCursorCoords] = useState<
    Record<string, { x: number; y: number; done: boolean }>
  >({});
  const [activeBoxes, setActiveBoxes] = useState<Record<string, BoxRect>>({});

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) {
      setPhase('done');
      return;
    }

    try {
      if (sessionStorage.getItem(SESSION_KEY) === '1') {
        setPhase('done');
        return;
      }
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // ignore storage restrictions
    }

    const root = document.documentElement;
    root.setAttribute('data-agent-building', 'true');

    // Mark all target slots as unbuilt initially so agents visibly snap them into place
    const slotEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-agent-slot]')
    );
    slotEls.forEach((el) => {
      el.setAttribute('data-agent-built', 'false');
    });

    const vw = window.innerWidth || 1200;
    const vh = window.innerHeight || 800;

    // Initial spawn positions near viewport corners
    const initial: Record<string, { x: number; y: number; done: boolean }> = {};
    for (const a of AGENTS) {
      initial[a.id] = {
        x: (a.startX / 100) * vw,
        y: (a.startY / 100) * vh,
        done: false,
      };
    }
    setCursorCoords(initial);
    setPhase('running');

    const timers: number[] = [];

    // Helper to measure a slot's live viewport rect
    const measureSlot = (slotName: string): DOMRect | null => {
      const el = document.querySelector<HTMLElement>(
        `[data-agent-slot="${slotName}"]`
      );
      if (!el) return null;
      return el.getBoundingClientRect();
    };

    // Schedule each agent to glide to its target UI block, show Figma selection box, and snap it in
    AGENTS.forEach((agent) => {
      // 1) Glide toward slot
      const glideTimer = window.setTimeout(() => {
        const rect = measureSlot(agent.slot);
        if (!rect) return;
        const targetX = rect.left + Math.min(rect.width * 0.38, 180);
        const targetY = rect.top + Math.min(rect.height * 0.36, 90);

        setCursorCoords((prev) => ({
          ...prev,
          [agent.id]: { x: targetX, y: targetY, done: false },
        }));
      }, Math.max(40, agent.revealAtMs - 280));
      timers.push(glideTimer);

      // 2) Arrive, flash Figma bounding box + dimensions, and snap the real UI block into place!
      const snapTimer = window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-agent-slot="${agent.slot}"]`
        );
        if (el) {
          el.setAttribute('data-agent-built', 'true');
          const rect = el.getBoundingClientRect();
          setActiveBoxes((prev) => ({
            ...prev,
            [agent.id]: {
              left: rect.left,
              top: rect.top,
              width: rect.width,
              height: rect.height,
              color: agent.color,
              label: `${Math.round(rect.width)} × ${Math.round(rect.height)}`,
            },
          }));
          // Subtle second micro-nudge of cursor to the corner handle
          setCursorCoords((prev) => ({
            ...prev,
            [agent.id]: {
              x: rect.left + rect.width - 28,
              y: rect.top + Math.min(rect.height * 0.55, 110),
              done: true,
            },
          }));
        }
      }, agent.revealAtMs);
      timers.push(snapTimer);

      // 3) Clear selection outline shortly after snap
      const clearBoxTimer = window.setTimeout(() => {
        setActiveBoxes((prev) => {
          const next = { ...prev };
          delete next[agent.id];
          return next;
        });
      }, agent.revealAtMs + 420);
      timers.push(clearBoxTimer);
    });

    // Ensure every slot is built & smoothly fade out all agent cursors
    const fadeTimer = window.setTimeout(() => {
      slotEls.forEach((el) => el.setAttribute('data-agent-built', 'true'));
      setActiveBoxes({});
      setPhase('fading');
    }, 2050);
    timers.push(fadeTimer);

    const doneTimer = window.setTimeout(() => {
      root.removeAttribute('data-agent-building');
      slotEls.forEach((el) => el.removeAttribute('data-agent-built'));
      setPhase('done');
    }, 2480);
    timers.push(doneTimer);

    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      root.removeAttribute('data-agent-building');
      slotEls.forEach((el) => el.removeAttribute('data-agent-built'));
    };
  }, [active]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[9990] overflow-hidden transition-opacity duration-400 ease-out"
      style={{ opacity: phase === 'fading' ? 0 : 1 }}
    >
      {/* Active Figma-Style Selection Bounding Boxes + Corner Handles + Dimension Pill */}
      {Object.entries(activeBoxes).map(([id, box]) => (
        <div
          key={id}
          className="fixed rounded-[14px] transition-all duration-200 ease-out"
          style={{
            left: `${box.left - 3}px`,
            top: `${box.top - 3}px`,
            width: `${box.width + 6}px`,
            height: `${box.height + 6}px`,
            border: `1.5px solid ${box.color}`,
            boxShadow: `0 0 0 1px rgba(0,0,0,0.08)`,
          }}
        >
          {/* 4 Corner Resize Handles */}
          <span
            className="absolute -left-[4px] -top-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${box.color}` }}
          />
          <span
            className="absolute -right-[4px] -top-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${box.color}` }}
          />
          <span
            className="absolute -bottom-[4px] -left-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${box.color}` }}
          />
          <span
            className="absolute -bottom-[4px] -right-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${box.color}` }}
          />
          {/* Live Dimension Tag */}
          <span
            className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 rounded-[4px] px-1.5 py-0.5 font-mono text-[9.5px] font-medium whitespace-nowrap shadow-sm"
            style={{
              backgroundColor: box.color,
              color: '#0e0e0e',
            }}
          >
            {box.label}
          </span>
        </div>
      ))}

      {/* 4 Collaborative Multiplayer AI Agent Cursors */}
      {AGENTS.map((agent) => {
        const pos = cursorCoords[agent.id];
        if (!pos) return null;
        return (
          <div
            key={agent.id}
            className="fixed left-0 top-0 will-change-transform"
            style={{
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              transition:
                'transform 440ms cubic-bezier(0.22, 1, 0.36, 1), opacity 300ms ease',
            }}
          >
            {/* Sharp Collaborative Cursor Arrow SVG */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.45)]"
            >
              <path
                d="M2.2 1.6L15.4 7.8L9.5 9.6L7.4 15.6L2.2 1.6Z"
                fill={agent.color}
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>

            {/* Agent Name + Live Build Status Pill */}
            <div
              className="ml-3.5 -mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.03em] shadow-[0_4px_14px_rgba(0,0,0,0.32)] whitespace-nowrap"
              style={{
                backgroundColor: agent.color,
                color: agent.textColor,
              }}
            >
              <span>{agent.name}</span>
              <span className="opacity-75">
                {pos.done ? '✓' : `· ${agent.status}`}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
