import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface PortalState {
  targetPath: string;
  expandDone: boolean;
  routeReady: boolean;
  fadeStarted: boolean;
  overlay: HTMLDivElement;
  safetyTimer: number;
}

let activePortal: PortalState | null = null;

function normalizePath(href: string): string {
  try {
    const u = new URL(href, 'http://localhost');
    return u.pathname.replace(/\/+$/, '') || '/';
  } catch {
    return href.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';
  }
}

function tryRevealTarget() {
  if (!activePortal) return;
  if (!activePortal.expandDone || !activePortal.routeReady || activePortal.fadeStarted) {
    return;
  }
  const portal = activePortal;
  portal.fadeStarted = true;
  window.clearTimeout(portal.safetyTimer);

  // Wait 2 animation frames so the newly mounted route has painted cleanly before lifting the veil
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const fadeAnim = portal.overlay.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 340,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        fill: 'forwards',
      });
      fadeAnim.onfinish = () => {
        portal.overlay.remove();
        if (activePortal === portal) {
          activePortal = null;
        }
      };
    });
  });
}

/**
 * Called by destination pages (`/`, `/art`) once mounted so the circular portal veil
 * ONLY lifts after the target page is actually loaded and painted.
 */
export function signalPortalRouteReady(pathname: string) {
  if (typeof window === 'undefined' || !activePortal) return;
  if (normalizePath(pathname) === activePortal.targetPath) {
    activePortal.routeReady = true;
    tryRevealTarget();
  }
}

/**
 * Triggers a silky 120fps GPU-composited circular portal reveal transition
 * radiating from the clicked card/button when switching between `/` (Dev) and `/art` (Creative).
 * Holds the veil until the destination page has actually mounted and painted.
 */
export function navigateWithCirclePortal(
  href: string,
  router: AppRouterInstance,
  event?: React.MouseEvent<HTMLElement>
) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    router.push(href);
    return;
  }

  const targetPath = normalizePath(href);
  const currentPath = normalizePath(window.location.pathname);
  if (targetPath === currentPath) {
    return;
  }

  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (prefersReduced) {
    router.push(href);
    return;
  }

  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  let x = vw / 2;
  let y = vh / 2;

  if (event?.currentTarget) {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    } else if (event.clientX || event.clientY) {
      x = event.clientX;
      y = event.clientY;
    }
  }

  const maxDist = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
  const diameter = Math.ceil(maxDist * 2.15);

  // Match the user's current theme so there's zero harsh flash
  const savedTheme = localStorage.getItem('theme');
  const isDark =
    savedTheme === 'dark' ||
    (!savedTheme && document.documentElement.classList.contains('dark'));
  const fillColor = isDark ? '#0e0e0d' : '#ffffff';
  const ringColor = isDark
    ? 'rgba(255, 90, 61, 0.35)'
    : 'rgba(232, 52, 28, 0.25)';

  // Clean up any previous unfinished portal
  if (activePortal) {
    window.clearTimeout(activePortal.safetyTimer);
    activePortal.overlay.remove();
    activePortal = null;
  }
  document.getElementById('dri4n-portal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'dri4n-portal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483640',
    pointerEvents: 'auto',
    overflow: 'hidden',
  });

  const circle = document.createElement('div');
  Object.assign(circle.style, {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${diameter}px`,
    height: `${diameter}px`,
    marginLeft: `${-diameter / 2}px`,
    marginTop: `${-diameter / 2}px`,
    borderRadius: '9999px',
    backgroundColor: fillColor,
    boxShadow: `0 0 0 2px ${ringColor}, 0 0 64px ${ringColor}`,
    transform: 'scale(0.01)',
    opacity: '0.96',
    willChange: 'transform, opacity',
  });

  overlay.appendChild(circle);
  document.body.appendChild(overlay);

  const safetyTimer = window.setTimeout(() => {
    if (activePortal && activePortal.overlay === overlay) {
      activePortal.expandDone = true;
      activePortal.routeReady = true;
      tryRevealTarget();
    }
  }, 4000);

  const state: PortalState = {
    targetPath,
    expandDone: false,
    routeReady: false,
    fadeStarted: false,
    overlay,
    safetyTimer,
  };
  activePortal = state;

  // Phase 1: Expand circle smoothly from the clicked tile/button
  const expandAnim = circle.animate(
    [
      { transform: 'scale(0.01)', opacity: 0.94 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    {
      duration: 380,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    }
  );

  // Start loading the destination route in parallel right as the circle expands
  window.setTimeout(() => {
    router.push(href);
  }, 140);

  // Phase 2: Mark expansion complete — veil stays up until signalPortalRouteReady(targetPath) fires!
  expandAnim.onfinish = () => {
    if (activePortal === state) {
      state.expandDone = true;
      tryRevealTarget();
    }
  };
}
