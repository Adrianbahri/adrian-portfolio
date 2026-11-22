'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion } from '@/lib/motion';
import { Shield, Key, Loader2, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Use replace for faster navigation
      router.replace('/setting');
      // No need to set loading to false here, the navigation will happen
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
      {/* Cinematic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" 
             style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[#0a0a0a] text-zinc-100 border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
          <header className="mb-10 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto mb-5 shadow-[0_0_40px_rgba(255,85,34,0.18)]">
              <Shield size={32} aria-hidden="true" />
            </div>
            <h1 className="text-3xl font-heading font-medium italic mb-2 text-white">Adrian <span className="text-primary">Terminal</span></h1>
            <p className="text-zinc-400 text-xs uppercase tracking-[0.2em] font-semibold">Authorized Access Only</p>
          </header>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login-email" className="block text-[11px] font-bold uppercase tracking-widest text-zinc-300 ml-1">
                Identifier
              </label>
              <div className="relative group">
                <input 
                  id="login-email"
                  type="email" 
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@adrianbahri.com"
                  className="w-full min-h-[48px] bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="login-password" className="block text-[11px] font-bold uppercase tracking-widest text-zinc-300 ml-1">
                Access Key
              </label>
              <div className="relative group">
                <input 
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full min-h-[48px] bg-white/[0.04] border border-white/10 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white placeholder:text-zinc-500 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div 
                role="alert"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-xs font-medium"
              >
                <AlertCircle size={16} aria-hidden="true" className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="flex justify-end mt-1">
              <button
                type="button"
                onClick={() => router.push('/reset-password')}
                className="text-xs text-primary hover:text-primary-hover uppercase tracking-widest font-bold transition-colors cursor-pointer py-1"
              >
                Forgot Access Key?
              </button>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full min-h-[52px] bg-primary text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs sm:text-sm hover:bg-primary-hover transition-all flex items-center justify-center gap-3 shadow-[0_16px_36px_rgba(255,85,34,0.22)] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={18} aria-hidden="true" /> : <Key size={18} aria-hidden="true" />}
              <span>{loading ? 'Authenticating...' : 'Establish Connection'}</span>
            </button>
          </form>

          <footer className="mt-12 pt-8 border-t border-white/5 text-center">
             <p className="text-[0.6rem] text-white/20 uppercase tracking-[0.3em]">Encrypted Session Protocol v1.0</p>
          </footer>
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-8 flex items-center justify-center gap-2 text-white/20 hover:text-white transition-all text-[0.6rem] font-bold uppercase tracking-widest mx-auto"
        >
          Return to public site <ArrowRight size={12} />
        </button>
      </motion.div>
    </main>
  );
}
