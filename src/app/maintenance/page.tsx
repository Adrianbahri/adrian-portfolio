'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion } from '@/lib/motion';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Loader2,
  Mail,
  Moon,
  RefreshCw,
  Sun,
  Terminal,
} from 'lucide-react';
import { FiGithub, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { ART_DOMAIN, PRIMARY_DOMAIN, isArtHost } from '@/lib/sites';

const MAIN_UPGRADE_TASKS = [
  {
    id: 'core',
    label: 'Core Architecture & Routing',
    detail: 'Next.js 16 & edge caching',
    status: 'done' as const,
  },
  {
    id: 'ui',
    label: 'Interface & Motion Polish',
    detail: 'Refining typography & interactions',
    status: 'active' as const,
  },
  {
    id: 'works',
    label: 'New Case Studies & Works',
    detail: 'Curating engineering showcase',
    status: 'queued' as const,
  },
];

const ART_UPGRADE_TASKS = [
  {
    id: 'studio',
    label: 'Creative Studio Architecture',
    detail: 'Dedicated subdomain art.dri4n.com',
    status: 'done' as const,
  },
  {
    id: 'archive',
    label: 'Design, Print & Motion Archive',
    detail: 'Curating visual & editorial works',
    status: 'active' as const,
  },
  {
    id: 'gallery',
    label: 'Interactive Gallery Experience',
    detail: 'Polishing transitions & lightbox',
    status: 'queued' as const,
  },
];

export default function MaintenancePage() {
  const { settings } = useSiteSettings();
  const [isDark, setIsDark] = useState(true);
  const [isArtSite, setIsArtSite] = useState(false);
  const [timeString, setTimeString] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setIsArtSite(isArtHost(window.location.host));
  }, []);

  const activeDomain = isArtSite ? ART_DOMAIN : PRIMARY_DOMAIN;
  const upgradeTasks = isArtSite ? ART_UPGRADE_TASKS : MAIN_UPGRADE_TASKS;

  // Lightweight pointer spotlight using CSS variables (zero Framer Motion)
  const [spotPos, setSpotPos] = useState({ x: -500, y: -500 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setSpotPos({ x: e.clientX, y: e.clientY });
    },
    []
  );

  // Sync theme with portfolio preference (default dark)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Live WITA (Makassar) clock
  useEffect(() => {
    const updateTime = () => {
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Makassar',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(new Date());
      setTimeString(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const emailAddress = settings.email_address || 'contact@dri4n.com';

  const socials = [
    {
      name: 'GitHub',
      handle: '@Adrianbahri',
      icon: FiGithub,
      href: settings.github_url || 'https://github.com/Adrianbahri',
    },
    {
      name: 'LinkedIn',
      handle: 'in/adrianbahri',
      icon: FiLinkedin,
      href: settings.linkedin_url || 'https://linkedin.com/in/adrianbahri',
    },
    {
      name: 'Instagram',
      handle: '@adrianbahri',
      icon: FiInstagram,
      href: settings.instagram_url || 'https://instagram.com/adrianbahri',
    },
  ];

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${emailAddress}`;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      window.location.reload();
    }, 350);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      className="relative min-h-[100dvh] w-full flex flex-col justify-between overflow-hidden bg-canvas text-on-dark selection:bg-primary selection:text-white"
    >
      {/* Background Architecture Layer */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 blueprint-grid opacity-90" />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/30 via-transparent to-canvas" />
        <div
          className="hidden md:block absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(520px circle at ${spotPos.x}px ${spotPos.y}px, rgba(255, 85, 34, 0.085), transparent 72%)`,
          }}
        />
        {/* Ambient Accent Glow */}
        <motion.div
          animate={{
            opacity: [0.12, 0.2, 0.12],
            scale: [1, 1.06, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-32 right-[10%] w-[460px] h-[460px] rounded-full bg-primary blur-[140px]"
        />
        <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full bg-primary/10 blur-[130px]" />
      </div>

      {/* Top Minimal Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 pt-6 sm:pt-8"
      >
        <div className="flex items-center justify-between gap-4">
          {/* Brand + Domain Pill */}
          <div className="flex items-center gap-3 h-11 px-4 bg-canvas/80 backdrop-blur-xl border border-border-strong rounded-[5px] shadow-sm">
            <span className="font-heading text-base tracking-tight text-on-dark flex items-center gap-2">
              <span>
                Dri4n<span className="text-primary font-bold">.</span>
              </span>
              {isArtSite && (
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-[2px] border border-primary/30 bg-primary/10 text-primary">
                  ART
                </span>
              )}
            </span>
            <span className="h-3.5 w-px bg-border-strong" />
            <span className="text-[11px] font-mono text-body-muted tracking-wider">
              {activeDomain}
            </span>
          </div>

          {/* Status Indicator + Theme Switcher */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 h-11 px-3.5 bg-canvas/80 backdrop-blur-xl border border-border-subtle rounded-[5px] text-[11px] font-mono uppercase tracking-[0.16em] text-body-muted">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span>Maintenance Mode</span>
            </div>

            <button
              onClick={toggleTheme}
              aria-label="Toggle color theme"
              className="h-11 w-11 flex items-center justify-center bg-canvas/80 backdrop-blur-xl border border-border-strong rounded-[5px] text-body-muted hover:text-on-dark hover:border-primary/50 transition-all duration-200 cursor-pointer"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 py-12 sm:py-16">
        <div className="relative border border-border-subtle bg-canvas/65 backdrop-blur-xl rounded-[6px] p-6 sm:p-10 lg:p-12 shadow-[0_24px_80px_-24px_var(--shadow-main)]">
          {/* Architectural Corner Crosshairs */}
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -top-2.5 -left-2 font-mono text-xs text-primary/70"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -top-2.5 -right-2 font-mono text-xs text-primary/70"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -bottom-2.5 -left-2 font-mono text-xs text-primary/70"
          >
            +
          </span>
          <span
            aria-hidden="true"
            className="pointer-events-none select-none absolute -bottom-2.5 -right-2 font-mono text-xs text-primary/70"
          >
            +
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Core Message & CTA */}
            <div className="lg:col-span-7 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-[3px] border border-primary/30 bg-primary/10 text-primary text-[11px] font-mono uppercase tracking-[0.2em]"
              >
                <Terminal size={12} />
                <span>HTTP 503 // Scheduled Upgrade</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl sm:text-5xl lg:text-[56px] font-heading font-normal tracking-tight leading-[1.06] text-on-dark"
              >
                {isArtSite ? (
                  <>
                    Curating the{' '}
                    <span className="text-primary">Visual Studio.</span>
                  </>
                ) : (
                  <>
                    Crafting Something{' '}
                    <span className="text-primary">Better.</span>
                  </>
                )}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-base sm:text-lg text-body-muted leading-relaxed max-w-xl font-sans"
              >
                <span className="text-on-dark font-medium">{activeDomain}</span> is
                currently under maintenance while I{' '}
                {isArtSite
                  ? 'curate new graphic design, editorial print, motion reels, and photography works.'
                  : 'refine the visual experience, optimize performance, and prepare new projects.'}{' '}
                Thanks for your patience—we&apos;ll be back online shortly.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <a
                  href={`mailto:${emailAddress}`}
                  className="inline-flex items-center gap-2.5 bg-on-dark text-canvas px-6 py-3.5 text-xs font-mono font-medium uppercase tracking-[0.16em] rounded-[4px] hover:bg-primary hover:text-white transition-all duration-300 group shadow-md hover:-translate-y-0.5"
                >
                  <Mail size={14} />
                  <span>Contact Me</span>
                  <ArrowUpRight
                    size={14}
                    className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                  />
                </a>

                <button
                  onClick={handleCopyEmail}
                  className="inline-flex items-center gap-2 px-5 py-3.5 border border-border-strong bg-surface-100/50 hover:bg-surface-200/70 hover:border-primary/40 text-on-dark text-xs font-mono uppercase tracking-[0.14em] rounded-[4px] transition-all duration-200 cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-500">Email Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} className="text-body-muted" />
                      <span>{emailAddress}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleRefresh}
                  title="Check if site is back online"
                  aria-label="Refresh page"
                  className="h-[46px] w-[46px] inline-flex items-center justify-center border border-border-subtle bg-surface-100/30 hover:bg-surface-100 hover:border-border-strong text-body-muted hover:text-on-dark rounded-[4px] transition-all duration-200 cursor-pointer"
                >
                  <RefreshCw
                    size={15}
                    className={refreshing ? 'animate-spin text-primary' : ''}
                  />
                </button>
              </motion.div>
            </div>

            {/* Right Column: Telemetry & Social Panel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 space-y-4"
            >
              {/* Upgrade Progress Card */}
              <div className="border border-border-strong bg-surface-100/45 backdrop-blur-md rounded-[5px] p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-border-subtle pb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-on-dark font-medium">
                      Upgrade Progress
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-primary font-medium">
                    72%
                  </span>
                </div>

                {/* Animated Progress Track */}
                <div className="w-full h-1.5 bg-surface-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '72%' }}
                    transition={{ duration: 1.4, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-primary/80 to-primary rounded-full"
                  />
                </div>

                {/* Task Checklist */}
                <ul className="space-y-3.5">
                  {upgradeTasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-start justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        {task.status === 'done' && (
                          <CheckCircle2
                            size={15}
                            className="text-emerald-500 mt-0.5 shrink-0"
                          />
                        )}
                        {task.status === 'active' && (
                          <Loader2
                            size={15}
                            className="text-primary animate-spin mt-0.5 shrink-0"
                          />
                        )}
                        {task.status === 'queued' && (
                          <Clock
                            size={15}
                            className="text-body-muted/60 mt-0.5 shrink-0"
                          />
                        )}
                        <div>
                          <p
                            className={
                              task.status === 'queued'
                                ? 'text-body-muted font-medium'
                                : 'text-on-dark font-medium'
                            }
                          >
                            {task.label}
                          </p>
                          <p className="text-[11px] text-body-muted/80 font-mono mt-0.5">
                            {task.detail}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-[2px] border shrink-0 ${
                          task.status === 'done'
                            ? 'text-emerald-500 border-emerald-500/25 bg-emerald-500/10'
                            : task.status === 'active'
                            ? 'text-primary border-primary/30 bg-primary/10'
                            : 'text-body-muted border-border-subtle bg-surface-200/50'
                        }`}
                      >
                        {task.status === 'done'
                          ? 'Done'
                          : task.status === 'active'
                          ? 'Active'
                          : 'Next'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Social Channels */}
              <div className="grid grid-cols-3 gap-2.5">
                {socials.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col justify-between gap-3 p-3.5 border border-border-subtle bg-surface-100/35 hover:bg-surface-100/80 hover:border-primary/40 rounded-[5px] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between text-body-muted group-hover:text-primary transition-colors">
                      <item.icon size={16} />
                      <ArrowUpRight
                        size={13}
                        className="opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-on-dark">
                        {item.name}
                      </p>
                      <p className="text-[10px] font-mono text-body-muted truncate">
                        {item.handle}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Signature Minimal Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative z-10 w-full max-w-5xl mx-auto px-6 lg:px-12 pb-6 sm:pb-8"
      >
        <div className="border-t border-border-subtle pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] font-mono text-body-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Makassar, Indonesia
            </span>
            {timeString && (
              <>
                <span className="text-border-strong">•</span>
                <span className="text-on-dark bg-surface-100/60 px-2 py-0.5 rounded-[2px] border border-border-subtle">
                  {timeString} WITA
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} Adrian Bahri (Dri4n)</span>
            <span className="text-border-strong">•</span>
            <Link
              href="/login"
              className="hover:text-primary transition-colors"
            >
              Admin
            </Link>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
