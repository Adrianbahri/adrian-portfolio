export interface GalleryPhotoMeta {
  title: string;
  tags: string[];
  narrative: string;
  images: string[];
  isMock: boolean;
}

const META_PREFIX = '__GALLERY_META__:';

export const MOCK_PHOTO_STORIES: Array<{
  title: string;
  tags: string[];
  narrative: string;
}> = [
  {
    title: 'Makassar Golden Hour Study',
    tags: ['PHOTOGRAPHY', 'DOCUMENTARY'],
    narrative:
      'Captured during late afternoon along the waterfront in Makassar, this frame explores the quiet tension between harsh coastal sunlight and elongated architectural shadows.\n\nThe composition focuses on unhurried human rhythm against raw concrete surfaces, preserving natural grain and tonal depth without heavy post-processing.',
  },
  {
    title: 'Concrete & Quiet Motion',
    tags: ['STREET', 'STUDY'],
    narrative:
      'An observational street study shot on a fast prime lens to isolate fleeting movement inside a rigid geometric environment.\n\nBy leaning into high-contrast shadows and restrained negative space, the frame turns an everyday transit moment into a still, graphic composition.',
  },
  {
    title: 'Campus Editorial Archive',
    tags: ['EDITORIAL', 'ARCHIVE'],
    narrative:
      'Documented during an editorial assignment in Makassar, focusing on candid gestures, natural window light, and authentic atmosphere behind the scenes.\n\nThe visual approach prioritizes honesty over polish, letting subtle imperfections and raw ambient lighting carry the story.',
  },
  {
    title: 'Nocturne Transit Frame',
    tags: ['NIGHT', 'PHOTOGRAPHY'],
    narrative:
      'Shot after dusk under mixed sodium and fluorescent street lamps, studying how artificial light carves texture out of damp asphalt and steel.\n\nExposed slightly under to protect highlights, the image balances deep obsidian blacks with warm industrial accents.',
  },
  {
    title: 'Monochrome Form & Scale',
    tags: ['ARCHITECTURE', 'STUDY'],
    narrative:
      'A study of vertical proportion, repeating lines, and structural rhythm observed across modern urban facades.\n\nStripping away distraction brings attention to light falloff, sharp edges, and the quiet discipline of industrial design.',
  },
  {
    title: 'Stillness Between Frames',
    tags: ['STILL LIFE', 'ARCHIVE'],
    narrative:
      'An intimate still-life frame built around tactile everyday objects, directional side light, and deliberate negative space.\n\nDesigned as part of a personal visual diary exploring patience, framing discipline, and understated color harmony.',
  },
];

export function encodeGalleryMeta(meta: {
  title: string;
  tags: string[];
  narrative: string;
  images?: string[];
}): string {
  const cleanImages = Array.isArray(meta.images)
    ? meta.images.map((u) => u.trim()).filter(Boolean)
    : [];

  return `${META_PREFIX}${JSON.stringify({
    title: meta.title.trim(),
    tags: meta.tags
      .map((t) => t.trim().toUpperCase())
      .filter(Boolean)
      .slice(0, 4),
    narrative: meta.narrative.trim(),
    images: cleanImages,
  })}`;
}

export function parseGalleryMeta(
  rawTitle: string | null | undefined,
  rawCaption: string | null | undefined,
  index: number
): GalleryPhotoMeta {
  const captionStr = String(rawCaption || '').trim();
  const titleStr = String(rawTitle || '').trim();

  if (captionStr.startsWith(META_PREFIX)) {
    try {
      const parsed = JSON.parse(captionStr.slice(META_PREFIX.length));
      const parsedTitle = String(parsed?.title || '').trim();
      const parsedNarrative = String(parsed?.narrative || '').trim();
      const parsedTags = Array.isArray(parsed?.tags)
        ? parsed.tags
            .map((t: unknown) => String(t).trim().toUpperCase())
            .filter(Boolean)
        : [];
      const parsedImages = Array.isArray(parsed?.images)
        ? parsed.images
            .map((u: unknown) => String(u).trim())
            .filter(Boolean)
        : [];

      if (parsedTitle || parsedNarrative || parsedImages.length > 0) {
        return {
          title: parsedTitle || `Frame ${String(index + 1).padStart(2, '0')}`,
          tags: parsedTags.length > 0 ? parsedTags : ['PHOTOGRAPHY'],
          narrative: parsedNarrative,
          images: parsedImages,
          isMock: false,
        };
      }
    } catch {
      // fall through to plain text / mock fallback
    }
  }

  if (titleStr || captionStr) {
    const fallbackMock = MOCK_PHOTO_STORIES[index % MOCK_PHOTO_STORIES.length];
    return {
      title: titleStr || captionStr,
      tags: ['PHOTOGRAPHY', 'ARCHIVE'],
      narrative:
        captionStr && captionStr !== titleStr
          ? captionStr
          : fallbackMock.narrative,
      images: [],
      isMock: !(captionStr && captionStr !== titleStr),
    };
  }

  const mock = MOCK_PHOTO_STORIES[index % MOCK_PHOTO_STORIES.length];
  return {
    title: mock.title,
    tags: mock.tags,
    narrative: mock.narrative,
    images: [],
    isMock: true,
  };
}
