'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { workData, organizationData, volunteerData } from '@/data/experience';

// Helper function to automatically sort data by date (Newest/NOW first)
const sortExperience = (data: any[]) => {
  return [...data].sort((a, b) => {
    const aYearStr = (a.year || a.timeline || '').toUpperCase();
    const bYearStr = (b.year || b.timeline || '').toUpperCase();

    // 1. Prioritize items with "NOW"
    const aIsNow = aYearStr.includes('NOW') || aYearStr.includes('PRESENT');
    const bIsNow = bYearStr.includes('NOW') || bYearStr.includes('PRESENT');

    if (aIsNow && !bIsNow) return -1;
    if (!aIsNow && bIsNow) return 1;

    // 2. If both are NOW or both are past, sort by the highest year found in the string
    const aYears = aYearStr.match(/\d{4}/g)?.map(Number) || [0];
    const bYears = bYearStr.match(/\d{4}/g)?.map(Number) || [0];
    
    const aMaxYear = Math.max(...aYears);
    const bMaxYear = Math.max(...bYears);

    if (aMaxYear !== bMaxYear) {
      return bMaxYear - aMaxYear;
    }

    // 3. If years are same, try to sort by start year (first year mentioned)
    return (bYears[0] || 0) - (aYears[0] || 0);
  });
};

export default function Experience() {
  const [work, setWork] = useState<any[]>([]);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [vols, setVols] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          { data: workDataDb },
          { data: orgDataDb },
          { data: volDataDb }
        ] = await Promise.all([
          supabase.from('experiences').select('*'),
          supabase.from('organizations').select('*'),
          supabase.from('volunteers').select('*')
        ]);

        if (workDataDb && workDataDb.length > 0) {
          const mapped = workDataDb.map(item => ({
            ...item,
            role: item.title || item.role,
            year: item.timeline || item.year,
            desc: item.description || item.desc
          }));
          setWork(sortExperience(mapped));
        } else setWork(sortExperience(workData));

        if (orgDataDb && orgDataDb.length > 0) {
          const mapped = orgDataDb.map(item => ({
            ...item,
            role: item.title || item.role,
            year: item.timeline || item.year,
            desc: item.description || item.desc,
            company: item.company
          }));
          setOrgs(sortExperience(mapped));
        } else setOrgs(sortExperience(organizationData));

        if (volDataDb && volDataDb.length > 0) {
          const mapped = volDataDb.map(item => ({
            ...item,
            role: item.title || item.role,
            year: item.timeline || item.year,
            desc: item.description || item.desc,
            company: item.company
          }));
          setVols(sortExperience(mapped));
        } else setVols(sortExperience(volunteerData));
      } catch (error) {
        console.error('Error fetching experience:', error);
        setWork(sortExperience(workData));
        setOrgs(sortExperience(organizationData));
        setVols(sortExperience(volunteerData));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedWork = work;
  const sortedOrg = orgs;
  const sortedVol = vols;

  return (
    <section id="experience" className="section-anchor py-24 sm:py-32 bg-transparent relative">
      
      <div className="section-container space-y-32 relative z-10">
        
        {/* Tier 1: Work Experience (Minimalist Split Layout) */}
        <div className="space-y-12">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">Work Experience</h2>
            <p className="text-[0.98rem] leading-8 text-body-muted">
              Media production, research & development, and technical internships.
            </p>
          </div>

          <div className="space-y-16">
            {sortedWork.map((item, i) => (
              <article 
                key={i} 
                className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-8 md:gap-0 border-t border-border/20 pt-12 group"
              >
                {/* Left Side: Date & Location */}
                <div className="md:pr-12 space-y-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold text-body-muted/60 uppercase tracking-[0.2em]">
                      {item.year}
                    </p>
                    <p className="text-[13px] text-body-muted/80 leading-relaxed font-medium">
                      {item.location}
                    </p>
                  </div>
                </div>
                
                {/* Right Side: Role, Company, Desc, Points */}
                <div className="space-y-8 md:border-l md:border-border/40 md:pl-12 group-hover:border-primary/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-heading text-[1.6rem] font-medium tracking-[-0.04em] text-on-dark group-hover:text-primary transition-colors">
                        {item.role}
                      </h3>
                      <p className="text-sm font-mono text-body-muted/70 uppercase tracking-widest">
                        {item.company}
                      </p>
                    </div>
                    {item.url && (
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-body-muted hover:text-primary transition-colors flex items-center gap-1.5 pt-2 uppercase tracking-tighter"
                      >
                        Company site
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60">
                          <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </a>
                    )}
                  </div>

                  <p className="text-[1.05rem] leading-8 text-body-muted max-w-3xl">
                    {item.desc}
                  </p>

                  {item.points && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                      {item.points.map((point, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className="w-1 h-1 rounded-full bg-border-strong group-hover:bg-primary/40 transition-colors" />
                          <p className="text-[14px] leading-relaxed text-body-muted/70">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Tier 2: Organization & Volunteer (Compact Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 pt-12 border-t border-border/20">
          
          {/* Organization History */}
          <div className="space-y-10">
            <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark border-b border-border/40 pb-6">Organization History</h3>

            <div className="space-y-10">
              {sortedOrg.map((item, i) => (
                <article key={i} className="group space-y-2">
                  <p className="text-[10px] font-mono text-body-muted/60 uppercase tracking-[0.2em]">{item.year}</p>
                  <div className="space-y-1">
                    <h4 className="font-heading text-lg font-medium text-on-dark group-hover:text-primary transition-colors">
                      {item.role}
                    </h4>
                    <p className="text-[11px] font-mono text-body-muted/70 uppercase tracking-widest">
                      {item.company}
                    </p>
                  </div>
                  <p className="text-[0.85rem] leading-6 text-body-muted/80 max-w-md mt-2">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Volunteer & Activities */}
          <div className="space-y-10">
            <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark border-b border-border/40 pb-6">Volunteer & Activities</h3>

            <div className="space-y-10">
              {sortedVol.map((item, i) => (
                <article key={i} className="group space-y-2">
                  <p className="text-[10px] font-mono text-body-muted/60 uppercase tracking-[0.2em]">{item.year}</p>
                  <div className="space-y-1">
                    <h4 className="font-heading text-lg font-medium text-on-dark group-hover:text-primary transition-colors">
                      {item.role}
                    </h4>
                    <p className="text-[11px] font-mono text-body-muted/70 uppercase tracking-widest">
                      {item.company}
                    </p>
                  </div>
                  <p className="text-[0.85rem] leading-6 text-body-muted/80 max-w-md mt-2">
                    {item.desc}
                  </p>
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
