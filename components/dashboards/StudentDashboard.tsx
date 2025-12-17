import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { BentoCard } from '../UI';
import { Play, Trophy, ChevronRight, Loader2, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface Props {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

interface Scenario {
  id: number;
  uuid: string;
  title: string;
  description: string;
  difficulty: string;
  specialty: string;
  duration_minutes: number;
}

export const StudentDashboard: React.FC<Props> = ({ onLogout, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [stats, setStats] = useState({
    xp: 0,
    level: 'Externe Junior',
    cases_solved: 0,
    accuracy: 0
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // 1. Fetch User Progress (Stats)
        if (user) {
          const { data: progress } = await supabase
            .from('user_progress')
            .select('completed_sessions, avg_accuracy')
            .eq('user_id', user.id)
            .single();

          if (progress) {
            // Calculate pseudo-XP based on sessions and accuracy
            const calculatedXp = (progress.completed_sessions || 0) * 150 + Math.round(progress.avg_accuracy || 0) * 5;
            let level = 'Externe Junior';
            if (calculatedXp > 500) level = 'Externe Confirmé';
            if (calculatedXp > 1500) level = 'Interne';
            if (calculatedXp > 3000) level = 'Chef de Clinique';

            setStats({
              xp: calculatedXp,
              level: level,
              cases_solved: progress.completed_sessions || 0,
              accuracy: Math.round(progress.avg_accuracy || 0)
            });
          }
        }

        // 2. Fetch All Scenarios from the DB
        const { data: scenariosData, error } = await supabase
          .from('scenarios')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching scenarios:', error);
        }

        if (scenariosData) {
          setScenarios(scenariosData);
        }

      } catch (e) {
        console.error("Error loading dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  const getDifficultyColor = (diff: string) => {
    if (!diff) return 'bg-slate-100 text-slate-700';
    const d = diff.toLowerCase();
    if (d.includes('adv') || d.includes('exp')) return 'bg-red-100 text-red-700';
    if (d.includes('int') || d.includes('moy')) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <DashboardLayout role="student" currentView="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-slate-900">Bonjour, Docteur (en devenir) 👋</h2>
        <p className="text-slate-500 mt-2">Prêt pour votre prochaine simulation ?</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Main Action - Featured Case */}
        <div className="md:col-span-2 bg-gradient-to-r from-brand-600 to-cyan-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-brand-500/20 group cursor-pointer hover:scale-[1.01] transition-transform">
           <div className="relative z-10">
             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-white/20">
               <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
               Recommandé
             </div>
             <h3 className="text-2xl font-bold mb-2">{scenarios[0]?.title || "Cas #42 : Détresse respiratoire"}</h3>
             <p className="text-brand-100 mb-6 max-w-md line-clamp-2">
               {scenarios[0]?.description || "Nourrisson de 8 mois. Fièvre depuis 48h. Tirage intercostal marqué. Les parents sont paniqués."}
             </p>
             <button className="bg-white text-brand-700 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-50 transition-colors">
               <Play className="w-4 h-4 fill-current" />
               Lancer la simulation
             </button>
           </div>
           <div className="absolute right-0 bottom-0 opacity-10 md:opacity-20 translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-500">
              <Play className="w-64 h-64" />
           </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
           {loading ? (
             <div className="h-full flex items-center justify-center">
               <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
             </div>
           ) : (
             <>
               <div>
                 <div className="flex items-center gap-2 text-slate-500 mb-2">
                   <Trophy className="w-4 h-4" />
                   <span className="text-sm font-medium">Niveau Actuel</span>
                 </div>
                 <div className="text-3xl font-bold text-slate-900">{stats.level}</div>
                 <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                   <div 
                     className="bg-brand-500 h-full rounded-full transition-all duration-1000 ease-out"
                     style={{ width: `${Math.min((stats.xp / 3000) * 100, 100)}%` }}
                   ></div>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 text-right">{stats.xp} XP</p>
               </div>
               <div className="mt-6 pt-6 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{stats.cases_solved}</p>
                    <p className="text-xs text-slate-500">Cas résolus</p>
                  </div>
                  <div>
                    <p className={`text-2xl font-bold ${stats.accuracy > 70 ? 'text-green-600' : 'text-amber-600'}`}>
                      {stats.accuracy}%
                    </p>
                    <p className="text-xs text-slate-500">Précision</p>
                  </div>
               </div>
             </>
           )}
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
        <BookOpen className="w-5 h-5 text-slate-400" />
        Bibliothèque des cas ({scenarios.length})
      </h3>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
          {scenarios.map((medicalCase, i) => (
            <BentoCard key={medicalCase.id} className="p-0 overflow-hidden group hover:border-brand-300 transition-all">
               <div className="h-40 bg-slate-100 relative">
                 {/* Generate a deterministic random image based on ID or index since scenarios table lacks image_url */}
                 <img 
                   src={`https://source.unsplash.com/random/800x600?medical,pediatrics&sig=${medicalCase.id}`} 
                   className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                   alt={medicalCase.title} 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex items-end p-5">
                   <span className="text-white text-sm font-medium bg-black/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/10">
                     {medicalCase.specialty || 'Pédiatrie'}
                   </span>
                 </div>
               </div>
               <div className="p-5">
                 <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{medicalCase.title}</h4>
                   <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider ${getDifficultyColor(medicalCase.difficulty)}`}>
                     {medicalCase.difficulty}
                   </span>
                 </div>
                 <p className="text-sm text-slate-500 mb-4 line-clamp-2 h-10">{medicalCase.description}</p>
                 <div className="flex items-center justify-between mt-auto">
                   <span className="text-xs font-medium text-slate-400">
                     Durée est. {medicalCase.duration_minutes || 15} min
                   </span>
                   <button className="text-brand-600 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 p-2 rounded-full transition-colors">
                     <ChevronRight className="w-5 h-5" />
                   </button>
                 </div>
               </div>
            </BentoCard>
          ))}
          {scenarios.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p>Aucun scénario disponible pour le moment.</p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};