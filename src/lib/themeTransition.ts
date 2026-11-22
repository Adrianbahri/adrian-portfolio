import { flushSync } from 'react-dom';

export type ThemePreference = 'light' | 'dark';

/**
 * Synchronizes root `.dark` class, `<meta name="color-scheme">`, and `localStorage`
 * safely (never throws if storage is blocked).
 */
export function applyThemePreference(
  next: ThemePreference,
  options: { persist?: boolean } = {}
) {
  const { persist = true } = options;

  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', next === 'dark');
    const colorSchemeMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="color-scheme"]'
    );
    if (colorSchemeMeta) {
      colorSchemeMeta.content = next;
    }
  }

  if (persist && typeof window !== 'undefined') {
    try {
      window.localStorage.setItem('theme', next);
    } catch {
      // Ignore storage errors when site data is restricted
    }
  }
}

/**
 * Keeps theme state in sync across open browser tabs via the `storage` event.
 */
export function subscribeThemeStorage(
  onThemeChange: (next: ThemePreference) => void
) {
  if (typeof window === 'undefined') return () => {};

  const onStorage = (event: StorageEvent) => {
    if (event.key !== 'theme') return;
    if (event.newValue === 'light' || event.newValue === 'dark') {
      applyThemePreference(event.newValue, { persist: false });
      onThemeChange(event.newValue);
    }
  };

  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

/**
 * Triggers a smooth circular reveal View Transition radiating from the clicked toggle button.
 * Falls back gracefully when View Transitions API is unavailable or reduced-motion is preferred.
 */
export function runThemeTransition(
  applyTheme: () => void,
  event?: React.MouseEvent<HTMLElement>
) {
  if (typeof document === 'undefined') {
    applyTheme();
    return;
  }

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => {
      ready: Promise<void>;
      finished: Promise<void>;
    };
  };

  if (!doc.startViewTransition || prefersReduced) {
    applyTheme();
    return;
  }

  const vw = window.innerWidth || 1;
  const vh = window.innerHeight || 1;
  let x = vw / 2;
  let y = 40;

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

  const endRadius = Math.ceil(
    Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)) * 1.04
  );

  const root = document.documentElement;
  root.setAttribute('data-vt', 'theme');

  const transition = doc.startViewTransition(() => {
    flushSync(() => {
      applyTheme();
    });
  });

  transition.ready
    .then(() => {
      root.animate(
        {
          clipPath: [
            `circle(0px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`,
            `circle(${endRadius}px at ${x.toFixed(1)}px ${y.toFixed(1)}px)`,
          ],
        },
        {
          duration: 460,
          easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
          fill: 'both',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    })
    .catch(() => {
      // Ignore aborted transitions on rapid toggling
    });

  transition.finished.finally(() => {
    if (root.getAttribute('data-vt') === 'theme') {
      root.removeAttribute('data-vt');
    }
  });
}
