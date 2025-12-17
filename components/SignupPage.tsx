import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Mail, Lock, User, GraduationCap, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SignupPageProps {
  onBack: () => void;
  onLoginClick: () => void;
  onSignupSuccess: (role: string) => void;
}

export const SignupPage: React.FC<SignupPageProps> = ({ onBack, onLoginClick, onSignupSuccess }) => {
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accessCode, setAccessCode] = useState(''); // Code required for professors
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (role === 'professor' && accessCode !== 'MED2024') {
      setError("Code établissement invalide. Impossible de créer un compte Professeur sans autorisation.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Auth User
      // Note: We keep metadata for redundancy, but we will also insert manually below
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role, 
          },
        },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erreur lors de la création du compte.");

      // 2. MANUAL PROFILE CREATION (Robust Fallback)
      // We do this explicitly to avoid relying on database triggers which can be flaky
      
      const userId = authData.user.id;

      // A. Create/Update Profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userId,
          full_name: name,
          email: email,
          role: role,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (profileError) {
        console.error("Profile creation error:", profileError);
        // We continue anyway, as the auth account exists. 
        // The user might just need to update their profile later.
      }

      // B. Create/Update Progress (Default stats)
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          specialty: 'pediatrics',
          created_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (progressError) {
        console.warn("Progress init error:", progressError);
      }

      // 3. Success!
      // Small delay to ensure DB propagation
      setTimeout(() => {
        onSignupSuccess(role);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.4]" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-300/20 rounded-full blur-[100px] animate-blob" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-300/20 rounded-full blur-[100px] animate-blob animation-delay-2000" />
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
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
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Créer un compte</h1>
            <p className="text-slate-500">Rejoignez la communauté MedMemic</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === 'student' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Étudiant
            </button>
            <button
              onClick={() => setRole('professor')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                role === 'professor' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              Professeur
            </button>
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

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Nom complet</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-slate-900 font-medium"
                  placeholder="Jean Dupont"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Email universitaire</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-slate-900 font-medium"
                  placeholder="nom@univ.edu"
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
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all outline-none text-slate-900 font-medium"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Special Field for Professors */}
            <motion.div 
              initial={false}
              animate={{ 
                height: role === 'professor' ? 'auto' : 0,
                opacity: role === 'professor' ? 1 : 0,
                marginBottom: role === 'professor' ? 16 : 0
              }}
              className="overflow-hidden"
            >
              <div className="space-y-1.5 p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <label className="text-sm font-bold text-amber-800 ml-1">Code Établissement (Requis)</label>
                <input 
                  type="text" 
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white border border-amber-200 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder="Ex: MED2024"
                />
                <p className="text-xs text-amber-600/80 mt-1">
                  Pour tester, utilisez le code : <strong>MED2024</strong>
                </p>
              </div>
            </motion.div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold text-lg text-white shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                role === 'professor' 
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' 
                  : 'bg-brand-600 hover:bg-brand-700 shadow-brand-900/20'
              }`}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-slate-500 text-sm">
              Déjà inscrit ?{' '}
              <button onClick={onLoginClick} className="text-brand-600 font-bold hover:underline">
                Se connecter
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};