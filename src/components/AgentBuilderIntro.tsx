'use client';

import { useEffect, useRef, useState } from 'react';

interface AgentSpec {
  id: string;
  name: string;
  color: string;
  textColor: string;
  tint: string;
  enterFrom: 'left' | 'right';
  slot: string;
  status: string;
  startMs: number;
}

const GLIDE_MS = 240;
const DRAG_MS = 300;
const HOLD_BOX_MS = 180;
const FADE_OUT_MS = 240;

const AGENTS: AgentSpec[] = [
  {
    id: 'layout',
    name: 'Layout Agent',
    color: '#ff5a3d',
    textColor: '#ffffff',
    tint: 'rgba(255, 90, 61, 0.07)',
    enterFrom: 'left',
    slot: 'hero',
    status: 'framing hero',
    startMs: 40,
  },
  {
    id: 'ui',
    name: 'UI Agent',
    color: '#38bdf8',
    textColor: '#0b1116',
    tint: 'rgba(56, 189, 248, 0.07)',
    enterFrom: 'right',
    slot: 'top-tiles',
    status: 'drawing grid',
    startMs: 460,
  },
  {
    id: 'content',
    name: 'Content Agent',
    color: '#34d399',
    textColor: '#081711',
    tint: 'rgba(52, 211, 153, 0.07)',
    enterFrom: 'left',
    slot: 'writing',
    status: 'placing writing',
    startMs: 880,
  },
  {
    id: 'systems',
    name: 'Systems Agent',
    color: '#fbbf24',
    textColor: '#1a1304',
    tint: 'rgba(251, 191, 36, 0.07)',
    enterFrom: 'right',
    slot: 'bottom-tiles',
    status: 'wiring tiles',
    startMs: 1300,
  },
];

let hasPlayedThisPageLoad = false;

function easeOutCubic(t: number): number {
  const u = 1 - Math.min(1, Math.max(0, t));
  return 1 - u * u * u;
}

function easeInOutCubic(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/**
 * Exact transform-free layout rect relative to .dev-shell (overlay's offsetParent).
 * Immune to scroll position and CSS scale/translate transforms so boxes align 0.0px.
 */
function getExactLayoutRect(el: HTMLElement, stopAt: Element | null) {
  let left = 0;
  let top = 0;
  let cur: HTMLElement | null = el;
  while (cur && cur !== stopAt && cur !== document.body) {
    left += cur.offsetLeft;
    top += cur.offsetTop;
    cur = cur.offsetParent as HTMLElement | null;
  }
  return {
    left,
    top,
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
}

export default function AgentBuilderIntro({
  active,
}: {
  active: boolean;
}) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const cursorRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const statusRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const boxRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const dimRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    // Do not start or consume the intro while a sub-view hash (#resources, #work, etc.) is active
    const currentHash = window.location.hash.replace('#', '');
    if (
      ['work', 'experience', 'services', 'writing', 'resources'].includes(
        currentHash
      )
    ) {
      return;
    }

    if (hasPlayedThisPageLoad) return;
    hasPlayedThisPageLoad = true;

    const root = document.documentElement;
    root.setAttribute('data-agent-building', 'true');

    const slotEls = Array.from(
      document.querySelectorAll<HTMLElement>('[data-agent-slot]')
    );
    slotEls.forEach((el) => el.setAttribute('data-agent-built', 'false'));

    setMounted(true);

    let rafId = 0;
    let startTime = 0;
    const snapped = new Set<string>();

    // Wait 1 animation frame so refs are attached before starting the rAF loop
    const initRaf = requestAnimationFrame(() => {
      const overlayEl = overlayRef.current;
      const offsetParent = overlayEl?.offsetParent ?? null;
      const containerWidth = overlayEl?.clientWidth || window.innerWidth || 1200;

      // Pre-measure exact transform-free layout rects for each agent's slot
      const plans = AGENTS.map((agent) => {
        const el = document.querySelector<HTMLElement>(
          `[data-agent-slot="${agent.slot}"]`
        );
        if (!el) return null;
        const rect = getExactLayoutRect(el, offsetParent);
        const spawnX =
          agent.enterFrom === 'left'
            ? Math.max(12, rect.left - 110)
            : Math.min(containerWidth - 130, rect.left + rect.width + 80);
        const spawnY = Math.max(12, rect.top - 36);
        // Gentle Bezier control point so cursor moves along a natural human arc
        const ctrlX = (spawnX + rect.left) * 0.5;
        const ctrlY = Math.min(spawnY, rect.top) - 28;
        return { agent, el, rect, spawnX, spawnY, ctrlX, ctrlY };
      }).filter((p): p is NonNullable<typeof p> => p !== null);

      // Set each selection box's final size ONCE upfront so the rAF loop ONLY animates GPU transform/opacity (zero layout thrashing!)
      for (const plan of plans) {
        const boxEl = boxRefs.current[plan.agent.id];
        if (boxEl) {
          boxEl.style.width = `${plan.rect.width + 4}px`;
          boxEl.style.height = `${plan.rect.height + 4}px`;
          boxEl.style.transformOrigin = '0 0';
        }
      }

      const totalEndMs =
        Math.max(...AGENTS.map((a) => a.startMs)) +
        GLIDE_MS +
        DRAG_MS +
        HOLD_BOX_MS +
        FADE_OUT_MS +
        80;

      const tick = (now: number) => {
        if (!startTime) startTime = now;
        const elapsed = now - startTime;

        for (const plan of plans) {
          const { agent, el, rect, spawnX, spawnY, ctrlX, ctrlY } = plan;
          const cursorEl = cursorRefs.current[agent.id];
          const statusEl = statusRefs.current[agent.id];
          const boxEl = boxRefs.current[agent.id];
          const dimEl = dimRefs.current[agent.id];
          if (!cursorEl || !boxEl) continue;

          const local = elapsed - agent.startMs;

          if (local < 0) {
            cursorEl.style.opacity = '0';
            boxEl.style.opacity = '0';
            continue;
          }

          // Phase 1: Glide along natural curved arc to top-left corner of the frame
          if (local < GLIDE_MS) {
            const t = easeOutCubic(local / GLIDE_MS);
            const inv = 1 - t;
            const x = inv * inv * spawnX + 2 * inv * t * ctrlX + t * t * rect.left;
            const y = inv * inv * spawnY + 2 * inv * t * ctrlY + t * t * rect.top;
            cursorEl.style.opacity = String(Math.min(1, local / 100));
            cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            boxEl.style.opacity = '0';
            continue;
          }

          // Phase 2: Drag diagonally using pure GPU transform scale (zero width/height layout reflow!)
          if (local < GLIDE_MS + DRAG_MS) {
            const t = Math.max(0.04, easeInOutCubic((local - GLIDE_MS) / DRAG_MS));
            const curW = rect.width * t;
            const curH = rect.height * t;
            const curX = rect.left + curW;
            const curY = rect.top + curH;

            cursorEl.style.opacity = '1';
            cursorEl.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;

            boxEl.style.opacity = '1';
            boxEl.style.transform = `translate3d(${rect.left - 2}px, ${rect.top - 2}px, 0) scale(${t}, ${t})`;

            if (dimEl) {
              dimEl.textContent = `${Math.round(curW)} × ${Math.round(curH)}`;
            }
            continue;
          }

          // Phase 3: Snap real UI block into the exact drawn frame!
          if (!snapped.has(agent.id)) {
            snapped.add(agent.id);
            el.setAttribute('data-agent-built', 'true');
            if (statusEl) statusEl.textContent = '✓';
            if (dimEl) {
              dimEl.textContent = `${Math.round(rect.width)} × ${Math.round(rect.height)}`;
            }
          }

          const postDrag = local - (GLIDE_MS + DRAG_MS);
          const settleT = easeOutCubic(Math.min(1, postDrag / (HOLD_BOX_MS + FADE_OUT_MS)));
          const driftX = agent.enterFrom === 'left' ? 18 : -18;
          const driftY = 10;

          // Keep box locked at scale(1, 1) while fading out cleanly on GPU
          boxEl.style.transform = `translate3d(${rect.left - 2}px, ${rect.top - 2}px, 0) scale(1, 1)`;

          if (postDrag < HOLD_BOX_MS) {
            boxEl.style.opacity = '1';
            cursorEl.style.opacity = '1';
          } else {
            const fadeT = Math.min(1, (postDrag - HOLD_BOX_MS) / FADE_OUT_MS);
            const op = String(1 - fadeT);
            boxEl.style.opacity = op;
            cursorEl.style.opacity = op;
          }

          cursorEl.style.transform = `translate3d(${rect.left + rect.width + driftX * settleT}px, ${rect.top + rect.height + driftY * settleT}px, 0)`;
        }

        if (elapsed < totalEndMs) {
          rafId = requestAnimationFrame(tick);
        } else {
          root.removeAttribute('data-agent-building');
          slotEls.forEach((el) => el.removeAttribute('data-agent-built'));
          setMounted(false);
        }
      };

      rafId = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(rafId);
      root.removeAttribute('data-agent-building');
      slotEls.forEach((el) => el.removeAttribute('data-agent-built'));
    };
  }, [active]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[9990] overflow-x-clip"
    >
      {/* Real-Time Drag-Drawn Figma Selection Frames */}
      {AGENTS.map((agent) => (
        <div
          key={`box-${agent.id}`}
          ref={(el) => {
            boxRefs.current[agent.id] = el;
          }}
          className="absolute left-0 top-0 rounded-[12px] will-change-transform"
          style={{
            opacity: 0,
            border: `1.5px solid ${agent.color}`,
            backgroundColor: agent.tint,
          }}
        >
          {/* 4 Corner Handles */}
          <span
            className="absolute -left-[4px] -top-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${agent.color}` }}
          />
          <span
            className="absolute -right-[4px] -top-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${agent.color}` }}
          />
          <span
            className="absolute -bottom-[4px] -left-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${agent.color}` }}
          />
          <span
            className="absolute -bottom-[4px] -right-[4px] h-[7px] w-[7px] bg-white"
            style={{ border: `1.5px solid ${agent.color}` }}
          />
          {/* Live Updating Dimension Pill */}
          <span
            ref={(el) => {
              dimRefs.current[agent.id] = el;
            }}
            className="absolute -bottom-[22px] left-1/2 -translate-x-1/2 rounded-[4px] px-1.5 py-0.5 font-mono text-[9.5px] font-medium whitespace-nowrap shadow-sm"
            style={{
              backgroundColor: agent.color,
              color: '#0e0e0e',
            }}
          />
        </div>
      ))}

      {/* 4 Collaborative Multiplayer AI Agent Cursors */}
      {AGENTS.map((agent) => (
        <div
          key={`cursor-${agent.id}`}
          ref={(el) => {
            cursorRefs.current[agent.id] = el;
          }}
          className="absolute left-0 top-0 will-change-transform"
          style={{ opacity: 0 }}
        >
          <svg
            width="17"
            height="17"
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

          <div
            className="ml-3.5 -mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium tracking-[0.03em] shadow-[0_4px_14px_rgba(0,0,0,0.32)] whitespace-nowrap"
            style={{
              backgroundColor: agent.color,
              color: agent.textColor,
            }}
          >
            <span>{agent.name}</span>
            <span
              ref={(el) => {
                statusRefs.current[agent.id] = el;
              }}
              className="opacity-80"
            >
              · {agent.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
