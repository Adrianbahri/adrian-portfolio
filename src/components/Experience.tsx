'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { workData, organizationData, volunteerData } from '@/data/experience';
import { Briefcase } from 'lucide-react';

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
    <section id="experience" className="section-anchor py-16 sm:py-20 bg-transparent relative">
      
      <div className="section-container space-y-20 relative z-10">
        
        {/* Tier 1: Work Experience (Minimalist Split Layout) */}
        <div className="space-y-10">
          <div className="max-w-2xl space-y-3">
            <h2 className="font-heading text-3xl font-medium tracking-[-0.05em] text-on-dark sm:text-[2.2rem]">Work Experience</h2>
            <p className="text-lg text-body-muted font-light leading-relaxed">
              Media production, research & development, and technical internships.
            </p>
          </div>

          <div className="space-y-12">
            {sortedWork.map((item, i) => {
              const desc = item.desc || '';
              const logoMatch = desc.match(/<!-- LOGO_URL:\s*(.*?)\s*-->/);
              const logoUrl = item.logo_url || (logoMatch ? logoMatch[1] : null);
              const cleanDesc = desc.replace(/<!-- LOGO_URL:\s*(.*?)\s*-->/, '');

              return (
                <article 
                  key={i} 
                  className="grid grid-cols-1 md:grid-cols-[200px_minmax(0,1fr)] gap-8 md:gap-0 border-t border-border-strong/40 pt-10 group"
                >
                  {/* Left Side: Date, Location & Logo */}
                  <div className="md:pr-12 flex flex-row md:flex-col justify-between md:justify-start items-start gap-4">
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-body-muted/60 uppercase tracking-[0.2em] font-mono">
                        {item.year}
                      </p>
                      <p className="text-[13px] text-body-muted/80 leading-relaxed font-sans font-medium">
                        {item.location}
                      </p>
                    </div>
                    
                    {/* Premium 1:1 Logo container */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl border border-white/5 bg-white/[0.02] shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md overflow-hidden flex items-center justify-center text-[#3ecf8e] group-hover:border-primary/30 group-hover:shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] transition-all duration-500 shrink-0">
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={`${item.company} logo`} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <Briefcase size={20} className="opacity-40 group-hover:opacity-80 group-hover:text-primary transition-all duration-500" />
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side: Role, Company, Desc, Points */}
                  <div className="space-y-8 md:border-l md:border-border-strong/40 md:pl-12 group-hover:border-primary/50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                      <div className="space-y-1">
                        <h3 className="font-heading text-2xl md:text-3xl font-medium tracking-[-0.04em] text-on-dark group-hover:text-primary transition-colors">
                          {item.role}
                        </h3>
                        <p className="text-[11px] font-mono text-body-muted/70 uppercase tracking-widest font-bold">
                          {item.company}
                        </p>
                      </div>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[10px] font-bold font-mono text-body-muted hover:text-primary transition-all flex items-center gap-2 pt-2 uppercase tracking-widest border border-border-subtle px-3 py-1 hover:border-primary/20 rounded-[3px]"
                        >
                          Visit
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                            <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                    </div>

                    <div 
                      className="text-lg leading-relaxed text-body-muted font-sans font-light max-w-3xl"
                      dangerouslySetInnerHTML={{ __html: cleanDesc }}
                    />

                  {item.points && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-2">
                      {item.points.map((point: string, idx: number) => (
                        <div key={idx} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                          <p className="text-sm leading-relaxed text-body-muted/80 font-sans">
                            {point}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </article>
              );
            })}
          </div>
        </div>

        {/* Tier 2: Organization & Volunteer (Compact Two Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 pt-16 border-t border-border-strong/40">
          
          {/* Organization History */}
          <div className="space-y-12">
            <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark border-b border-border-strong/40 pb-6 uppercase tracking-widest text-[0.8rem] font-bold">Organization History</h3>

            <div className="space-y-8">
              {sortedOrg.map((item, i) => (
                <article key={i} className="group space-y-3">
                  <p className="text-[10px] font-mono text-body-muted/60 uppercase tracking-[0.2em] font-bold">{item.year}</p>
                  <div className="space-y-1">
                    <h4 className="font-heading text-xl font-medium text-on-dark group-hover:text-primary transition-colors tracking-tight">
                      {item.role}
                    </h4>
                    <p className="text-[10px] font-mono text-body-muted/70 uppercase tracking-widest font-bold">
                      {item.company}
                    </p>
                  </div>
                  <div 
                    className="text-sm leading-relaxed text-body-muted/80 max-w-md font-sans font-light"
                    dangerouslySetInnerHTML={{ __html: item.desc }}
                  />
                </article>
              ))}
            </div>
          </div>

          {/* Volunteer & Activities */}
          <div className="space-y-12">
            <h3 className="font-heading text-2xl font-medium tracking-[-0.03em] text-on-dark border-b border-border-strong/40 pb-6 uppercase tracking-widest text-[0.8rem] font-bold">Volunteer & Activities</h3>

            <div className="space-y-12">
              {sortedVol.map((item, i) => (
                <article key={i} className="group space-y-3">
                  <p className="text-[10px] font-mono text-body-muted/60 uppercase tracking-[0.2em] font-bold">{item.year}</p>
                  <div className="space-y-1">
                    <h4 className="font-heading text-xl font-medium text-on-dark group-hover:text-primary transition-colors tracking-tight">
                      {item.role}
                    </h4>
                    <p className="text-[10px] font-mono text-body-muted/70 uppercase tracking-widest font-bold">
                      {item.company}
                    </p>
                  </div>
                  <div 
                    className="text-sm leading-relaxed text-body-muted/80 max-w-md font-sans font-light"
                    dangerouslySetInnerHTML={{ __html: item.desc }}
                  />
                </article>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
