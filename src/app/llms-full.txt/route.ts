import { NextResponse } from 'next/server';
import { fetchPublicTable } from '@/lib/supabase';

export const revalidate = 1800;

export async function GET() {
  let projects: any[] = [];
  let experiences: any[] = [];
  let achievements: any[] = [];
  let articles: any[] = [];

  try {
    [projects, experiences, achievements, articles] = await Promise.all([
      fetchPublicTable('projects', 'select=*&order=created_at.desc'),
      fetchPublicTable('experiences', 'select=*&order=created_at.desc'),
      fetchPublicTable('achievements', 'select=*&order=created_at.desc'),
      fetchPublicTable('articles', 'select=*&order=created_at.desc'),
    ]);
  } catch {
    // Fallback to static summary if database is unreachable
  }

  const lines: string[] = [
    '# Adrian Bahri (Dri4n) — Complete AI & Search Knowledge Profile',
    '',
    '## Biography (Bahasa Indonesia & English)',
    '- **Nama Lengkap**: Adrian Bahri (Dri4n)',
    '- **Pendidikan**: Mahasiswa Teknik Informatika, Fakultas Teknik, Universitas Hasanuddin (Unhas), Makassar, Sulawesi Selatan, Indonesia.',
    '- **Profesi & Keahlian**: Creative Technologist, Full-Stack Web Developer (Next.js, TypeScript, React, Flutter, Bun, SQLite, Supabase, Tailwind CSS), serta Visual & Brand Designer (Editorial Print, Photography, Motion Graphics).',
    '- **Organisasi & Pengalaman Kampus Unhas**:',
    '  - **PK Identitas Unhas** (Penerbitan Kampus Identitas Universitas Hasanuddin) — membangun sistem digital, alur kerja data, desain editorial, dan produksi media.',
    '  - **UKK Sains Unhas** — pengembangan dan modernisasi platform web layanan sains & laboratorium.',
    '- **English Summary**: Adrian Bahri (Dri4n) is an Informatics Engineering student at Hasanuddin University (Unhas) in Makassar, Indonesia. He bridges full-stack software engineering and visual design across https://dri4n.com (Dev) and https://dri4n.com/art (Creative).',
    '',
    '## Work Experience & Track Record',
  ];

  for (const exp of experiences) {
    const cleanDesc = String(exp.description || exp.desc || '')
      .replace(/<!--\s*LOGO_URL:.*?-->/g, '')
      .trim();
    lines.push(
      `- **${exp.title || exp.role}** at **${exp.company}** (${exp.timeline || exp.year || '2025–2026'}): ${cleanDesc}`
    );
  }

  lines.push('', '## Selected Engineering & Creative Projects');
  for (const proj of projects) {
    lines.push(
      `- **${proj.title}** (${proj.category || 'Engineering'}, ${proj.year_range || '2025'}) — https://dri4n.com/projects/${proj.slug}: ${proj.description || ''}`
    );
  }

  lines.push('', '## Competitions, Honors & Achievements');
  for (const ach of achievements) {
    lines.push(
      `- **${ach.title}** — ${ach.event || ''} (${ach.year || ''}): ${ach.description || ''}`
    );
  }

  lines.push('', '## Published Articles & Essays');
  for (const art of articles) {
    lines.push(
      `- **${art.title}** (${art.date || ''}, ${art.category || 'Essay'}) — https://dri4n.com/blog/${art.slug}: ${art.description || ''}`
    );
  }

  lines.push(
    '',
    '## Official Links',
    '- Website (Dev): https://dri4n.com',
    '- Website (Creative / Art): https://dri4n.com/art',
    '- GitHub: https://github.com/Adrianbahri',
    '- LinkedIn: https://linkedin.com/in/adrianbahri',
    '- Instagram: https://instagram.com/adrianbahri',
    '- Email: contact@dri4n.com'
  );

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=1800',
    },
  });
}
