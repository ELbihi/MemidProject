import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Key, Save, AlertCircle, ArrowRight, ExternalLink } from 'lucide-react';
import { configureSupabase } from '../lib/supabase';
import { Button } from './UI';

export const SetupScreen: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    
    setLoading(true);
    // Simulate a brief processing time for UX
    setTimeout(() => {
      configureSupabase(apiKey.trim());
    }, 800);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden p-4 font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern-dark bg-grid opacity-[0.1]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <div className="glass-card-dark bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto w-16 h-16 bg-brand-500/20 rounded-2xl flex items-center justify-center mb-6 text-brand-400 border border-brand-500/30">
              <Database className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Configuration Requise</h1>
            <p className="text-slate-400">Pour connecter MedMemic à votre base de données, nous avons besoin de votre clé API publique.</p>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-8 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
             <div className="text-sm text-amber-200/80">
                <p className="mb-2 font-medium text-amber-400">Instructions :</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Allez sur votre dashboard Supabase.</li>
                  <li>Projet: <strong>pdhgguquynvakmxghvok</strong></li>
                  <li>Settings &rarr; API &rarr; Project API keys</li>
                  <li>Copiez la clé <strong>anon</strong> / <strong>public</strong>.</li>
                </ol>
             </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-300 ml-1">Clé API (anon public)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-xl bg-slate-950/50 border border-white/10 focus:bg-slate-950 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all outline-none text-white font-mono text-sm placeholder:text-slate-600"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  required
                />
              </div>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              size="lg"
              disabled={loading}
              className="h-14 text-lg bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 border-none"
            >
              {loading ? (
                <span className="flex items-center gap-2">Configuration...</span>
              ) : (
                <span className="flex items-center gap-2">Connecter <ArrowRight className="w-5 h-5" /></span>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
             <a 
               href="https://supabase.com/dashboard/project/pdhgguquynvakmxghvok/settings/api" 
               target="_blank" 
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
             >
               Ouvrir Supabase Dashboard <ExternalLink className="w-3 h-3" />
             </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};