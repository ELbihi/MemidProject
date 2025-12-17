import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Hero, Problem, Solution, Audience, Pricing, FAQ, Footer } from './components/Sections';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { ProfessorDashboard } from './components/dashboards/ProfessorDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { ProfileView } from './components/dashboards/ProfileView';
import { SetupScreen } from './components/SetupScreen';
import { isSupabaseConfigured } from './lib/supabase';

// Expanded view states to include profiles and admin sub-pages
type ViewState = 
  | 'landing' 
  | 'login' 
  | 'signup' 
  | 'student-dashboard' 
  | 'student-profile'
  | 'professor-dashboard' 
  | 'professor-profile'
  | 'admin-dashboard'
  | 'admin-users'
  | 'admin-scenarios'
  | 'admin-approvals'
  | 'admin-profile';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('landing');
  const [isConfigured, setIsConfigured] = useState(true);
  
  // App-wide Preferences
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'fr' | 'es'>('fr');

  useEffect(() => {
    // Check configuration on mount
    setIsConfigured(isSupabaseConfigured());

    // Check system preference for dark mode
    // Only apply if we are NOT in an admin view (though on mount we usually are at landing)
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // If we are mounting into an admin view (e.g. hydration/persisted state in a real app), don't set dark
      if (!currentView.startsWith('admin')) {
        setTheme('dark');
      }
    }
  }, []);

  // Apply Theme Class
  useEffect(() => {
    // Force light mode on landing page and ALL admin pages regardless of theme preference
    if (currentView === 'landing' || currentView.startsWith('admin')) {
      document.documentElement.classList.remove('dark');
      // Sync state if it drifted to dark
      if (theme === 'dark' && currentView.startsWith('admin')) {
        setTheme('light');
      }
      return;
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme, currentView]);

  // Handle successful login by switching to the correct dashboard based on role
  const handleLoginSuccess = (role: string) => {
    switch(role) {
      case 'admin': 
        // Explicitly force light mode for admin
        setTheme('light');
        setCurrentView('admin-dashboard'); 
        break;
      case 'professor': 
        setCurrentView('professor-dashboard'); 
        break;
      case 'student': 
      default: 
        setCurrentView('student-dashboard'); 
        break;
    }
  };

  const handleLogout = () => {
    setCurrentView('landing');
  };

  // Generic navigation handler for dashboards
  const handleNavigate = (view: string, role: string) => {
    if (view === 'profile') {
      // @ts-ignore
      setCurrentView(`${role}-profile` as ViewState);
    } else if (view === 'dashboard') {
      // @ts-ignore
      setCurrentView(`${role}-dashboard` as ViewState);
    } else {
      // Handle specific admin views or others
      setCurrentView(view as ViewState);
    }
  };

  // If not configured (missing API Key), show the Setup Screen
  if (!isConfigured) {
    return <SetupScreen />;
  }

  const renderView = () => {
    switch(currentView) {
      case 'login':
        return (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginPage 
              onBack={() => setCurrentView('landing')} 
              onLoginSuccess={handleLoginSuccess}
              onSignupClick={() => setCurrentView('signup')}
            />
          </motion.div>
        );
      case 'signup':
        return (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupPage 
              onBack={() => setCurrentView('landing')} 
              onLoginClick={() => setCurrentView('login')}
              onSignupSuccess={handleLoginSuccess}
            />
          </motion.div>
        );
      
      // STUDENT VIEWS
      case 'student-dashboard':
        return (
          <motion.div key="student-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <StudentDashboard 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'student')} 
            />
          </motion.div>
        );
      case 'student-profile':
        return (
          <motion.div key="student-prof" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProfileView 
              role="student" 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'student')}
              theme={theme}
              setTheme={setTheme}
              language={language}
              setLanguage={setLanguage}
            />
          </motion.div>
        );

      // PROFESSOR VIEWS
      case 'professor-dashboard':
        return (
          <motion.div key="professor-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProfessorDashboard 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'professor')} 
            />
          </motion.div>
        );
      case 'professor-profile':
        return (
          <motion.div key="professor-prof" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProfileView 
              role="professor" 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'professor')}
              theme={theme}
              setTheme={setTheme}
              language={language}
              setLanguage={setLanguage}
            />
          </motion.div>
        );

      // ADMIN VIEWS
      case 'admin-dashboard':
        return (
          <motion.div key="admin-dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AdminDashboard 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'admin')}
              defaultTab="overview" 
            />
          </motion.div>
        );
      case 'admin-users':
        return (
          <motion.div key="admin-users" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AdminDashboard 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'admin')}
              defaultTab="users"
            />
          </motion.div>
        );
      case 'admin-scenarios':
        return (
          <motion.div key="admin-scenarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AdminDashboard 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'admin')}
              defaultTab="scenarios"
            />
          </motion.div>
        );
      case 'admin-approvals':
        return (
          <motion.div key="admin-approvals" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AdminDashboard 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'admin')}
              defaultTab="approvals"
            />
          </motion.div>
        );
      case 'admin-profile':
        return (
          <motion.div key="admin-prof" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <ProfileView 
              role="admin" 
              onLogout={handleLogout} 
              onNavigate={(v) => handleNavigate(v, 'admin')}
              theme={theme}
              setTheme={setTheme}
              language={language}
              setLanguage={setLanguage}
            />
          </motion.div>
        );

      case 'landing':
      default:
        return (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Navigation onLoginClick={() => setCurrentView('login')} />
            <main>
              <Hero />
              <Problem />
              <Solution />
              <Audience />
              <Pricing />
              <FAQ />
            </main>
            <Footer />
          </motion.div>
        );
    }
  };

  return (
    <div className={`min-h-screen relative font-sans ${theme}`}>
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>
    </div>
  );
};

export default App;