'use client';

import { useEffect, useRef, useState } from 'react';

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/[]';

export function ScrambleKeychip({
  label,
  shortcut,
  active,
}: {
  label: string;
  shortcut: string;
  active: boolean;
}) {
  const [displayText, setDisplayText] = useState(label);

  useEffect(() => {
    if (!active) {
      setDisplayText(label);
      return;
    }

    let frame = 0;
    const totalFrames = label.length + 4;
    const interval = setInterval(() => {
      frame += 1;
      const next = label
        .split('')
        .map((ch, idx) => {
          if (ch === ' ') return ' ';
          if (idx < frame) return label[idx];
          return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
        })
        .join('');
      setDisplayText(next);
      if (frame >= totalFrames) {
        setDisplayText(label);
        clearInterval(interval);
      }
    }, 22);

    return () => clearInterval(interval);
  }, [active, label]);

  return (
    <div
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1) translateY(0)' : 'scale(0.94) translateY(4px)',
      }}
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center transition-[opacity,transform] duration-200 ease-out"
    >
      <div
        className="inline-flex items-center gap-2 rounded-[6px] px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] shadow-[0_4px_14px_rgba(0,0,0,0.28)]"
        style={{
          backgroundColor: 'var(--art-marker)',
          color: 'var(--art-on-marker)',
        }}
      >
        <span className="font-medium">{displayText}</span>
        <span className="opacity-75">[{shortcut}]</span>
      </div>
    </div>
  );
}

type CursorMode = 'default' | 'interactive' | 'text' | 'label';

const MAX_PARTICLES = 320;
const GRAVITY = 0.42;
const FLOOR_BOUNCE = 0.28;
const SURFACE_BOUNCE = 0.3;
const FRICTION = 0.86;
const AIR_DRAG = 0.994;

interface PhysicsSquare {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rot: number;
  vr: number;
  alpha: number;
  fading: boolean;
  asleep: boolean;
  restFrames: number;
}

interface SurfaceRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Zero-re-render GPU-accelerated custom cursor matching Shahriyar Mohammadi:
 * - Default: 14x14 orange square + 2D gravity physics trail (tiny orange squares
 *   that fall, bounce, perch/roll on text & UI elements, and pile up at the bottom)
 * - Hover text (p, h1-h4, li, dd): tall thin 2x20px vertical I-beam selection caret
 * - Hover interactive (button, a): compact 8x8 orange square
 * - Hover [data-cursor-label]: expanded orange pill ("CUT", "COPY", "VISIT", "TEAR", etc.)
 */
export function ArtCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastModeRef = useRef<CursorMode>('default');
  const lastLabelRef = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    setEnabled(true);

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    const particles: PhysicsSquare[] = [];
    let surfaces: SurfaceRect[] = [];
    let rafId = 0;
    let running = false;
    let lastSpawnX = -999;
    let lastSpawnY = -999;
    let lastSpawnTime = 0;
    let lastCursorX = -999;
    let lastCursorY = -999;
    let lastSurfaceScan = 0;
    let lastScrollY = window.scrollY;
    let lastScrollTime = performance.now();
    let scrollUnlockUntil = 0;
    let markerColor = '#ff5a3d';

    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const refreshMarkerColor = () => {
      const shell = document.querySelector<HTMLElement>('.dev-shell') || document.documentElement;
      const c = getComputedStyle(shell).getPropertyValue('--art-marker').trim();
      if (c) markerColor = c;
    };

    const isElementVisiblyRendered = (el: HTMLElement): boolean => {
      if (el.closest('.sr-only, [aria-hidden="true"]')) return false;
      let cur: HTMLElement | null = el;
      while (cur && cur !== document.body) {
        const style = getComputedStyle(cur);
        if (style.display === 'none' || style.visibility === 'hidden' || Number(style.opacity) < 0.05) {
          return false;
        }
        if (
          (style.overflow === 'hidden' || style.overflowY === 'hidden') &&
          cur.getBoundingClientRect().height < 6
        ) {
          return false;
        }
        cur = cur.parentElement;
      }
      return true;
    };

    const scanSurfaces = (force = false) => {
      const now = performance.now();
      if (!force && now - lastSurfaceScan < 420) return;
      lastSurfaceScan = now;

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const nodes = document.querySelectorAll<HTMLElement>(
        '[data-agent-slot="top-tiles"] > *, [data-agent-slot="writing"] > *, [data-agent-slot="bottom-tiles"] > *, [data-agent-slot="hero"] header button, [data-agent-slot="hero"] header a, [data-agent-slot="hero"] p, main .dev-tile, main .dev-tile-soft'
      );
      const next: SurfaceRect[] = [];
      for (let i = 0; i < nodes.length; i++) {
        const el = nodes[i];
        const r = el.getBoundingClientRect();
        if (r.width < 24 || r.height < 12) continue;
        if (r.bottom < 0 || r.top > vh - 14 || r.right < 0 || r.left > vw) continue;
        if (r.width > vw * 0.92 && r.height > vh * 0.7) continue;
        if (!isElementVisiblyRendered(el)) continue;
        next.push({
          left: r.left,
          right: r.right,
          top: r.top,
          bottom: r.bottom,
        });
      }
      surfaces = next;
    };

    const wakeAll = () => {
      for (let i = 0; i < particles.length; i++) {
        particles[i].asleep = false;
        particles[i].restFrames = 0;
      }
      ensureLoop();
    };

    const stepPhysics = () => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) {
        running = false;
        return;
      }

      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const now = performance.now();
      const scrollingShaken = now < scrollUnlockUntil;
      let anyAwake = false;

      // 1) Integrate gravity, air drag, floor & DOM surface collisions
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        if (p.fading) {
          p.alpha -= 0.035;
          if (p.alpha <= 0.01) {
            particles.splice(i, 1);
            continue;
          }
          anyAwake = true;
        }

        if (p.asleep) continue;
        anyAwake = true;

        const prevY = p.y;
        const half = p.size * 0.5;

        p.vy += GRAVITY;
        p.vx *= AIR_DRAG;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;

        let supported = false;

        // Viewport side walls & soft ceiling (prevents squares from flying off-screen on hard scrolls)
        if (p.x - half < 0) {
          p.x = half;
          p.vx = Math.abs(p.vx) * 0.45;
          p.vr = p.vx * 0.12;
        } else if (p.x + half > vw) {
          p.x = vw - half;
          p.vx = -Math.abs(p.vx) * 0.45;
          p.vr = p.vx * 0.12;
        }
        if (p.y - half < 0) {
          p.y = half;
          p.vy = Math.abs(p.vy) * 0.25;
        }

        // Collide with top ledges of text / cards / buttons (bypassed briefly during scroll shake so squares never glue to moving elements)
        if (!scrollingShaken && p.vy >= 0) {
          for (let s = 0; s < surfaces.length; s++) {
            const surf = surfaces[s];
            if (p.x + half * 0.7 < surf.left || p.x - half * 0.7 > surf.right) continue;
            // Crossing the top edge from above
            if (prevY + half <= surf.top + 6 && p.y + half >= surf.top) {
              p.y = surf.top - half;
              if (p.vy > 1.35) {
                p.vy = -p.vy * SURFACE_BOUNCE;
                // Tiny natural scatter / roll impulse on bounce
                p.vx += (Math.random() - 0.5) * 0.65;
                p.vr = p.vx * 0.14;
              } else {
                p.vy = 0;
                p.vx *= FRICTION;
                p.vr = p.vx * 0.14;
                // If perched right near an edge, tip & roll off!
                const edgeDistLeft = p.x - surf.left;
                const edgeDistRight = surf.right - p.x;
                if (edgeDistLeft < half * 0.85) {
                  p.vx -= 0.28;
                } else if (edgeDistRight < half * 0.85) {
                  p.vx += 0.28;
                } else {
                  supported = true;
                }
              }
              break;
            }
          }
        }

        // Bottom floor collision (pile up like pixel debris at the bottom)
        if (p.y + half >= vh) {
          p.y = vh - half;
          if (p.vy > 1.3) {
            p.vy = -p.vy * FLOOR_BOUNCE;
            p.vx *= 0.82;
            p.vr = p.vx * 0.15;
          } else {
            p.vy = 0;
            p.vx *= FRICTION;
            p.vr *= 0.75;
            supported = true;
          }
        }

        // Snap rotation gently toward nearest 90° when resting flat
        if (supported && Math.abs(p.vx) < 0.12 && Math.abs(p.vy) < 0.12) {
          const targetRot = Math.round(p.rot / (Math.PI / 2)) * (Math.PI / 2);
          p.rot += (targetRot - p.rot) * 0.28;
          p.restFrames += 1;
          if (p.restFrames > 22) {
            p.vx = 0;
            p.vy = 0;
            p.vr = 0;
            p.rot = targetRot;
            p.asleep = true;
          }
        } else {
          p.restFrames = 0;
        }
      }

      // 2) Square-to-square stacking & rolling collisions
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          if (a.asleep && b.asleep) continue;

          const minDist = (a.size + b.size) * 0.52;
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy;
          if (distSq >= minDist * minDist || distSq < 0.0001) continue;

          const dist = Math.sqrt(distSq);
          const overlap = minDist - dist;
          const nx = dx / dist;
          const ny = dy / dist;

          // Separate overlapping squares
          if (a.asleep && !b.asleep) {
            b.x += nx * overlap;
            b.y += ny * overlap;
          } else if (b.asleep && !a.asleep) {
            a.x -= nx * overlap;
            a.y -= ny * overlap;
          } else {
            a.x -= nx * overlap * 0.5;
            a.y -= ny * overlap * 0.5;
            b.x += nx * overlap * 0.5;
            b.y += ny * overlap * 0.5;
          }

          // Natural stacking / rolling off the sides of a pile
          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const velAlongNormal = rvx * nx + rvy * ny;
          if (velAlongNormal < 0) {
            const impulse = -(1 + 0.16) * velAlongNormal * 0.5;
            if (!a.asleep) {
              a.vx -= impulse * nx;
              a.vy -= impulse * ny;
              a.vr = a.vx * 0.12;
            }
            if (!b.asleep) {
              b.vx += impulse * nx;
              b.vy += impulse * ny;
              b.vr = b.vx * 0.12;
            }
          }

          // If one square sits cleanly on top of a sleeping square, let it rest or roll slightly
          if (Math.abs(ny) > 0.72) {
            const topP = a.y < b.y ? a : b;
            const botP = a.y < b.y ? b : a;
            if (botP.asleep && Math.abs(topP.vy) < 0.45 && Math.abs(topP.vx) < 0.25) {
              topP.vy = 0;
              topP.vx *= 0.78;
              topP.restFrames += 1;
              if (topP.restFrames > 18) {
                topP.vx = 0;
                topP.vy = 0;
                topP.vr = 0;
                topP.asleep = true;
              }
            }
          }
        }
      }

      // 3) Render all squares cleanly on the GPU-backed canvas
      ctx.clearRect(0, 0, vw, vh);
      ctx.fillStyle = markerColor;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        const h = p.size * 0.5;
        ctx.beginPath();
        ctx.roundRect(-h, -h, p.size, p.size, 1.4);
        ctx.fill();
        ctx.restore();
      }

      if (anyAwake) {
        rafId = requestAnimationFrame(stepPhysics);
      } else {
        running = false;
      }
    };

    const ensureLoop = () => {
      if (running || prefersReduced) return;
      running = true;
      rafId = requestAnimationFrame(stepPhysics);
    };

    const spawnPhysicsSquare = (x: number, y: number, vxHint: number) => {
      if (prefersReduced) return;
      const now = performance.now();
      const dx = x - lastSpawnX;
      const dy = y - lastSpawnY;
      if (now - lastSpawnTime < 36 || dx * dx + dy * dy < 16 * 16) return;

      lastSpawnX = x;
      lastSpawnY = y;
      lastSpawnTime = now;

      scanSurfaces(false);

      // Gently fade oldest particle when pile reaches cap
      if (particles.length >= MAX_PARTICLES) {
        const oldest = particles.find((pt) => !pt.fading);
        if (oldest) oldest.fading = true;
      }

      const size = 5 + Math.random() * 3.2;
      particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y: y + (Math.random() - 0.5) * 5,
        vx: Math.max(-3.2, Math.min(3.2, vxHint * 0.12)) + (Math.random() - 0.5) * 1.1,
        vy: -0.6 + Math.random() * 0.9,
        size,
        rot: (Math.random() - 0.5) * 0.7,
        vr: (Math.random() - 0.5) * 0.14,
        alpha: 0.9,
        fading: false,
        asleep: false,
        restFrames: 0,
      });

      ensureLoop();
    };

    // Gently nudge nearby settled squares if cursor brushes through a pile
    const nudgePile = (x: number, y: number, vx: number, vy: number) => {
      if (particles.length === 0) return;
      let woke = false;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const dx = p.x - x;
        const dy = p.y - y;
        if (dx * dx + dy * dy < 22 * 22) {
          p.asleep = false;
          p.restFrames = 0;
          p.vx += Math.max(-2.6, Math.min(2.6, vx * 0.14)) + (Math.random() - 0.5) * 0.5;
          p.vy += Math.max(-2.4, Math.min(1.0, vy * 0.08 - 0.7));
          p.vr = (Math.random() - 0.5) * 0.22;
          woke = true;
        }
      }
      if (woke) ensureLoop();
    };

    const handleMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const hideCursor = Boolean(target?.closest('[data-cursor-hide="true"]'));

      const moveVx = lastCursorX > -500 ? e.clientX - lastCursorX : 0;
      const moveVy = lastCursorY > -500 ? e.clientY - lastCursorY : 0;
      lastCursorX = e.clientX;
      lastCursorY = e.clientY;

      if (wrapRef.current) {
        wrapRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
        wrapRef.current.style.opacity = hideCursor ? '0' : '1';
      }

      if (hideCursor) return;

      const labelEl = target?.closest('[data-cursor-label]') as HTMLElement | null;
      const nextLabel = labelEl ? labelEl.getAttribute('data-cursor-label') : null;

      let nextMode: CursorMode = 'default';
      if (nextLabel) {
        nextMode = 'label';
      } else if (target?.closest('a, button, [role="button"]')) {
        nextMode = 'interactive';
      } else if (
        target?.closest(
          'p, h1, h2, h3, h4, li, dd, blockquote, input, textarea, [data-cursor-text]'
        )
      ) {
        nextMode = 'text';
      }

      // Only drop gravity squares when cursor is in default square mode
      if (nextMode === 'default') {
        spawnPhysicsSquare(e.clientX, e.clientY, moveVx);
        nudgePile(e.clientX, e.clientY, moveVx, moveVy);
      }

      if (nextLabel !== lastLabelRef.current) {
        lastLabelRef.current = nextLabel;
        setCursorLabel(nextLabel);
      }
      if (nextMode !== lastModeRef.current) {
        lastModeRef.current = nextMode;
        setMode(nextMode);
      }
    };

    const handleLeave = () => {
      if (wrapRef.current) wrapRef.current.style.opacity = '0';
    };

    const handleScroll = () => {
      const now = performance.now();
      const curScrollY = window.scrollY;
      const deltaY = curScrollY - lastScrollY;
      const dt = Math.max(12, now - lastScrollTime);
      lastScrollY = curScrollY;
      lastScrollTime = now;
      if (particles.length === 0 || Math.abs(deltaY) < 0.2) return;

      // Actual scroll speed in px/ms (gentle trackpad ~0.08–0.3, medium ~0.6–1.4, fast flick ~2.0–4.5+)
      const speedPxPerMs = Math.abs(deltaY) / dt;
      const intensity = Math.min(1, speedPxPerMs / 3.2);

      // Unlock surface sticking briefly so even slow scrolling dislodges perched squares smoothly
      scrollUnlockUntil = now + 180;
      scanSurfaces(true);
      const vh = window.innerHeight;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.asleep = false;
        p.restFrames = 0;

        // Speed-proportional shaken-surface inertia (non-stacking cap via Math.min so rapid trackpad ticks never launch squares to the ceiling)
        const isNearFloor = p.y >= vh - 96;
        const maxHop = isNearFloor
          ? 0.45 + intensity * 4.2 // gentle tremor on slow scroll, crisp hop on fast flick
          : 0.75 + intensity * 5.2; // dislodges from ledges cleanly without flying too high

        const targetVy = -maxHop * (0.75 + Math.random() * 0.45);
        if (deltaY > 0) {
          p.vy = Math.min(p.vy, targetVy);
        } else {
          // Scrolling up drops the surface beneath -> softer upward hop (55%) before gravity takes over
          p.vy = Math.min(p.vy, targetVy * 0.55);
        }

        // Subtle horizontal tremor & spin scaled strictly by scroll speed
        const rattle = (0.25 + intensity * 2.2) * (Math.random() - 0.5);
        p.vx = Math.max(-4.2, Math.min(4.2, p.vx + rattle));
        p.vr = Math.max(
          -0.28,
          Math.min(0.28, p.vr + (Math.random() - 0.5) * (0.05 + intensity * 0.18))
        );
      }

      ensureLoop();
    };

    const handleResize = () => {
      resizeCanvas();
      scanSurfaces(true);
      if (particles.length > 0) wakeAll();
    };

    // Init canvas after first render
    const initRaf = requestAnimationFrame(() => {
      resizeCanvas();
      refreshMarkerColor();
      scanSurfaces(true);
    });

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      cancelAnimationFrame(initRaf);
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* 2D Gravity & Surface-Collision Physics Canvas for Orange Square Debris */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998]"
      />

      <div
        ref={wrapRef}
        aria-hidden="true"
        style={{ opacity: 0, willChange: 'transform' }}
        className="pointer-events-none fixed left-0 top-0 z-[9999] transition-opacity duration-150"
      >
        <div
          style={{
            backgroundColor: 'var(--art-marker)',
            color: 'var(--art-on-marker)',
          }}
          className={
            mode === 'label' && cursorLabel
              ? 'rounded-[6px] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] whitespace-nowrap shadow-[0_2px_10px_rgba(0,0,0,0.22)] transition-all duration-150 ease-out'
              : mode === 'text'
              ? 'h-[20px] w-[2px] rounded-full transition-all duration-150 ease-out'
              : mode === 'interactive'
              ? 'h-2 w-2 rounded-[2px] transition-all duration-150 ease-out'
              : 'h-3.5 w-3.5 rounded-[3px] transition-all duration-150 ease-out'
          }
        >
          {mode === 'label' ? cursorLabel : null}
        </div>
      </div>
    </>
  );
}
