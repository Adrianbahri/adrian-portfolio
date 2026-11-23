export type MediaPlatformKey = 'youtube' | 'tiktok';

export interface MediaMetricItem {
  label: string;
  value: string;
  note: string;
}

export interface MediaChartPoint {
  label: string;
  value: number; // 0-100 relative height or raw count
  display: string;
}

export interface MediaScreenshotItem {
  id: string;
  url: string;
  caption: string;
}

export interface MediaPlatformShowcase {
  key: MediaPlatformKey;
  label: string;
  handle: string;
  channelUrl: string;
  mediaUrl: string;
  title: string;
  subtitle: string;
  description: string;
  metrics: MediaMetricItem[];
  chartTitle: string;
  chartUnit: string;
  chartData: MediaChartPoint[];
  screenshots: MediaScreenshotItem[];
}

export function isVideoMediaUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  const clean = url.split('?')[0].toLowerCase();
  return (
    clean.endsWith('.mp4') ||
    clean.endsWith('.webm') ||
    clean.endsWith('.mov') ||
    clean.endsWith('.m4v')
  );
}

export interface MediaShowcaseConfig {
  sectionLabel: string;
  platforms: Record<MediaPlatformKey, MediaPlatformShowcase>;
}

export const DEFAULT_MEDIA_SHOWCASE: MediaShowcaseConfig = {
  sectionLabel: 'Media Prod',
  platforms: {
    tiktok: {
      key: 'tiktok',
      label: 'Tiktok',
      handle: '@sulawesipos',
      channelUrl: 'https://www.tiktok.com/@sulawesipos',
      mediaUrl:
        'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=85',
      title: 'SulawesiPos',
      subtitle: 'Media Production & Content Producer',
      description:
        'Produced and scaled digital news content for SulawesiPos.com (Jawa Pos Group), turning daily regional reporting into high-retention short-form and long-form video across TikTok and YouTube.',
      metrics: [
        { label: 'Total Views', value: '134.8M', note: '' },
        { label: 'Followers', value: '100.8K+', note: '' },
        { label: 'Interactions', value: '5.34M', note: '' },
        { label: 'Daily Output', value: '7+ / day', note: '' },
        { label: 'Avg Daily Views', value: '593K+', note: '' },
        { label: 'Highest Video', value: '8.14M', note: '' },
      ],
      chartTitle: 'MONTHLY PLAYS INDEX (TIKTOK)',
      chartUnit: 'PLAYS',
      chartData: [
        { label: 'APR', value: 12, display: '3.6M' },
        { label: 'MAY', value: 11, display: '3.4M' },
        { label: 'SEP', value: 49, display: '20.8M' },
        { label: 'OCT', value: 78, display: '33.1M' },
        { label: 'NOV', value: 100, display: '42.4M' },
      ],
      screenshots: [
        {
          id: 'tt-1',
          url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=85',
          caption: 'TikTok Feed & Rapid News Hooks',
        },
      ],
    },
    youtube: {
      key: 'youtube',
      label: 'Youtube',
      handle: '@sulawesiposcom',
      channelUrl: 'https://www.youtube.com/@sulawesiposcom',
      mediaUrl:
        'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=85',
      title: 'SulawesiPos',
      subtitle: 'Media Production & Content Producer',
      description:
        'Produced and scaled digital news content for SulawesiPos.com (Jawa Pos Group), turning daily regional reporting into high-retention short-form and long-form video across TikTok and YouTube.',
      metrics: [
        { label: 'Total Views', value: '7.49M', note: '' },
        { label: 'Subscribers', value: '+14.2K', note: '' },
        { label: 'Watch Time', value: '105.6K hrs', note: '' },
        { label: 'Daily Output', value: '7+ / day', note: '' },
        { label: 'Avg Daily Views', value: '22.9K', note: '' },
        { label: 'Highest Video', value: '759.5K', note: '' },
      ],
      chartTitle: 'MONTHLY REACH INDEX (YOUTUBE)',
      chartUnit: 'VIEWS',
      chartData: [
        { label: 'JAN', value: 38, display: '991K' },
        { label: 'FEB', value: 27, display: '719K' },
        { label: 'APR', value: 18, display: '482K' },
        { label: 'SEP', value: 24, display: '625K' },
        { label: 'OCT', value: 52, display: '1.35M' },
        { label: 'NOV', value: 100, display: '2.61M' },
      ],
      screenshots: [
        {
          id: 'yt-1',
          url: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?auto=format&fit=crop&w=1200&q=85',
          caption: 'YouTube Channel & Breaking News Packaging',
        },
      ],
    },
  },
};

export type OrgBrandingKey = 'arjuna' | 'kknt';

export interface OrgBrandingAccount {
  key: OrgBrandingKey;
  tabLabel: string;
  handle: string;
  leftDescription: string;
  rightStatement?: string;
  mediaUrl: string;
  instagramUrl: string;
}

export interface OrgBrandingConfig {
  rightStatement: string;
  accounts: Record<OrgBrandingKey, OrgBrandingAccount>;
}

export const DEFAULT_ORG_BRANDING: OrgBrandingConfig = {
  rightStatement:
    "I don't just create content. It's about complete branding: iconography, color systems, visual elements, layout direction, video pacing, and color grading.",
  accounts: {
    arjuna: {
      key: 'arjuna',
      tabLabel: 'Arjuna UH',
      handle: 'arjuna.uh',
      leftDescription:
        'Built the end-to-end visual identity and Instagram system for arjuna.uh. Established a cohesive design language across feeds, reels, typography, and motion graphics so every post feels unmistakably part of one brand.',
      mediaUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
      instagramUrl: 'https://www.instagram.com/arjuna.uh',
    },
    kknt: {
      key: 'kknt',
      tabLabel: 'KKNT Assamaturu',
      handle: 'kknt.assamaturu',
      leftDescription:
        'Directed the visual branding, documentary reels, and Instagram grid identity for KKNT Assamaturu Universitas Hasanuddin. Unified field photography, custom graphic elements, and consistent color grading across the entire community program.',
      mediaUrl:
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=85',
      instagramUrl: 'https://www.instagram.com/kknt.assamaturu',
    },
  },
};

export function parseOrgBranding(
  rawJson: string | undefined | null
): OrgBrandingConfig {
  if (!rawJson) return DEFAULT_ORG_BRANDING;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && typeof parsed === 'object') {
      if (parsed.accounts && parsed.accounts.arjuna && parsed.accounts.kknt) {
        return {
          rightStatement:
            String(parsed.rightStatement || '').trim() ||
            DEFAULT_ORG_BRANDING.rightStatement,
          accounts: {
            arjuna: {
              ...DEFAULT_ORG_BRANDING.accounts.arjuna,
              ...parsed.accounts.arjuna,
            },
            kknt: {
              ...DEFAULT_ORG_BRANDING.accounts.kknt,
              ...parsed.accounts.kknt,
            },
          },
        };
      }
      // Backward compatibility if single-account format was saved earlier
      return {
        rightStatement:
          String(parsed.rightStatement || '').trim() ||
          DEFAULT_ORG_BRANDING.rightStatement,
        accounts: {
          arjuna: {
            ...DEFAULT_ORG_BRANDING.accounts.arjuna,
            handle:
              String(parsed.handle || '').trim() ||
              DEFAULT_ORG_BRANDING.accounts.arjuna.handle,
            leftDescription:
              String(parsed.leftDescription || '').trim() ||
              DEFAULT_ORG_BRANDING.accounts.arjuna.leftDescription,
            mediaUrl:
              String(parsed.mediaUrl || '').trim() ||
              DEFAULT_ORG_BRANDING.accounts.arjuna.mediaUrl,
            instagramUrl:
              String(parsed.instagramUrl || '').trim() ||
              DEFAULT_ORG_BRANDING.accounts.arjuna.instagramUrl,
          },
          kknt: DEFAULT_ORG_BRANDING.accounts.kknt,
        },
      };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_ORG_BRANDING;
}

export function parseMediaShowcase(
  rawJson: string | undefined | null
): MediaShowcaseConfig {
  if (!rawJson) return DEFAULT_MEDIA_SHOWCASE;
  try {
    const parsed = JSON.parse(rawJson);
    if (
      parsed &&
      parsed.platforms &&
      parsed.platforms.youtube &&
      parsed.platforms.tiktok
    ) {
      return {
        sectionLabel:
          String(parsed.sectionLabel || '').trim() ||
          DEFAULT_MEDIA_SHOWCASE.sectionLabel,
        platforms: {
          youtube: {
            ...DEFAULT_MEDIA_SHOWCASE.platforms.youtube,
            ...parsed.platforms.youtube,
          },
          tiktok: {
            ...DEFAULT_MEDIA_SHOWCASE.platforms.tiktok,
            ...parsed.platforms.tiktok,
          },
        },
      };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_MEDIA_SHOWCASE;
}
