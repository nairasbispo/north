import React, { useState } from 'react';
import { Menu, Bell, User, Flame, Globe } from 'lucide-react';
import { AppTab, LanguageType } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  activeTab: AppTab;
  languageContext: LanguageType;
  onLanguageChange: (lang: LanguageType) => void;
  onMobileMenuOpen: () => void;
  streak: number;
  currentUser: FirebaseUser | null;
}

export default function Header({ 
  activeTab, 
  languageContext, 
  onLanguageChange, 
  onMobileMenuOpen,
  streak,
  currentUser
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  // Determine title or header widget depending on tab
  const getHeaderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-0.5">
              Painel Geral
            </span>
            <h2 className="font-display text-2xl font-bold text-[#3a302a]">Dashboard</h2>
          </div>
        );
      case 'exercise':
        return (
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-0.5">
              Atividade Física
            </span>
            <h2 className="font-display text-2xl font-bold text-[#3a302a]">Treino de Hoje</h2>
          </div>
        );
      case 'languages':
        return (
          <div className="flex items-center gap-6">
            <div className="flex flex-col mr-2">
              <span className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-0.5">
                Estudo Diário
              </span>
              <h2 className="font-display text-2xl font-bold text-[#3a302a]">Idiomas</h2>
            </div>
            {/* Custom Language Tabs */}
            <div className="flex p-1 bg-[#f2ece4] rounded-full shadow-inner border border-[#d8d0c8]/40">
              <button
                onClick={() => onLanguageChange('en')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  languageContext === 'en'
                    ? 'bg-white text-[#c2652a] shadow-sm'
                    : 'text-[#605850] hover:text-[#c2652a]'
                }`}
              >
                Inglês
              </button>
              <button
                onClick={() => onLanguageChange('fr')}
                className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
                  languageContext === 'fr'
                    ? 'bg-white text-[#c2652a] shadow-sm'
                    : 'text-[#605850] hover:text-[#c2652a]'
                }`}
              >
                Francês
              </button>
            </div>
          </div>
        );
      case 'habits':
        return (
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-0.5">
              Rotina & Consistência
            </span>
            <h2 className="font-display text-2xl font-bold text-[#3a302a]">Visão Geral de Hábitos</h2>
          </div>
        );
      case 'statistics':
        return (
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-0.5">
              Estatísticas Gerais
            </span>
            <h2 className="font-display text-2xl font-bold text-[#3a302a]">Progresso de Atividades</h2>
          </div>
        );
      case 'settings':
        return (
          <div className="flex flex-col">
            <span className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-0.5">
              Preferências do App
            </span>
            <h2 className="font-display text-2xl font-bold text-[#3a302a]">Configurações</h2>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 right-0 w-full z-30 bg-[#faf5ee]/90 backdrop-blur-md border-b border-[#d8d0c8]/50 flex justify-between items-center h-20 px-6 md:px-10 transition-all duration-300">
      {/* Mobile Menu Trigger & Logo */}
      <div className="flex items-center gap-4 md:hidden">
        <button 
          onClick={onMobileMenuOpen}
          className="p-2 text-[#605850] hover:bg-[#c2652a]/10 hover:text-[#c2652a] rounded-full transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex flex-col">
          <h1 className="font-display text-xl font-bold tracking-tight text-[#c2652a] leading-none uppercase">North</h1>
          <span className="text-[10px] font-semibold text-[#78706a] uppercase tracking-wider">Evolution</span>
        </div>
      </div>

      {/* Desktop Contextual Title Widget */}
      <div className="hidden md:block">
        {getHeaderContent()}
      </div>

      {/* Quick Global Actions (Notifications, user stats) */}
      <div className="flex items-center gap-2.5">
        {/* Streak Indicator (Mobile context) */}
        <div className="md:hidden flex items-center gap-1 px-3 py-1 bg-[#c2652a]/10 rounded-full border border-[#c2652a]/10">
          <Flame className="w-4 h-4 text-[#c2652a] fill-[#c2652a]" />
          <span className="text-xs font-bold text-[#c2652a]">{streak}d</span>
        </div>

        {/* Notifications Icon with popover */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 text-[#605850] hover:bg-[#c2652a]/10 hover:text-[#c2652a] rounded-full transition-all relative"
            title="Notificações"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#8c3c3c] rounded-full border-2 border-[#faf5ee]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-[#d8d0c8] rounded-2xl shadow-xl p-4 z-50 text-left">
              <div className="flex justify-between items-center pb-2 border-b border-[#d8d0c8]/60 mb-2">
                <h4 className="font-sans text-sm font-bold text-[#3a302a]">Notificações</h4>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-[#c2652a] hover:underline"
                >
                  Fechar
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3 text-xs leading-relaxed text-[#605850] hover:bg-[#faf5ee] p-2 rounded-lg transition-colors">
                  <span className="text-[#c2652a] font-bold">✨</span>
                  <div>
                    <p className="font-semibold text-[#3a302a]">Foco Atual: Fluência alcançado</p>
                    <p className="text-[#78706a] mt-0.5">Sua consistência em inglês está rendendo excelentes frutos!</p>
                  </div>
                </div>
                <div className="flex gap-3 text-xs leading-relaxed text-[#605850] hover:bg-[#faf5ee] p-2 rounded-lg transition-colors">
                  <span className="text-[#8c3c3c] font-bold">🎯</span>
                  <div>
                    <p className="font-semibold text-[#3a302a]">Próxima atividade em breve</p>
                    <p className="text-[#78706a] mt-0.5">Sua Prática de Francês começa às 10:00.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile picture */}
        <div className="w-9 h-9 rounded-full overflow-hidden border border-[#d8d0c8] shadow-sm">
          <img 
            src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuB_fvfjYbviNKIfXWmXQ-eOVIEvOTeM9mhbY3f8qjao2Z-ZVxURhd14mIdFQJDXMyhk-XrkDXCEFIZnqiLqJ4WhETgr7WrZq6uHCgatQA0eX0jhdHbt0xw9rqvFjVkm-2Z8mTmfFyECmdSTIpBi-xIO7LeMlKI2CKKM5pqJ7ud442YAkcTuP-oxZKzAsRTIibZFuBoCA-LjmiFTx7ui29QUw4QVlQbWQx4tfLof3nIeLVNdg2dtTIs7whEZcG7OSNs-DEmw3Gns0JcJ"}
            alt={currentUser?.displayName || "Usuário"}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
