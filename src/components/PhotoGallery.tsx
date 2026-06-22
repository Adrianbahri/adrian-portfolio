'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function PhotoGallery() {
  const [photos, setPhotos] = useState<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setPhotos(data);
      }
    };
    fetchPhotos();
  }, []);

  const GAP = 16;
  const SPEED_PX_PER_SEC = 60; // Butter-smooth physical speed in pixels per second

  const getCardWidth = useCallback(() => {
    if (typeof window === 'undefined') return 342;
    if (window.innerWidth < 640) return 216;
    if (window.innerWidth < 768) return 288;
    return 342;
  }, []);

  // Update container height based on aspect-square photo size
  useEffect(() => {
    const update = () => {
      const cw = getCardWidth();
      setContainerHeight((cw * (2 / 3) + GAP) * 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [getCardWidth]);

  // Core S-snake loop with requestAnimationFrame
  useEffect(() => {
    if (photos.length === 0 || !containerRef.current) return;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      if (!containerRef.current) return;

      const cardW = getCardWidth();
      const cardH = cardW * (2 / 3); // aspect landscape (3:2)
      const rowH = cardH + GAP;
      const cW = containerRef.current.offsetWidth;
      
      const slotSize = cardW + GAP;    // exact horizontal space per card
      
      // Calculate how many slots can fit in the actual travel path
      const actualTravel = cW + cardW + GAP;
      const actualPathLength = 3 * actualTravel;
      const numSlots = Math.ceil(actualPathLength / slotSize);
      
      // Define virtual path parameters that are perfect multiples of slotSize
      const pathLength = numSlots * slotSize;
      const travel = pathLength / 3; // Virtual travel per row

      const elapsedSeconds = (timestamp - startRef.current) / 1000;
      const d = elapsedSeconds * SPEED_PX_PER_SEC; // current scroll displacement in pixels

      const els = containerRef.current.querySelectorAll<HTMLElement>('.snake-photo');

      els.forEach((el, i) => {
        if (i < numSlots) {
          // Calculate the item's coordinate s along the serpentine path
          let s = (i * slotSize - d) % pathLength;
          if (s < 0) s += pathLength;

          let x = 0;
          let y = 0;

          if (s < travel) {
            // Row 1 (Floor 1): Enters RIGHT, exits LEFT
            const progress = s / travel;
            x = cW - progress * (cW + cardW + GAP);
            y = 0;
          } else if (s < 2 * travel) {
            // Row 2 (Floor 2): Enters LEFT, exits RIGHT (reversed S-curve)
            const progress = (s - travel) / travel;
            x = -cardW + progress * (cW + cardW + GAP);
            y = rowH;
          } else {
            // Row 3 (Floor 3): Enters RIGHT, exits LEFT
            const progress = (s - 2 * travel) / travel;
            x = cW - progress * (cW + cardW + GAP);
            y = rowH * 2;
          }

          el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          el.style.display = 'block';
        } else {
          el.style.display = 'none';
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [photos, getCardWidth]);

  if (photos.length === 0) return null;

  // We render a safe maximum of 36 items in the DOM.
  // The requestAnimationFrame loop will dynamically position and show exactly as many as needed,
  // while hiding any excess items to prevent overlap.
  const domItems: any[] = [];
  for (let i = 0; i < 36; i++) {
    domItems.push(photos[i % photos.length]);
  }

  return (
    <section className="w-full pt-12 pb-12 relative overflow-hidden bg-transparent select-none border-t border-border-strong">
      <div className="section-container mb-12">
        <p className="eyebrow mb-3">Photography</p>
        <h2 className="text-2xl lg:text-3xl font-medium text-on-dark tracking-tight font-heading mb-3">
          Moments & Perspectives
        </h2>
        <p className="text-sm text-body-muted max-w-xl font-sans">
          A visual journal captured through the lens.
        </p>
      </div>

      <div
        ref={containerRef}
        className="relative overflow-hidden w-full"
        style={{
          height: containerHeight || 'auto',
          maskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 65%, transparent 97%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 50% 0%, black 65%, transparent 97%)',
        }}
      >
        {domItems.map((photo, i) => (
          <div
            key={`${photo.id}-${i}`}
            className="snake-photo absolute top-0 left-0 w-[216px] sm:w-[288px] md:w-[342px] will-change-transform"
            style={{ display: 'none' }} // Hidden by default, animation loop will show it
          >
            <div className="w-full h-full aspect-[3/2] overflow-hidden border border-border-strong bg-surface-50 relative">
              <Image
                src={photo.image_url}
                alt="Gallery"
                fill
                sizes="(max-width: 640px) 216px, (max-width: 768px) 288px, 342px"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Side Fades */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-canvas to-transparent z-20 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-canvas to-transparent z-20 pointer-events-none" />
    </section>
  );
}
