'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Search, ArrowLeft, Calendar, User, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      const { data } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (data) setArticles(data);
      setLoading(false);
    };
    fetchArticles();
  }, []);

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-canvas pt-32 pb-24 relative overflow-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="section-container relative z-10">
        <header className="mb-20 space-y-6">
          <Link href="/" className="group inline-flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-body-muted hover:text-on-dark transition-colors">
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to home
          </Link>
          <div className="space-y-4">
            <p className="eyebrow">Perspectives</p>
            <h1 className="text-5xl lg:text-7xl font-medium tracking-tight text-on-dark font-heading">The Blog</h1>
            <p className="text-xl text-body-muted max-w-2xl font-sans leading-relaxed">Thoughts on design, technology, and the intersection of creativity and logic.</p>
          </div>
        </header>

        <div className="relative w-full max-w-md mb-16">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-body-muted" size={16} />
          <input type="text" placeholder="Search insights..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-surface-50 border border-border-subtle text-sm text-on-dark focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all rounded-sm" />
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4 text-white/10">
            <Loader2 size={32} className="animate-spin" />
            <p className="text-[0.6rem] font-bold uppercase tracking-widest">Loading articles...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, idx) => (
              <motion.article key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: idx * 0.1 }} className="group">
                <Link href={`/blog/${article.slug}`} className="block space-y-6">
                  <div className="aspect-[16/10] overflow-hidden bg-surface-100 border border-border-subtle rounded-sm">
                    <img src={article.img || `https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80`} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-[0.6rem] font-bold uppercase tracking-widest text-primary">
                      <span>{article.category}</span>
                      <span className="w-1 h-1 rounded-full bg-border-strong" />
                      <span className="text-body-muted">{article.date}</span>
                    </div>
                    <h3 className="text-xl font-medium text-on-dark group-hover:text-primary transition-colors leading-snug">{article.title}</h3>
                    <p className="text-sm text-body-muted line-clamp-3 leading-relaxed">{article.description}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
