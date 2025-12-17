import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, Lock, AlertCircle, CheckCircle, Shield, GraduationCap, Stethoscope, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: (role: string) => void;
  onSignupClick: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onBack, onLoginSuccess, onSignupClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Authenticate user
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur utilisateur non trouvé.");

      setSuccessMsg("Connexion réussie ! Chargement du profil...");

      // 2. Determine Role from Database (Source of Truth)
      let role = authData.user.user_metadata?.role || 'student';
      
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (profileData && profileData.role) {
        role = profileData.role;
      }

      console.log(`User logged in as ${role}`);
      
      setTimeout(() => {
        onLoginSuccess(role);
      }, 800);

    } catch (err: any) {
      if (err.message && err.message.includes('anon key')) {
         setError("Erreur config : Clé API manquante.");
      } else {
         setError(err.message || "Erreur de connexion.");
      }
      setLoading(false);
    }
  };

  // Quick Access for Demo/Testing
  const handleDemoLogin = (role: string) => {
    setLoading(true);
    // Simulate network delay for realism
    setTimeout(() => {
      onLoginSuccess(role);
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.4]" />
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-8 group font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Retour à l'accueil
        </button>

        <div className="glass-card bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-8 md:p-10">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Bienvenue</h1>
            <p className="text-slate-500">Connectez-vous à votre espace MedMemic</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-sm"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </motion.div>
          )}

          {successMsg && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 rounded-xl bg-green-50 border border-green-100 flex items-start gap-3 text-green-700 text-sm"
            >
              <CheckCircle className="w-5 h-5 shrink-0" />
              <p>{successMsg}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="nom@exemple.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-slate-900 placeholder:text-slate-400 font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Pas encore de compte ?{' '}
              <button onClick={onSignupClick} className="text-brand-600 font-bold hover:underline">
                Créer un compte
              </button>
            </p>
          </div>

          {/* DEMO / DEV ACCESS */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
               <Eye className="w-3 h-3" />
               Mode Démonstration
             </div>
             <div className="grid grid-cols-3 gap-2">
               <button 
                 onClick={() => handleDemoLogin('student')}
                 className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 transition-all"
               >
                  <GraduationCap className="w-4 h-4 text-brand-600 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-600">Étudiant</span>
               </button>
               <button 
                 onClick={() => handleDemoLogin('professor')}
                 className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-all"
               >
                  <Stethoscope className="w-4 h-4 text-amber-600 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-600">Prof.</span>
               </button>
               <button 
                 onClick={() => handleDemoLogin('admin')}
                 className="flex flex-col items-center justify-center p-2 rounded-lg bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all"
               >
                  <Shield className="w-4 h-4 text-purple-600 mb-1" />
                  <span className="text-[10px] font-semibold text-slate-600">Admin</span>
               </button>
             </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};