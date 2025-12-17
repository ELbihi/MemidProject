import React, { useEffect, useState, useRef } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { supabase } from '../../lib/supabase';
import { User, Mail, Shield, Trophy, Target, BookOpen, Loader2, Moon, Sun, Globe, Check, Edit2, Save, X, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../UI';

interface Props {
  role: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  setTheme?: (t: 'light' | 'dark') => void;
  language?: 'fr' | 'es';
  setLanguage?: (l: 'fr' | 'es') => void;
}

export const ProfileView: React.FC<Props> = ({ 
  role, 
  onNavigate, 
  onLogout,
  theme = 'light',
  setTheme,
  language = 'fr',
  setLanguage
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    medical_school: '',
    year_of_study: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple translation helper
  const t = (fr: string, es: string) => language === 'fr' ? fr : es;

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Fetch general profile info
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        // Fetch progress stats
        const { data: progress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        // Combine data, explicitly preserving auth_id
        setUserData({
          ...user,
          ...profile,
          auth_id: user.id // Critical for database updates
        });

        // Init form data
        setFormData({
          full_name: profile?.full_name || user.user_metadata?.full_name || '',
          medical_school: profile?.medical_school || '',
          year_of_study: profile?.year_of_study || ''
        });
        
        if (progress) {
           setStats(progress);
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!userData?.auth_id) return;
    setSaving(true);
    try {
       // Using upsert ensures we create the profile if it doesn't exist yet
       // user_id is the unique key we match on
       const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: userData.auth_id, // Match on Auth ID
          full_name: formData.full_name,
          medical_school: formData.medical_school,
          year_of_study: formData.year_of_study,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

       if (error) throw error;

       // Refresh local data
       setUserData({ ...userData, ...formData });
       setIsEditing(false);
       
       // Optional: Update auth metadata too so it persists across sessions if profile load fails
       await supabase.auth.updateUser({
         data: { full_name: formData.full_name }
       });

    } catch (err) {
      console.error("Error updating profile", err);
      alert("Erreur lors de la mise à jour");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    if (!userData?.auth_id) return;

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${userData.auth_id}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    setUploadingPhoto(true);

    try {
      // 1. Upload to 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        // Fallback: If bucket doesn't exist or permissions fail, inform user
        // In a real app we'd handle this more gracefully, but here we alert.
        console.error(uploadError);
        throw new Error("Impossible d'uploader l'image (Vérifiez que le bucket 'avatars' existe).");
      }

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // 3. Update User Profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userData.auth_id);

      if (updateError) throw updateError;

      // 4. Update local state
      setUserData({ ...userData, avatar_url: publicUrl });
      alert("Photo de profil mise à jour !");

    } catch (error: any) {
      alert(error.message || "Erreur lors du changement de photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role={role} currentView="profile" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-brand-600 dark:text-brand-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={role} currentView="profile" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 transition-colors duration-300"
        >
          {/* Avatar Section */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-white dark:border-slate-700 shadow-lg overflow-hidden shrink-0">
               <img 
                 src={userData?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.auth_id}`} 
                 alt="Profile" 
                 className="w-full h-full object-cover"
               />
               {uploadingPhoto && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                   <Loader2 className="w-8 h-8 text-white animate-spin" />
                 </div>
               )}
            </div>
            
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 p-2 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-500 transition-colors border-2 border-white dark:border-slate-900"
              title="Changer la photo"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden"
              accept="image/*"
            />
          </div>
          
          <div className="flex-1 w-full text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              {isEditing ? (
                 <input 
                    type="text" 
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="text-2xl font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1 w-full md:w-auto focus:ring-2 focus:ring-brand-500"
                    placeholder="Votre nom"
                 />
              ) : (
                <div className="flex items-center gap-3 justify-center md:justify-start">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{userData?.full_name || t('Utilisateur', 'Usuario')}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${role === 'professor' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300'}`}>
                    {role === 'professor' ? t('Professeur', 'Profesor') : t('Étudiant', 'Estudiante')}
                  </span>
                </div>
              )}

              <div className="flex gap-2 justify-center">
                 {isEditing ? (
                   <>
                     <button 
                       onClick={handleSaveProfile} 
                       disabled={saving}
                       className="p-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors"
                     >
                       {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                     </button>
                     <button 
                       onClick={() => setIsEditing(false)} 
                       className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                     >
                       <X className="w-5 h-5" />
                     </button>
                   </>
                 ) : (
                   <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                   >
                     <Edit2 className="w-5 h-5" />
                   </button>
                 )}
              </div>
            </div>
            
            <div className="flex flex-col gap-3 text-slate-500 dark:text-slate-400 mb-6">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Mail className="w-4 h-4" />
                <span>{userData?.email}</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2">
                <Shield className="w-4 h-4" />
                <span>ID: {userData?.auth_id?.slice(0, 8)}...</span>
              </div>
              
              <div className="flex flex-col md:flex-row gap-4 mt-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="flex-1 space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase">{t('Université / Faculté', 'Universidad')}</label>
                     {isEditing ? (
                       <input 
                         className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                         value={formData.medical_school}
                         onChange={(e) => setFormData({...formData, medical_school: e.target.value})}
                         placeholder={t("Ex: Faculté de Médecine de Paris", "Ej: Facultad de Madrid")}
                       />
                     ) : (
                       <p className="font-medium text-slate-800 dark:text-slate-200">{userData?.medical_school || t('Non renseigné', 'No especificado')}</p>
                     )}
                  </div>
                  <div className="flex-1 space-y-1">
                     <label className="text-xs font-bold text-slate-400 uppercase">{t('Année d\'étude', 'Año de estudio')}</label>
                     {isEditing ? (
                       <select 
                         className="w-full text-sm p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-white"
                         value={formData.year_of_study}
                         onChange={(e) => setFormData({...formData, year_of_study: e.target.value})}
                       >
                         <option value="">{t('Choisir...', 'Elegir...')}</option>
                         <option value="Externe - 4ème année">Externe - 4ème année</option>
                         <option value="Externe - 5ème année">Externe - 5ème année</option>
                         <option value="Externe - 6ème année">Externe - 6ème année</option>
                         <option value="Interne">Interne</option>
                       </select>
                     ) : (
                       <p className="font-medium text-slate-800 dark:text-slate-200">{userData?.year_of_study || t('Non renseigné', 'No especificado')}</p>
                     )}
                  </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences Section */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
             <SettingsIcon className="w-5 h-5 text-slate-400" />
             {t('Préférences', 'Preferencias')}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
             {/* Theme Switcher - Hide for Admin if forced light mode */}
             {role !== 'admin' && (
             <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                      {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                   </div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t('Apparence', 'Apariencia')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{theme === 'dark' ? t('Mode Sombre', 'Modo Oscuro') : t('Mode Clair', 'Modo Claro')}</p>
                   </div>
                </div>
                <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1 cursor-pointer" onClick={() => setTheme && setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    <motion.div 
                       layout 
                       className="w-6 h-6 bg-white rounded-full shadow-sm"
                       animate={{ x: theme === 'dark' ? 24 : 0 }}
                       transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                    <div className="w-6 h-6" /> {/* Spacer */}
                </div>
             </div>
             )}

             {/* Language Switcher */}
             <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Globe className="w-5 h-5" />
                   </div>
                   <div>
                      <p className="font-bold text-slate-900 dark:text-white">{t('Langue', 'Idioma')}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Français' : 'Español'}</p>
                   </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => setLanguage && setLanguage('fr')}
                     className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${language === 'fr' ? 'bg-white shadow text-brand-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                   >
                     FR
                   </button>
                   <button 
                     onClick={() => setLanguage && setLanguage('es')}
                     className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${language === 'es' ? 'bg-white shadow text-amber-600' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                   >
                     ES
                   </button>
                </div>
             </div>
          </div>
        </motion.div>

        {/* Stats Section (For Students) */}
        {role === 'student' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">{t('Statistiques Cliniques', 'Estadísticas Clínicas')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-2xl">
                  <Trophy className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('Session Complétées', 'Sesiones Completadas')}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.completed_sessions || 0}</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-2xl">
                  <Target className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('Précision Moyenne', 'Precisión Media')}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{Number(stats?.avg_accuracy || 0).toFixed(0)}%</p>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
                <div className="p-4 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <BookOpen className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('Série Actuelle', 'Racha Actual')}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats?.current_streak || 0} {t('jours', 'días')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Helper Icon
const SettingsIcon = (props: any) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
);