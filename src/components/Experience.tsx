'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';
import { workData, organizationData, volunteerData } from '@/data/experience';
import { Briefcase } from 'lucide-react';
import { cn } from '@/lib/utils';

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
        
        {/* Tier 1: Work Experience */}
        <div className="space-y-8">
          <div className="max-w-2xl space-y-3">
            <p className="eyebrow">Career</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-on-dark tracking-tight font-heading leading-tight">
              Work <span className="text-primary font-normal">Experience</span>
            </h2>
            <p className="text-base sm:text-lg text-body-muted font-sans font-normal">
              Previous roles, projects, and organizations I’ve contributed to.
            </p>
          </div>

          <div className="space-y-4">
            {sortedWork.map((item, i) => {
              const desc = item.desc || '';
              const logoMatch = desc.match(/<!-- LOGO_URL:\s*(.*?)\s*-->/);
              const logoUrl = item.logo_url || (logoMatch ? logoMatch[1] : null);
              const cleanDesc = desc.replace(/<!-- LOGO_URL:\s*(.*?)\s*-->/, '');

              return (
                <article 
                  key={i} 
                  className="grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] gap-6 md:gap-8 p-6 sm:p-8 rounded-[4px] bg-surface-100/15 border border-border-subtle hover:border-border-strong transition-all duration-500 hover:bg-surface-100/30 group"
                >
                  {/* Left Side: Date, Location & Logo */}
                  <div className="flex flex-row md:flex-col justify-between md:justify-start items-start gap-4">
                    <div className="space-y-1.5">
                      <span className="text-xs font-mono text-primary font-medium tracking-wider">
                        {item.year}
                      </span>
                      <p className="text-xs text-body-muted font-sans font-normal pt-1">
                        {item.location}
                      </p>
                    </div>
                    
                    {/* Logo container */}
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-[4px] border border-border-subtle bg-surface-100/30 overflow-hidden flex items-center justify-center text-primary group-hover:border-primary/40 transition-all duration-500 shrink-0 relative shadow-sm">
                      {logoUrl ? (
                        <Image 
                          src={logoUrl} 
                          alt={`${item.company} logo`} 
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      ) : (
                        <Briefcase size={18} className="text-body-muted group-hover:text-primary transition-colors" />
                      )}
                    </div>
                  </div>
                  
                  {/* Right Side: Role, Company, Desc, Points */}
                  <div className="space-y-5 md:border-l md:border-border-subtle md:pl-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
                      <div className="space-y-1">
                        <h3 className="font-heading text-xl sm:text-2xl font-normal text-on-dark group-hover:text-primary transition-colors tracking-tight">
                          {item.role}
                        </h3>
                        <p className="text-xs font-mono text-body-muted uppercase tracking-wider font-semibold">
                          {item.company}
                        </p>
                      </div>
                      {item.url && (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-mono uppercase tracking-wider text-body-muted hover:text-on-dark transition-all flex items-center gap-1.5 px-3 py-1 rounded-[3px] border border-border-subtle hover:border-border-strong bg-surface-100/60"
                        >
                          Visit
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                            <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </a>
                      )}
                    </div>

                    <div 
                      className="text-sm sm:text-base leading-relaxed text-body-muted font-sans font-normal max-w-2xl"
                      dangerouslySetInnerHTML={{ __html: cleanDesc }}
                    />

                    {item.points && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 pt-2">
                        {item.points.map((point: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 shrink-0" />
                            <p className="text-xs sm:text-sm leading-relaxed text-body-muted font-sans">
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

        {/* Tier 2: Organization & Volunteer */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 pt-12 border-t border-border-subtle">
          
          {/* Organization History */}
          <div className="space-y-6">
            <div className="space-y-1 border-b border-border-subtle pb-4">
              <p className="eyebrow">Leadership</p>
              <h3 className="font-heading text-2xl font-normal text-on-dark tracking-tight">Organization History</h3>
            </div>

            <div className="space-y-5">
              {sortedOrg.map((item, i) => (
                <article key={i} className={cn("space-y-2 group", i > 0 && "border-t border-border-subtle pt-5")}>
                  <span className="text-[11px] font-mono text-primary font-medium">
                    {item.year}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-heading text-lg font-normal text-on-dark group-hover:text-primary transition-colors tracking-tight">
                      {item.role}
                    </h4>
                    <p className="text-xs font-mono text-body-muted uppercase tracking-wider font-semibold">
                      {item.company}
                    </p>
                  </div>
                  <div 
                    className="text-xs sm:text-sm leading-relaxed text-body-muted font-sans font-normal"
                    dangerouslySetInnerHTML={{ __html: item.desc }}
                  />
                </article>
              ))}
            </div>
          </div>

          {/* Volunteer & Activities */}
          <div className="space-y-6">
            <div className="space-y-1 border-b border-border-subtle pb-4">
              <p className="eyebrow">Community</p>
              <h3 className="font-heading text-2xl font-normal text-on-dark tracking-tight">Volunteer & Activities</h3>
            </div>

            <div className="space-y-5">
              {sortedVol.map((item, i) => (
                <article key={i} className={cn("space-y-2 group", i > 0 && "border-t border-border-subtle pt-5")}>
                  <span className="text-[11px] font-mono text-primary font-medium">
                    {item.year}
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-heading text-lg font-normal text-on-dark group-hover:text-primary transition-colors tracking-tight">
                      {item.role}
                    </h4>
                    <p className="text-xs font-mono text-body-muted uppercase tracking-wider font-semibold">
                      {item.company}
                    </p>
                  </div>
                  <div 
                    className="text-xs sm:text-sm leading-relaxed text-body-muted font-sans font-normal"
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
