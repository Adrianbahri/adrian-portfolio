'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Key, Loader2, ArrowRight, AlertCircle, CheckCircle2, Mail, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

function ResetPasswordContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mode, setMode] = useState<'request' | 'update'>('request');
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Supabase recovery links will have type=recovery or similar or we can detect hash
    const type = searchParams.get('type');
    const code = searchParams.get('code'); // Code PKCE flow if any
    
    // Check if we are in update mode
    if (type === 'recovery' || code || window.location.hash.includes('access_token')) {
      setMode('update');
    }
  }, [searchParams]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const redirectToUrl = `${window.location.origin}/reset-password?type=recovery`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectToUrl,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Reset link has been dispatched to your identifier. Please inspect your inbox.');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError('Access keys do not match.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Access key must contain at least 6 characters.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Access key successfully updated. Re-establishing connection...');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
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
        <div className="bg-[#0a0a0a] border border-white/5 rounded-[3rem] p-12 shadow-2xl backdrop-blur-xl">
          <header className="mb-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-[2.5rem] flex items-center justify-center text-primary mx-auto mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.2)]">
              {mode === 'request' ? <Mail size={38} /> : <Lock size={38} />}
            </div>
            <h1 className="text-3xl font-heading font-medium italic mb-2">
              Adrian <span className="text-primary">{mode === 'request' ? 'Recovery' : 'Key Override'}</span>
            </h1>
            <p className="text-white/40 text-sm uppercase tracking-[0.2em] font-bold">
              {mode === 'request' ? 'Password Reset System' : 'Establish New Access Key'}
            </p>
          </header>

          <AnimatePresence mode="wait">
            {mode === 'request' ? (
              <motion.form 
                key="request-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleRequestReset} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 ml-4">Identifier (Email)</label>
                  <div className="relative group">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@adrianbahri.com"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-medium"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-medium"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                  {loading ? 'Dispatched...' : 'Send Recovery Link'}
                </button>
              </motion.form>
            ) : (
              <motion.form 
                key="update-form"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={handleUpdatePassword} 
                className="space-y-6"
              >
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 ml-4">New Access Key</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.65rem] font-bold uppercase tracking-widest text-white/40 ml-4">Confirm Access Key</label>
                  <div className="relative group">
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.03] border border-white/5 rounded-2xl px-6 py-4 text-sm focus:border-primary/50 outline-none transition-all text-white"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-xs font-medium"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-400 text-xs font-medium"
                  >
                    <CheckCircle2 size={16} className="shrink-0" />
                    <span>{success}</span>
                  </motion.div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary text-black py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-sm hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.2)] disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <Key size={20} />}
                  {loading ? 'Overriding...' : 'Override Access Key'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <footer className="mt-12 pt-8 border-t border-white/5 text-center flex flex-col gap-4">
             {mode === 'update' && (
               <button
                 type="button"
                 onClick={() => setMode('request')}
                 className="text-[0.65rem] text-primary hover:underline uppercase tracking-widest font-bold"
               >
                 Request a new recovery link
               </button>
             )}
             <p className="text-[0.6rem] text-white/20 uppercase tracking-[0.3em]">Encrypted Session Protocol v1.0</p>
          </footer>
        </div>

        <button 
          onClick={() => router.push('/login')}
          className="mt-8 flex items-center justify-center gap-2 text-white/20 hover:text-white transition-all text-[0.6rem] font-bold uppercase tracking-widest mx-auto"
        >
          Return to login portal <ArrowRight size={12} />
        </button>
      </motion.div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
        <div className="text-center relative z-10">
          <Loader2 className="animate-spin text-primary mx-auto mb-4" size={40} />
          <p className="text-white/40 text-xs uppercase tracking-widest font-bold">Initializing Connection...</p>
        </div>
      </main>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
