import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Check, 
  Plus, 
  Clock, 
  Flame, 
  BarChart, 
  Calendar,
  Bike,
  Footprints,
  Sparkles,
  Dumbbell,
  TrendingUp,
  Award
} from 'lucide-react';
import { ExerciseLog, RoutineSettings } from '../types';

interface ExerciseTabProps {
  logs: ExerciseLog[];
  onAddLog: (log: Omit<ExerciseLog, 'id' | 'date'>) => void;
  settings: RoutineSettings;
}

export default function ExerciseTab({ logs, onAddLog, settings }: ExerciseTabProps) {
  // Timer States
  const [timeLeft, setTimeLeft] = useState(1455); // 24:15 in seconds
  const [timerRunning, setTimerRunning] = useState(false);
  const [totalDuration, setTotalDuration] = useState(1500); // 25 min default

  // Form States
  const [exerciseType, setExerciseType] = useState<'Bike' | 'Caminhada' | 'Corrida' | 'Musculação'>('Bike');
  const [duration, setDuration] = useState('45');
  const [intensity, setIntensity] = useState<'Leve' | 'Moderada' | 'Intensa'>('Moderada');
  const [notes, setNotes] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Live countdown timer ticker
  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      handleFinishTimerSession();
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setTimerRunning(false);
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(1455); // Reset to 24:15
  };

  const handleFinishTimerSession = () => {
    setTimerRunning(false);
    // Add completed 25 mins session to state
    onAddLog({
      type: 'Musculação',
      duration: 25,
      intensity: 'Moderada',
      notes: 'Sessão cronometrada concluída com sucesso!'
    });
    setTimeLeft(1500); // reset
    setSuccessMessage('Sessão cronometrada gravada!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Submit manual exercise
  const handleSubmitManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) return;

    onAddLog({
      type: exerciseType,
      duration: Number(duration),
      intensity,
      notes: notes.trim() || undefined
    });

    setNotes('');
    setSuccessMessage('Treino adicionado com sucesso!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  // Calculate stats based on logs list
  const totalDurationThisWeek = logs.reduce((sum, item) => sum + item.duration, 0);
  const hoursCompleted = Math.floor(totalDurationThisWeek / 60);
  const minsCompleted = totalDurationThisWeek % 60;
  
  // Weekly goal in minutes (e.g. 5 hours = 300 minutes, let's say goal is settings.weeklyExerciseGoal days * 45m = e.g. 180 min or 5h default = 300 min)
  const weeklyGoalMin = 300; // 5 hours target
  const weeklyProgressPercent = Math.min((totalDurationThisWeek / weeklyGoalMin) * 100, 100);

  // Calculate weekly activity dynamically for "Dia Mais Ativo" and daily bar chart
  const getWeeklyActivityStats = () => {
    const todayObj = new Date();
    const currentDayOfWeek = todayObj.getDay(); // 0 (Sun) to 6 (Sat)
    
    // Calculate distance to Monday
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayOfThisWeek = new Date(todayObj);
    mondayOfThisWeek.setDate(todayObj.getDate() + distanceToMonday);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
    sundayOfThisWeek.setHours(23, 59, 59, 999);

    const dailyMinutes = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    // Filter and sum logs for the current week
    logs.forEach(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      if (logDate >= mondayOfThisWeek && logDate <= sundayOfThisWeek) {
        const dayIndex = logDate.getDay() === 0 ? 6 : logDate.getDay() - 1;
        dailyMinutes[dayIndex] += log.duration;
      }
    });

    const maxMins = Math.max(...dailyMinutes);
    
    // Find the day with maximum activity in the current week
    let peakDayIndex = -1;
    let peakMinutes = 0;
    dailyMinutes.forEach((mins, idx) => {
      if (mins > peakMinutes) {
        peakMinutes = mins;
        peakDayIndex = idx;
      }
    });

    // If no activity in current week, look historically
    let isHistorical = false;
    let fallbackDayName = '';
    let fallbackMinutes = 0;

    if (peakDayIndex === -1 && logs.length > 0) {
      const historicalDailyMinutes = [0, 0, 0, 0, 0, 0, 0];
      logs.forEach(log => {
        const logDate = new Date(log.date + 'T00:00:00');
        const dayIndex = logDate.getDay() === 0 ? 6 : logDate.getDay() - 1;
        historicalDailyMinutes[dayIndex] += log.duration;
      });

      let histMaxIdx = -1;
      let histMaxMins = 0;
      historicalDailyMinutes.forEach((mins, idx) => {
        if (mins > histMaxMins) {
          histMaxMins = mins;
          histMaxIdx = idx;
        }
      });

      if (histMaxIdx !== -1) {
        isHistorical = true;
        fallbackDayName = dayNames[histMaxIdx];
        fallbackMinutes = histMaxMins;
      }
    }

    return {
      dailyMinutes,
      maxMins,
      peakDayIndex,
      peakMinutes,
      isHistorical,
      fallbackDayName,
      fallbackMinutes,
      dayNames
    };
  };

  const weeklyStats = getWeeklyActivityStats();

  // Exercise Icons lookup helper
  const getExerciseIcon = (type: string) => {
    switch (type) {
      case 'Bike': return <Bike className="w-5 h-5" />;
      case 'Caminhada': return <Footprints className="w-5 h-5" />;
      case 'Corrida': return <Sparkles className="w-5 h-5 text-amber-500" />;
      case 'Musculação': return <Dumbbell className="w-5 h-5" />;
      default: return <Dumbbell className="w-5 h-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 text-left"
    >
      {/* Tab Header Area */}
      <header className="flex justify-between items-end mb-4">
        <div>
          <h2 className="font-display text-4xl font-bold text-[#3a302a] mb-2">Treino de Hoje</h2>
          <p className="font-sans text-base text-[#605850]">Pronto para manter o seu ritmo e foco físico?</p>
        </div>
        
        <button 
          onClick={handleStartTimer}
          className="bg-[#c2652a] text-white font-sans text-sm font-bold px-6 py-3.5 rounded-full hover:bg-[#8a4518] transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Iniciar Treino</span>
        </button>
      </header>

      {/* Alert Banner */}
      {successMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 text-sm py-3 px-4 rounded-xl flex items-center gap-2 font-medium"
        >
          <Check className="w-4 h-4 text-green-600" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Active Timer Control Panel */}
        <section className="col-span-12 lg:col-span-5 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-display text-xl text-[#3a302a] mb-4 flex items-center gap-2 font-bold">
            <Clock className="w-5 h-5 text-[#c2652a]" />
            <span>Sessão Ativa</span>
          </h3>

          <div className="flex flex-col items-center justify-center py-6">
            {/* Progress Circular Ring Visual */}
            <div className="w-48 h-48 rounded-full border-4 border-[#f2ece4] flex items-center justify-center relative mb-6">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="transition-all duration-300 ease-linear"
                  cx="50"
                  cy="50"
                  fill="none"
                  r="44"
                  stroke="#c2652a"
                  strokeWidth="6"
                  strokeDasharray="276.4"
                  strokeDashoffset={276.4 - (276.4 * (timeLeft / totalDuration))}
                />
              </svg>
              <span className="font-display text-4xl font-bold text-[#c2652a] tracking-tight">
                {formatTime(timeLeft)}
              </span>
            </div>

            <div className="flex gap-3">
              {timerRunning ? (
                <button
                  onClick={handlePauseTimer}
                  className="bg-white border border-[#d8d0c8] text-[#605850] hover:text-[#c2652a] font-sans text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#faf5ee] transition-all flex items-center gap-1.5"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pausar</span>
                </button>
              ) : (
                <button
                  onClick={handleStartTimer}
                  className="bg-[#c2652a]/10 text-[#c2652a] font-sans text-xs font-bold px-5 py-2.5 rounded-full hover:bg-[#c2652a]/20 transition-all flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4 fill-[#c2652a]" />
                  <span>Retomar</span>
                </button>
              )}

              <button
                onClick={handleFinishTimerSession}
                className="bg-[#faf5ee] border border-[#d8d0c8] hover:border-[#c2652a] text-[#3a302a] font-sans text-xs font-bold px-5 py-2.5 rounded-full transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 text-[#c2652a]" />
                <span>Finalizar</span>
              </button>

              <button
                onClick={handleResetTimer}
                className="p-2.5 rounded-full hover:bg-[#f2ece4] text-[#9a9088] transition-colors"
                title="Reiniciar"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Manual Exercise Entry Form */}
        <section className="col-span-12 lg:col-span-7 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 shadow-sm">
          <h3 className="font-display text-xl text-[#3a302a] mb-4 font-bold">Registrar Treino Mananalmente</h3>
          
          <form onSubmit={handleSubmitManual} className="space-y-5">
            {/* Exercise Type */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-2">
                Tipo de Exercício
              </label>
              <div className="flex flex-wrap gap-2">
                {(['Bike', 'Caminhada', 'Corrida', 'Musculação'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExerciseType(type)}
                    className={`px-4 py-2.5 rounded-full border text-xs font-bold transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
                      exerciseType === type
                        ? 'bg-[#c2652a] text-white border-[#c2652a]'
                        : 'bg-white text-[#605850] border-[#d8d0c8]/80 hover:border-[#c2652a]'
                    }`}
                  >
                    {getExerciseIcon(type)}
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-2">
                  Duração (minutos)
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-colors"
                  placeholder="e.g. 45"
                  required
                />
              </div>

              <div>
                <label className="block font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-2">
                  Intensidade
                </label>
                <select
                  value={intensity}
                  onChange={(e) => setIntensity(e.target.value as any)}
                  className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-colors"
                >
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Intensa">Intensa</option>
                </select>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-2">
                Notas (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-colors resize-none"
                placeholder="Como se sentiu no treino?"
                rows={2}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="bg-[#c2652a] text-white font-sans text-xs font-bold px-6 py-3 rounded-full hover:bg-[#8a4518] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Salvar Registro</span>
              </button>
            </div>
          </form>
        </section>

        {/* Progress & Charts Row */}
        <section className="col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Progress Card */}
          <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3 text-[#78706a]">
              <Calendar className="w-4 h-4" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider">Esta Semana</span>
            </div>
            <div className="font-display text-3xl font-bold text-[#3a302a]">
              {hoursCompleted > 0 ? `${hoursCompleted}h ` : ''}{minsCompleted}m
            </div>
            <div className="w-full h-2 bg-[#f2ece4] rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-[#c2652a] rounded-full transition-all duration-500" 
                style={{ width: `${weeklyProgressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[10px] font-semibold text-[#78706a]">Atingido {Math.round(weeklyProgressPercent)}%</span>
              <span className="font-sans text-xs font-bold text-[#c2652a]">Meta: 5h</span>
            </div>
          </div>

          {/* Streak details */}
          <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="flex items-center gap-2 mb-2 text-[#78706a]">
              <Flame className="w-4.5 h-4.5 text-[#8c3c3c] fill-[#8c3c3c]" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider">Sequência</span>
            </div>
            <div className="font-display text-3xl font-bold text-[#3a302a]">
              {settings.weeklyExerciseGoal} Dias/Semana
            </div>
            <div className="font-sans text-xs text-[#605850] mt-1.5 font-medium">
              Sua meta semanal de treinos ativos!
            </div>
          </div>

          {/* Dynamic activity weekly visual bars */}
          <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2 text-[#78706a]">
              <BarChart className="w-4 h-4" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider">Atividade Diária</span>
            </div>
            
            {/* Visual Bars based on typical logging */}
            <div className="flex-1 flex items-end justify-between gap-2.5 pt-3 h-16">
              {weeklyStats.dailyMinutes.map((mins, idx) => {
                const dayLabel = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'][idx];
                const isPeak = idx === weeklyStats.peakDayIndex;
                let barHeight = '10%';
                let barColor = 'bg-[#f2ece4]';
                
                if (weeklyStats.maxMins > 0) {
                  if (mins > 0) {
                    barHeight = `${Math.max(20, Math.round((mins / weeklyStats.maxMins) * 90))}%`;
                    barColor = isPeak ? 'bg-[#c2652a]' : 'bg-[#c2652a]/50';
                  }
                }
                
                return (
                  <div 
                    key={idx} 
                    className={`w-full rounded-t-sm transition-all duration-500 ${barColor}`} 
                    style={{ height: barHeight }} 
                    title={`${dayLabel}: ${mins} min`} 
                  />
                );
              })}
            </div>

            <div className="flex justify-between font-sans text-[10px] text-[#9a9088] font-bold mt-2">
              <span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span><span>D</span>
            </div>
          </div>

          {/* Most Active Day Card */}
          <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-3 text-[#78706a]">
              <TrendingUp className="w-4 h-4 text-[#c2652a]" />
              <span className="font-sans text-xs font-bold uppercase tracking-wider">Dia Mais Ativo</span>
            </div>
            <div>
              <div className="font-display text-2xl font-bold text-[#3a302a] leading-tight">
                {weeklyStats.peakDayIndex !== -1 ? (
                  weeklyStats.dayNames[weeklyStats.peakDayIndex]
                ) : weeklyStats.isHistorical ? (
                  weeklyStats.fallbackDayName
                ) : (
                  'Nenhum treino'
                )}
              </div>
              <div className="font-sans text-xs text-[#605850] mt-1 font-medium">
                {weeklyStats.peakDayIndex !== -1 ? (
                  `Pico de ${weeklyStats.peakMinutes} min de treino`
                ) : weeklyStats.isHistorical ? (
                  `Melhor dia histórico (${weeklyStats.fallbackMinutes} min)`
                ) : (
                  'Registre treinos para ver estatísticas'
                )}
              </div>
            </div>
            {weeklyStats.peakDayIndex !== -1 && (
              <div className="text-[9px] text-green-700 bg-green-50 rounded-md py-1 px-2 mt-2 inline-flex items-center font-bold self-start gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Dia de maior intensidade!</span>
              </div>
            )}
          </div>

        </section>

      </div>
    </motion.div>
  );
}
