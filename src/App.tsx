import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  X, 
  LayoutDashboard, 
  Dumbbell, 
  Languages, 
  CheckCircle2, 
  BarChart3, 
  Settings as SettingsIcon,
  Flame,
  Award,
  LogIn,
  LogOut,
  CloudOff,
  Cloud
} from 'lucide-react';
import { AppTab, Habit, ExerciseLog, RoutineSettings, LanguageType, LanguageLog } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardTab from './components/DashboardTab';
import ExerciseTab from './components/ExerciseTab';
import LanguagesTab from './components/LanguagesTab';
import HabitsTab from './components/HabitsTab';
import StatisticsTab from './components/StatisticsTab';
import SettingsTab from './components/SettingsTab';
import LoginModal from './components/LoginModal';
import { useFirebaseSync } from './hooks/useFirebaseSync';
import { loginWithGoogle, logout, isFirebaseConfigured } from './firebase';

export default function App() {
  const {
    currentUser,
    authLoading,
    firestoreLoading,
    isCloudSyncActive,
    streak,
    waterAmount,
    habits,
    logs,
    languageLogs,
    settings,
    toggleHabit,
    addHabit,
    deleteHabit,
    addExerciseLog,
    addLanguageHours,
    addWater,
    saveSettings,
  } = useFirebaseSync();

  // Navigation states
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [languageContext, setLanguageContext] = useState<LanguageType>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Compute total languageHours dynamically
  const languageHours = languageLogs.reduce((sum, log) => sum + log.hours, 0);

  // Language Levels Progress definitions
  const englishProgress = {
    listening: 85,
    speaking: 70,
    reading: 90,
    writing: 65,
    grammar: 80,
    vocabulary: 75,
    conversation: 80
  };

  const frenchProgress = {
    listening: 40,
    speaking: 35,
    reading: 55,
    writing: 30,
    grammar: 45,
    vocabulary: 40,
    conversation: 30
  };

  // Render correct tab panels
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardTab
            onTabChange={setActiveTab}
            streak={streak}
            habits={habits}
            onToggleHabit={toggleHabit}
            waterAmount={waterAmount}
            onAddWater={addWater}
            logs={logs}
            languageLogs={languageLogs}
          />
        );
      case 'exercise':
        return (
          <ExerciseTab
            logs={logs}
            onAddLog={addExerciseLog}
            settings={settings}
          />
        );
      case 'languages':
        return (
          <LanguagesTab
            languageContext={languageContext}
            englishProgress={englishProgress}
            frenchProgress={frenchProgress}
            onAddLanguageHours={(hours, lang, skills) => addLanguageHours(hours, lang || languageContext, skills)}
            languageLogs={languageLogs}
          />
        );
      case 'habits':
        return (
          <HabitsTab
            habits={habits}
            onToggleHabit={toggleHabit}
            onAddHabit={addHabit}
            onDeleteHabit={deleteHabit}
            streak={streak}
          />
        );
      case 'statistics':
        return (
          <StatisticsTab
            logs={logs}
            languageHours={languageHours}
            habitsCompletedCount={habits.filter(h => h.completed).length}
            streak={streak}
            settings={settings}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            settings={settings}
            onSaveSettings={saveSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col bg-[#faf5ee] selection:bg-[#c2652a]/20 ${settings.darkTheme ? 'dark bg-amber-950/25' : ''}`}>
      
      {/* Sidebar for Desktop navigation */}
      <div className="hidden md:block">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          streak={streak}
          currentUser={currentUser}
          authLoading={authLoading}
          onLogin={() => setIsLoginModalOpen(true)}
          onLogout={logout}
          isCloudSyncActive={isCloudSyncActive}
        />
      </div>

      {/* Mobile Sidebar/Drawer Menu Slide-over */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-[#3a302a] z-50 md:hidden"
            />
            {/* Drawer */}
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#faf5ee] border-r border-[#d8d0c8] p-6 z-50 flex flex-col justify-between md:hidden"
            >
              <div>
                <div className="flex justify-between items-center mb-10">
                  <div className="text-left">
                    <h1 className="font-display text-2xl font-bold text-[#c2652a] uppercase leading-none">North</h1>
                    <span className="text-[10px] font-semibold text-[#78706a] uppercase tracking-wider block mt-1">Evolution Assistant</span>
                  </div>
                  <button 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-[#605850] hover:bg-[#c2652a]/10 hover:text-[#c2652a] rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Navigation List */}
                <nav className="space-y-1.5">
                  {[
                    { id: 'dashboard' as AppTab, label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'exercise' as AppTab, label: 'Exercise', icon: Dumbbell },
                    { id: 'languages' as AppTab, label: 'Languages', icon: Languages },
                    { id: 'habits' as AppTab, label: 'Habits', icon: CheckCircle2 },
                    { id: 'statistics' as AppTab, label: 'Statistics', icon: BarChart3 },
                    { id: 'settings' as AppTab, label: 'Settings', icon: SettingsIcon },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-full font-sans text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-[#c2652a]/10 text-[#c2652a] font-bold border-l-4 border-[#c2652a]'
                            : 'text-[#605850] hover:text-[#c2652a]'
                        }`}
                      >
                        <IconComp className="w-5 h-5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User details footer */}
              <div className="pt-6 border-t border-[#d8d0c8]/50 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setIsLoginModalOpen(true);
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 text-left focus:outline-none ${!currentUser ? 'hover:opacity-85 active:scale-95 transition-all cursor-pointer' : ''}`}
                >
                  <img
                    src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuB_fvfjYbviNKIfXWmXQ-eOVIEvOTeM9mhbY3f8qjao2Z-ZVxURhd14mIdFQJDXMyhk-XrkDXCEFIZnqiLqJ4WhETgr7WrZq6uHCgatQA0eX0jhdHbt0xw9rqvFjVkm-2Z8mTmfFyECmdSTIpBi-xIO7LeMlKI2CKKM5pqJ7ud442YAkcTuP-oxZKzAsRTIibZFuBoCA-LjmiFTx7ui29QUw4QVlQbWQx4tfLof3nIeLVNdg2dtTIs7whEZcG7OSNs-DEmw3Gns0JcJ"}
                    alt={currentUser?.displayName || "João Silva"}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-[#d8d0c8]/60"
                  />
                  <div className="text-left">
                    <p className="text-sm font-bold text-[#3a302a]">{currentUser?.displayName || "João Silva"}</p>
                    <p className="text-xs font-semibold text-[#78706a]">
                      {currentUser ? "Nuvem Sincronizada" : "Entrar com Google"}
                    </p>
                  </div>
                </button>
                {currentUser && (
                  <button 
                    onClick={logout}
                    className="p-1.5 text-[#78706a] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 rounded-full transition-colors"
                    title="Sair"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        
        {/* Dynamic header */}
        <Header 
          activeTab={activeTab} 
          languageContext={languageContext}
          onLanguageChange={setLanguageContext}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
          streak={streak}
          currentUser={currentUser}
          onLoginClick={() => setIsLoginModalOpen(true)}
        />

        {/* Tab Canvas Content */}
        <main className="flex-1 p-6 md:p-10 max-w-[1200px] w-full mx-auto pb-20">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </main>

        {/* Floating Google Login Modal */}
        <AnimatePresence>
          {isLoginModalOpen && (
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onLogin={() => {
                loginWithGoogle().finally(() => {
                  setIsLoginModalOpen(false);
                });
              }}
              currentUser={currentUser}
              authLoading={authLoading}
              isFirebaseConfigured={isFirebaseConfigured}
            />
          )}
        </AnimatePresence>

        {/* Footer Area with credit info */}
        <footer className="py-6 border-t border-[#d8d0c8]/40 text-center opacity-60">
          <p className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider">
            Design adaptativo otimizado para Sahara.
          </p>
        </footer>
      </div>

    </div>
  );
}
