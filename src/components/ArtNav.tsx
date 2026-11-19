'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from '@/lib/motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { PRIMARY_SITE_URL, isLocalHost } from '@/lib/sites';

const artNavLinks = [
  { name: 'Works', href: '#works' },
  { name: 'Visuals', href: '#visuals' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export default function ArtNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mainSiteUrl, setMainSiteUrl] = useState(PRIMARY_SITE_URL);

  useEffect(() => {
    if (isLocalHost(window.location.host)) {
      const port = window.location.port ? `:${window.location.port}` : '';
      setMainSiteUrl(`${window.location.protocol}//localhost${port}`);
    }
  }, []);

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-[100] h-[54px] bg-white/80 backdrop-blur-md">
        <nav className="w-full h-full px-6 md:px-10 py-2.5 flex items-center justify-between">
          {/* Left: Clean Wordmark */}
          <a
            href="#top"
            className="text-[15px] font-medium tracking-[-0.03em] text-[#111111] hover:opacity-70 transition-opacity"
          >
            Adrian Bahri
            <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded-[5px] bg-[#D1FE27] text-[11px] font-semibold tracking-[-0.01em] text-[#111111] align-middle">
              art
            </span>
          </a>

          {/* Right: Clean Text Links (Inesh Jain style) */}
          <div className="hidden md:flex items-center gap-7">
            {artNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[14px] font-normal tracking-[-0.01em] text-[#1F1F1F] hover:text-[#6C7179] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <a
              href={mainSiteUrl}
              className="inline-flex items-center gap-1 text-[13px] font-medium text-[#6C7179] hover:text-[#111111] transition-colors pl-2 border-l border-[#D1D3D6]"
            >
              <span>dri4n.com</span>
              <ArrowUpRight size={13} />
            </a>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 text-[#111111] hover:bg-[#F7F7F7] rounded-lg transition-colors cursor-pointer"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </header>

      {/* Clean White Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-[54px] z-[95] bg-white/95 backdrop-blur-xl border-b border-[#D1D3D6] md:hidden px-6 py-6 flex flex-col gap-4 shadow-lg"
          >
            {artNavLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="text-[18px] font-medium tracking-[-0.02em] text-[#111111] hover:text-[#6C7179] transition-colors"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-3 border-t border-[#D1D3D6]">
              <a
                href={mainSiteUrl}
                className="inline-flex items-center gap-1.5 text-[14px] font-medium text-[#6C7179] hover:text-[#111111]"
              >
                <span>Back to dri4n.com</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
