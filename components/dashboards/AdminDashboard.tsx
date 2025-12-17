import React, { useEffect, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { BentoCard, Button } from '../UI';
import { 
  ShieldAlert, Server, Users, Database, Loader2, RefreshCw, 
  Search, Trash2, Edit2, CheckCircle, XCircle, FileText, 
  Check, X, GraduationCap, Stethoscope, Filter, Plus, Clock, Save
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { motion } from 'framer-motion';

interface Props {
  onLogout: () => void;
  onNavigate: (view: string) => void;
  defaultTab?: 'overview' | 'users' | 'scenarios' | 'approvals';
}

type TabView = 'overview' | 'users' | 'scenarios' | 'approvals';

export const AdminDashboard: React.FC<Props> = ({ onLogout, onNavigate, defaultTab = 'overview' }) => {
  const [currentTab, setCurrentTab] = useState<TabView>(defaultTab);
  const [loading, setLoading] = useState(false);
  
  // Data States
  const [stats, setStats] = useState({ totalUsers: 0, totalScenarios: 0, pendingApprovals: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [scenariosList, setScenariosList] = useState<any[]>([]);
  const [pendingCourses, setPendingCourses] = useState<any[]>([]);

  // Filter States
  const [userFilter, setUserFilter] = useState<'all' | 'student' | 'professor'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit User State
  const [editingUser, setEditingUser] = useState<any>(null);

  // Scenario Modal State
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<any>(null);
  const [scenarioForm, setScenarioForm] = useState({
    title: '',
    description: '',
    difficulty: 'Débutant',
    specialty: 'Pédiatrie Générale',
    duration_minutes: 15
  });

  // Sync prop change (from sidebar) to local state
  useEffect(() => {
    setCurrentTab(defaultTab);
  }, [defaultTab]);

  useEffect(() => {
    fetchData();
  }, [currentTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Overview Stats
      if (currentTab === 'overview') {
        const { count: usersCount } = await supabase.from('user_profiles').select('*', { count: 'exact', head: true });
        const { count: scenariosCount } = await supabase.from('scenarios').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await supabase.from('scenario_courses').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        
        setStats({
          totalUsers: usersCount || 0,
          totalScenarios: scenariosCount || 0,
          pendingApprovals: pendingCount || 0
        });
      }

      // 2. Users List
      if (currentTab === 'users') {
        const { data } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setUsers(data);
      }

      // 3. Scenarios List
      if (currentTab === 'scenarios') {
        const { data } = await supabase
          .from('scenarios')
          .select('*')
          .order('created_at', { ascending: false });
        if (data) setScenariosList(data);
      }

      // 4. Pending Approvals
      if (currentTab === 'approvals') {
        // Fetch courses and join with scenarios to get the scenario title
        const { data } = await supabase
          .from('scenario_courses')
          .select(`
            *,
            scenarios (
              title
            )
          `)
          .eq('status', 'pending');
        
        if (data) setPendingCourses(data);
      }

    } catch (e) {
      console.error("Admin fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  // --- USER ACTIONS ---

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;

    try {
      const { error } = await supabase.from('user_profiles').delete().eq('user_id', userId);
      if (error) throw error;
      setUsers(users.filter(u => u.user_id !== userId));
    } catch (err) {
      alert("Erreur lors de la suppression.");
      console.error(err);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          full_name: editingUser.full_name,
          role: editingUser.role 
        })
        .eq('user_id', editingUser.user_id);

      if (error) throw error;

      setUsers(users.map(u => u.user_id === editingUser.user_id ? editingUser : u));
      setEditingUser(null);
    } catch (err) {
      alert("Erreur maj profil");
    }
  };

  // --- SCENARIO ACTIONS ---

  const handleOpenScenarioModal = (scenario: any = null) => {
    if (scenario) {
      setEditingScenario(scenario);
      setScenarioForm({
        title: scenario.title,
        description: scenario.description,
        difficulty: scenario.difficulty,
        specialty: scenario.specialty,
        duration_minutes: scenario.duration_minutes
      });
    } else {
      setEditingScenario(null);
      setScenarioForm({
        title: '',
        description: '',
        difficulty: 'Débutant',
        specialty: 'Pédiatrie Générale',
        duration_minutes: 15
      });
    }
    setIsScenarioModalOpen(true);
  };

  const handleSaveScenario = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScenario) {
        // Update
        const { data, error } = await supabase
          .from('scenarios')
          .update(scenarioForm)
          .eq('id', editingScenario.id)
          .select();
        
        if (error) throw error;
        
        // Update local state
        setScenariosList(scenariosList.map(s => s.id === editingScenario.id ? data[0] : s));
      } else {
        // Create
        const { data, error } = await supabase
          .from('scenarios')
          .insert([scenarioForm])
          .select();

        if (error) throw error;
        
        // Update local state
        setScenariosList([data[0], ...scenariosList]);
      }
      setIsScenarioModalOpen(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement du scénario.");
    }
  };

  const handleDeleteScenario = async (id: number) => {
    if (!window.confirm("Supprimer ce scénario et toutes les données associées ?")) return;
    try {
      const { error } = await supabase.from('scenarios').delete().eq('id', id);
      if (error) throw error;
      setScenariosList(scenariosList.filter(s => s.id !== id));
    } catch (err) {
      alert("Impossible de supprimer ce scénario (peut-être lié à des sessions).");
    }
  };

  // --- APPROVAL ACTIONS ---

  const handleCourseDecision = async (courseId: string, status: 'approved' | 'rejected') => {
    try {
      if (status === 'rejected') {
        if (!window.confirm("Rejeter et supprimer ce cours ?")) return;
        await supabase.from('scenario_courses').delete().eq('id', courseId);
      } else {
        await supabase.from('scenario_courses').update({ status: 'approved' }).eq('id', courseId);
      }
      
      // Remove from local list
      setPendingCourses(pendingCourses.filter(c => c.id !== courseId));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'action.");
    }
  };

  // --- RENDERERS ---

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <BentoCard className="bg-slate-900 text-white border-slate-800">
           <div className="flex items-center gap-3 mb-4 text-slate-400">
             <Users className="w-5 h-5" />
             <span className="text-sm font-medium">Utilisateurs Totaux</span>
           </div>
           <div className="text-4xl font-bold text-white mb-2">{stats.totalUsers}</div>
           <div className="flex gap-2">
             <span className="text-xs px-2 py-1 bg-white/10 rounded text-slate-300">Etudiants & Profs</span>
           </div>
        </BentoCard>

        <BentoCard className="cursor-pointer hover:border-brand-300 transition-colors" onClick={() => setCurrentTab('scenarios')}>
           <div className="flex items-center gap-3 mb-4 text-slate-500">
             <Database className="w-5 h-5" />
             <span className="text-sm font-medium">Scénarios Actifs</span>
           </div>
           <div className="text-4xl font-bold text-slate-900 mb-2">{stats.totalScenarios}</div>
           <p className="text-xs text-slate-400">Cas cliniques disponibles</p>
        </BentoCard>

        <div 
          onClick={() => setCurrentTab('approvals')}
          className="bg-amber-50 border border-amber-100 p-8 rounded-3xl cursor-pointer hover:shadow-lg hover:shadow-amber-100 transition-all group"
        >
           <div className="flex items-center gap-3 mb-4 text-amber-600">
             <ShieldAlert className="w-5 h-5 group-hover:animate-bounce" />
             <span className="text-sm font-bold uppercase tracking-wider">À valider</span>
           </div>
           <div className="text-4xl font-bold text-amber-900 mb-2">{stats.pendingApprovals}</div>
           <p className="text-xs text-amber-700/70">Cours en attente d'approbation</p>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsers = users.filter(u => {
      const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = userFilter === 'all' ? true : u.role === userFilter;
      return matchesSearch && matchesRole;
    });

    return (
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50/50">
           <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
             <input 
               type="text" 
               placeholder="Rechercher..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm"
             />
           </div>
           <div className="flex bg-slate-200 p-1 rounded-lg">
             {['all', 'student', 'professor'].map((f) => (
               <button
                 key={f}
                 onClick={() => setUserFilter(f as any)}
                 className={`px-4 py-1.5 rounded-md text-xs font-bold capitalize transition-all ${userFilter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 {f === 'all' ? 'Tous' : f === 'student' ? 'Étudiants' : 'Profs'}
               </button>
             ))}
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4">Utilisateur</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Université</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                         <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.user_id}`} alt="avatar" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.full_name}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {user.role === 'professor' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-bold border border-amber-200">
                        <Stethoscope className="w-3 h-3" /> Professeur
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200">
                         <GraduationCap className="w-3 h-3" /> Étudiant
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {user.medical_school || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button 
                         onClick={() => setEditingUser(user)}
                         className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                       >
                         <Edit2 className="w-4 h-4" />
                       </button>
                       <button 
                         onClick={() => handleDeleteUser(user.user_id)}
                         className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderScenarios = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-slate-900">Gestion des Scénarios</h3>
        <Button onClick={() => handleOpenScenarioModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Ajouter un scénario
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-xs tracking-wider">
               <tr>
                 <th className="px-6 py-4">Titre</th>
                 <th className="px-6 py-4">Spécialité</th>
                 <th className="px-6 py-4">Difficulté</th>
                 <th className="px-6 py-4">Durée</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
                {scenariosList.map((sc) => (
                  <tr key={sc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">{sc.title}</td>
                    <td className="px-6 py-4 text-slate-600">{sc.specialty}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        sc.difficulty === 'Avancé' ? 'bg-red-100 text-red-700' : 
                        sc.difficulty === 'Intermédiaire' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {sc.difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {sc.duration_minutes} min
                    </td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleOpenScenarioModal(sc)}
                           className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                         >
                           <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                           onClick={() => handleDeleteScenario(sc.id)}
                           className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                         >
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))}
                {scenariosList.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">Aucun scénario trouvé.</td>
                  </tr>
                )}
             </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderApprovals = () => (
    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {pendingCourses.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-3xl border-dashed">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Tout est à jour</h3>
          <p className="text-slate-500">Aucun cours en attente de validation.</p>
        </div>
      ) : (
        pendingCourses.map((course) => (
          <div key={course.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
             <div className="flex items-start gap-4">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                 <FileText className="w-6 h-6" />
               </div>
               <div>
                 <h4 className="text-lg font-bold text-slate-900">{course.title}</h4>
                 <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                   <span className="font-medium text-slate-700">Scénario:</span> 
                   {course.scenarios?.title || "Scénario inconnu"}
                 </div>
                 <p className="text-xs text-slate-400 mt-2 max-w-xl line-clamp-2 bg-slate-50 p-2 rounded border border-slate-100">
                   {course.description}
                 </p>
                 <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                    Type: {course.content_type}
                 </span>
               </div>
             </div>
             
             <div className="flex items-center gap-3 w-full md:w-auto">
                <Button 
                  onClick={() => handleCourseDecision(course.id, 'rejected')}
                  className="flex-1 md:flex-none bg-white border border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-none"
                >
                  <X className="w-4 h-4 mr-2" /> Rejeter
                </Button>
                <Button 
                  onClick={() => handleCourseDecision(course.id, 'approved')}
                  className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                >
                  <Check className="w-4 h-4 mr-2" /> Approuver
                </Button>
             </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <DashboardLayout role="admin" currentView="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Administration</h2>
          <p className="text-slate-500 mt-1">Gérez les utilisateurs et le contenu.</p>
        </div>
        
        <div className="bg-white p-1 rounded-xl border border-slate-200 shadow-sm flex overflow-x-auto">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${currentTab === 'overview' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Vue d'ensemble
          </button>
          <button
            onClick={() => setCurrentTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${currentTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Utilisateurs
          </button>
          <button
            onClick={() => setCurrentTab('scenarios')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${currentTab === 'scenarios' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Scénarios
          </button>
          <button
            onClick={() => setCurrentTab('approvals')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 ${currentTab === 'approvals' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
          >
            Approbations
            {stats.pendingApprovals > 0 && (
              <span className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[10px] rounded-full">
                {stats.pendingApprovals}
              </span>
            )}
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
        </div>
      )}

      {!loading && (
        <>
          {currentTab === 'overview' && renderOverview()}
          {currentTab === 'users' && renderUsers()}
          {currentTab === 'scenarios' && renderScenarios()}
          {currentTab === 'approvals' && renderApprovals()}
        </>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl"
           >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Modifier Utilisateur</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Nom Complet</label>
                   <input 
                     className="w-full p-2 border rounded-lg bg-slate-50"
                     value={editingUser.full_name || ''}
                     onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-500 uppercase">Rôle</label>
                   <select 
                     className="w-full p-2 border rounded-lg bg-slate-50"
                     value={editingUser.role}
                     onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                   >
                     <option value="student">Étudiant</option>
                     <option value="professor">Professeur</option>
                     <option value="admin">Admin</option>
                   </select>
                 </div>
                 <div className="flex gap-2 pt-2">
                   <Button type="button" variant="secondary" fullWidth onClick={() => setEditingUser(null)}>Annuler</Button>
                   <Button type="submit" fullWidth>Enregistrer</Button>
                 </div>
              </form>
           </motion.div>
        </div>
      )}

      {/* Create/Edit Scenario Modal */}
      {isScenarioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
           >
             <h3 className="text-xl font-bold text-slate-900 mb-4">{editingScenario ? 'Modifier Scénario' : 'Nouveau Scénario'}</h3>
             <form onSubmit={handleSaveScenario} className="space-y-4">
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Titre</label>
                 <input 
                   required
                   className="w-full p-3 border rounded-xl bg-slate-50"
                   value={scenarioForm.title}
                   onChange={(e) => setScenarioForm({...scenarioForm, title: e.target.value})}
                 />
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Spécialité</label>
                 <input 
                   required
                   className="w-full p-3 border rounded-xl bg-slate-50"
                   value={scenarioForm.specialty}
                   onChange={(e) => setScenarioForm({...scenarioForm, specialty: e.target.value})}
                   placeholder="ex: Cardiologie Pédiatrique"
                 />
               </div>
               <div className="flex gap-4">
                 <div className="flex-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Difficulté</label>
                   <select 
                     className="w-full p-3 border rounded-xl bg-slate-50"
                     value={scenarioForm.difficulty}
                     onChange={(e) => setScenarioForm({...scenarioForm, difficulty: e.target.value})}
                   >
                     <option value="Débutant">Débutant</option>
                     <option value="Intermédiaire">Intermédiaire</option>
                     <option value="Avancé">Avancé</option>
                   </select>
                 </div>
                 <div className="flex-1">
                   <label className="text-xs font-bold text-slate-500 uppercase">Durée (min)</label>
                   <input 
                     type="number"
                     className="w-full p-3 border rounded-xl bg-slate-50"
                     value={scenarioForm.duration_minutes}
                     onChange={(e) => setScenarioForm({...scenarioForm, duration_minutes: parseInt(e.target.value)})}
                   />
                 </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-500 uppercase">Description du cas</label>
                 <textarea 
                   required
                   rows={4}
                   className="w-full p-3 border rounded-xl bg-slate-50"
                   value={scenarioForm.description}
                   onChange={(e) => setScenarioForm({...scenarioForm, description: e.target.value})}
                   placeholder="Contexte clinique, âge du patient, symptômes..."
                 />
               </div>
               
               <div className="flex gap-2 pt-4">
                 <Button type="button" variant="secondary" fullWidth onClick={() => setIsScenarioModalOpen(false)}>Annuler</Button>
                 <Button type="submit" fullWidth>Enregistrer</Button>
               </div>
             </form>
          </motion.div>
        </div>
      )}

    </DashboardLayout>
  );
};