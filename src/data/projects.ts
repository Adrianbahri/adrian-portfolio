import { Play, Layout, Camera, Brush } from 'lucide-react';

export const projects = [
  { 
    id: 1, 
    title: 'Tunify', 
    mode: 'developer',
    category: 'Web Development', 
    desc: 'Music streaming platform focused on seamless UI/UX and process thinking.',
    img: 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-8',
    icon: Play
  },
  { 
    id: 2, 
    title: 'Ke-Rent', 
    mode: 'developer',
    category: 'UI/UX Design', 
    desc: 'Rental application showcase with comprehensive design system.',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-4',
    icon: Layout
  },
  { 
    id: 3, 
    title: 'Cinematic Reel', 
    mode: 'creative',
    category: 'Video Editing', 
    desc: 'A collection of visual storytelling and professional editing works.',
    img: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-6',
    icon: Camera
  },
  { 
    id: 4, 
    title: 'Identity Unhas', 
    mode: 'creative',
    category: 'Creative Media', 
    desc: 'Branding and layout coordination for campus media organization.',
    img: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=800&q=80',
    span: 'md:col-span-6',
    icon: Brush
  },
];
