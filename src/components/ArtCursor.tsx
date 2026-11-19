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

/**
 * Zero-re-render GPU-accelerated custom cursor matching Shahriyar Mohammadi:
 * - Default: 14x14 orange square
 * - Hover text (p, h1-h4, li, dd): tall thin 2x20px vertical I-beam selection caret!
 * - Hover interactive (button, a): compact 8x8 orange square
 * - Hover [data-cursor-label]: expanded orange pill ("CUT", "COPY", "VISIT", "TEAR", etc.)
 */
export function ArtCursor() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<CursorMode>('default');
  const [cursorLabel, setCursorLabel] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastModeRef = useRef<CursorMode>('default');
  const lastLabelRef = useRef<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia('(hover: hover) and (pointer: fine)');
    if (!mq.matches) return;
    setEnabled(true);

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
  );
}
