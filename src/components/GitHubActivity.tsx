'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, GitBranch, Star } from 'lucide-react';

interface MonthlyVelocityPoint {
  month: string;
  publicCount: number;
  privateCount: number;
  total: number;
  activeRepos: number;
}

type ToneLevel = 'accent' | 'ink' | 'soft' | 'muted';

interface SplitItem {
  label: string;
  count: number;
  percent: number;
  tone?: ToneLevel;
  note?: string;
}

interface RepoItem {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  pushedAt: string;
}

interface GitHubResponse {
  username: string;
  profileUrl: string;
  totalRepos: number;
  publicRepos: number;
  privateRepos: number;
  orgReposCount: number;
  totalContributions: number;
  monthlyVelocity?: MonthlyVelocityPoint[];
  workspaceSplit?: SplitItem[];
  domainSplit?: SplitItem[];
  repos: RepoItem[];
}

function toneToColor(tone?: ToneLevel): string {
  switch (tone) {
    case 'accent':
      return 'var(--art-marker)';
    case 'ink':
      return 'var(--art-ink)';
    case 'soft':
      return 'var(--art-ink-soft)';
    case 'muted':
    default:
      return 'var(--art-ink-muted)';
  }
}

function formatShortUpdated(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '';
  const diffDays = Math.max(0, Math.floor((Date.now() - ts) / 86_400_000));
  if (diffDays === 0) return 'today';
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
}

export default function GitHubActivity() {
  const [data, setData] = useState<GitHubResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);

  const loadGitHubData = useCallback(() => {
    setLoading(true);
    setHasError(false);
    fetch('/api/github')
      .then((res) => (res.ok ? res.json() : null))
      .then((json: GitHubResponse | null) => {
        if (json) {
          setData(json);
        } else {
          setHasError(true);
        }
      })
      .catch(() => {
        setHasError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadGitHubData();
  }, [loadGitHubData]);

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className="rounded-[14px] p-5"
        style={{
          backgroundColor: 'var(--art-tile)',
          border: '1px solid var(--art-line)',
        }}
      >
        <p
          className="font-mono text-[11px]"
          style={{ color: 'var(--art-ink-muted)' }}
        >
          Loading repository history from GitHub...
        </p>
      </div>
    );
  }

  if (hasError || !data) {
    return (
      <div
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] p-4"
        style={{
          backgroundColor: 'var(--art-tile)',
          border: '1px solid var(--art-line)',
        }}
      >
        <p className="text-[12.5px]" style={{ color: 'var(--art-ink-soft)' }}>
          Could not load GitHub repository metrics right now.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadGitHubData}
            className="cursor-pointer rounded-[6px] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] transition-colors"
            style={{
              backgroundColor: 'var(--art-paper-raised)',
              border: '1px solid var(--art-hairline-strong)',
              color: 'var(--art-ink)',
            }}
          >
            Retry
          </button>
          <a
            href="https://github.com/Adrianbahri"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-[6px] px-3 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em]"
            style={{
              color: 'var(--art-marker-text)',
            }}
          >
            <span>Open GitHub</span>
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>
      </div>
    );
  }

  const velocity = data.monthlyVelocity ?? [];
  const workspaceSplit = data.workspaceSplit ?? [];
  const domainSplit = data.domainSplit ?? [];

  const maxMonthlyTotal = Math.max(1, ...velocity.map((m) => m.total));
  const inspectedMonth =
    activeMonthIdx !== null && velocity[activeMonthIdx]
      ? velocity[activeMonthIdx]
      : velocity[velocity.length - 1] || null;

  return (
    <div className="space-y-3.5">
      {/* Main Git Engineering Analytics & Charts Card */}
      <div
        className="rounded-[14px] p-4 sm:p-5"
        style={{
          backgroundColor: 'var(--art-tile)',
          border: '1px solid var(--art-line)',
        }}
      >
        {/* Top Row: Summary Heading + Profile Handle (No decorative pulsing dot per R-19) */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4">
          <p
            className="text-[13px] font-medium"
            style={{ color: 'var(--art-ink)' }}
          >
            {data.totalRepos} repositories across personal, campus, and organization work
          </p>

          <a
            href={data.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-cursor-label="github"
            className="inline-flex items-center gap-1 font-mono text-[10.5px] transition-colors hover:text-[var(--art-marker-text)] cursor-pointer"
            style={{ color: 'var(--art-ink-muted)' }}
          >
            <span>@{data.username}</span>
            <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </div>

        {/* 4 Summary Metrics */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            {
              value: String(data.totalRepos),
              label: 'Total repos',
              sub: `${data.publicRepos} public · ${data.privateRepos} private`,
            },
            {
              value: `${data.orgReposCount}`,
              label: 'Org & team repos',
              sub: 'UKK Unhas, SIRIDA & team',
            },
            {
              value: `${data.totalContributions}+`,
              label: 'Commits / yr',
              sub: 'Public + private orgs',
            },
            {
              value: '40',
              label: 'Stack & tools',
              sub: '5 engineering categories',
            },
          ].map((stat, idx) => (
            <div
              key={stat.label}
              className="dev-enter-card rounded-[10px] p-3"
              style={{
                backgroundColor: 'var(--art-paper-raised)',
                border: '1px solid var(--art-hairline)',
                ['--enter-delay' as string]: `${idx * 55}ms`,
              }}
            >
              <p
                className="font-mono text-[18px] font-semibold tracking-tight tabular-nums sm:text-[20px]"
                style={{ color: 'var(--art-ink)' }}
              >
                {stat.value}
              </p>
              <p
                className="mt-0.5 font-mono text-[10px]"
                style={{ color: 'var(--art-marker-text)' }}
              >
                {stat.label}
              </p>
              <p
                className="mt-0.5 truncate text-[11px]"
                style={{ color: 'var(--art-ink-muted)' }}
              >
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* CHART 1: Commits per month, last 12 months (Constrained 2-tone palette per R-29) */}
        {velocity.length > 0 && (
          <div
            className="mt-4 rounded-[12px] p-3.5 sm:p-4"
            style={{
              backgroundColor: 'var(--art-paper)',
              border: '1px solid var(--art-hairline)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-2 pb-3">
              <div>
                <p
                  className="text-[12.5px] font-medium"
                  style={{ color: 'var(--art-ink)' }}
                >
                  Commits per month, last 12 months
                </p>
                {inspectedMonth && (
                  <p
                    className="mt-0.5 font-mono text-[10.5px]"
                    style={{ color: 'var(--art-ink-muted)' }}
                  >
                    <strong style={{ color: 'var(--art-marker-text)' }}>
                      {inspectedMonth.month}
                    </strong>
                    : {inspectedMonth.total} commits ({inspectedMonth.privateCount}{' '}
                    private/org, {inspectedMonth.publicCount} public) across{' '}
                    {inspectedMonth.activeRepos} active repos
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 font-mono text-[10px]">
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-xs"
                    style={{ backgroundColor: 'var(--art-marker)' }}
                  />
                  <span style={{ color: 'var(--art-ink-soft)' }}>
                    Private &amp; org
                  </span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-xs"
                    style={{
                      backgroundColor: 'var(--art-ink)',
                      opacity: 0.42,
                    }}
                  />
                  <span style={{ color: 'var(--art-ink-soft)' }}>Public</span>
                </span>
              </div>
            </div>

            {/* Interactive 12-Month Stacked Bar Chart */}
            <div
              role="group"
              aria-label="Commits per month over the last 12 months"
              className="grid grid-cols-12 items-end gap-1 pt-2 sm:gap-2"
              style={{ height: '128px' }}
            >
              {velocity.map((m, idx) => {
                const totalHeightPct = Math.max(
                  18,
                  Math.round((m.total / maxMonthlyTotal) * 100)
                );
                const privRatio = Math.round((m.privateCount / m.total) * 100);
                const pubRatio = 100 - privRatio;
                const isInspected =
                  (activeMonthIdx ?? velocity.length - 1) === idx;

                return (
                  <button
                    key={m.month}
                    type="button"
                    aria-label={`${m.month}: ${m.total} total commits (${m.privateCount} private or organization, ${m.publicCount} public)`}
                    aria-pressed={isInspected}
                    onMouseEnter={() => setActiveMonthIdx(idx)}
                    onFocus={() => setActiveMonthIdx(idx)}
                    onClick={() => setActiveMonthIdx(idx)}
                    className="group flex h-full cursor-pointer flex-col items-center justify-end gap-1.5"
                  >
                    <span
                      className="font-mono text-[9px] tabular-nums"
                      style={{
                        color: isInspected
                          ? 'var(--art-marker-text)'
                          : 'var(--art-ink-muted)',
                      }}
                    >
                      {m.total}
                    </span>

                    <div
                      className="flex w-full flex-col justify-end overflow-hidden rounded-[4px] p-[1px] transition-transform duration-150 group-hover:scale-y-[1.02]"
                      style={{
                        height: `${totalHeightPct}%`,
                        backgroundColor: 'var(--art-hairline)',
                        outline: isInspected
                          ? '1px solid var(--art-marker)'
                          : 'none',
                      }}
                    >
                      {/* Public Commits Top Segment (Editorial Ink Tone) */}
                      <div
                        className="w-full rounded-t-[2px] transition-all duration-200"
                        style={{
                          height: `${pubRatio}%`,
                          backgroundColor: 'var(--art-ink)',
                          opacity: isInspected ? 0.55 : 0.35,
                        }}
                      />
                      {/* Private & Org Commits Base Segment (Signature Vermilion Accent) */}
                      <div
                        className="w-full rounded-b-[2px] transition-all duration-200"
                        style={{
                          height: `${privRatio}%`,
                          backgroundColor: 'var(--art-marker)',
                          opacity: isInspected ? 1 : 0.82,
                        }}
                      />
                    </div>

                    <span
                      className="font-mono text-[9.5px]"
                      style={{
                        color: isInspected
                          ? 'var(--art-ink)'
                          : 'var(--art-ink-muted)',
                        fontWeight: isInspected ? 600 : 400,
                      }}
                    >
                      {m.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CHARTS 2 & 3: Where Repositories Live + Engineering Focus */}
        <div className="mt-3.5 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {/* Chart 2: Where the 52 repositories live */}
          {workspaceSplit.length > 0 && (
            <div
              className="rounded-[12px] p-3.5"
              style={{
                backgroundColor: 'var(--art-paper)',
                border: '1px solid var(--art-hairline)',
              }}
            >
              <div className="flex items-center justify-between pb-2.5">
                <span
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--art-ink)' }}
                >
                  Where the {data.totalRepos} repositories live
                </span>
                <span
                  className="font-mono text-[10px]"
                  style={{ color: 'var(--art-ink-muted)' }}
                >
                  {data.totalRepos} repos
                </span>
              </div>

              {/* Segmented Stacked Bar (Monochrome + Single Accent per R-29) */}
              <div
                aria-hidden="true"
                className="mb-3 flex h-[6px] w-full overflow-hidden rounded-full gap-[2px] p-[1px]"
                style={{ backgroundColor: 'var(--art-hairline)' }}
              >
                {workspaceSplit.map((item, idx) => (
                  <span
                    key={item.label}
                    className="dev-timeline-bar h-full first:rounded-l-full last:rounded-r-full"
                    style={{
                      width: `${item.percent}%`,
                      backgroundColor: toneToColor(item.tone),
                      ['--bar-delay' as string]: `${idx * 70}ms`,
                    }}
                  />
                ))}
              </div>

              <div className="space-y-2.5">
                {workspaceSplit.map((item) => (
                  <div key={item.label} className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span className="inline-flex min-w-0 items-center gap-1.5">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-xs"
                          style={{ backgroundColor: toneToColor(item.tone) }}
                        />
                        <span
                          className="truncate font-medium"
                          style={{ color: 'var(--art-ink)' }}
                        >
                          {item.label}
                        </span>
                      </span>
                      <span
                        className="shrink-0 font-mono text-[10px] tabular-nums"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        {item.count} repos ({item.percent}%)
                      </span>
                    </div>
                    {item.note && (
                      <p
                        className="truncate pl-3.5 text-[10.5px]"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chart 3: Repositories by engineering focus */}
          {domainSplit.length > 0 && (
            <div
              className="rounded-[12px] p-3.5"
              style={{
                backgroundColor: 'var(--art-paper)',
                border: '1px solid var(--art-hairline)',
              }}
            >
              <div className="flex items-center justify-between pb-2.5">
                <span
                  className="text-[12px] font-medium"
                  style={{ color: 'var(--art-ink)' }}
                >
                  Repositories by engineering focus
                </span>
                  <span
                    className="font-mono text-[10px]"
                    style={{ color: 'var(--art-ink-muted)' }}
                  >
                    {domainSplit.length} areas
                  </span>
                </div>

              <div className="space-y-2.5">
                {domainSplit.map((dom, idx) => (
                  <div key={dom.label} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-[11.5px]">
                      <span
                        className="truncate font-medium"
                        style={{ color: 'var(--art-ink)' }}
                      >
                        {dom.label}
                      </span>
                      <span
                        className="shrink-0 font-mono text-[10px] tabular-nums"
                        style={{ color: 'var(--art-ink-muted)' }}
                      >
                        {dom.count} repos ({dom.percent}%)
                      </span>
                    </div>
                    <div
                      className="h-[5px] w-full overflow-hidden rounded-full"
                      style={{ backgroundColor: 'var(--art-hairline)' }}
                    >
                      <div
                        className="dev-timeline-bar h-full rounded-full"
                        style={{
                          width: `${dom.percent}%`,
                          backgroundColor: toneToColor(dom.tone),
                          ['--bar-delay' as string]: `${120 + idx * 65}ms`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Public Repositories Grid */}
      {data.repos.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {data.repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor-label="repo"
              className="group flex flex-col justify-between rounded-[12px] p-3.5 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                backgroundColor: 'var(--art-tile)',
                border: '1px solid var(--art-line)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <GitBranch
                      size={13}
                      aria-hidden="true"
                      style={{ color: 'var(--art-marker-text)' }}
                      className="shrink-0"
                    />
                    <span
                      className="dev-hover-title truncate text-[13px] font-medium"
                      style={{ color: 'var(--art-ink)' }}
                    >
                      {repo.name}
                    </span>
                  </span>
                  <ArrowUpRight
                    size={12}
                    aria-hidden="true"
                    className="shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ color: 'var(--art-ink-muted)' }}
                  />
                </div>

                {repo.description && (
                  <p
                    className="mt-1.5 line-clamp-2 text-[12px] leading-[17px]"
                    style={{ color: 'var(--art-ink-soft)' }}
                  >
                    {repo.description}
                  </p>
                )}
              </div>

              <div
                className="mt-3 flex items-center justify-between font-mono text-[10px]"
                style={{ color: 'var(--art-ink-muted)' }}
              >
                <span className="truncate">{repo.language || 'TypeScript'}</span>
                <span className="inline-flex items-center gap-2.5 shrink-0">
                  {repo.stars > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <Star size={10} aria-hidden="true" />
                      {repo.stars}
                    </span>
                  )}
                  <span>{formatShortUpdated(repo.pushedAt)}</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
