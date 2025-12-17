import React from 'react';
import { Activity, LogOut, Bell, User, LayoutDashboard, GraduationCap, Users, ShieldCheck, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
  currentView?: string; 
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  role, 
  currentView = 'dashboard', 
  onNavigate, 
  onLogout 
}) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  const getRoleBadgeColor = () => {
    switch(role) {
      case 'admin': return 'bg-purple-500 text-purple-50 border-purple-400/50';
      case 'professor': return 'bg-amber-500 text-amber-50 border-amber-400/50';
      default: return 'bg-brand-500 text-brand-50 border-brand-400/50';
    }
  };

  const getRoleLabel = () => {
    switch(role) {
      case 'admin': return 'Administrateur';
      case 'professor': return 'Professeur';
      default: return 'Étudiant';
    }
  };

  const getDashboardLabel = () => {
    if (role === 'student') return 'Espace Clinique';
    return 'Tableau de bord';
  };

  const isActive = (view: string) => currentView === view;

  const NavItem = ({ view, icon: Icon, label }: { view: string, icon: any, label: string }) => (
    <div 
      onClick={() => onNavigate(view)}
      className={`p-3 rounded-xl cursor-pointer flex items-center gap-3 transition-colors ${isActive(view) ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' : 'bg-transparent text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
       <Icon className="w-5 h-5" />
       <span className="hidden lg:block font-medium">{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative flex font-sans transition-colors duration-300">
      {/* Background Texture */}
      <div className="noise-bg fixed inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-[0.4] pointer-events-none dark:opacity-[0.05]" />

      {/* Sidebar */}
      <aside className="w-20 lg:w-64 bg-slate-900 dark:bg-slate-900 text-white fixed h-full z-40 hidden md:flex flex-col border-r border-white/10">
        <div className="p-6 flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="bg-brand-600 p-1.5 rounded-lg shrink-0">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden lg:block">MedMemic</span>
        </div>

        <div className="px-6 py-4 hidden lg:block">
           <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor()}`}>
             {getRoleLabel()}
           </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
           {/* Dashboard Link */}
           <NavItem 
             view="dashboard" 
             icon={role === 'student' ? GraduationCap : LayoutDashboard} 
             label={getDashboardLabel()} 
           />

           {/* Admin Specific Links */}
           {role === 'admin' && (
             <>
               <NavItem view="admin-users" icon={Users} label="Utilisateurs" />
               <NavItem view="admin-scenarios" icon={FileText} label="Scénarios" />
               <NavItem view="admin-approvals" icon={ShieldCheck} label="Approbations" />
             </>
           )}

           {/* Profile Link */}
           <NavItem view="profile" icon={User} label="Mon Profil" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-0 md:ml-20 lg:ml-64 p-4 md:p-8 overflow-x-hidden">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 flex justify-around items-center">
         <button onClick={() => onNavigate('dashboard')} className={`p-2 rounded-full ${currentView === 'dashboard' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}>
            {role === 'student' ? <GraduationCap className="w-6 h-6" /> : <LayoutDashboard className="w-6 h-6" />}
         </button>
         
         {role === 'admin' && (
           <>
             <button onClick={() => onNavigate('admin-users')} className={`p-2 rounded-full ${currentView === 'admin-users' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}>
                <Users className="w-6 h-6" />
             </button>
             <button onClick={() => onNavigate('admin-scenarios')} className={`p-2 rounded-full ${currentView === 'admin-scenarios' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}>
                <FileText className="w-6 h-6" />
             </button>
           </>
         )}

         <button onClick={() => onNavigate('profile')} className={`p-2 rounded-full ${currentView === 'profile' ? 'bg-brand-100 text-brand-600' : 'text-slate-400'}`}>
            <User className="w-6 h-6" />
         </button>
         <button onClick={handleLogout} className="p-2 rounded-full text-red-400">
            <LogOut className="w-6 h-6" />
         </button>
      </div>
    </div>
  );
};