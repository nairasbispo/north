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
  Check
} from 'lucide-react';
import { RoutineSettings } from '../types';

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
    </motion.div>
  );
}
