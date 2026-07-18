import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Dumbbell, 
  Languages, 
  CheckCircle2, 
  BarChart3, 
  Settings as SettingsIcon,
  Flame,
  Cloud,
  CloudOff,
  LogOut,
  LogIn,
  Mail,
  Lock,
  UserPlus
} from 'lucide-react';
import { AppTab } from '../types';
import { User as FirebaseUser } from 'firebase/auth';
import { isFirebaseConfigured } from '../firebase';
import { isSupabaseConfigured, supabase } from '../supabase';


interface SidebarProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  streak: number;
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeTab, 
  onTabChange, 
  streak,
  currentUser,
  authLoading,
  onLogin,
  onLogout 
}: SidebarProps) {
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLocalLoading(true);
    setAuthError('');
    setAuthSuccess('');

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setAuthSuccess('Conta criada! Verifique seu email ou faça login.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setAuthSuccess('Login efetuado!');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro na autenticação.');
    } finally {
      setLocalLoading(false);
    }
  };

  const menuItems = [
    { id: 'dashboard' as AppTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'exercise' as AppTab, label: 'Exercise', icon: Dumbbell },
    { id: 'languages' as AppTab, label: 'Languages', icon: Languages },
    { id: 'habits' as AppTab, label: 'Habits', icon: CheckCircle2 },
    { id: 'statistics' as AppTab, label: 'Statistics', icon: BarChart3 },
    { id: 'settings' as AppTab, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 border-r border-[#d8d0c8]/60 bg-[#faf5ee] flex flex-col h-screen fixed left-0 top-0 py-8 z-40">
      {/* Branding */}
      <div className="px-6 mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight text-[#c2652a] uppercase">North</h1>
        <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#78706a] mt-1">
          Evolution Assistant
        </p>
      </div>

      {/* Cloud sync status indicator */}
      <div className="px-4 mb-4">
        {authLoading ? (
          <div className="text-xs text-[#78706a] px-3 py-1.5 bg-[#f2ece4] rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Carregando nuvem...
          </div>
        ) : (!isFirebaseConfigured && !isSupabaseConfigured) ? (
          <div className="text-[11px] text-[#78706a] px-3 py-2 bg-[#f2ece4] rounded-xl border border-[#d8d0c8]/30 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 font-semibold text-[#8c3c3c]">
              <CloudOff className="w-3.5 h-3.5" />
              Nuvem não configurada
            </div>
            <p className="leading-tight opacity-85">Defina as chaves no painel de Secrets para ativar.</p>
          </div>
        ) : currentUser ? (
          <div className="text-xs text-emerald-800 px-3 py-1.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold">
                <Cloud className="w-3.5 h-3.5 text-emerald-600" />
                {isSupabaseConfigured ? 'Supabase Sincronizado' : 'Firebase Sincronizado'}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button 
              onClick={onLogin}
              className="w-full text-xs text-[#c2652a] font-bold px-3 py-2 bg-[#c2652a]/15 hover:bg-[#c2652a]/20 border border-[#c2652a]/30 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              Entrar com Google
            </button>
            
            {isSupabaseConfigured && (
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailAuth(!showEmailAuth);
                    setAuthError('');
                    setAuthSuccess('');
                  }}
                  className="w-full text-[11px] text-[#78706a] hover:text-[#c2652a] transition-all font-semibold underline text-center cursor-pointer"
                >
                  {showEmailAuth ? 'Ocultar login por Email' : 'Entrar/Criar conta com Email'}
                </button>

                {showEmailAuth && (
                  <form onSubmit={handleEmailAuth} className="bg-white/60 p-2.5 rounded-xl border border-[#d8d0c8]/50 space-y-2 text-left">
                    <div>
                      <label className="text-[9px] font-bold text-[#78706a] uppercase block mb-0.5">Email</label>
                      <div className="relative">
                        <Mail className="w-3 h-3 text-[#9a9088] absolute left-2 top-2" />
                        <input
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-lg pl-6 pr-2 py-1 text-xs text-[#3a302a] focus:outline-none focus:border-[#c2652a]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-bold text-[#78706a] uppercase block mb-0.5">Senha</label>
                      <div className="relative">
                        <Lock className="w-3 h-3 text-[#9a9088] absolute left-2 top-2" />
                        <input
                          type="password"
                          placeholder="••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-lg pl-6 pr-2 py-1 text-xs text-[#3a302a] focus:outline-none focus:border-[#c2652a]"
                          required
                        />
                      </div>
                    </div>

                    {authError && (
                      <p className="text-[9px] text-[#8c3c3c] font-bold leading-tight">{authError}</p>
                    )}
                    {authSuccess && (
                      <p className="text-[9px] text-emerald-700 font-bold leading-tight">{authSuccess}</p>
                    )}

                    <div className="flex gap-1.5 pt-1">
                      <button
                        type="submit"
                        disabled={localLoading}
                        onClick={() => setIsRegister(false)}
                        className="flex-1 bg-[#c2652a] hover:bg-[#8a4518] text-white font-bold py-1 px-2 rounded text-[10px] transition-colors cursor-pointer"
                      >
                        {localLoading && !isRegister ? '...' : 'Entrar'}
                      </button>
                      <button
                        type="submit"
                        disabled={localLoading}
                        onClick={() => setIsRegister(true)}
                        className="flex-1 bg-[#faf5ee] hover:bg-[#f2ece4] text-[#c2652a] border border-[#c2652a]/30 font-bold py-1 px-2 rounded text-[10px] transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <UserPlus className="w-2.5 h-2.5" />
                        Cadastrar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Menu List */}
      <nav className="flex-1 px-3 space-y-1.5">
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-full transition-all duration-300 font-sans text-sm font-medium ${
                isActive
                  ? 'bg-[#c2652a]/10 text-[#c2652a] font-bold border-l-4 border-[#c2652a]'
                  : 'text-[#605850] hover:text-[#c2652a] hover:bg-[#c2652a]/5'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#c2652a]' : 'text-[#9a9088]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User profile card & Streak badge at the bottom */}
      <div className="px-4 mt-auto pt-6 border-t border-[#d8d0c8]/40">
        {/* Streak badge */}
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#c2652a]/5 border border-[#c2652a]/10 rounded-2xl mb-4">
          <Flame className="w-5 h-5 text-[#c2652a] fill-[#c2652a]" />
          <div className="text-left">
            <p className="text-xs font-semibold text-[#c2652a] uppercase tracking-wider">Sequência</p>
            <p className="text-sm font-bold text-[#3a302a]">{streak} dias ativos</p>
          </div>
        </div>

        {/* User Card */}
        <div className="flex items-center justify-between p-3 bg-white/50 rounded-2xl border border-[#d8d0c8]/30">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={currentUser?.photoURL || "https://lh3.googleusercontent.com/aida-public/AB6AXuB_fvfjYbviNKIfXWmXQ-eOVIEvOTeM9mhbY3f8qjao2Z-ZVxURhd14mIdFQJDXMyhk-XrkDXCEFIZnqiLqJ4WhETgr7WrZq6uHCgatQA0eX0jhdHbt0xw9rqvFjVkm-2Z8mTmfFyECmdSTIpBi-xIO7LeMlKI2CKKM5pqJ7ud442YAkcTuP-oxZKzAsRTIibZFuBoCA-LjmiFTx7ui29QUw4QVlQbWQx4tfLof3nIeLVNdg2dtTIs7whEZcG7OSNs-DEmw3Gns0JcJ"}
              alt={currentUser?.displayName || "João Silva"}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-full object-cover border border-[#d8d0c8]/60 shadow-inner"
            />
            <div className="min-w-0 text-left">
              <h4 className="text-sm font-bold text-[#3a302a] truncate">
                {currentUser?.displayName || "João Silva"}
              </h4>
              <p className="text-xs font-semibold text-[#78706a] truncate">
                {currentUser ? "Nuvem Sincronizada" : "Nível 12 • Evoluindo"}
              </p>
            </div>
          </div>
          {currentUser && (
            <button 
              onClick={onLogout}
              className="p-1.5 text-[#78706a] hover:text-[#8c3c3c] hover:bg-[#8c3c3c]/10 rounded-full transition-colors"
              title="Sair da conta"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

