'use client';

import { motion } from 'framer-motion';
import { Settings, ShieldAlert } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col items-center justify-center text-white px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 max-w-md text-center"
      >
        {/* Animated Gear Icon */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          className="text-[#3ecf8e] opacity-40 mb-2"
        >
          <Settings size={40} className="stroke-[1.5]" />
        </motion.div>

        {/* Section title */}
        <div className="space-y-3">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl md:text-3xl font-medium uppercase tracking-[0.3em] font-heading text-white"
          >
            OFFLINE
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="text-[10px] md:text-[11px] font-bold uppercase tracking-[0.25em] font-sans text-[#3ecf8e] flex items-center justify-center gap-1.5"
          >
            <ShieldAlert size={12} className="stroke-[2.5]" />
            SYSTEM UNDER MAINTENANCE
          </motion.h3>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 0.5, duration: 1.5 }}
            className="text-[9px] md:text-[10px] tracking-[0.2em] text-white uppercase font-medium leading-relaxed font-mono max-w-[320px] mx-auto pt-1"
          >
            taking a brief moment to calibrate and refine the digital interface. we will be back online shortly.
          </motion.p>
        </div>

        {/* Pulse Dot Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ delay: 0.8, duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-2 pt-6 text-[8px] font-mono tracking-[0.25em] text-[#3ecf8e] uppercase font-bold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#3ecf8e]" />
          ACTIVE OPTIMIZATION IN PROGRESS
        </motion.div>
      </motion.div>

      {/* Signature horizontal anchor line from LoadingScreen */}
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 w-full h-[1px] bg-[#3ecf8e] origin-left opacity-20"
      />
    </div>
  );
}
