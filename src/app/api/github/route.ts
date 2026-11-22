import { NextResponse } from 'next/server';

const GITHUB_USERNAME = 'Adrianbahri';

interface GitHubRepoRaw {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  created_at?: string;
  updated_at?: string;
  fork: boolean;
  owner?: {
    login?: string;
  };
}

interface ContribDay {
  date: string;
  count: number;
  level: number;
}

const PUBLIC_REPO_DESCRIPTIONS: Record<string, string> = {
  'adrian-portfolio':
    'Full-stack portfolio built with Next.js 16, TypeScript, Supabase, and the Spotify Web API.',
  'ojs-rpl-backend':
    'SIRIDA: Open Journal System (OJS) backend monolith built with Laravel 13 and SQLite.',
  'desa-bonto-somba':
    'Public village information and administration portal for Desa Bonto Somba.',
  'web-arsip-tonasa':
    'Document archiving system built with Next.js, TypeScript, and Supabase Postgres.',
  'big-data-project-architecture':
    'NYC Green Taxi streaming analytics pipeline using Kafka, Spark, and ClickHouse.',
  Swipi:
    'Native SwiftUI iOS utility for reviewing and cleaning photo galleries.',
  'Web-Desa-Waginopo':
    'Village transparency portal with a headless WordPress CMS for Desa Waginopo, Wakatobi.',
  Eventku_MobileApp:
    'Flutter and Firebase mobile app for tracking university campus events.',
  'Web-Desa---Unfinished':
    'Interactive digital archive and map exploration for Kakaskasen 2, Tomohon.',
};

const DEFAULT_MONTHLY_VELOCITY = [
  { month: 'Dec', publicCount: 14, privateCount: 18, total: 32, activeRepos: 5 },
  { month: 'Jan', publicCount: 19, privateCount: 22, total: 41, activeRepos: 6 },
  { month: 'Feb', publicCount: 16, privateCount: 26, total: 42, activeRepos: 7 },
  { month: 'Mar', publicCount: 22, privateCount: 30, total: 52, activeRepos: 8 },
  { month: 'Apr', publicCount: 18, privateCount: 28, total: 46, activeRepos: 7 },
  { month: 'May', publicCount: 25, privateCount: 34, total: 59, activeRepos: 9 },
  { month: 'Jun', publicCount: 21, privateCount: 38, total: 59, activeRepos: 10 },
  { month: 'Jul', publicCount: 28, privateCount: 41, total: 69, activeRepos: 11 },
  { month: 'Aug', publicCount: 24, privateCount: 46, total: 70, activeRepos: 12 },
  { month: 'Sep', publicCount: 31, privateCount: 52, total: 83, activeRepos: 14 },
  { month: 'Oct', publicCount: 35, privateCount: 58, total: 93, activeRepos: 15 },
  { month: 'Nov', publicCount: 38, privateCount: 64, total: 102, activeRepos: 17 },
];

// Constrained editorial palette (R-29): single vermilion accent + monochrome ink tones
const DEFAULT_WORKSPACE_SPLIT = [
  {
    label: 'Personal open-source',
    count: 27,
    percent: 64,
    tone: 'accent' as const,
    note: 'Public web apps, iOS/Flutter utilities, and coursework',
  },
  {
    label: 'Private production systems',
    count: 10,
    percent: 24,
    tone: 'ink' as const,
    note: 'PK Identitas portal, Rekap analytics, Sposmed, and Solusi Digitalta',
  },
  {
    label: 'Organization collaborations',
    count: 5,
    percent: 12,
    tone: 'soft' as const,
    note: 'UKK Unhas (UI & API), SIRIDA OJS RPL, and team repositories',
  },
];

const DEFAULT_DOMAIN_SPLIT = [
  {
    label: 'Full-stack web & portals',
    count: 22,
    percent: 52,
    tone: 'accent' as const,
  },
  {
    label: 'Campus & editorial systems',
    count: 11,
    percent: 26,
    tone: 'ink' as const,
  },
  {
    label: 'Data engineering & analytics',
    count: 5,
    percent: 12,
    tone: 'soft' as const,
  },
  {
    label: 'Native iOS & Flutter mobile',
    count: 4,
    percent: 10,
    tone: 'muted' as const,
  },
];

function isAdrianRepo(r: GitHubRepoRaw): boolean {
  const owner = (r.owner?.login || '').toLowerCase();
  const name = r.name.toLowerCase();
  // Inside netmon-snd-research, only include UKK Unhas repositories
  if (owner === 'netmon-snd-research') {
    return name === 'ui-ukk-uh' || name === 'api-ukk-uh';
  }
  return true;
}

export async function GET() {
  const cacheHeaders = {
    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=1800',
  };

  const hasToken = Boolean(process.env.GITHUB_TOKEN);
  const ghHeaders: HeadersInit = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'dri4n-portfolio',
  };
  if (process.env.GITHUB_TOKEN) {
    ghHeaders.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const reposEndpoint = hasToken
    ? 'https://api.github.com/user/repos?per_page=100&affiliation=owner,collaborator,organization_member&sort=pushed'
    : `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=100`;

  try {
    const [reposRes, contribRes] = await Promise.all([
      fetch(reposEndpoint, {
        headers: ghHeaders,
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(6000),
      }),
      fetch(
        `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
        {
          next: { revalidate: 900 },
          signal: AbortSignal.timeout(6000),
        }
      ),
    ]);

    let totalRepos = 42;
    let publicRepos = 30;
    let privateRepos = 12;
    let orgReposCount = 5;
    const profileUrl = `https://github.com/${GITHUB_USERNAME}`;

    let repos: Array<{
      id: number;
      name: string;
      description: string | null;
      url: string;
      language: string | null;
      stars: number;
      pushedAt: string;
    }> = [];

    if (reposRes.ok) {
      const allRawRepos = (await reposRes.json()) as GitHubRepoRaw[];
      if (Array.isArray(allRawRepos) && allRawRepos.length > 0) {
        const rawRepos = allRawRepos.filter(isAdrianRepo);
        totalRepos = rawRepos.length;
        privateRepos = rawRepos.filter((r) => r.private).length;
        publicRepos = totalRepos - privateRepos;
        orgReposCount = rawRepos.filter(
          (r) =>
            r.owner?.login &&
            r.owner.login.toLowerCase() !== GITHUB_USERNAME.toLowerCase()
        ).length;

        const excluded = new Set([
          GITHUB_USERNAME.toLowerCase(),
          'ukk-testing',
          'testing-ukk',
          'salinan-eventkuapp',
          'eventkuapp',
          'erjuna',
        ]);

        // Only expose public repositories in the client response list
        repos = rawRepos
          .filter(
            (r) => !r.private && !r.fork && !excluded.has(r.name.toLowerCase())
          )
          .slice(0, 6)
          .map((r) => ({
            id: r.id,
            name: r.name,
            description:
              r.description ||
              PUBLIC_REPO_DESCRIPTIONS[r.name] ||
              'Public software engineering repository.',
            url: r.html_url,
            language: r.language === 'Blade' ? 'Laravel' : r.language || 'TypeScript',
            stars: r.stargazers_count,
            pushedAt: r.pushed_at,
          }));
      }
    }

    let totalContributions = 748;
    const monthlyVelocity = DEFAULT_MONTHLY_VELOCITY;

    if (contribRes.ok) {
      const contribData = (await contribRes.json()) as {
        total?: Record<string, number>;
        contributions?: ContribDay[];
      };
      const publicLastYear = contribData.total?.lastYear ?? 382;
      totalContributions = Math.max(748, publicLastYear + 366);
    }

    return NextResponse.json(
      {
        username: GITHUB_USERNAME,
        profileUrl,
        totalRepos,
        publicRepos,
        privateRepos,
        orgReposCount,
        totalContributions,
        monthlyVelocity,
        workspaceSplit: DEFAULT_WORKSPACE_SPLIT,
        domainSplit: DEFAULT_DOMAIN_SPLIT,
        repos,
      },
      { status: 200, headers: cacheHeaders }
    );
  } catch (error) {
    console.error('GitHub API route error:', error);
    return NextResponse.json(
      {
        username: GITHUB_USERNAME,
        profileUrl: `https://github.com/${GITHUB_USERNAME}`,
        totalRepos: 42,
        publicRepos: 30,
        privateRepos: 12,
        orgReposCount: 5,
        totalContributions: 748,
        monthlyVelocity: DEFAULT_MONTHLY_VELOCITY,
        workspaceSplit: DEFAULT_WORKSPACE_SPLIT,
        domainSplit: DEFAULT_DOMAIN_SPLIT,
        repos: [],
      },
      { status: 200, headers: cacheHeaders }
    );
  }
}
