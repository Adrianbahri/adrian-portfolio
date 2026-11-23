export interface ArtAboutExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  description?: string | null;
}

export interface ArtAboutConnectLink {
  id: string;
  label: string;
  platform: string;
  url: string;
}

export interface ArtAboutConfig {
  bioPrimary: string;
  bioSecondary: string;
  experiences: ArtAboutExperienceItem[];
  skills: string[];
  tools: string[];
  email: string;
  links: ArtAboutConnectLink[];
  footerLocation: string;
}

export const DEFAULT_ART_ABOUT_EXPERIENCES: ArtAboutExperienceItem[] = [
  {
    id: 'exp-sp',
    company: 'SULAWESIPOS.COM (JAWA POS GROUP)',
    role: 'MEDIA PRODUCTION & CONTENT PRODUCER',
    period: '2026 - NOW',
    description:
      'DAILY DIGITAL VIDEO PRODUCTION, SHORT-FORM NEWS PACKAGING, AND AUDIENCE GROWTH ACROSS TIKTOK AND YOUTUBE.',
  },
  {
    id: 'exp-id',
    company: 'PK IDENTITAS UNHAS',
    role: 'RESEARCH, DATA & VISUAL EDITORIAL',
    period: '2025 - NOW',
    description:
      'DATA JOURNALISM INFOGRAPHICS, PRINT MAGAZINE LAYOUTS, CAMPUS DOCUMENTARIES, AND DIGITAL PUBLISHING SYSTEMS.',
  },
];

export const DEFAULT_ART_ABOUT: ArtAboutConfig = {
  bioPrimary:
    "I'M ADRIAN (DRI4N), A CREATIVE TECHNOLOGIST & VISUAL DESIGNER BASED IN MAKASSAR, INDONESIA. MY WORK IS ROOTED IN BRANDING, EDITORIAL LAYOUTS, MOTION DIRECTION, AND DIGITAL SYSTEMS WITH A FOCUS ON TRANSLATING IDEAS INTO CLEAR FORM.",
  bioSecondary:
    'ALONGSIDE ENGINEERING FULL-STACK PLATFORMS, I MAINTAIN AN INDEPENDENT VISUAL PRACTICE DRIVEN BY CURIOSITY: EXPLORING PRINT, FILM, PHOTOGRAPHY, SOCIAL GROWTH, AND GRAPHIC IDENTITY.',
  experiences: DEFAULT_ART_ABOUT_EXPERIENCES,
  skills: [
    'CREATIVE DIRECTION',
    'BRAND & VISUAL IDENTITY',
    'EDITORIAL, PRINT & INFOGRAPHIC DESIGN',
    'MOTION & VIDEO EDITING',
    'PHOTOGRAPHY & COLOR GRADING',
    'SOCIAL MEDIA GROWTH & CONTENT SYSTEMS',
  ],
  tools: [
    'FIGMA · PHOTOSHOP · ILLUSTRATOR · INDESIGN',
    'PREMIERE PRO · AFTER EFFECTS · DAVINCI RESOLVE · LIGHTROOM',
  ],
  email: 'adrianbahri87@gmail.com',
  links: [
    {
      id: 'link-ig',
      label: '@ADRIANBAHRI',
      platform: 'INSTAGRAM',
      url: 'https://www.instagram.com/adrianbahri',
    },
    {
      id: 'link-li',
      label: 'ADRIAN',
      platform: 'LINKEDIN',
      url: 'https://www.linkedin.com/in/adrianbahri',
    },
    {
      id: 'link-gh',
      label: 'ADRIANBAHRI',
      platform: 'GITHUB',
      url: 'https://github.com/Adrianbahri',
    },
  ],
  footerLocation: 'MAKASSAR, ID · CREATIVE ARCHIVE',
};

export function parseArtAboutConfig(
  rawJson: string | undefined | null,
  fallbackSettings?: Record<string, string>,
  fallbackExperiences?: ArtAboutExperienceItem[]
): ArtAboutConfig {
  const defaultWithFallbacks: ArtAboutConfig = {
    ...DEFAULT_ART_ABOUT,
    experiences:
      fallbackExperiences && fallbackExperiences.length > 0
        ? fallbackExperiences
        : DEFAULT_ART_ABOUT.experiences,
    email: fallbackSettings?.email_address || DEFAULT_ART_ABOUT.email,
    links: [
      {
        id: 'link-ig',
        label: '@ADRIANBAHRI',
        platform: 'INSTAGRAM',
        url:
          fallbackSettings?.instagram_url ||
          'https://www.instagram.com/adrianbahri',
      },
      {
        id: 'link-li',
        label: 'ADRIAN',
        platform: 'LINKEDIN',
        url:
          fallbackSettings?.linkedin_url ||
          'https://www.linkedin.com/in/adrianbahri',
      },
      {
        id: 'link-gh',
        label: 'ADRIANBAHRI',
        platform: 'GITHUB',
        url: fallbackSettings?.github_url || 'https://github.com/Adrianbahri',
      },
    ],
  };

  if (!rawJson) return defaultWithFallbacks;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && typeof parsed === 'object') {
      return {
        bioPrimary:
          String(parsed.bioPrimary || '').trim() ||
          defaultWithFallbacks.bioPrimary,
        bioSecondary:
          String(parsed.bioSecondary || '').trim() ||
          defaultWithFallbacks.bioSecondary,
        experiences:
          Array.isArray(parsed.experiences) && parsed.experiences.length > 0
            ? parsed.experiences
            : defaultWithFallbacks.experiences,
        skills:
          Array.isArray(parsed.skills) && parsed.skills.length > 0
            ? parsed.skills
            : defaultWithFallbacks.skills,
        tools:
          Array.isArray(parsed.tools) && parsed.tools.length > 0
            ? parsed.tools
            : defaultWithFallbacks.tools,
        email:
          String(parsed.email || '').trim() || defaultWithFallbacks.email,
        links:
          Array.isArray(parsed.links) && parsed.links.length > 0
            ? parsed.links
            : defaultWithFallbacks.links,
        footerLocation:
          String(parsed.footerLocation || '').trim() ||
          defaultWithFallbacks.footerLocation,
      };
    }
  } catch {
    // fallback to defaults
  }
  return defaultWithFallbacks;
}
