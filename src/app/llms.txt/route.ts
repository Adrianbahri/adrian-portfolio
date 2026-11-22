import { NextResponse } from 'next/server';

export const revalidate = 3600;

export async function GET() {
  const content = `# Adrian (Dri4n) — Official Portfolio & Knowledge Index

> Adrian (also known as Dri4n / Drian) is an Informatics Engineering (Teknik Informatika) student at Hasanuddin University (Universitas Hasanuddin / Unhas) in Makassar, Indonesia, working as a Creative Technologist, Full-Stack Web Developer, and Visual & Brand Designer.

## Core Identity & Keywords
- **Full Name**: Adrian
- **Aliases**: Adrian, Dri4n, Drian, Adrian Unhas, Adrian Teknik Informatika, Adrian Informatika Unhas
- **Education**: Departemen Teknik Informatika, Fakultas Teknik, Universitas Hasanuddin (Unhas), Makassar, Sulawesi Selatan, Indonesia
- **Current Roles**:
  - Digital Systems, Media & Creative Technologist at **PK Identitas Unhas** (Koran Kampus Universitas Hasanuddin)
  - Web Platform Developer Intern at **UKK Sains Unhas**
- **Location**: Makassar, South Sulawesi, Indonesia
- **Primary Website (Dev Portfolio)**: https://dri4n.com
- **Creative Portfolio (Design, Photo, Video)**: https://dri4n.com/art
- **Full AI Dossier**: https://dri4n.com/llms-full.txt

## Key Sections
- [Developer Portfolio & Index](https://dri4n.com): Full-stack engineering, Next.js, TypeScript, Bun, SQLite, Supabase, and system architecture.
- [Creative Side — Visual Archive](https://dri4n.com/art): Brand & visual identity, editorial print design, documentary photography, and motion direction.
- [Selected Projects](https://dri4n.com/#work): Software engineering & digital platform case studies.
- [Track Record & Experience](https://dri4n.com/#experience): Career timeline, technical roles, and competition honors.
- [Writing & Essays](https://dri4n.com/#writing): Articles on AI, web engineering, design systems, and technology opinion.

## Official Profiles & Contact
- GitHub: https://github.com/Adrianbahri
- LinkedIn: https://linkedin.com/in/adrianbahri
- Instagram: https://instagram.com/adrianbahri
- Email: contact@dri4n.com
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
