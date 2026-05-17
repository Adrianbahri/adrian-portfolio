'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Mail, Globe, Camera, ArrowUpRight, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSiteSettings } from '@/hooks/useSiteSettings';

export default function ContactPage() {
  const { settings } = useSiteSettings();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    website: '' // Honeypot field
  });

  const socials = [
    { 
      name: 'GitHub', 
      label: settings.github_url ? settings.github_url.replace(/https?:\/\/(www\.)?github\.com\//, '@').replace(/\/$/, '') : '@adrianbahri', 
      href: settings.github_url || '#' 
    },
    { 
      name: 'LinkedIn', 
      label: 'Profile', 
      href: settings.linkedin_url || '#' 
    },
    { 
      name: 'Instagram', 
      label: settings.instagram_url ? settings.instagram_url.replace(/https?:\/\/(www\.)?instagram\.com\//, '@').replace(/\/$/, '') : '@adrianbahri', 
      href: settings.instagram_url || '#' 
    },
    { 
      name: 'Email', 
      label: settings.email_address || 'adrian@example.com', 
      href: settings.email_address ? `mailto:${settings.email_address}` : 'mailto:adrian@example.com' 
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 1. Honeypot check
    if (formData.website) {
      console.warn('Bot detected via honeypot');
      setSuccess(true); // Fake success for bots
      return;
    }

    // 2. Rate limiting check (12 hours cooldown)
    const lastSent = localStorage.getItem('last_message_sent');
    const TWELVE_HOURS = 12 * 60 * 60 * 1000;
    if (lastSent && Date.now() - parseInt(lastSent) < TWELVE_HOURS) {
      setCooldown(true);
      setTimeout(() => setCooldown(false), 3000);
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        }]);

      if (error) throw error;
      
      localStorage.setItem('last_message_sent', Date.now().toString());

      // Send Email Notification (Background)
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      }).catch(err => console.error('Email notification error:', err));

      setSuccess(true);
      setFormData({ name: '', email: '', subject: '', message: '', website: '' });
    } catch (error: any) {
      console.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-transparent relative overflow-hidden">
      {/* Background Decorative Lines (Reference Style) */}
      <div className="pointer-events-none fixed inset-y-0 left-1/2 z-0 hidden w-[min(calc(100vw-2.5rem),64rem)] -translate-x-1/2 border-x border-on-dark/5 md:block"></div>
      
      <div className="grain" />

      <div className="relative z-10 pt-32 sm:pt-40 pb-24">
        
        {/* Header Section */}
        <header className="section-container border-t border-border-subtle py-12 sm:py-16">
          <div className="max-w-3xl space-y-5">
            <p className="eyebrow">Contact</p>
            <div className="space-y-4">
              <h1 className="font-heading text-4xl sm:text-6xl font-medium tracking-tight text-on-dark leading-tight">
                Let's get in touch.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-body-muted font-sans font-light">
                Whether you have a question about my work, want to chat about creative technology, or just want to say hi, feel free to reach out using the form or the links on this page.
              </p>
            </div>
          </div>
        </header>

        {/* Form & Sidebar Grid */}
        <section className="section-container grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 lg:gap-20">
          
          {/* Form Side */}
          <div className="border-t border-border-subtle pt-10">
            {success ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-primary/5 border border-primary/20 p-12 rounded-[5px] text-center space-y-6"
              >
                <div className="flex justify-center">
                  <CheckCircle2 size={64} className="text-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-heading text-on-dark font-medium">Message Sent!</h2>
                  <p className="text-body-muted font-sans font-light">
                    Thank you for reaching out. I'll get back to you as soon as possible.
                  </p>
                </div>
                <button 
                  onClick={() => setSuccess(false)}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary hover:text-on-dark transition-colors"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Honeypot - DO NOT FILL */}
                <div className="absolute -left-[5000px] top-auto size-px overflow-hidden">
                  <label htmlFor="website">Website</label>
                  <input 
                    id="website" 
                    type="text" 
                    tabIndex={-1} 
                    autoComplete="off" 
                    value={formData.website}
                    onChange={(e) => setFormData({...formData, website: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-body-muted font-mono">Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-surface-75/50 border border-border-subtle px-4 py-3 text-sm text-on-dark focus:border-primary/50 focus:outline-none transition-all rounded-[3px] placeholder:text-body-muted/40"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-body-muted font-mono">Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-surface-75/50 border border-border-subtle px-4 py-3 text-sm text-on-dark focus:border-primary/50 focus:outline-none transition-all rounded-[3px] placeholder:text-body-muted/40"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-body-muted font-mono">Subject</label>
                  <input 
                    required
                    type="text" 
                    placeholder="What should we talk about?"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full bg-surface-75/50 border border-border-subtle px-4 py-3 text-sm text-on-dark focus:border-primary/50 focus:outline-none transition-all rounded-[3px] placeholder:text-body-muted/40"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-body-muted font-mono">Message</label>
                  <textarea 
                    required
                    rows={6}
                    placeholder="Tell me a little about the project or the idea."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full bg-surface-75/50 border border-border-subtle px-4 py-4 text-sm text-on-dark focus:border-primary/50 focus:outline-none transition-all rounded-[3px] resize-none placeholder:text-body-muted/40"
                  ></textarea>
                </div>

                {cooldown && (
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-widest text-center rounded-[3px]"
                  >
                    Slow down! Please wait a few minutes before sending another message.
                  </motion.div>
                )}

                <button 
                  disabled={loading || cooldown}
                  className="bg-on-dark text-canvas px-8 py-3 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-primary transition-all rounded-[3px] flex items-center gap-3 disabled:opacity-50 group w-full justify-center"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : cooldown ? 'Wait a bit...' : 'Send Message'}
                  {!loading && !cooldown && <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar Side */}
          <aside className="border-t border-border-subtle pt-10 lg:border-t-0 lg:border-l lg:pl-10 space-y-12">
            <div className="space-y-4">
              <h2 className="font-heading text-xl font-medium text-on-dark tracking-tight">Direct channels</h2>
              <p className="text-sm leading-relaxed text-body-muted font-sans font-light">
                The form goes to my database and email. These links are here if a direct channel is easier.
              </p>
            </div>

            <ul className="space-y-4">
              {socials.map((social) => (
                <li key={social.name}>
                  <a 
                    href={social.href} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="group flex items-center justify-between py-2 border-b border-border-subtle/50 text-sm text-body-muted hover:text-primary transition-colors"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-widest">{social.name}</span>
                    <span className="text-on-dark/40 group-hover:text-primary transition-colors font-sans">{social.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </aside>

        </section>
      </div>

      <footer className="section-container border-t border-border-subtle py-12 flex justify-between items-center text-[10px] font-mono text-body-muted/40 uppercase tracking-widest">
        <p>© 2026 DRIAN. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-6">
          <Link href="/blog" className="hover:text-on-dark">Blog</Link>
          <Link href="/projects" className="hover:text-on-dark">Projects</Link>
          <Link href="/contact" className="text-on-dark">Contact</Link>
        </div>
      </footer>
    </main>
  );
}
