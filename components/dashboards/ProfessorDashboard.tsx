import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { Button } from '../UI';
import { Plus, Users, FileText, TrendingUp, Search, BookOpen, Loader2, Video, FileText as FileIcon, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onLogout: () => void;
  onNavigate: (view: string) => void;
}

interface Scenario {
  id: number;
  title: string;
  difficulty: string;
  specialty: string;
  created_at: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  content_type: 'pdf' | 'video' | 'text';
}

export const ProfessorDashboard: React.FC<Props> = ({ onLogout, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  
  // Real Data State
  const [stats, setStats] = useState({
    activeStudents: 0,
    publishedScenarios: 0,
    globalSuccessRate: 0,
  });
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  
  // Modal State for Adding Course
  const [selectedScenarioId, setSelectedScenarioId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', description: '', type: 'text' });
  const [savingCourse, setSavingCourse] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Get Active Students count
      const { count: studentCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'student');

      // 2. Get Scenarios count & list
      const { data: scenarioData, count: scenarioCount } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      // 3. Calculate Global Success Rate (Average of all completed sessions)
      const { data: sessions } = await supabase
        .from('scenario_sessions')
        .select('accuracy_score')
        .not('accuracy_score', 'is', null);

      let avgSuccess = 0;
      if (sessions && sessions.length > 0) {
        const total = sessions.reduce((acc, curr) => acc + (curr.accuracy_score || 0), 0);
        avgSuccess = Math.round(total / sessions.length);
      }

      setStats({
        activeStudents: studentCount || 0,
        publishedScenarios: scenarioCount || 0,
        globalSuccessRate: avgSuccess,
      });

      if (scenarioData) {
        setScenarios(scenarioData);
      }

    } catch (error) {
      console.error("Error fetching professor dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScenarioId) return;
    
    setSavingCourse(true);
    try {
      const { error } = await supabase.from('scenario_courses').insert({
        scenario_id: selectedScenarioId,
        title: newCourse.title,
        description: newCourse.description,
        content_type: newCourse.type
      });

      if (error) throw error;
      
      // Reset and close
      setIsModalOpen(false);
      setNewCourse({ title: '', description: '', type: 'text' });
      alert("Cours ajouté avec succès au scénario !");
      
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du cours.");
    } finally {
      setSavingCourse(false);
    }
  };

  const openAddCourseModal = (scenarioId: number) => {
    setSelectedScenarioId(scenarioId);
    setIsModalOpen(true);
  };

  const getDifficultyColor = (diff: string) => {
    if (!diff) return 'bg-slate-100 text-slate-700';
    const d = diff.toLowerCase();
    if (d.includes('exp') || d.includes('adv')) return 'bg-red-100 text-red-700';
    if (d.includes('int') || d.includes('moy')) return 'bg-amber-100 text-amber-700';
    return 'bg-green-100 text-green-700';
  };

  return (
    <DashboardLayout role="professor" currentView="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Espace Professeur</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Données en temps réel de votre cohorte.</p>
        </div>
        <Button className="gap-2 shadow-amber-500/20 bg-amber-600 hover:bg-amber-700">
          <Plus className="w-4 h-4" />
          Nouveau Scénario
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-amber-600" />
        </div>
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
               <div className="text-slate-500 text-sm mb-1 flex items-center gap-2"><Users className="w-4 h-4"/> Étudiants actifs</div>
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeStudents}</div>
               <div className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1"><TrendingUp className="w-3 h-3"/> Base de données live</div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
               <div className="text-slate-500 text-sm mb-1 flex items-center gap-2"><FileText className="w-4 h-4"/> Scénarios publiés</div>
               <div className="text-3xl font-bold text-slate-900 dark:text-white">{stats.publishedScenarios}</div>
             </div>
             <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2 transition-colors">
                <div className="text-slate-500 text-sm mb-3">Taux de réussite global (Moyenne)</div>
                <div className="flex items-end gap-2">
                  <div className="text-4xl font-bold text-slate-900 dark:text-white">{stats.globalSuccessRate}%</div>
                  <div className="text-sm text-slate-400 mb-2">sur les sessions terminées</div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                   <div 
                     className="bg-amber-500 h-full rounded-full transition-all duration-1000" 
                     style={{ width: `${stats.globalSuccessRate}%` }}
                   ></div>
                </div>
             </div>
          </div>

          {/* Scenarios Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm transition-colors">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Gestion des Scénarios & Cours</h3>
              <div className="relative hidden md:block">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-900 dark:text-white placeholder:text-slate-500" 
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                  <tr>
                    <th className="px-6 py-4">Titre du cas</th>
                    <th className="px-6 py-4">Spécialité</th>
                    <th className="px-6 py-4">Difficulté</th>
                    <th className="px-6 py-4">Date de création</th>
                    <th className="px-6 py-4 text-right">Ressources</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scenarios.map((scenario) => (
                    <tr key={scenario.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{scenario.title}</td>
                      <td className="px-6 py-4">{scenario.specialty || 'Général'}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getDifficultyColor(scenario.difficulty)}`}>
                          {scenario.difficulty}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(scenario.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => openAddCourseModal(scenario.id)}
                          className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium hover:bg-amber-50 dark:hover:bg-amber-900/30 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <BookOpen className="w-4 h-4" />
                          Ajouter un cours
                        </button>
                      </td>
                    </tr>
                  ))}
                  {scenarios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                        Aucun scénario trouvé. Créez-en un pour commencer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Course Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white">Ajouter une ressource</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddCourse} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Titre du cours</label>
                  <input 
                    type="text" 
                    required
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                    placeholder="Ex: Fiche de synthèse Bronchiolite"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Type de contenu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['text', 'pdf', 'video'].map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setNewCourse({...newCourse, type: type as any})}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          newCourse.type === type 
                            ? 'bg-amber-50 border-amber-500 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' 
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'
                        }`}
                      >
                        {type === 'text' && <FileIcon className="w-5 h-5 mb-1" />}
                        {type === 'pdf' && <FileText className="w-5 h-5 mb-1" />}
                        {type === 'video' && <Video className="w-5 h-5 mb-1" />}
                        <span className="text-xs font-bold uppercase">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Description / Lien</label>
                  <textarea 
                    required
                    value={newCourse.description}
                    onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
                    placeholder="Collez le contenu ou le lien vers la ressource ici..."
                    className="w-full h-32 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-amber-500 outline-none text-slate-900 dark:text-white resize-none"
                  />
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    fullWidth 
                    disabled={savingCourse}
                    className="bg-amber-600 hover:bg-amber-700 text-white"
                  >
                    {savingCourse ? <Loader2 className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Enregistrer le cours</span>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};