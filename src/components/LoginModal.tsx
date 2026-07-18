import React from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Cloud, 
  Sparkles, 
  CheckCircle2, 
  LogIn, 
  Shield, 
  Dumbbell, 
  Languages, 
  Flame, 
  Droplet 
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  currentUser: FirebaseUser | null;
  authLoading: boolean;
  isFirebaseConfigured: boolean;
}

export default function LoginModal({
  isOpen,
  onClose,
  onLogin,
  currentUser,
  authLoading,
  isFirebaseConfigured
}: LoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Darkened blur backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#3a302a]/60 backdrop-blur-sm"
        id="login-modal-backdrop"
      />

      {/* Main Card Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-lg bg-[#faf5ee] rounded-3xl border border-[#d8d0c8] shadow-2xl p-6 md:p-8 overflow-hidden z-10 text-center"
        id="login-modal-content"
      >
        {/* Soft top-right ambient background accent */}
        <div className="absolute -top-12 -right-12 w-44 h-44 bg-[#c2652a]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-[#8c3c3c]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#78706a] hover:text-[#c2652a] hover:bg-[#c2652a]/5 rounded-full transition-all cursor-pointer"
          id="login-modal-close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Branding header */}
        <div className="mb-6 mt-2">
          <div className="inline-flex items-center justify-center p-3 bg-[#c2652a]/10 rounded-2xl mb-3 text-[#c2652a]">
            <Cloud className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="font-display text-3xl font-bold text-[#3a302a] tracking-tight uppercase">
            North Cloud Sync
          </h2>
          <p className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mt-1">
            Sincronização de Evolução Pessoal
          </p>
        </div>

        {/* Features list */}
        <div className="bg-white/65 border border-[#d8d0c8]/40 rounded-2xl p-5 mb-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#c2652a]/15 text-[#c2652a] rounded-lg mt-0.5">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#3a302a]">Consistência Total</h4>
              <p className="text-xs text-[#78706a] leading-relaxed">
                Mantenha seu streak ativo de 12 dias e hábitos em dia, sincronizando instantaneamente no servidor.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-[#8c3c3c]/15 text-[#8c3c3c] rounded-lg mt-0.5">
              <Languages className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#3a302a]">Idiomas & Atividades</h4>
              <p className="text-xs text-[#78706a] leading-relaxed">
                Acesse todo seu progresso de imersão de Inglês e Francês, e histórico de exercícios físicos a qualquer momento.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-1.5 bg-blue-500/10 text-blue-600 rounded-lg mt-0.5">
              <Droplet className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#3a302a]">Histórico Multiplataforma</h4>
              <p className="text-xs text-[#78706a] leading-relaxed">
                Registre sua hidratação de água e acesse estatísticas semanais de evolução no computador, tablet ou telemóvel.
              </p>
            </div>
          </div>
        </div>

        {/* Status indicator / instructions if Firebase is not configured */}
        {!isFirebaseConfigured ? (
          <div className="mb-6 p-4 bg-[#8c3c3c]/10 text-[#8c3c3c] border border-[#8c3c3c]/20 rounded-2xl text-xs leading-relaxed text-left">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Shield className="w-4 h-4" />
              Nuvem Não Configurada no Projeto
            </div>
            Para ativar o login, configure as credenciais do Firebase (API Key, Auth Domain, Project ID) nas configurações de Secrets do AI Studio. Enquanto isso, o North funciona perfeitamente salvando todos os seus dados localmente no navegador!
          </div>
        ) : currentUser ? (
          <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-2xl text-xs leading-relaxed text-left">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Você já está autenticado!
            </div>
            Conectado como <strong className="font-bold">{currentUser.displayName || currentUser.email}</strong>. Todos os seus dados de evolução já estão sincronizados com segurança na nuvem.
          </div>
        ) : null}

        {/* Action button container */}
        <div className="space-y-3">
          {currentUser ? (
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 font-semibold text-white bg-[#c2652a] hover:bg-[#a9521f] rounded-2xl shadow-md transition-all duration-300 cursor-pointer"
              id="login-modal-logged-continue"
            >
              Continuar para o Dashboard
            </button>
          ) : !isFirebaseConfigured ? (
            <button
              onClick={onClose}
              className="w-full py-3.5 px-6 font-semibold text-[#605850] bg-white border border-[#d8d0c8] hover:bg-neutral-50 rounded-2xl transition-all duration-300 cursor-pointer"
              id="login-modal-unconfigured-continue"
            >
              Continuar no Modo Local (Offline)
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={onLogin}
                disabled={authLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-6 font-bold text-[#faf5ee] bg-[#c2652a] hover:bg-[#a9521f] disabled:bg-[#c2652a]/50 rounded-2xl shadow-md hover:shadow-lg hover:scale-[1.01] transition-all duration-300 cursor-pointer"
                id="login-modal-google-sign-in"
              >
                {authLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#faf5ee] border-t-transparent rounded-full animate-spin" />
                    Conectando com o Google...
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Entrar com Conta Google
                  </>
                )}
              </button>
              
              <button
                onClick={onClose}
                className="w-full py-2.5 px-6 font-medium text-xs text-[#78706a] hover:text-[#c2652a] transition-all cursor-pointer"
                id="login-modal-skip"
              >
                Continuar sem sincronizar (modo local)
              </button>
            </div>
          )}
        </div>

        {/* Safe lock footnote */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] text-[#78706a] font-semibold uppercase tracking-wider">
          <Shield className="w-3.5 h-3.5" />
          Conexão Segura SSL • Autenticação Oficial Firebase Google
        </div>
      </motion.div>
    </div>
  );
}
