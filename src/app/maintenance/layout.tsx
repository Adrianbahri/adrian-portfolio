import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Under Maintenance',
  description:
    'dri4n.com is currently undergoing scheduled maintenance and a visual upgrade. We will be back online shortly.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
