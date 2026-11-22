import React, { SVGProps } from 'react';

// Helper component that is ALWAYS monochrome/white, even without hover
const RemoteIcon = ({ url }: { url: string }) => (
  <div 
    style={{ 
      maskImage: `url(${url})`, 
      WebkitMaskImage: `url(${url})`,
      maskSize: 'contain',
      WebkitMaskSize: 'contain',
      maskRepeat: 'no-repeat',
      WebkitMaskRepeat: 'no-repeat',
      maskPosition: 'center',
      WebkitMaskPosition: 'center'
    }}
    className="w-7 h-7 sm:w-8 sm:h-8 bg-current opacity-70 dark:opacity-60 group-hover:opacity-100 transition-all duration-300"
  />
);

// --- High-fidelity Components ---

const IllustratorIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 32 31" fill="none" className="w-full h-full">
    <g clipPath="url(#ai_clip)">
      <path d="M5.65714 0H26.3429C29.4857 0 32 2.51429 32 5.65714V25.2C32 28.3429 29.4857 30.8571 26.3429 30.8571H5.65714C2.51429 30.8571 0 28.3429 0 25.2V5.65714C0 2.51429 2.51429 0 5.65714 0Z" fill="currentColor"/>
      <path d="M15.4858 18.2857H10.6286L9.65719 21.5428C9.65719 21.6571 9.54291 21.7143 9.42862 21.7143H6.97148C6.85719 21.7143 6.80005 21.6571 6.80005 21.4857L11.0286 9.31427C11.0858 9.19998 11.0858 9.02856 11.1429 8.85713C11.2 8.62856 11.2572 8.39998 11.2 8.11427C11.2 8.05713 11.2572 7.99998 11.3143 7.94284C11.3143 7.94284 11.3143 7.94284 11.3715 7.94284H14.7429C14.8572 7.94284 14.9143 7.99998 14.9143 8.05713L19.7143 21.4286C19.7715 21.5428 19.7143 21.6571 19.6 21.6571H16.8572C16.7429 21.6571 16.6858 21.6 16.6286 21.4857L15.4858 18.2857ZM11.3715 16H14.9715C14.9143 15.7143 14.5715 15.0857 14.4572 14.7428C14.3429 14.4 14.1715 14.1143 14.0572 13.7143C13.9429 13.3143 13.8286 12.9143 13.6572 12.5143C13.5429 12.1143 13.4286 11.7143 13.3143 11.3714C13.2 10.9714 13.0858 10.6286 13.0286 10.3428C12.9143 10.9143 12.7429 11.4857 12.5715 12.0571C12.4 12.6857 12.1715 13.3143 11.9429 14C11.7715 14.5714 11.5429 15.4286 11.3715 16Z" fill="var(--color-canvas)"/>
      <path d="M22.5143 10.1143C22.0572 10.1143 21.6572 9.94285 21.3715 9.65713C21.0858 9.31427 20.9143 8.91427 20.9143 8.45713C20.9143 7.99999 21.0858 7.59999 21.3715 7.25713C21.7143 6.97142 22.1143 6.79999 22.5715 6.79999C23.0286 6.79999 23.4286 6.91427 23.7715 7.25713C24.0572 7.59999 24.2286 7.99999 24.2286 8.45713C24.2286 8.91427 24.0572 9.31427 23.7715 9.65713C23.4286 9.94285 22.9715 10.1143 22.5143 10.1143ZM21.1429 21.4286V11.7143C21.1429 11.6 21.2001 11.5428 21.3143 11.5428H23.7143C23.8286 11.5428 23.8858 11.6 23.8858 11.7143V21.3714C23.8858 21.4857 23.8286 21.6 23.7143 21.6H21.3143C21.2001 21.6 21.1429 21.5428 21.1429 21.4286Z" fill="var(--color-canvas)"/>
    </g>
    <defs><clipPath id="ai_clip"><rect width="32" height="30.8571" fill="white"/></clipPath></defs>
  </svg>
);

const LightroomIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 32 32" fill="none" className="w-full h-full">
    <g clipPath="url(#lr_clip)">
      <path d="M26.3333 0H5.66667C2.53705 0 0 2.53705 0 5.66667V25.5333C0 28.6629 2.53705 31.2 5.66667 31.2H26.3333C29.4629 31.2 32 28.6629 32 25.5333V5.66667C32 2.53705 29.4629 0 26.3333 0Z" fill="currentColor"/>
      <path d="M11.2256 22.0511H3.61352C3.48467 22.0511 3.42028 21.9724 3.42033 21.815V8.18362C3.42033 8.05484 3.4783 7.99044 3.59424 7.99042H5.95129C6.04123 7.99042 6.08652 8.04074 6.08652 8.14071V19.3463H11.6314C11.7473 19.3463 11.7923 19.4107 11.7666 19.5395L11.4188 21.8579C11.4058 21.9438 11.3801 21.9974 11.3416 22.0189C11.3063 22.0394 11.2664 22.0505 11.2256 22.0511Z" fill="var(--color-canvas)"/>
      <path d="M13.1382 11.3822H15.2441C15.36 11.3822 15.4437 11.4537 15.4952 11.5968C15.5415 11.6919 15.5741 11.7931 15.5918 11.8974C15.6188 12.0357 15.6382 12.1755 15.6498 12.316C15.6625 12.4662 15.6689 12.6272 15.6691 12.7989C16.0219 12.3393 16.4577 11.9497 16.9539 11.6505C17.492 11.3239 18.1116 11.1565 18.741 11.1675C18.8569 11.1675 18.9149 11.2319 18.9149 11.3607V13.9582C18.9149 14.0585 18.8505 14.1086 18.7217 14.1084C18.2974 14.0778 17.8709 14.1104 17.4562 14.2051C17.1083 14.2822 16.771 14.4011 16.4516 14.5593C16.205 14.679 15.985 14.8468 15.8044 15.053V21.8579C15.8044 21.9867 15.7528 22.0511 15.6498 22.0511H13.3121C13.1832 22.0511 13.1188 21.9796 13.1189 21.8364V14.4519C13.1189 14.1373 13.1157 13.8045 13.1092 13.4537C13.1026 13.1032 13.0929 12.7561 13.0802 12.4126C13.0717 12.1179 13.0459 11.8241 13.003 11.5324C12.9987 11.4909 13.0089 11.4492 13.0319 11.4144C13.0465 11.402 13.0634 11.3928 13.0817 11.3872C13.1 11.3817 13.1192 11.38 13.1382 11.3822Z" fill="var(--color-canvas)"/>
      <path d="M28.3496 9.41347C28.0643 9.29824 27.7648 9.22176 27.4592 9.18606C27.0083 9.12931 26.5541 9.10319 26.0996 9.1079C24.7919 9.1079 23.6479 9.38821 22.6995 9.94104C21.7542 10.4904 20.9877 11.3012 20.4922 12.2758C19.9782 13.2687 19.7175 14.4359 19.7175 15.7451C19.7074 16.536 19.808 17.3244 20.0163 18.0874C20.1969 18.7373 20.4831 19.3531 20.8634 19.9101C21.2196 20.4242 21.6621 20.8727 22.1714 21.2356C22.684 21.5982 23.2547 21.8705 23.8589 22.0407C24.4919 22.2186 25.1466 22.3075 25.8041 22.3049C26.2645 22.3068 26.7244 22.2774 27.1808 22.2171C27.5486 22.1739 27.9095 22.0843 28.2549 21.9504C28.3209 21.9198 28.3755 21.8689 28.4106 21.8052C28.4457 21.7414 28.4595 21.6681 28.4499 21.5959V19.607C28.4539 19.5714 28.4499 19.5354 28.4382 19.5015C28.4265 19.4677 28.4074 19.4369 28.3822 19.4114C28.3489 19.3837 28.2782 19.3507 28.1742 19.4304C27.875 19.5426 27.563 19.617 27.2453 19.6517C26.859 19.6923 26.4707 19.7115 26.0823 19.7091C25.7292 19.707 25.3778 19.6594 25.0368 19.5674C24.6818 19.4735 24.3416 19.3305 24.026 19.1427C23.6981 18.9431 23.4119 18.6821 23.1829 18.374C22.9238 18.0265 22.7258 17.6374 22.5977 17.2233C22.447 16.7189 22.3752 16.1941 22.3847 15.6677C22.3668 14.9326 22.5182 14.2031 22.827 13.5357C23.104 12.9596 23.5383 12.4737 24.0798 12.134C24.6688 11.7838 25.3451 11.6079 26.0302 11.6266C26.4499 11.6245 26.8691 11.6596 27.2826 11.7313C27.6171 11.7852 27.9405 11.8933 28.2401 12.0513C28.2659 12.0667 28.2953 12.075 28.3253 12.0752C28.3553 12.0754 28.3848 12.0676 28.4108 12.0525C28.4395 12.0285 28.462 11.9977 28.4761 11.963C28.4903 11.9283 28.4957 11.8906 28.492 11.8533V9.72907C28.4985 9.66855 28.4887 9.60739 28.4637 9.55191C28.4386 9.49643 28.3993 9.44864 28.3496 9.41347Z" fill="var(--color-canvas)"/>
    </g>
    <defs><clipPath id="lr_clip"><rect width="32" height="31.2" fill="white"/></clipPath></defs>
  </svg>
);

const InDesignIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 83 80" fill="none" className="w-full h-full">
    <g clipPath="url(#id_clip)">
      <path d="M67.5214 0H14.5299C6.50526 0 0 6.50526 0 14.5299V65.4701C0 73.4947 6.50526 80 14.5299 80H67.5214C75.546 80 82.0513 73.4947 82.0513 65.4701V14.5299C82.0513 6.50526 75.546 0 67.5214 0Z" fill="currentColor"/>
      <path d="M29.7977 20.9286V55.9908C29.7977 56.3581 29.6326 56.5415 29.3024 56.5413H22.6421C22.3481 56.5413 22.2014 56.3578 22.2019 55.9908V20.9286C22.2019 20.6353 22.367 20.4885 22.6972 20.4882H29.3574C29.4172 20.4797 29.4781 20.4853 29.5355 20.5044C29.5928 20.5235 29.6448 20.5557 29.6875 20.5984C29.7303 20.6412 29.7625 20.6932 29.7816 20.7505C29.8007 20.8078 29.8062 20.8688 29.7977 20.9286Z" fill="var(--color-canvas)"/>
      <path d="M49.5031 57.0919C46.9696 57.1304 44.4594 56.6039 42.1549 55.5506C40.0081 54.5571 38.2135 52.9352 37.0085 50.8995C35.7605 48.8268 35.1366 46.2306 35.137 43.111C35.1162 40.5847 35.7618 38.0977 37.0085 35.9004C38.2926 33.6622 40.1811 31.831 42.4577 30.6163C44.8425 29.2952 47.723 28.6347 51.0993 28.6347C51.2825 28.6439 51.521 28.6439 51.8148 28.6623C52.1081 28.6812 52.4567 28.7087 52.8607 28.7448V17.9014C52.8607 17.6451 52.9708 17.5161 53.191 17.5161H60.1263C60.1711 17.5097 60.2169 17.5138 60.2599 17.5282C60.3029 17.5425 60.3419 17.5666 60.374 17.5986C60.4061 17.6307 60.4302 17.6697 60.4445 17.7127C60.4589 17.7557 60.463 17.8015 60.4566 17.8463V50.3766C60.4566 51.001 60.4841 51.6799 60.5391 52.4132C60.5942 53.1476 60.6401 53.8081 60.6768 54.3947C60.6836 54.509 60.6556 54.6228 60.5967 54.721C60.5378 54.8192 60.4505 54.8973 60.3465 54.9452C58.5573 55.6914 56.6937 56.2449 54.7872 56.5964C53.0441 56.9181 51.2757 57.0839 49.5031 57.0919ZM52.8606 50.2665V35.2399C52.5631 35.1593 52.2594 35.104 51.9525 35.0747C51.5776 35.037 51.2009 35.0187 50.8241 35.0197C49.4884 35.0064 48.1684 35.3081 46.9711 35.9004C45.805 36.48 44.8093 37.3525 44.0814 38.4323C43.3289 39.5332 42.9528 40.9827 42.953 42.7807C42.9262 43.9806 43.1221 45.175 43.5309 46.3034C43.8636 47.2127 44.3894 48.0389 45.0722 48.7253C45.7258 49.3568 46.5172 49.8279 47.3839 50.1014C48.2994 50.3979 49.2563 50.5465 50.2186 50.5417C50.7321 50.5417 51.2009 50.5234 51.6497 50.4867C52.0599 50.4558 52.4658 50.382 52.8606 50.2665Z" fill="var(--color-canvas)"/>
    </g>
    <defs><clipPath id="id_clip"><rect width="82.0513" height="80" fill="white"/></clipPath></defs>
  </svg>
);

const CanvaIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 80 80" fill="none" className="w-full h-full">
    <g clipPath="url(#canva_clip)">
      <path d="M40 80C62.0914 80 80 62.0914 80 40C80 17.9086 62.0914 0 40 0C17.9086 0 0 17.9086 0 40C0 62.0914 17.9086 80 40 80Z" fill="currentColor"/>
      <path d="M57.2691 48.2052C56.939 48.2052 56.6485 48.484 56.3462 49.0928C52.9323 56.0153 47.0358 60.9134 40.2125 60.9134C32.3228 60.9134 27.437 53.7913 27.437 43.9522C27.437 27.2855 36.7232 17.6491 44.8796 17.6491C48.691 17.6491 51.0186 20.0443 51.0186 23.8559C51.0186 28.3796 48.4485 30.7748 48.4485 32.3702C48.4485 33.0864 48.8939 33.5201 49.7773 33.5201C53.3264 33.5201 57.4918 29.4419 57.4918 23.6808C57.4918 18.0947 52.63 13.9888 44.4737 13.9888C30.994 13.9888 19.0142 26.4858 19.0142 43.777C19.0142 57.1614 26.6572 66.0061 38.45 66.0061C50.9668 66.0061 58.2043 53.5526 58.2043 49.5105C58.2043 48.6153 57.7466 48.2052 57.2691 48.2052Z" fill="var(--color-canvas)"/>
    </g>
    <defs><clipPath id="canva_clip"><rect width="80" height="80" fill="white"/></clipPath></defs>
  </svg>
);

const AntigravityIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
    <path d="M12 13V7" />
    <circle cx="12" cy="5" r="1" fill="currentColor" />
  </svg>
);

const CodexIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.9"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6"
  >
    <polygon points="12 2 21 7 21 17 12 22 3 17 3 7 12 2" />
    <polyline points="9.5 9.5 7 12 9.5 14.5" />
    <polyline points="14.5 9.5 17 12 14.5 14.5" />
    <line x1="13" y1="9" x2="11" y2="15" />
  </svg>
);

const SqlIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    {...props}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-6 h-6 opacity-75 group-hover:opacity-100 transition-opacity"
  >
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5" />
    <path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6" />
  </svg>
);

export interface TechProjectRef {
  title: string;
  tag: string;
  href?: string;
}

export type TechCategory =
  | 'ai'
  | 'languages'
  | 'frameworks'
  | 'databases'
  | 'backend';

export interface TechStackItem {
  name: string;
  mode: 'developer' | 'creative';
  category?: TechCategory;
  usage?: number;
  role?: string;
  featured?: boolean;
  projects?: TechProjectRef[];
  icon: () => React.ReactNode;
}

export const techStack: TechStackItem[] = [
  // AI workflow tools
  {
    name: 'Antigravity',
    mode: 'developer',
    category: 'ai',
    usage: 98,
    role: 'AI pair programming & refactoring',
    featured: true,
    projects: [
      { title: 'Dri4n Portfolio (dri4n.com)', tag: 'LIVE', href: '/' },
      { title: 'UKK Unhas UI & API Platform', tag: 'ORG SYSTEM', href: '/projects/ukk-unhas' },
      { title: 'PK Identitas Web & Rekap Analytics', tag: 'ORG SYSTEM' },
      { title: 'Portal Desa Bonto Somba', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/desa-bonto-somba' },
      { title: 'Arsip Digital Tonasa', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Kakaskasen 2 Encyclopedia', tag: 'PUBLIC', href: '/projects/kakaskasen-2' },
    ],
    icon: () => <AntigravityIcon />,
  },
  {
    name: 'Codex',
    mode: 'developer',
    category: 'ai',
    usage: 95,
    role: 'Code generation & test scaffolding',
    featured: true,
    projects: [
      { title: 'Dri4n Portfolio (dri4n.com)', tag: 'LIVE', href: '/' },
      { title: 'UKK Unhas Modular Migration', tag: 'ORG SYSTEM', href: '/projects/ukk-unhas' },
      { title: 'PK Identitas Analytics Dashboard', tag: 'ORG SYSTEM' },
      { title: 'Arsip Digital Tonasa', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Kakaskasen 2 Encyclopedia', tag: 'PUBLIC', href: '/projects/kakaskasen-2' },
    ],
    icon: () => <CodexIcon />,
  },

  // Programming, query, and markup languages
  {
    name: 'TypeScript',
    mode: 'developer',
    category: 'languages',
    usage: 92,
    role: '13 repos · static typing',
    projects: [
      { title: 'Dri4n Portfolio (dri4n.com)', tag: 'NEXT.JS 16', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
      { title: 'PK Identitas Portal & Rekap Analytics', tag: 'NEXT.JS 15/16' },
      { title: 'UKK Unhas UI Monorepo', tag: 'TURBOREPO', href: '/projects/ukk-unhas' },
      { title: 'Arsip Digital Tonasa', tag: 'WEB APP', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Sposmed Drive Cloud Storage', tag: 'FULL-STACK' },
      { title: "Solusi Digitalta' Official Portal", tag: 'ASTRO + TS' },
      { title: 'Kakaskasen 2 Encyclopedia', tag: 'WEB APP', href: '/projects/kakaskasen-2' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/typescript" />,
  },
  {
    name: 'JavaScript',
    mode: 'developer',
    category: 'languages',
    usage: 88,
    role: '27 repos · client & runtime',
    projects: [
      { title: 'PK Identitas Web & PM2 Cluster', tag: 'PRODUCTION' },
      { title: 'Website Profil Desa Waginopo', tag: 'REACT 19', href: 'https://github.com/Adrianbahri/Web-Desa-Waginopo' },
      { title: 'UKK Web Portal', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/UKK' },
      { title: 'Sistem Kelola Data Mahasiswa', tag: 'CRUD APP', href: 'https://github.com/Adrianbahri/Web-Kelola-Data-Mahasiswa' },
      { title: 'Perpustakaan Online', tag: 'WEB APP', href: 'https://github.com/Adrianbahri/Perpustakaan-Online' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/javascript" />,
  },
  {
    name: 'SQL',
    mode: 'developer',
    category: 'languages',
    usage: 85,
    role: 'Raw queries, RLS & PL/pgSQL',
    projects: [
      { title: 'PK Identitas Web & Rekap Analytics (idenweb)', tag: 'RAW SQL / MYSQL' },
      { title: 'Arsip Digital Tonasa (8 SQL Migrations & RLS)', tag: 'PL/PGSQL', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Dri4n Portfolio CMS & Storage Schema', tag: 'POSTGRES SQL', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
      { title: 'UKK Unhas Core Database Schema', tag: 'RELATIONAL SQL', href: '/projects/ukk-unhas' },
      { title: 'Sposmed Drive File & Trash Schema', tag: 'SQLITE SQL' },
    ],
    icon: () => <SqlIcon />,
  },
  {
    name: 'HTML5',
    mode: 'developer',
    category: 'languages',
    usage: 82,
    role: '20 repos · semantic markup',
    projects: [
      { title: 'PK Identitas Editorial Portal & Magazine', tag: 'EDITORIAL' },
      { title: 'Portal Desa Bonto Somba', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/desa-bonto-somba' },
      { title: 'Twibbon PK Identitas Unhas', tag: 'CAMPUS TOOL', href: 'https://github.com/Adrianbahri/Twibbon-PK-Identitas' },
      { title: 'Admin Dashboard Layout', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Admin-Dashboard' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/html5" />,
  },
  {
    name: 'CSS3',
    mode: 'developer',
    category: 'languages',
    usage: 80,
    role: '29 repos · keyframes & grid',
    projects: [
      { title: 'Dri4n Editorial & Tactile System', tag: 'CUSTOM CSS', href: '/' },
      { title: 'PK Identitas Newspaper Typography', tag: 'EDITORIAL UI' },
      { title: 'Portal Desa Bonto Somba', tag: 'RESPONSIVE', href: 'https://github.com/Adrianbahri/desa-bonto-somba' },
      { title: 'Admin Dashboard Grid', tag: 'CSS GRID', href: 'https://github.com/Adrianbahri/Admin-Dashboard' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/css" />,
  },
  {
    name: 'Python',
    mode: 'developer',
    category: 'languages',
    usage: 68,
    role: '8 repos · data & backend scripts',
    projects: [
      { title: 'NYC Green Taxi Kappa Architecture', tag: 'BIG DATA', href: 'https://github.com/Adrianbahri/big-data-project-architecture' },
      { title: 'PK Identitas Data Scraper & Rekap Scripts', tag: 'DATA AUTOMATION' },
      { title: 'UKK Unhas Storage & Image Automation', tag: 'AUTOMATION', href: '/projects/ukk-unhas' },
      { title: 'Perpustakaan Online Backend', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Perpustakaan-Online' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/python" />,
  },
  {
    name: 'PHP',
    mode: 'developer',
    category: 'languages',
    usage: 62,
    role: '7 repos · PHP 8.3/8.4 & APIs',
    projects: [
      { title: 'PK Identitas Backend & Static Cache Plugin', tag: 'PHP-FPM 8.3' },
      { title: 'UKK Unhas Core REST API', tag: 'PHP 8.4', href: '/projects/ukk-unhas' },
      { title: 'SIRIDA: OJS RPL Backend', tag: 'PUBLIC', href: 'https://github.com/von-ai/ojs-rpl-backend' },
      { title: 'Portal Desa Bonto Somba Backend', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/desa-bonto-somba' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/php" />,
  },
  {
    name: 'Bash / Shell',
    mode: 'developer',
    category: 'languages',
    usage: 56,
    role: '6 repos · VPS & DevOps scripts',
    projects: [
      { title: 'PK Identitas Server & Audit Automation', tag: 'VPS OPS' },
      { title: 'UKK Unhas Storage Sync & Deploy Scripts', tag: 'CI/CD', href: '/projects/ukk-unhas' },
      { title: 'SIRIDA OJS Build & Test Automation', tag: 'PUBLIC', href: 'https://github.com/von-ai/ojs-rpl-backend' },
      { title: 'NYC Taxi Kappa Stream Runner (run_all.sh)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/big-data-project-architecture' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/gnubash" />,
  },
  {
    name: 'Dart',
    mode: 'developer',
    category: 'languages',
    usage: 48,
    role: '3 repos · mobile app logic',
    projects: [
      { title: 'Eventku (EventHub) Mobile App', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Eventku_MobileApp' },
      { title: 'Mobile Programming Lab Suite', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/D121231047-MOBILE2025-W1' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/dart" />,
  },
  {
    name: 'Swift',
    mode: 'developer',
    category: 'languages',
    usage: 34,
    role: 'Native iOS & SwiftUI',
    projects: [
      { title: 'Swipi (CleanSwipe) iOS Gallery Cleaner', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Swipi' },
      { title: 'Eventku iOS Native Runner', tag: 'IOS', href: 'https://github.com/Adrianbahri/Eventku_MobileApp' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/swift" />,
  },

  // Frameworks and UI libraries
  {
    name: 'Next.js',
    mode: 'developer',
    category: 'frameworks',
    usage: 90,
    role: '9 repos · App Router & ISR',
    projects: [
      { title: 'Dri4n Portfolio (Next.js 16)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
      { title: 'PK Identitas Portal, Rekap & Kontak (3 Apps)', tag: 'ISR / PM2' },
      { title: 'UKK Unhas Landing & SciLabHub', tag: 'NEXT.JS 16', href: '/projects/ukk-unhas' },
      { title: 'Arsip Digital Tonasa', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Kakaskasen 2 Encyclopedia', tag: 'PUBLIC', href: '/projects/kakaskasen-2' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/nextdotjs" />,
  },
  {
    name: 'React',
    mode: 'developer',
    category: 'frameworks',
    usage: 88,
    role: '15 repos · React 19 & UI systems',
    projects: [
      { title: 'Dri4n Portfolio (React 19)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
      { title: 'Website Profil Desa Waginopo', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Web-Desa-Waginopo' },
      { title: 'PK Identitas Portal & Recharts Dashboard', tag: 'ORG SYSTEM' },
      { title: 'UKK Unhas UI & Admin Portal', tag: 'ORG SYSTEM', href: '/projects/ukk-unhas' },
      { title: 'Sposmed Drive Cloud Storage UI', tag: 'REACT + VITE' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/react" />,
  },
  {
    name: 'Tailwind CSS',
    mode: 'developer',
    category: 'frameworks',
    usage: 86,
    role: '15 repos · Tailwind v4 & tokens',
    projects: [
      { title: 'Dri4n Portfolio (Tailwind v4)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
      { title: 'PK Identitas Main & Rekap Dashboard', tag: 'TAILWIND v4' },
      { title: 'UKK Unhas Shared UI Package', tag: 'DESIGN SYSTEM', href: '/projects/ukk-unhas' },
      { title: 'SIRIDA OJS RPL & Desa Waginopo', tag: 'TAILWIND v4', href: '/projects/web-desa-waginopo' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/tailwindcss" />,
  },
  {
    name: 'Vite',
    mode: 'developer',
    category: 'frameworks',
    usage: 72,
    role: '8 repos · frontend bundler',
    projects: [
      { title: 'Portal Desa Bonto Somba', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/desa-bonto-somba' },
      { title: 'Website Profil Desa Waginopo', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Web-Desa-Waginopo' },
      { title: 'Sposmed Drive Web Client', tag: 'VITE + TS' },
      { title: 'UKK Unhas Admin & Laravel Vite', tag: 'BUILD TOOL', href: '/projects/ukk-unhas' },
      { title: 'Bestie Lansia Web App', tag: 'PUBLIC', href: 'https://github.com/rerere-bit/Bestie-Lansia' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/vite" />,
  },
  {
    name: 'Laravel',
    mode: 'developer',
    category: 'frameworks',
    usage: 64,
    role: '4 repos · Laravel 13, Blade & Inertia',
    projects: [
      { title: 'UKK Unhas Core Backend (Sanctum/Reverb/Sail)', tag: 'LARAVEL 13', href: '/projects/ukk-unhas' },
      { title: 'SIRIDA: OJS RPL Backend Monolith', tag: 'PUBLIC', href: 'https://github.com/von-ai/ojs-rpl-backend' },
      { title: 'UKK Web Portal (Laravel + Inertia React)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/UKK' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/laravel" />,
  },
  {
    name: 'Framer Motion',
    mode: 'developer',
    category: 'frameworks',
    usage: 58,
    role: '5 repos · layout & gesture transitions',
    projects: [
      { title: 'UKK Unhas UI Platform', tag: 'MOTION UI', href: '/projects/ukk-unhas' },
      { title: 'Website Profil Desa Waginopo', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Web-Desa-Waginopo' },
      { title: 'Kakaskasen 2 Digital Encyclopedia', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Web-Desa---Unfinished' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/framer" />,
  },
  {
    name: 'Flutter',
    mode: 'developer',
    category: 'frameworks',
    usage: 54,
    role: 'Cross-platform mobile UI',
    projects: [
      { title: 'Eventku (EventHub) Mobile App', tag: 'PUBLIC', href: '/projects/eventku' },
      { title: 'Mobile Programming Lab Suite', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/D121231047-MOBILE2025-W1' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/flutter" />,
  },
  {
    name: 'Express.js',
    mode: 'developer',
    category: 'frameworks',
    usage: 48,
    role: 'REST API & presigned upload server',
    projects: [
      { title: 'Sposmed Drive Backend Server', tag: 'EXPRESS + TS' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/express" />,
  },
  {
    name: 'Turborepo',
    mode: 'developer',
    category: 'frameworks',
    usage: 44,
    role: 'Multi-app monorepo build system',
    projects: [
      { title: 'UKK Unhas UI Monorepo (3 Apps + Shared UI)', tag: 'MONOREPO', href: '/projects/ukk-unhas' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/turborepo" />,
  },
  {
    name: 'Astro',
    mode: 'developer',
    category: 'frameworks',
    usage: 38,
    role: 'Static & content-first web builds',
    projects: [
      { title: "Solusi Digitalta' Official Portal", tag: 'ASTRO + TAILWIND' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/astro" />,
  },
  {
    name: 'Flask',
    mode: 'developer',
    category: 'frameworks',
    usage: 35,
    role: 'Python web service framework',
    projects: [
      { title: 'Perpustakaan Online Web Service', tag: 'FLASK', href: 'https://github.com/Adrianbahri/Perpustakaan-Online' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/flask" />,
  },

  // Databases, ORM, and data engineering
  {
    name: 'MySQL',
    mode: 'developer',
    category: 'databases',
    usage: 82,
    role: 'Relational DB & mysql2 driver',
    projects: [
      { title: 'PK Identitas Main & Rekap Analytics (idenweb)', tag: 'MYSQL 8.0 / MYSQL2' },
      { title: 'UKK Unhas PDO MySQL Driver Support', tag: 'RELATIONAL DB', href: '/projects/ukk-unhas' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/mysql" />,
  },
  {
    name: 'PostgreSQL',
    mode: 'developer',
    category: 'databases',
    usage: 78,
    role: 'Primary relational & RLS database',
    projects: [
      { title: 'UKK Unhas Core Backend (Postgres 16)', tag: 'POSTGRESQL', href: '/projects/ukk-unhas' },
      { title: 'Arsip Digital Tonasa (PL/pgSQL & Triggers)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Dri4n Portfolio Database', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/postgresql" />,
  },
  {
    name: 'Supabase',
    mode: 'developer',
    category: 'databases',
    usage: 76,
    role: 'Postgres BaaS, Auth & Storage',
    projects: [
      { title: 'Dri4n Portfolio CMS & Asset Storage', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/adrian-portfolio' },
      { title: 'Arsip Digital Tonasa (Webhooks & Push)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/web-arsip-tonasa' },
      { title: 'Eventku Campus Event Backend', tag: 'MOBILE BAAS', href: '/projects/eventku' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/supabase" />,
  },
  {
    name: 'SQLite',
    mode: 'developer',
    category: 'databases',
    usage: 72,
    role: 'Embedded edge & in-memory DB',
    projects: [
      { title: 'Dri4n API Server (api.dri4n.com)', tag: 'BUN + SQLITE' },
      { title: 'Sposmed Drive Metadata Store (better-sqlite3)', tag: 'EDGE SQLITE' },
      { title: 'SIRIDA OJS RPL Automated Test Suite', tag: 'IN-MEMORY DB', href: 'https://github.com/von-ai/ojs-rpl-backend' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/sqlite" />,
  },
  {
    name: 'Redis',
    mode: 'developer',
    category: 'databases',
    usage: 58,
    role: 'In-memory cache & session store',
    projects: [
      { title: 'PK Identitas High-Traffic Object Cache', tag: 'REDIS CACHE' },
      { title: 'UKK Unhas Session & Queue Store (Redis 7)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/UKK' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/redis" />,
  },
  {
    name: 'Prisma ORM',
    mode: 'developer',
    category: 'databases',
    usage: 48,
    role: 'Type-safe TypeScript SQL ORM',
    projects: [
      { title: 'Toko Oxi E-Commerce (Prisma + NextAuth)', tag: 'PUBLIC', href: 'https://github.com/Muhammad-Rizqullah-Akbar/toko-oxi-sikerent' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/prisma" />,
  },
  {
    name: 'Jupyter',
    mode: 'developer',
    category: 'databases',
    usage: 46,
    role: 'Interactive data analytics notebooks',
    projects: [
      { title: 'PK Identitas Editorial & Foto Analytics', tag: 'DATA NOTEBOOKS' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/jupyter" />,
  },
  {
    name: 'PySpark & Pandas',
    mode: 'developer',
    category: 'databases',
    usage: 44,
    role: 'Batch ML retraining & data frames',
    projects: [
      { title: 'NYC Taxi Tip Random Forest Predictor', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/big-data-project-architecture' },
      { title: 'PK Identitas Rekap Data Processing', tag: 'PANDAS /PYARROW' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/apachespark" />,
  },
  {
    name: 'Kafka & ClickHouse',
    mode: 'developer',
    category: 'databases',
    usage: 38,
    role: 'Kappa streaming & columnar OLAP',
    projects: [
      { title: 'NYC Green Taxi Tip Prediction (Kafka + Spark + ClickHouse)', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/big-data-project-architecture' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/apachekafka" />,
  },

  // Backend runtime, cloud, and DevOps infrastructure
  {
    name: 'Cloudflare R2 & CDN',
    mode: 'developer',
    category: 'backend',
    usage: 74,
    role: 'S3 object storage, WAF & edge CDN',
    projects: [
      { title: 'PK Identitas Media CDN & WAF (idenweb)', tag: 'R2 + WAF' },
      { title: 'Sposmed Drive Direct-to-R2 Presigned Upload', tag: 'AWS S3 SDK' },
      { title: 'Dri4n Domain & Edge Routing (dri4n.com)', tag: 'EDGE DNS' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/cloudflare" />,
  },
  {
    name: 'Nginx & PM2',
    mode: 'developer',
    category: 'backend',
    usage: 70,
    role: 'VPS reverse proxy & process cluster',
    projects: [
      { title: 'PK Identitas Multi-Service VPS (3 PM2 Apps + Nginx)', tag: 'VPS INFRA' },
      { title: 'UKK Unhas Production FPM + Nginx Container', tag: 'PRODUCTION', href: '/projects/ukk-unhas' },
      { title: 'Sposmed Drive Low-RAM VPS Cluster', tag: 'PM2 ECOSYSTEM' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/nginx" />,
  },
  {
    name: 'Node.js',
    mode: 'developer',
    category: 'backend',
    usage: 68,
    role: 'Server runtime & build tooling',
    projects: [
      { title: 'PK Identitas Next.js & Rekap Servers', tag: 'NODE RUNTIME' },
      { title: 'SIRIDA OJS Node 22 Frontend Build Stage', tag: 'PUBLIC', href: 'https://github.com/von-ai/ojs-rpl-backend' },
      { title: 'LitoMonitor IoT Server', tag: 'IOT API', href: '/projects/litomonitor' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/nodedotjs" />,
  },
  {
    name: 'Bun',
    mode: 'developer',
    category: 'backend',
    usage: 65,
    role: 'Fast JS/TS runtime & package manager',
    projects: [
      { title: 'Dri4n API Server (api.dri4n.com)', tag: 'BUN RUNTIME' },
      { title: 'UKK Unhas UI & API Monorepo Tooling', tag: 'BUN LOCK', href: '/projects/ukk-unhas' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/bun" />,
  },
  {
    name: 'Docker',
    mode: 'developer',
    category: 'backend',
    usage: 62,
    role: 'Compose & multi-stage containers',
    projects: [
      { title: 'UKK Unhas PHP 8.4-FPM, Postgres & Redis Stack', tag: 'DOCKER COMPOSE', href: '/projects/ukk-unhas' },
      { title: 'SIRIDA OJS RPL Multi-Stage Containers', tag: 'PUBLIC', href: 'https://github.com/von-ai/ojs-rpl-backend' },
      { title: 'PK Identitas Local MySQL 8.0 Container', tag: 'DOCKER DB' },
      { title: 'NYC Taxi Kafka/Spark/ClickHouse Cluster', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/big-data-project-architecture' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/docker" />,
  },
  {
    name: 'WordPress Headless',
    mode: 'developer',
    category: 'backend',
    usage: 56,
    role: 'Headless REST API & editorial CMS',
    projects: [
      { title: 'PK Identitas Headless CMS (cms.identitasunhas.com)', tag: 'WP REST API' },
      { title: 'Website Profil Desa Waginopo', tag: 'PUBLIC', href: '/projects/web-desa-waginopo' },
      { title: 'Portal Desa Bonto Somba WP Backend', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/desa-bonto-somba' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/wordpress" />,
  },
  {
    name: 'Firebase',
    mode: 'developer',
    category: 'backend',
    usage: 50,
    role: 'FCM push alerts & mobile Auth',
    projects: [
      { title: 'Eventku H-1 Push Notifications & Auth', tag: 'PUBLIC', href: 'https://github.com/Adrianbahri/Eventku_MobileApp' },
      { title: 'Toko Oxi Firebase Integration', tag: 'PUBLIC', href: 'https://github.com/Muhammad-Rizqullah-Akbar/toko-oxi-sikerent' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/firebase" />,
  },
  {
    name: 'Terraform',
    mode: 'developer',
    category: 'backend',
    usage: 34,
    role: 'Infrastructure as Code (HCL)',
    projects: [
      { title: 'SIRIDA: OJS RPL Cloud Provisioning (44KB HCL)', tag: 'PUBLIC', href: 'https://github.com/von-ai/ojs-rpl-backend' },
    ],
    icon: () => <RemoteIcon url="https://cdn.simpleicons.org/terraform" />,
  },

  // Creative suite tools
  { name: 'Figma', mode: 'creative', icon: () => <RemoteIcon url="https://cdn.simpleicons.org/figma" /> },
  {
    name: 'CapCut', mode: 'creative',
    icon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 opacity-70 dark:opacity-60 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.97 217.62" className="w-full h-full">
          <path fill="currentColor" d="M.06,35.48C2.29,15.95,18.38.91,38.02,0h167.19c12.14,1,23.18,7.4,30.1,17.43,3.08,4.51,5.25,9.58,6.39,14.91l49.14-24.36c1.08-.54,2.39-.1,2.93.98.11.22.18.45.21.69v27.72c0,1.85-1.12,3.53-2.84,4.23-45.22,22.43-90.43,44.87-135.63,67.34l135.32,66.95c1.77.61,3,2.22,3.14,4.08v27.68c0,1.25-1.02,2.27-2.27,2.26-.48,0-.96-.16-1.35-.44-16.12-8.16-32.46-15.85-48.46-24.18-1.07,3.87-2.5,7.63-4.28,11.23-5.48,10.08-14.95,17.39-26.1,20.14-3.69.77-7.46,1.08-11.22.92H44.46c-3.51,0-7.04,0-10.53-.26C15.84,214.61,1.88,199.95.06,181.75v-26.77c.3-2.28,1.89-4.18,4.08-4.88,27.79-13.73,55.52-27.59,83.35-41.26-28.04-13.96-56.09-27.87-84.17-41.75-1.95-.86-3.21-2.79-3.22-4.92-.04-8.88-.18-17.79-.04-26.69h0ZM31.04,35.67c-1.67,3.37-.9,7.26-1.04,10.9,30.61,15.12,60.99,30.32,91.54,45.34,30.18-14.96,60.38-29.93,90.6-44.89,0-2.71.12-5.43,0-8.16-.73-5.01-5.03-8.73-10.1-8.73H40.36c-3.93-.13-7.58,2.04-9.35,5.55h.02ZM30,171.07c.14,3.67-.65,7.63,1.12,11.04,1.82,3.42,5.41,5.51,9.28,5.4h161.67s.08,0,.08,0c3.62,0,6.96-1.94,8.75-5.08,2.04-3.57,1.1-7.86,1.3-11.77-30.26-14.94-60.48-30.12-90.8-44.89-30.49,15.06-60.97,30.16-91.43,45.3h.02Z" />
        </svg>
      </div>
    )
  },
  {
    name: 'Lightroom', mode: 'creative',
    icon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 opacity-70 dark:opacity-60 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <LightroomIcon />
      </div>
    )
  },
  {
    name: 'Illustrator', mode: 'creative',
    icon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 opacity-70 dark:opacity-60 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <IllustratorIcon />
      </div>
    )
  },
  {
    name: 'Canva', mode: 'creative',
    icon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 opacity-70 dark:opacity-60 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <CanvaIcon />
      </div>
    )
  },
  {
    name: 'InDesign', mode: 'creative',
    icon: () => (
      <div className="w-7 h-7 sm:w-8 sm:h-8 opacity-70 dark:opacity-60 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
        <InDesignIcon />
      </div>
    )
  }
];
