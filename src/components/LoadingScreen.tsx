'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      animate={{ opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[100] bg-canvas flex flex-col items-center justify-center"
    >
      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-2xl font-bold tracking-[0.2em] text-on-dark mb-2"
        >
          ADRIAN
        </motion.h1>
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="text-xs tracking-[0.4em] text-body-muted uppercase"
      >
        Creative Developer
      </motion.p>
      
      <motion.div 
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.2, duration: 2, ease: "easeInOut" }}
        className="absolute bottom-0 left-0 w-full h-[2px] bg-primary origin-left"
      />
    </motion.div>
  );
}
