import type { Metadata } from 'next';
import { ART_SITE_URL, PRIMARY_SITE_URL } from '@/lib/sites';

const title = '©Adrian Bahri — Creative Side & Visual Archive';
const description =
  'A curated archive of visual design, documentary photography, editorial print, and motion direction.';

export const metadata: Metadata = {
  metadataBase: new URL(PRIMARY_SITE_URL),
  title: {
    default: title,
    template: '%s | ©Adrian Bahri',
  },
  description,
  keywords: [
    'Adrian',
    'Adrian Bahri',
    'Dri4n',
    'Drian',
    'Adrian Unhas',
    'Adrian Teknik Informatika',
    'Adrian Universitas Hasanuddin',
    'Adrian PK Identitas Unhas',
    'Visual Designer Makassar',
    'Brand Identity',
    'Editorial Print Design',
    'Photography Makassar',
    'Motion Graphics',
  ],
  alternates: {
    canonical: '/art',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: ART_SITE_URL,
    title,
    description,
    siteName: '©Adrian Bahri · Creative Side',
    images: [
      {
        url: '/art/opengraph-image',
        width: 1200,
        height: 630,
        alt: '©Adrian Bahri — Creative Side & Visual Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@adrianbahri',
    images: ['/art/opengraph-image'],
  },
};

export default function ArtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
