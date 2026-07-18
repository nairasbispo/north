import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  Flame, 
  Dumbbell, 
  Languages, 
  BookOpen, 
  Droplet, 
  Check, 
  ChevronRight,
  ArrowRight,
  Plus,
  TrendingUp,
  Sparkles,
  Award,
  Activity
} from 'lucide-react';
import { Habit, AppTab, ExerciseLog, LanguageLog } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface DashboardTabProps {
  onTabChange: (tab: AppTab) => void;
  streak: number;
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  waterAmount: number;
  onAddWater: (amount: number) => void;
  logs: ExerciseLog[];
  languageLogs: LanguageLog[];
  currentUser?: FirebaseUser | null;
}

export default function DashboardTab({ 
  onTabChange, 
  streak, 
  habits, 
  onToggleHabit,
  waterAmount,
  onAddWater,
  logs,
  languageLogs,
  currentUser
}: DashboardTabProps) {
  // Calculate completed percentage
  const completedHabits = habits.filter(h => h.completed).length;
  const totalHabits = habits.length;
  const progressPercent = Math.round((completedHabits / totalHabits) * 100);

  // Quick activity toggle states
  const [exercisePending, setExercisePending] = useState(true);

  // Calculate weekly activity dynamically for "Dia Mais Ativo" and daily bar chart
  const getWeeklyExerciseStats = () => {
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

    return {
      dailyMinutes,
      maxMins,
      peakDayIndex,
      peakMinutes,
      dayNames
    };
  };

  const weeklyExercise = getWeeklyExerciseStats();

  // Calculate weekly comparison of all activities
  const getWeeklyComparison = () => {
    const todayObj = new Date();
    const currentDayOfWeek = todayObj.getDay();
    const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
    const mondayOfThisWeek = new Date(todayObj);
    mondayOfThisWeek.setDate(todayObj.getDate() + distanceToMonday);
    mondayOfThisWeek.setHours(0, 0, 0, 0);

    const sundayOfThisWeek = new Date(mondayOfThisWeek);
    sundayOfThisWeek.setDate(mondayOfThisWeek.getDate() + 6);
    sundayOfThisWeek.setHours(23, 59, 59, 999);

    // 1. Exercise minutes this week
    let exerciseMins = 0;
    logs.forEach(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      if (logDate >= mondayOfThisWeek && logDate <= sundayOfThisWeek) {
        exerciseMins += log.duration;
      }
    });

    // 2. Language minutes this week (hours * 60)
    let languageMins = 0;
    languageLogs.forEach(log => {
      const logDate = new Date(log.date + 'T00:00:00');
      if (logDate >= mondayOfThisWeek && logDate <= sundayOfThisWeek) {
        languageMins += Math.round(log.hours * 60);
      }
    });

    // 3. Habits minutes equivalent this week
    const completedHabitsToday = habits.filter(h => h.completed).length;
    // Assuming 15 minutes of dedication per habit completed today
    const habitsMins = completedHabitsToday * 15;

    const totalMins = exerciseMins + languageMins + habitsMins;

    // Determine the absolute dominant activity
    let dominantActivity = 'Nenhum';
    let dominantMinutes = 0;
    let colorTheme = 'text-[#c2652a]';
    let summaryText = 'Registe mais treinos ou sessões de estudo para ver o seu balanço semanal de evolução.';

    if (totalMins > 0) {
      if (exerciseMins >= languageMins && exerciseMins >= habitsMins) {
        dominantActivity = 'Exercício Físico';
        dominantMinutes = exerciseMins;
        colorTheme = 'text-[#c2652a]';
        summaryText = `Esta semana, o seu foco dominante foi o Exercício Físico, acumulando ${exerciseMins} minutos de treino ativo!`;
      } else if (languageMins >= exerciseMins && languageMins >= habitsMins) {
        dominantActivity = 'Estudo de Idiomas';
        dominantMinutes = languageMins;
        colorTheme = 'text-[#8c3c3c]';
        summaryText = `Esta semana, o seu foco dominante foi o Estudo de Idiomas, dedicando ${languageMins} minutos (${(languageMins / 60).toFixed(1)}h) à fluência linguística!`;
      } else {
        dominantActivity = 'Hábitos de Rotina';
        dominantMinutes = habitsMins;
        colorTheme = 'text-blue-500';
        summaryText = `Esta semana, a consistência dos seus Hábitos Saudáveis liderou, somando ${completedHabitsToday} tarefas feitas hoje (equivalente a ${habitsMins} min de foco)!`;
      }
    }

    return {
      exerciseMins,
      languageMins,
      habitsMins,
      totalMins,
      dominantActivity,
      dominantMinutes,
      colorTheme,
      summaryText
    };
  };

  const activityComparison = getWeeklyComparison();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 text-left"
    >
      {/* Welcome Banner */}
      <section className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
        <div>
          <p className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-1.5">
            18 de Julho, 2026
          </p>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#3a302a] tracking-tight">
            Bom dia, {
              currentUser 
                ? (currentUser.displayName?.split(' ')[0] || currentUser.email?.split('@')[0] || 'Usuário') 
                : 'João'
            }.
          </h2>
          <p className="font-sans text-base text-[#605850] mt-2 max-w-2xl leading-relaxed">
            Aqui está o seu panorama de evolução para hoje. Mantenha o seu foco e o ritmo de conquistas.
          </p>
        </div>

        {/* Daily Progress Widget */}
        <div className="w-full md:w-72 bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-[#d8d0c8]/60 shadow-[0_4px_20px_rgba(58,48,42,0.03)] flex flex-col justify-center">
          <div className="flex justify-between items-end mb-2">
            <span className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider">
              Progresso Diário
            </span>
            <span className="font-sans text-sm font-bold text-[#c2652a]">{progressPercent}%</span>
          </div>
          <div className="w-full h-2.5 bg-[#f2ece4] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#c2652a] rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="font-sans text-[11px] text-[#78706a] mt-1.5 font-semibold">
            {completedHabits} de {totalHabits} hábitos concluídos hoje
          </span>
        </div>
      </section>

      {/* Bento Grid Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Next Daily Activity (Focus card) */}
        <div className="md:col-span-8 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 shadow-[0_4px_20px_rgba(58,48,42,0.04)] p-6 relative overflow-hidden flex flex-col justify-between group min-h-[220px]">
          {/* Sienna glow background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#c2652a]/5 rounded-full blur-3xl -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 pointer-events-none" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4 text-[#c2652a]">
              <Play className="w-5 h-5 fill-[#c2652a]" />
              <span className="font-sans text-xs font-bold tracking-wider uppercase">
                Próxima atividade do dia
              </span>
            </div>
            <h3 className="font-display text-3xl text-[#3a302a] font-bold mb-2">Prática de Francês</h3>
            <p className="font-sans text-xs font-semibold text-[#605850] mb-4 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c2652a]" /> 10:00 - 10:30 (30 min) • Duolingo imersão
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 flex items-center justify-between border-t border-[#d8d0c8]/40">
            {/* Skill tags mockup icons */}
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-[#faf5ee] border-2 border-white flex items-center justify-center text-[#c2652a] shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 rounded-full bg-[#faf5ee] border-2 border-white flex items-center justify-center text-[#c2652a] shadow-sm">
                <Languages className="w-4 h-4" />
              </div>
            </div>

            <button 
              onClick={() => onTabChange('languages')}
              className="bg-[#c2652a] hover:bg-[#8a4518] text-white rounded-full px-6 py-2.5 font-sans text-xs font-bold transition-all duration-300 shadow-sm flex items-center gap-2 hover:shadow-md"
            >
              <span>Iniciar Atividade</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Current Streak Indicator */}
        <div className="md:col-span-4 bg-[#c2652a] text-white rounded-2xl shadow-[0_4px_25px_rgba(194,101,42,0.15)] p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[220px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          <Flame className="w-12 h-12 mb-3 text-white fill-white animate-pulse" />
          <p className="font-sans text-xs font-bold uppercase tracking-widest text-white/80 mb-1">
            Sequência Atual
          </p>
          <h3 className="font-display text-6xl font-bold mb-1 leading-none tracking-tight">
            {streak}
          </h3>
          <p className="font-sans text-sm font-semibold text-white/90">
            dias consecutivos
          </p>
        </div>

        {/* Status Activity Grid */}
        
        {/* Exercício Status Card */}
        <div className="md:col-span-3 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 shadow-[0_4px_20px_rgba(58,48,42,0.03)] p-5 flex flex-col justify-between h-44 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#c2652a]/10 flex items-center justify-center text-[#c2652a]">
              <Dumbbell className="w-5 h-5" />
            </div>
            <button 
              onClick={() => setExercisePending(!exercisePending)}
              className={`font-sans text-[10px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                exercisePending 
                  ? 'bg-[#f2ece4] text-[#78706a]' 
                  : 'bg-[#c2652a]/20 text-[#c2652a]'
              }`}
            >
              {exercisePending ? 'Pendente' : 'Concluído'}
            </button>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-[#3a302a] mb-1">Exercício</h4>
            <p className="font-sans text-xs text-[#605850]">Musculação - 45m</p>
          </div>
        </div>

        {/* Inglês Status Card */}
        <div className="md:col-span-3 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 shadow-[0_4px_20px_rgba(58,48,42,0.03)] p-5 flex flex-col justify-between h-44 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#c2652a]/10 rounded-bl-full flex items-start justify-end p-2.5 pointer-events-none">
            <Check className="w-3.5 h-3.5 text-[#c2652a] font-bold" />
          </div>
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#f2ece4] flex items-center justify-center text-[#c2652a]">
              <Languages className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-[#3a302a] mb-1">Inglês</h4>
            <p className="font-sans text-xs text-[#605850]">Revisão Anki - 15m</p>
          </div>
        </div>

        {/* Francês Status Card */}
        <div className="md:col-span-3 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 shadow-[0_4px_20px_rgba(58,48,42,0.03)] p-5 flex flex-col justify-between h-44 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[#8c3c3c]/10 flex items-center justify-center text-[#8c3c3c]">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="bg-[#8c3c3c]/10 text-[#8c3c3c] font-sans text-[10px] font-bold px-2.5 py-1 rounded-full">
              10:00
            </span>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-[#3a302a] mb-1">Francês</h4>
            <p className="font-sans text-xs text-[#605850]">Duolingo - 30m</p>
          </div>
        </div>

        {/* Habits Status Card (Water logging) */}
        <div className="md:col-span-3 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 shadow-[0_4px_20px_rgba(58,48,42,0.03)] p-5 flex flex-col justify-between h-44 hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <Droplet className="w-5 h-5 fill-blue-100" />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-sans text-xs font-bold text-[#3a302a]">
                {waterAmount.toFixed(1)} / 2.0L
              </span>
              <button 
                onClick={() => onAddWater(0.25)}
                className="w-6 h-6 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-500 flex items-center justify-center transition-colors"
                title="Adicionar 250ml"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-[#3a302a] mb-1">Hábitos</h4>
            <p className="font-sans text-xs text-[#605850] mb-2">Hidratação diária</p>
            <div className="w-full h-1.5 bg-[#f2ece4] rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.min((waterAmount / 2.0) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Habits Quick Checklist */}
      <section className="bg-white/50 border border-[#d8d0c8]/60 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-display text-xl font-bold text-[#3a302a]">Registo Rápido de Rotina</h3>
            <p className="font-sans text-xs text-[#605850] mt-0.5">O que você já concluiu hoje?</p>
          </div>
          <button 
            onClick={() => onTabChange('habits')}
            className="text-xs font-bold text-[#c2652a] hover:underline flex items-center gap-1"
          >
            Ver hábitos <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {habits.map((habit) => (
            <button
              key={habit.id}
              onClick={() => onToggleHabit(habit.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold transition-all duration-300 cursor-pointer ${
                habit.completed
                  ? 'bg-[#c2652a] text-white border-[#c2652a] shadow-sm'
                  : 'bg-white text-[#605850] border-[#d8d0c8]/80 hover:border-[#c2652a]'
              }`}
            >
              {habit.completed && <Check className="w-3.5 h-3.5" />}
              <span>{habit.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Dynamic Weekly Analytics Row */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Responsive Workout Bar Chart */}
        <div className="lg:col-span-6 bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#c2652a]" />
                <h4 className="font-display text-lg font-bold text-[#3a302a]">Atividade Diária (Exercício)</h4>
              </div>
              <span className="font-sans text-[10px] text-[#9a9088] font-bold bg-[#faf5ee] py-1 px-2.5 rounded-full uppercase tracking-wider">
                Minutos de Treino
              </span>
            </div>
            <p className="font-sans text-xs text-[#605850] mb-6">
              Acompanhamento proporcional aos minutos de treino registrados para esta semana.
            </p>

            {/* Responsive visual bar chart */}
            <div className="flex items-end justify-between gap-3 pt-4 h-24 border-b border-[#d8d0c8]/30 pb-1">
              {weeklyExercise.dailyMinutes.map((mins, idx) => {
                const dayLabel = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'][idx];
                const isPeak = idx === weeklyExercise.peakDayIndex;
                let barHeight = '8%';
                let barColor = 'bg-[#f2ece4]';

                if (weeklyExercise.maxMins > 0) {
                  if (mins > 0) {
                    barHeight = `${Math.max(15, Math.round((mins / weeklyExercise.maxMins) * 100))}%`;
                    barColor = isPeak ? 'bg-[#c2652a]' : 'bg-[#c2652a]/45';
                  }
                }

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 bg-[#3a302a] text-white text-[9px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20 shadow-md">
                      {mins} min
                    </div>
                    
                    {/* Visual Bar */}
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-500 ease-out ${barColor}`} 
                      style={{ height: barHeight }} 
                    />
                    
                    {/* Label */}
                    <span className="font-sans text-[10px] text-[#9a9088] font-bold mt-1">
                      {dayLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between mt-5 pt-3 border-t border-[#d8d0c8]/20">
            <span className="font-sans text-xs text-[#605850] font-medium">
              {weeklyExercise.peakDayIndex !== -1 ? (
                <>Dia mais ativo: <strong className="text-[#3a302a] font-bold">{weeklyExercise.dayNames[weeklyExercise.peakDayIndex]}</strong></>
              ) : (
                'Nenhum treino registrado esta semana'
              )}
            </span>
            {weeklyExercise.peakDayIndex !== -1 && (
              <span className="text-[10px] text-[#c2652a] font-bold flex items-center gap-1 bg-[#c2652a]/5 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pico de {weeklyExercise.peakMinutes}m</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Which activity was performed the most */}
        <div className="lg:col-span-6 bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-[#c2652a]" />
              <h4 className="font-display text-lg font-bold text-[#3a302a]">Foco de Dedicação Semanal</h4>
            </div>
            <p className="font-sans text-xs text-[#605850] mb-6">
              Comparação proporcional de tempo acumulado entre as suas atividades principais nesta semana.
            </p>

            {/* Comparison bars */}
            <div className="space-y-4">
              {/* Exercise progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-[#3a302a] mb-1">
                  <span className="flex items-center gap-1.5"><Dumbbell className="w-3.5 h-3.5 text-[#c2652a]" /> Exercício</span>
                  <span className="font-mono text-xs">{activityComparison.exerciseMins} min</span>
                </div>
                <div className="w-full h-2 bg-[#f2ece4] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#c2652a] rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${activityComparison.totalMins > 0 ? (activityComparison.exerciseMins / activityComparison.totalMins) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Languages progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-[#3a302a] mb-1">
                  <span className="flex items-center gap-1.5"><Languages className="w-3.5 h-3.5 text-[#8c3c3c]" /> Estudo de Idiomas</span>
                  <span className="font-mono text-xs">{activityComparison.languageMins} min</span>
                </div>
                <div className="w-full h-2 bg-[#f2ece4] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#8c3c3c] rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${activityComparison.totalMins > 0 ? (activityComparison.languageMins / activityComparison.totalMins) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* Habits progress */}
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-[#3a302a] mb-1">
                  <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-blue-500 font-bold" /> Hábitos Saudáveis</span>
                  <span className="font-mono text-xs">{activityComparison.habitsMins} min</span>
                </div>
                <div className="w-full h-2 bg-[#f2ece4] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${activityComparison.totalMins > 0 ? (activityComparison.habitsMins / activityComparison.totalMins) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#faf5ee]/85 border border-[#d8d0c8]/40 rounded-xl p-3.5 mt-6 flex items-start gap-2.5">
            <TrendingUp className="w-5 h-5 text-[#c2652a] shrink-0 mt-0.5" />
            <div className="text-left">
              <span className="font-sans text-[11px] font-bold text-[#c2652a] uppercase tracking-wider block">
                Foco Dominante: {activityComparison.dominantActivity}
              </span>
              <p className="font-sans text-xs text-[#605850] mt-0.5 font-medium leading-relaxed">
                {activityComparison.summaryText}
              </p>
            </div>
          </div>
        </div>

      </section>
    </motion.div>
  );
}
