export type PrintWorkCategory = 'magazine' | 'infographic' | 'product';
export type PrintFilterKey = 'all' | PrintWorkCategory;

export interface PrintWorkItem {
  id: string;
  title: string;
  category: PrintWorkCategory;
  spec: string;
  year: string;
  narrative: string;
  image: string;
  extraImages: string[];
}

export interface PrintShowcaseConfig {
  sectionLabel: string;
  items: PrintWorkItem[];
}

export const PRINT_CATEGORY_LABELS: Record<PrintFilterKey, string> = {
  all: 'All',
  magazine: 'Magazine',
  infographic: 'Infographic',
  product: 'Product',
};

export const DEFAULT_PRINT_SHOWCASE: PrintShowcaseConfig = {
  sectionLabel: 'Print & Objects',
  items: [
    {
      id: 'print-mag-1',
      title: 'Majalah Identitas Edisi Khusus',
      category: 'magazine',
      spec: 'A4 · 48 PP · OFFSET',
      year: '2026',
      narrative:
        'Full editorial layout and cover art direction for PK Identitas Universitas Hasanuddin print magazine.\n\nBuilt on a 12-column Swiss baseline grid combining long-form campus journalism, documentary photo essays, and stark typographic hierarchy.',
      image:
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85',
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85',
      ],
    },
    {
      id: 'print-info-1',
      title: 'Infografis Cetak SNBP & Akademik',
      category: 'infographic',
      spec: 'A2 POSTER · CMYK',
      year: '2026',
      narrative:
        'Large-format printed data journalism poster translating university admission statistics into clear visual hierarchies for campus exhibition boards.\n\nDesigned for both three-meter readability and close-up inspection of faculty-level charts.',
      image:
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=85',
      ],
    },
    {
      id: 'print-prod-1',
      title: 'Kedai Ayah UQ Packaging System',
      category: 'product',
      spec: 'PACKAGING · SLEEVE & CUP',
      year: '2025',
      narrative:
        'Tactile F&B packaging and printed collateral system for Kedai Ayah UQ in Makassar, covering cup sleeves, takeaway boxes, table menus, and promotional cards.\n\nFocused on cost-efficient 2-color printing with strong shelf and hand-held identity.',
      image:
        'https://images.unsplash.com/photo-1558655146-9f40138edfeb?auto=format&fit=crop&w=1200&q=85',
      extraImages: [
        'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=85',
      ],
    },
    {
      id: 'print-mag-2',
      title: 'Arsip Cetak Jurnalistik Kampus',
      category: 'magazine',
      spec: 'B5 · 36 PP · SADDLE STITCH',
      year: '2025',
      narrative:
        'Compact investigative zine and photo-reportage booklet documenting student movements and campus culture across Makassar.',
      image:
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1200&q=85',
      extraImages: [],
    },
    {
      id: 'print-info-2',
      title: 'Peta Visual & Infografis Pilrek',
      category: 'infographic',
      spec: 'A3 FOLDED · 150 GSM',
      year: '2026',
      narrative:
        'Foldable printed infographic guide detailing election stages, candidate track records, and institutional timelines in a clean editorial foldout.',
      image:
        'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1200&q=85',
      extraImages: [],
    },
    {
      id: 'print-prod-2',
      title: 'Merchandise & Event Print Kit',
      category: 'product',
      spec: 'LANYARD · ID CARD · TOTE',
      year: '2025',
      narrative:
        'Complete physical event kit including press passes, woven lanyards, screen-printed tote bags, and stage backdrops unified under one industrial grid.',
      image:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
      extraImages: [],
    },
  ],
};

export function parsePrintShowcase(
  rawJson: string | undefined | null
): PrintShowcaseConfig {
  if (!rawJson) return DEFAULT_PRINT_SHOWCASE;
  try {
    const parsed = JSON.parse(rawJson);
    if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
      return {
        sectionLabel:
          String(parsed.sectionLabel || '').trim() ||
          DEFAULT_PRINT_SHOWCASE.sectionLabel,
        items: parsed.items,
      };
    }
  } catch {
    // fallback to defaults
  }
  return DEFAULT_PRINT_SHOWCASE;
}
