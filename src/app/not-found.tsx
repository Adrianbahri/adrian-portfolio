'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 max-w-md text-center"
      >
        {/* Sleek 404 Large Header */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 0.15, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-8xl md:text-9xl font-bold tracking-[-0.05em] font-heading text-white select-none leading-none"
        >
          404
        </motion.h1>

        {/* Section title */}
        <div className="space-y-3 -mt-4">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl font-medium uppercase tracking-[0.25em] font-heading text-[#3ecf8e]"
          >
            PAGE NOT FOUND
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="text-[9px] md:text-[10px] tracking-[0.2em] text-white uppercase font-medium leading-relaxed font-mono max-w-[280px] mx-auto"
          >
            the coordinates you requested do not exist in this space
          </motion.p>
        </div>

        {/* Minimalist Return Home Action */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="pt-6"
        >
          <Link
            href="/"
            className="group flex items-center gap-2.5 px-6 py-3 border border-[#2e2e2e] hover:border-[#3ecf8e] text-white/70 hover:text-white font-mono text-[9px] uppercase tracking-[0.2em] rounded-md transition-all duration-500 bg-[#121212]/50 hover:bg-[#3ecf8e]/5 shadow-lg shadow-black/40"
          >
            <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" />
            RETURN TO HOMEPAGE
          </Link>
        </motion.div>
      </motion.div>

      {/* Signature horizontal anchor line from LoadingScreen */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 w-full h-[1px] bg-[#3ecf8e] origin-left opacity-20"
      />
    </div>
  );
}
