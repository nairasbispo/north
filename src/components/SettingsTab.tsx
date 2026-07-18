import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Flag, 
  Sliders, 
  Save, 
  RotateCcw,
  Bell,
  Moon,
  Languages,
  Check,
  Database,
  FileCode,
  CheckCircle,
  HelpCircle,
  Copy
} from 'lucide-react';
import { RoutineSettings } from '../types';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA } from '../supabase';


interface SettingsTabProps {
  settings: RoutineSettings;
  onSaveSettings: (newSettings: RoutineSettings) => void;
}

export default function SettingsTab({ settings, onSaveSettings }: SettingsTabProps) {
  // Local form states
  const [wakeTime, setWakeTime] = useState(settings.wakeTime);
  const [sleepTime, setSleepTime] = useState(settings.sleepTime);
  const [weeklyExerciseGoal, setWeeklyExerciseGoal] = useState(settings.weeklyExerciseGoal);
  const [monthlyLanguageGoal, setMonthlyLanguageGoal] = useState(settings.monthlyLanguageGoal);
  const [pushNotifications, setPushNotifications] = useState(settings.pushNotifications);
  const [darkTheme, setDarkTheme] = useState(settings.darkTheme);
  
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      wakeTime,
      sleepTime,
      weeklyExerciseGoal,
      monthlyLanguageGoal: Number(monthlyLanguageGoal),
      pushNotifications,
      darkTheme
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  const handleReset = () => {
    setWakeTime(settings.wakeTime);
    setSleepTime(settings.sleepTime);
    setWeeklyExerciseGoal(settings.weeklyExerciseGoal);
    setMonthlyLanguageGoal(settings.monthlyLanguageGoal);
    setPushNotifications(settings.pushNotifications);
    setDarkTheme(settings.darkTheme);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 text-left"
    >
      {/* Header */}
      <header>
        <h2 className="font-display text-4xl font-bold text-[#3a302a] mb-2">Configurações</h2>
        <p className="font-sans text-base text-[#605850]">Personalize suas rotinas, metas semanais e preferências do ambiente.</p>
      </header>

      {/* Success banner */}
      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 text-sm py-3.5 px-4 rounded-xl flex items-center gap-2 font-semibold"
        >
          <Check className="w-4 h-4 text-green-600" />
          <span>Alterações salvas com sucesso! O assistente North foi atualizado.</span>
        </motion.div>
      )}

      {/* Form Submission wrapper */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left column ( Routine & Goals ) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Daily Routine Card */}
          <section className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 md:p-8 relative overflow-hidden group shadow-sm">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#c2652a]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#c2652a]/10 flex items-center justify-center text-[#c2652a]">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#3a302a]">Rotina Diária</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* Wake time */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider" htmlFor="wake-time">
                  Hora de Acordar
                </label>
                <input
                  type="time"
                  id="wake-time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-3 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Sleep time */}
              <div className="flex flex-col gap-1.5">
                <label className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider" htmlFor="sleep-time">
                  Hora de Dormir
                </label>
                <input
                  type="time"
                  id="sleep-time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-3 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-all cursor-pointer"
                  required
                />
              </div>
            </div>
          </section>

          {/* Evolution Goals Card */}
          <section className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#8c3c3c]/10 flex items-center justify-center text-[#8c3c3c]">
                <Flag className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#3a302a]">Metas de Evolução</h3>
            </div>

            <div className="flex flex-col gap-8">
              {/* Exercise Goal Slider */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider">
                    Meta Semanal de Exercícios
                  </label>
                  <span className="font-sans text-sm font-bold text-[#c2652a]">{weeklyExerciseGoal} dias/semana</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="7"
                  value={weeklyExerciseGoal}
                  onChange={(e) => setWeeklyExerciseGoal(Number(e.target.value))}
                  className="w-full accent-[#c2652a] h-1.5 bg-[#f2ece4] rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between mt-2 font-sans text-[11px] text-[#9a9088] font-semibold">
                  <span>1 dia</span>
                  <span>7 dias</span>
                </div>
              </div>

              <hr className="border-[#d8d0c8]/40" />

              {/* Language Hours Input */}
              <div className="flex flex-col gap-2">
                <label className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider" htmlFor="language-goal">
                  Meta Mensal de Idiomas (Horas)
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="relative w-full sm:w-1/3">
                    <Languages className="absolute left-3.5 top-3.5 w-4 h-4 text-[#9a9088]" />
                    <input
                      type="number"
                      id="language-goal"
                      min="1"
                      max="120"
                      value={monthlyLanguageGoal}
                      onChange={(e) => setMonthlyLanguageGoal(Number(e.target.value))}
                      className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl pl-10 pr-4 py-3 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-all"
                      required
                    />
                  </div>
                  <span className="font-sans text-xs text-[#78706a] font-semibold leading-relaxed">
                    horas dedicadas à imersão e estudo ativo de novos idiomas.
                  </span>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right column (Preferences & Controls) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Preferences Settings Card */}
          <section className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#78706a]/10 flex items-center justify-center text-[#78706a]">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl font-bold text-[#3a302a]">Preferências</h3>
            </div>

            <div className="flex flex-col gap-6">
              {/* Push notifications Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="font-sans text-sm font-bold text-[#3a302a]">Notificações Push</span>
                  <span className="font-sans text-xs text-[#78706a] font-medium mt-0.5">Lembretes diários de hábitos.</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    pushNotifications ? 'bg-[#c2652a]' : 'bg-[#d8d0c8]'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    pushNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <hr className="border-[#d8d0c8]/40" />

              {/* Dark Theme Simulation Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex flex-col pr-4">
                  <span className="font-sans text-sm font-bold text-[#3a302a]">Tema Escuro</span>
                  <span className="font-sans text-xs text-[#78706a] font-medium mt-0.5">Reduz o cansaço visual.</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => setDarkTheme(!darkTheme)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    darkTheme ? 'bg-[#c2652a]' : 'bg-[#d8d0c8]'
                  }`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                    darkTheme ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </section>

          {/* Action buttons area */}
          <div className="flex flex-col gap-3 mt-4">
            <button
              type="submit"
              className="w-full bg-[#c2652a] text-white font-sans text-sm font-bold py-3 px-8 rounded-full hover:bg-[#8a4518] transition-colors shadow-sm flex items-center justify-center gap-2 hover:shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-full bg-white border border-[#d8d0c8]/80 text-[#3a302a] font-sans text-sm font-semibold py-3 px-8 rounded-full hover:bg-[#faf5ee] transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-[#9a9088]" />
              <span>Descartar</span>
            </button>
          </div>

        </div>

      </form>

      {/* Supabase Configuration Section */}
      <section className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 md:p-8 mt-8 shadow-sm text-left relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-[#3a302a]">Sincronização com Supabase</h3>
              <p className="font-sans text-xs text-[#78706a] font-medium mt-0.5">Persistência durável em nuvem com PostgreSQL.</p>
            </div>
          </div>

          <div>
            {isSupabaseConfigured ? (
              <span className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs font-bold rounded-full flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Conectado ao Supabase
              </span>
            ) : (
              <span className="px-3.5 py-1.5 bg-[#f2ece4] border border-[#d8d0c8]/40 text-[#78706a] text-xs font-bold rounded-full flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#9a9088]" />
                Modo Local (LocalStorage)
              </span>
            )}
          </div>
        </div>

        <div className="space-y-4 relative z-10">
          <p className="font-sans text-sm text-[#605850] leading-relaxed">
            O North suporta sincronização automática e transparente com o <strong>Supabase</strong>. 
            Se as variáveis de ambiente <code className="bg-[#f2ece4] px-1.5 py-0.5 rounded text-xs text-[#c2652a] font-mono">VITE_SUPABASE_URL</code> e <code className="bg-[#f2ece4] px-1.5 py-0.5 rounded text-xs text-[#c2652a] font-mono">VITE_SUPABASE_ANON_KEY</code> estiverem definidas, o app alternará automaticamente do Firebase para o Supabase!
          </p>

          <div className="bg-[#faf5ee] border border-[#d8d0c8]/60 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-[#3a302a]">
              <FileCode className="w-4.5 h-4.5 text-[#c2652a]" />
              Esquema de Banco de Dados (SQL)
            </div>
            <p className="font-sans text-xs text-[#78706a] mb-4 leading-relaxed">
              Execute o script SQL abaixo no editor do seu painel do Supabase (SQL Editor) para criar todas as tabelas e políticas de segurança necessárias em segundos:
            </p>

            <div className="relative">
              <pre className="bg-[#3a302a] text-amber-50 rounded-xl p-4 text-xs font-mono overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
                {SUPABASE_SQL_SCHEMA}
              </pre>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
                  setSqlCopied(true);
                  setTimeout(() => setSqlCopied(false), 3000);
                }}
                className="absolute top-3 right-3 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer"
                title="Copiar Código"
              >
                <Copy className="w-3.5 h-3.5" />
                {sqlCopied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
          </div>
        </div>
      </section>

    </motion.div>
  );
}
