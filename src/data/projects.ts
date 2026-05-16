import { Smartphone, Globe, BarChart3, Camera, Brush } from 'lucide-react';

export interface Project {
  id: number;
  slug: string;
  title: string;
  mode: 'developer' | 'creative';
  category: string;
  desc: string;
  img: string;
  span: string;
  icon: any;
  color: string;
  github?: string;
  demo?: string;
  features?: string[];
  status?: string;
  yearRange?: string;
  tags?: string[];
  accentColor?: string;
  content?: {
    whatItIs: string;
    problemItSolves: string;
    howItWorks: string;
    architecture?: string;
    challenges?: string;
    highlights?: string[];
    role?: string;
    timeline?: string;
    published?: string;
  };
}

export const projects: Project[] = [
  { 
    id: 1, 
    slug: 'eventku',
    title: 'Eventku (EventHub)', 
    mode: 'developer',
    category: 'Mobile App', 
    status: 'ACTIVE BUILD',
    yearRange: '2025 — NOW',
    desc: 'Aplikasi mobile aggregator terpusat bagi berbagai acara kampus seperti seminar, workshop, konser, dan kompetisi. Menghubungkan mahasiswa dengan penyelenggara acara dalam satu antarmuka interaktif.',
    img: '/app_icon.png',
    span: 'md:col-span-6',
    icon: Smartphone,
    color: 'from-blue-500/20',
    accentColor: 'from-blue-600/40 via-purple-600/20 to-transparent',
    github: 'https://github.com/Adrianbahri/Eventku_MobileApp',
    tags: ['FLUTTER', 'FIREBASE', 'DART', 'SUPABASE', 'MOBILE-APP'],
    features: ['Search & Filter Acara', 'Pengingat Otomatis H-1', 'Modul Admin CRUD', 'Autentikasi Aman'],
    content: {
      whatItIs: 'EventKu (EventHub) adalah aplikasi mobile yang dikembangkan menggunakan Flutter untuk menjadi pusat informasi (aggregator) terpusat bagi berbagai acara kampus seperti seminar, workshop, konser, dan kompetisi. Aplikasi ini melayani dua jenis pengguna utama: Mahasiswa (User) yang mencari dan mendaftar acara, serta Admin yang mengelola data melalui panel khusus.',
      problemItSolves: 'Proyek ini mengatasi masalah informasi acara kampus yang seringkali tersebar di berbagai platform media sosial atau grup pesan singkat. EventKu menyajikan semuanya dalam satu antarmuka yang mudah diakses, interaktif, dan terintegrasi.',
      howItWorks: 'Aplikasi ini menggunakan Flutter untuk frontend lintas platform dan Firebase/Supabase sebagai backend. Pengguna dapat mencari acara berdasarkan kategori (Akademik, Olahraga, Seni, dll.), melihat detail lengkap termasuk pembicara dan lokasi, serta mengatur notifikasi pengingat otomatis H-1 sebelum acara dimulai.',
      role: 'Creator & Lead Developer',
      timeline: '2025 — Present',
      published: 'March 12, 2026',
      highlights: [
        'Pencarian & Filter Acara berdasarkan kategori spesifik.',
        'Sistem Pengingat Otomatis H-1 (Push Notification).',
        'Modul Admin lengkap untuk manajemen data (CRUD) Acara dan Kategori.',
        'Arsitektur data terstruktur (User, Admin, Event, Category, Notification).'
      ]
    }
  },
  { 
    id: 2, 
    slug: 'ukk-unhas',
    title: 'UKK Unhas — UI Platform', 
    mode: 'developer',
    category: 'Landing Page', 
    status: 'COMPLETED',
    yearRange: '2026',
    desc: 'Modernisasi sistem digital UKK Unhas melalui migrasi ke arsitektur modular. Memisahkan landing page publik dari marketplace untuk performa dan skalabilitas yang lebih baik.',
    img: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-6',
    icon: Globe,
    color: 'from-emerald-500/20',
    accentColor: 'from-emerald-600/40 via-teal-600/20 to-transparent',
    github: '#',
    tags: ['NEXT.JS', 'TURBOREPO', 'PNPM', 'TYPESCRIPT', 'TAILWIND'],
    features: ['Modern Architecture', 'Article & News System', 'Lab & Vessel Management', 'Admin Dashboard'],
    content: {
      whatItIs: 'UKK Unhas UI Platform adalah hasil modernisasi infrastruktur frontend untuk Layanan Sains dan Laboratorium Universitas Hasanuddin. Sebelumnya, sistem ini menyatukan fitur marketplace (shop) dengan landing page utama yang mengakibatkan performa menurun. Saya memigrasikannya ke sistem yang lebih terstruktur menggunakan Turborepo.',
      problemItSolves: 'Memisahkan fungsionalitas publik (informasi, artikel, jadwal kapal, data lab) dari fungsionalitas transaksional (SciLabHub). Hal ini mempermudah pemeliharaan kode, mempercepat waktu build, dan menciptakan antarmuka yang jauh lebih bersih serta fungsional.',
      howItWorks: 'Menggunakan Turborepo dengan pnpm workspaces. Landing page publik dibangun dengan Next.js 15+ menggunakan Route Groups untuk memisahkan area publik dan panel admin internal. Shared packages digunakan untuk komponen UI yang konsisten di seluruh aplikasi.',
      role: 'Lead Frontend Developer',
      timeline: '2026',
      published: 'March 10, 2026',
      highlights: [
        'Migrasi ke Arsitektur Terpadu (Turborepo + pnpm).',
        'Pemisahan marketplace SciLabHub ke aplikasi terpisah.',
        'Implementasi sistem artikel dan informasi lab yang dinamis.',
        'Dashboard Admin terintegrasi dalam satu Next.js app via Route Groups.'
      ]
    }
  },
  { 
    id: 3, 
    slug: 'web-desa-waginopo',
    title: 'Website Profil Desa Waginopo', 
    mode: 'developer',
    category: 'Web Development', 
    status: 'COMPLETED',
    yearRange: '2024',
    desc: 'Portal resmi digital Desa Waginopo untuk transparansi informasi publik. Dibangun dengan fokus pada aksesibilitas dan kemudahan pengelolaan konten berita desa.',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-12',
    icon: Globe,
    color: 'from-sky-500/20',
    accentColor: 'from-sky-600/40 via-cyan-600/20 to-transparent',
    github: 'https://github.com/Adrianbahri/Web-Desa-Waginopo',
    demo: 'https://waginopowakatobi.online/',
    tags: ['REACT 19', 'VITE 7', 'TAILWIND 4', 'WORDPRESS-CMS', 'FRAMER-MOTION'],
    features: ['WordPress CMS Integration', 'Transparency Dashboard', 'Automated News Archive', 'Responsive Design'],
    content: {
      whatItIs: 'Website Profil Desa Waginopo adalah portal digital resmi yang dikembangkan untuk Desa Waginopo di Kabupaten Wakatobi. Platform ini berfungsi sebagai pusat informasi publik yang mencakup berita desa, profil wilayah, struktur organisasi, hingga transparansi anggaran desa.',
      problemItSolves: 'Sebelumnya, akses terhadap informasi desa dan transparansi anggaran APB Desa sangat terbatas dan bersifat fisik. Website ini mendigitalisasi seluruh data tersebut, memungkinkan warga desa maupun pihak luar untuk mengakses informasi secara cepat dan transparan.',
      howItWorks: 'Aplikasi ini dibangun menggunakan React 19 dan Vite 7 untuk performa yang sangat cepat. Konten berita dan artikel dikelola melalui integrasi WordPress CMS sebagai headless backend, sementara tampilan frontend menggunakan Tailwind CSS 4 dan Framer Motion untuk animasi yang interaktif.',
      role: 'Fullstack Developer (Lead)',
      timeline: '2024',
      published: 'January 20, 2024',
      highlights: [
        'Integrasi WordPress CMS untuk kemudahan update berita oleh admin desa.',
        'Dashboard Transparansi Anggaran (APB Desa) yang interaktif.',
        'Sistem arsip berita lengkap dengan fitur pencarian dan pagination.',
        'Optimasi performa menggunakan Vite 7 dan React 19.'
      ]
    }
  },
  { 
    id: 4, 
    slug: 'kakaskasen-2',
    title: 'Kakaskasen 2 Encyclopedia', 
    mode: 'developer',
    category: 'Digital Exploration', 
    status: 'UNFINISHED',
    yearRange: '2025',
    desc: 'Eksplorasi digital interaktif untuk memperkenalkan potensi Desa Kakaskasen 2, Tomohon. Menggabungkan desain minimalis modern dengan pengalaman sinematik.',
    img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-8',
    icon: Globe,
    color: 'from-amber-500/20',
    accentColor: 'from-amber-600/40 via-orange-600/20 to-transparent',
    github: 'https://github.com/Adrianbahri/Web-Desa---Unfinished.git',
    tags: ['NEXT.JS 16', 'TAILWIND 4', 'TYPESCRIPT', 'FRAMER-MOTION'],
    features: ['Progressive Hero Section', 'Magic Book Interface', 'Bento Grid Layout', 'Cinematic Experience'],
    content: {
      whatItIs: 'Kakaskasen 2 Digital Encyclopedia adalah platform eksplorasi digital interaktif yang dirancang untuk memperkenalkan keindahan, budaya, dan potensi Desa Kakaskasen 2, Tomohon, Sulawesi Utara. Proyek ini menggabungkan desain minimalis modern dengan pengalaman sinematik yang memukau.',
      problemItSolves: 'Proyek ini bertujuan untuk mendigitalisasi informasi desa dengan cara yang lebih menarik dan emosional, melampaui website profil desa konvensional melalui teknik storytelling visual.',
      howItWorks: 'Dibangun dengan Next.js 16 dan Tailwind 4. Fitur utamanya meliputi Progressive Hero Section dengan parallax sinematik dan Magic Book Interface yang memberikan pengalaman membaca buku fisik secara digital.',
      challenges: 'Proyek ini dihentikan sementara (Unfinished) karena keterbatasan pendanaan dan sumber daya untuk melanjutkan pengembangan fitur yang lebih kompleks.',
      role: 'Creative Technologist (Lead)',
      timeline: '2025',
      published: 'Unreleased',
      highlights: [
        'Progressive Hero Section dengan efek parallax halus.',
        'Magic Book Interface untuk eksplorasi interaktif.',
        'Bento Grid Encyclopedia untuk navigasi konten yang estetis.',
        'Desain premium yang terinspirasi dari standar desain Apple.'
      ]
    }
  },
  { 
    id: 5, 
    slug: 'tunify',
    title: 'Tunify', 
    mode: 'developer',
    category: 'Web App', 
    status: 'ARCHIVED',
    yearRange: '2024',
    desc: 'Platform streaming musik performa tinggi yang dibangun dengan Next.js dan Framer Motion. Mengutamakan transisi antar halaman yang mulus dan manajemen state yang efisien.',
    img: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-4',
    icon: Globe,
    color: 'from-orange-500/20',
    accentColor: 'from-orange-600/40 via-red-600/20 to-transparent',
    github: '#',
    tags: ['REACT', 'NEXT.JS', 'FRAMER-MOTION', 'AUDIO-API'],
  },
  { 
    id: 6, 
    slug: 'litomonitor',
    title: 'LitoMonitor', 
    mode: 'developer',
    category: 'Fullstack Web', 
    status: 'BETA RELEASE',
    yearRange: '2025',
    desc: 'Dashboard visualisasi data IoT untuk pemantauan sensor secara real-time. Memungkinkan pengguna untuk menganalisis tren data melalui grafik interaktif dan laporan analitis.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-4',
    icon: BarChart3,
    color: 'from-purple-500/20',
    accentColor: 'from-indigo-600/40 via-purple-600/20 to-transparent',
    github: '#',
    tags: ['REACT', 'NODE.JS', 'CHART.JS', 'IOT', 'DASHBOARD'],
  },
  { 
    id: 7, 
    slug: 'identity-unhas',
    title: 'Identity Unhas', 
    mode: 'creative',
    category: 'Creative Media', 
    status: 'ONGOING',
    yearRange: '2025 — NOW',
    desc: 'Koordinasi branding visual dan tata letak digital untuk PK Identitas Unhas. Mengelola identitas visual organisasi media kampus terbesar di Makassar.',
    img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-8',
    icon: Brush,
    color: 'from-pink-500/20',
    accentColor: 'from-pink-600/40 via-rose-600/20 to-transparent',
    tags: ['BRANDING', 'LAYOUT', 'ADOBE-CC', 'EDITORIAL'],
  },
];
