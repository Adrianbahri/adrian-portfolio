import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Triggers a silky 120fps GPU-composited circular portal reveal transition
 * radiating from the clicked card/button when switching between `/` (Dev) and `/art` (Creative).
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
  const fillColor = isDark ? '#0e0e0d' : '#faf9f6';
  const ringColor = isDark ? 'rgba(255, 90, 61, 0.35)' : 'rgba(232, 52, 28, 0.28)';

  // Remove any stale portal overlay
  document.getElementById('dri4n-portal-overlay')?.remove();

  const overlay = document.createElement('div');
  overlay.id = 'dri4n-portal-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  Object.assign(overlay.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '2147483640',
    pointerEvents: 'none',
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

  // Phase 1: Expand circle smoothly from the clicked tile/button
  const expandAnim = circle.animate(
    [
      { transform: 'scale(0.01)', opacity: 0.92 },
      { transform: 'scale(1)', opacity: 1 },
    ],
    {
      duration: 420,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'forwards',
    }
  );

  // Trigger Next.js route navigation right as the circle covers the viewport
  window.setTimeout(() => {
    router.push(href);
  }, 300);

  // Phase 2: Softly fade the portal veil away once the new route is painted
  expandAnim.onfinish = () => {
    window.setTimeout(() => {
      const fadeAnim = overlay.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        {
          duration: 360,
          easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
          fill: 'forwards',
        }
      );
      fadeAnim.onfinish = () => {
        overlay.remove();
      };
    }, 110);
  };
}
