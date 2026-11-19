import type { Metadata } from 'next';
import { ART_SITE_URL, PRIMARY_SITE_URL } from '@/lib/sites';

const title = '©Adrian Bahri — Creative Archive & Visual Work';
const description =
  'A collection of visual design, video, and photography by Adrian Bahri (Dri4n).';

export const metadata: Metadata = {
  metadataBase: new URL(PRIMARY_SITE_URL),
  title: {
    default: title,
    template: '%s | Dri4n Art',
  },
  description,
  alternates: {
    canonical: '/art',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: ART_SITE_URL,
    title,
    description,
    siteName: '©Adrian Bahri',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: '©Adrian Bahri — Creative Archive',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    creator: '@adrianbahri',
    images: ['/opengraph-image'],
  },
};

export default function ArtLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
