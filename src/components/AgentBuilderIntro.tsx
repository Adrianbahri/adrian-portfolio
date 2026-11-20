'use client';

import { useEffect, useRef, useState } from 'react';

interface AgentSpec {
  id: string;
  name: string;
  color: string;
  textColor: string;
  enterFrom: 'left' | 'right';
  slot: string;
  status: string;
  enterAtMs: number;
  snapAtMs: number;
}

interface CursorState {
  x: number;
  y: number;
  visible: boolean;
  done: boolean;
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
    enterFrom: 'left',
    slot: 'hero',
    status: 'framing hero',
    enterAtMs: 120,
    snapAtMs: 920,
  },
  {
    id: 'ui',
    name: 'UI Agent',
    color: '#38bdf8',
    textColor: '#0b1116',
    enterFrom: 'right',
    slot: 'top-tiles',
    status: 'snapping grid',
    enterAtMs: 1250,
    snapAtMs: 2050,
  },
  {
    id: 'content',
    name: 'Content Agent',
    color: '#34d399',
    textColor: '#081711',
    enterFrom: 'left',
    slot: 'writing',
    status: 'hydrating blog',
    enterAtMs: 2350,
    snapAtMs: 3150,
  },
  {
    id: 'systems',
    name: 'Systems Agent',
    color: '#fbbf24',
    textColor: '#1a1304',
    enterFrom: 'right',
    slot: 'bottom-tiles',
    status: 'wiring stack',
    enterAtMs: 3450,
    snapAtMs: 4250,
  },
];

const SESSION_KEY = 'dri4n-agent-intro-v2';

export default function AgentBuilderIntro({
  active,
}: {
  active: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [phase, setPhase] = useState<'idle' | 'running' | 'fading' | 'done'>('idle');
  const [cursorCoords, setCursorCoords] = useState<Record<string, CursorState>>({});
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

    // Mark all target slots as unbuilt initially so agents visibly snap them into place one by one
    const slotEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-agent-slot]')
    );
    slotEls.forEach((el) => {
      el.setAttribute('data-agent-built', 'false');
    });

    setPhase('running');

    const timers: number[] = [];

    // Measure a slot's coordinates relative to the scrollable .dev-shell overlay
    // so cursors & bounding boxes scroll 1:1 with the real page content.
    const measureSlotRelative = (
      slotName: string
    ): { left: number; top: number; width: number; height: number } | null => {
      const el = document.querySelector<HTMLElement>(
        `[data-agent-slot="${slotName}"]`
      );
      if (!el) return null;
      const elRect = el.getBoundingClientRect();
      const overlayRect = overlayRef.current?.getBoundingClientRect();
      if (overlayRect) {
        return {
          left: elRect.left - overlayRect.left,
          top: elRect.top - overlayRect.top,
          width: elRect.width,
          height: elRect.height,
        };
      }
      return {
        left: elRect.left + window.scrollX,
        top: elRect.top + window.scrollY,
        width: elRect.width,
        height: elRect.height,
      };
    };

    // Schedule each agent sequentially: enter -> glide -> select & snap -> clear box -> fade out
    AGENTS.forEach((agent) => {
      // 1) Spawn agent near the side of its own target slot
      const enterTimer = window.setTimeout(() => {
        const rect = measureSlotRelative(agent.slot);
        if (!rect) return;
        const vw = window.innerWidth || 1200;
        const spawnX =
          agent.enterFrom === 'left'
            ? Math.max(16, rect.left - 130)
            : Math.min(vw - 150, rect.left + rect.width + 65);
        const spawnY = Math.max(16, rect.top - 24);

        setCursorCoords((prev) => ({
          ...prev,
          [agent.id]: { x: spawnX, y: spawnY, visible: true, done: false },
        }));
      }, agent.enterAtMs);
      timers.push(enterTimer);

      // 2) Smoothly glide into the target UI block
      const glideTimer = window.setTimeout(() => {
        const rect = measureSlotRelative(agent.slot);
        if (!rect) return;
        const targetX = rect.left + Math.min(rect.width * 0.34, 170);
        const targetY = rect.top + Math.min(rect.height * 0.34, 84);

        setCursorCoords((prev) => ({
          ...prev,
          [agent.id]: { x: targetX, y: targetY, visible: true, done: false },
        }));
      }, agent.enterAtMs + 110);
      timers.push(glideTimer);

      // 3) Arrive, flash Figma bounding box + live dimensions, and snap the UI block into place
      const snapTimer = window.setTimeout(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-agent-slot="${agent.slot}"]`
        );
        if (el) {
          el.setAttribute('data-agent-built', 'true');
          const rect = measureSlotRelative(agent.slot);
          if (rect) {
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
            // Gentle nudge of cursor to the opposite corner handle after snap
            setCursorCoords((prev) => ({
              ...prev,
              [agent.id]: {
                x: rect.left + rect.width - 36,
                y: rect.top + Math.min(rect.height * 0.56, 118),
                visible: true,
                done: true,
              },
            }));
          }
        }
      }, agent.snapAtMs);
      timers.push(snapTimer);

      // 4) Clear Figma selection outline cleanly
      const clearBoxTimer = window.setTimeout(() => {
        setActiveBoxes((prev) => {
          const next = { ...prev };
          delete next[agent.id];
          return next;
        });
      }, agent.snapAtMs + 660);
      timers.push(clearBoxTimer);

      // 5) Fade out this agent after completing its turn
      const exitTimer = window.setTimeout(() => {
        setCursorCoords((prev) => {
          const cur = prev[agent.id];
          if (!cur) return prev;
          return {
            ...prev,
            [agent.id]: { ...cur, visible: false },
          };
        });
      }, agent.snapAtMs + 980);
      timers.push(exitTimer);
    });

    // Ensure every slot is built & smoothly fade out overlay
    const fadeTimer = window.setTimeout(() => {
      slotEls.forEach((el) => el.setAttribute('data-agent-built', 'true'));
      setActiveBoxes({});
      setPhase('fading');
    }, 5300);
    timers.push(fadeTimer);

    const doneTimer = window.setTimeout(() => {
      root.removeAttribute('data-agent-building');
      slotEls.forEach((el) => el.removeAttribute('data-agent-built'));
      setPhase('done');
    }, 5780);
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
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[9990] overflow-x-clip transition-opacity duration-500 ease-out"
      style={{ opacity: phase === 'fading' ? 0 : 1 }}
    >
      {/* Active Figma-Style Selection Bounding Boxes + Corner Handles + Dimension Pill */}
      {Object.entries(activeBoxes).map(([id, box]) => (
        <div
          key={id}
          className="absolute rounded-[14px] transition-all duration-300 ease-out"
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

      {/* 4 Collaborative Multiplayer AI Agent Cursors (Document-Anchored) */}
      {AGENTS.map((agent) => {
        const pos = cursorCoords[agent.id];
        if (!pos) return null;
        return (
          <div
            key={agent.id}
            className="absolute left-0 top-0 will-change-transform"
            style={{
              opacity: pos.visible ? 1 : 0,
              transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
              transition:
                'transform 720ms cubic-bezier(0.22, 1, 0.36, 1), opacity 360ms ease',
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
