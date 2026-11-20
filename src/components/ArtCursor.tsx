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

const TRAIL_POOL_SIZE = 18;

/**
 * Zero-re-render GPU-accelerated custom cursor matching Shahriyar Mohammadi:
 * - Default: 14x14 orange square + subtle falling/fading tiny orange square trail
 * - Hover text (p, h1-h4, li, dd): tall thin 2x20px vertical I-beam selection caret
 * - Hover interactive (button, a): compact 8x8 orange square
 * - Hover [data-cursor-label]: expanded orange pill ("CUT", "COPY", "VISIT", "TEAR", etc.)
 */
export function ArtCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const trailPoolRef = useRef<(HTMLSpanElement | null)[]>([]);
  const lastModeRef = useRef<CursorMode>('default');
  const lastLabelRef = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    setEnabled(true);

    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let poolIdx = 0;
    let lastSpawnX = -999;
    let lastSpawnY = -999;
    let lastSpawnTime = 0;

    const spawnTrailSquare = (x: number, y: number) => {
      if (prefersReduced) return;
      const now = performance.now();
      const dx = x - lastSpawnX;
      const dy = y - lastSpawnY;
      if (now - lastSpawnTime < 34 || dx * dx + dy * dy < 16 * 16) return;

      const particle = trailPoolRef.current[poolIdx];
      if (!particle) return;
      poolIdx = (poolIdx + 1) % TRAIL_POOL_SIZE;
      lastSpawnX = x;
      lastSpawnY = y;
      lastSpawnTime = now;

      const size = 4 + Math.random() * 2.8;
      const jitterX = (Math.random() - 0.5) * 8;
      const jitterY = (Math.random() - 0.5) * 6;
      const driftX = (Math.random() - 0.5) * 18;
      const fallY = 26 + Math.random() * 24;
      const startRot = (Math.random() - 0.5) * 18;
      const endRot = startRot + (Math.random() - 0.5) * 46;

      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;

      particle.getAnimations().forEach((anim) => anim.cancel());
      particle.animate(
        [
          {
            transform: `translate3d(${x + jitterX - size / 2}px, ${y + jitterY - size / 2}px, 0) rotate(${startRot}deg) scale(1)`,
            opacity: 0.85,
          },
          {
            transform: `translate3d(${x + jitterX + driftX - size / 2}px, ${y + jitterY + fallY - size / 2}px, 0) rotate(${endRot}deg) scale(0.3)`,
            opacity: 0,
          },
        ],
        {
          duration: 540 + Math.random() * 180,
          easing: 'cubic-bezier(0.32, 0.04, 0.68, 1)',
          fill: 'forwards',
        }
      );
    };

    const handleMove = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const hideCursor = Boolean(target?.closest('[data-cursor-hide="true"]'));

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

      // Only leave falling orange square crumbs in default square cursor mode
      if (nextMode === 'default') {
        spawnTrailSquare(e.clientX, e.clientY);
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

    window.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Pooled GPU-composited falling orange square trail (default square mode only) */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9998] overflow-hidden"
      >
        {Array.from({ length: TRAIL_POOL_SIZE }).map((_, i) => (
          <span
            key={i}
            ref={(el) => {
              trailPoolRef.current[i] = el;
            }}
            style={{
              backgroundColor: 'var(--art-marker)',
              opacity: 0,
              willChange: 'transform, opacity',
            }}
            className="fixed left-0 top-0 rounded-[1.5px]"
          />
        ))}
      </div>

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
