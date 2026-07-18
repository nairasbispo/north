import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  Dumbbell, 
  Languages, 
  CheckCircle2, 
  Flame, 
  Compass,
  Award
} from 'lucide-react';
import { ExerciseLog, RoutineSettings } from '../types';

interface StatisticsTabProps {
  logs: ExerciseLog[];
  languageHours: number;
  habitsCompletedCount: number;
  streak: number;
  settings: RoutineSettings;
}

export default function StatisticsTab({ 
  logs, 
  languageHours, 
  habitsCompletedCount, 
  streak,
  settings
}: StatisticsTabProps) {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  // Exercise hours calculations
  const totalExerciseMinutes = logs.reduce((sum, item) => sum + item.duration, 0);
  const exerciseHoursMonth = Math.round((24 + (totalExerciseMinutes / 60)) * 10) / 10; // add baseline 24h

  // Languages progress calculations
  const languageHoursTotal = Math.round((18 + languageHours) * 10) / 10; // baseline 18h

  // Total Focus Calculation
  const totalHoursCombined = exerciseHoursMonth + languageHoursTotal + (habitsCompletedCount * 0.1);
  const exerciseFocusPct = Math.round((exerciseHoursMonth / totalHoursCombined) * 100) || 45;
  const languageFocusPct = Math.round((languageHoursTotal / totalHoursCombined) * 100) || 30;
  const habitsFocusPct = 100 - exerciseFocusPct - languageFocusPct;

  // Evolution of Activities line chart (Simulated data)
  const activityData = timeframe === 'month'
    ? [
        { label: '1', val: 32 },
        { label: '5', val: 45 },
        { label: '10', val: 38 },
        { label: '15', val: 60 },
        { label: '20', val: 55 },
        { label: '25', val: 75 },
        { label: '30', val: 68 }
      ]
    : timeframe === 'week'
    ? [
        { label: 'Seg', val: 20 },
        { label: 'Ter', val: 35 },
        { label: 'Qua', val: 45 },
        { label: 'Qui', val: 30 },
        { label: 'Sex', val: 55 },
        { label: 'Sáb', val: 70 },
        { label: 'Dom', val: 60 }
      ]
    : [
        { label: 'Jan', val: 240 },
        { label: 'Mar', val: 310 },
        { label: 'Mai', val: 450 },
        { label: 'Jul', val: 580 },
        { label: 'Set', val: 620 },
        { label: 'Nov', val: 750 },
        { label: 'Dez', val: 820 }
      ];

  const getLinePoints = () => {
    const width = 380;
    const height = 140;
    const maxVal = timeframe === 'year' ? 900 : 100;

    return activityData.map((d, idx) => {
      const x = (idx / (activityData.length - 1)) * (width - 40) + 20;
      const y = height - (d.val / maxVal) * (height - 30) - 15;
      return { x, y, ...d };
    });
  };

  const linePoints = getLinePoints();
  const linePointsString = linePoints.map(p => `${p.x},${p.y}`).join(' ');
  const areaPointsString = `${linePoints[0].x},140 ` + linePointsString + ` ${linePoints[linePoints.length-1].x},140`;

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
        <h2 className="font-display text-4xl font-bold text-[#3a302a] mb-2">Visão Geral do Seu Progresso</h2>
        <p className="font-sans text-base text-[#605850]">Acompanhe de forma holística sua evolução e consistência ao longo do tempo.</p>
      </header>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric Card 1: Exercise */}
        <div className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#c2652a]/10 text-[#c2652a] rounded-xl">
              <Dumbbell className="w-5 h-5" />
            </div>
            <span className="font-sans text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +12%
            </span>
          </div>
          <h3 className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-1">Tempo de Exercício</h3>
          <p className="font-display text-5xl font-bold text-[#3a302a] mb-2 leading-none">{exerciseHoursMonth}h</p>
          <p className="font-sans text-[11px] text-[#9a9088] font-bold">Acumulado neste mês</p>
        </div>

        {/* Metric Card 2: Languages */}
        <div className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#8c3c3c]/10 text-[#8c3c3c] rounded-xl">
              <Languages className="w-5 h-5" />
            </div>
            <span className="font-sans text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> +5%
            </span>
          </div>
          <h3 className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-1">Estudo de Idiomas</h3>
          <div className="flex items-baseline gap-1 mb-2 leading-none">
            <span className="font-display text-5xl font-bold text-[#3a302a]">{languageHoursTotal}h</span>
            <span className="font-sans text-xs font-bold text-[#78706a] uppercase">EN / 12h FR</span>
          </div>
          <p className="font-sans text-[11px] text-[#9a9088] font-bold">Meta mensal: {settings.monthlyLanguageGoal}h</p>
        </div>

        {/* Metric Card 3: Habits Completed */}
        <div className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#78706a]/10 text-[#78706a] rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-1">Hábitos Concluídos</h3>
          <p className="font-display text-5xl font-bold text-[#3a302a] mb-2 leading-none">
            {142 + habitsCompletedCount}
          </p>
          <div className="w-full bg-[#f2ece4] h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-[#c2652a] h-full rounded-full transition-all duration-500" style={{ width: '78%' }} />
          </div>
          <p className="font-sans text-[11px] text-[#9a9088] font-bold mt-1.5">78% da meta mensal atingida</p>
        </div>

        {/* Metric Card 4: Streak */}
        <div className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 relative overflow-hidden group shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-[#c2652a]/10 text-[#c2652a] rounded-xl">
              <Flame className="w-5 h-5 fill-[#c2652a]/10" />
            </div>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-1">Sequência Atual</h3>
          <p className="font-display text-5xl font-bold text-[#3a302a] mb-2 leading-none">
            {streak} <span className="text-xl font-normal font-sans">dias</span>
          </p>
          <p className="font-sans text-[11px] text-[#9a9088] font-bold">Recorde pessoal: 28 dias</p>
        </div>

      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Evolution Line Chart */}
        <div className="lg:col-span-2 bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-lg font-bold text-[#3a302a]">Evolução de Atividades</h3>
            <div className="flex gap-1 bg-[#f2ece4] rounded-lg p-1">
              {(['week', 'month', 'year'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1 font-sans text-xs font-bold rounded ${
                    timeframe === t ? 'bg-white text-[#c2652a] shadow-sm' : 'text-[#605850]'
                  }`}
                >
                  {t === 'week' ? 'Semana' : t === 'month' ? 'Mês' : 'Ano'}
                </button>
              ))}
            </div>
          </div>

          {/* Line Chart rendering */}
          <div className="h-64 relative flex items-end justify-between pb-6 mt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 380 140" preserveAspectRatio="none">
              {/* Grids / Dash lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = 140 - (val / 100) * 110 - 15;
                const displayVal = timeframe === 'year' ? val * 8 : val;
                return (
                  <g key={val}>
                    <line
                      x1="20"
                      y1={y}
                      x2="370"
                      y2={y}
                      stroke="#d8d0c8"
                      strokeWidth="0.5"
                      strokeDasharray="4,4"
                    />
                    <text
                      x="0"
                      y={y + 3}
                      fill="#9a9088"
                      className="text-[9px] font-bold font-sans"
                    >
                      {displayVal}
                    </text>
                  </g>
                );
              })}

              {/* Sienna Gradient Area */}
              <polygon
                points={areaPointsString}
                fill="url(#siennaGradient)"
                className="transition-all duration-500 ease-out"
              />

              {/* Main curve line */}
              <polyline
                fill="none"
                stroke="#c2652a"
                strokeWidth="2.5"
                points={linePointsString}
                className="transition-all duration-500 ease-out"
              />

              {/* Dots & tooltip triggers */}
              {linePoints.map((p, idx) => (
                <g key={idx} className="group/line-dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4.5"
                    fill="#fff"
                    stroke="#c2652a"
                    strokeWidth="2"
                  />
                  {/* Hover tooltips */}
                  <rect
                    x={p.x - 22}
                    y={p.y - 24}
                    width="44"
                    height="16"
                    rx="4"
                    fill="#3a302a"
                    className="hidden group-hover/line-dot:block"
                  />
                  <text
                    x={p.x}
                    y={p.y - 13}
                    textAnchor="middle"
                    fill="#fff"
                    className="hidden group-hover/line-dot:block text-[9px] font-bold font-sans"
                  >
                    {timeframe === 'year' ? `${p.val}h` : `${p.val}%`}
                  </text>
                  {/* Axis labels */}
                  <text
                    x={p.x}
                    y="136"
                    textAnchor="middle"
                    fill="#9a9088"
                    className="text-[9px] font-bold font-sans"
                  >
                    {p.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Chart Legend */}
          <div className="flex justify-center gap-6 pt-4 border-t border-[#d8d0c8]/40">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#c2652a]" />
              <span className="text-xs font-bold text-[#605850]">Exercício</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#8c3c3c]" />
              <span className="text-xs font-bold text-[#605850]">Idiomas</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#78706a]" />
              <span className="text-xs font-bold text-[#605850]">Hábitos</span>
            </div>
          </div>
        </div>

        {/* Focus Donut Distribution Chart */}
        <div className="bg-white/70 border border-[#d8d0c8]/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h3 className="font-display text-lg font-bold text-[#3a302a] mb-4">Distribuição de Foco</h3>
          
          <div className="flex-1 flex justify-center items-center relative py-6">
            {/* SVG Donut Chart */}
            <svg className="w-44 h-44 -rotate-90 overflow-visible" viewBox="0 0 100 100">
              {/* Outer stroke representing distribution segments */}
              {/* Radius = 38. Circumference = 2 * Math.PI * 38 = 238.76 */}
              {/* Segment 1: Exercício focus */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#c2652a"
                strokeWidth="10"
                strokeDasharray={`${(exerciseFocusPct / 100) * 238.76} 238.76`}
                strokeDashoffset="0"
              />
              {/* Segment 2: Idiomas focus */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#8c3c3c"
                strokeWidth="10"
                strokeDasharray={`${(languageFocusPct / 100) * 238.76} 238.76`}
                strokeDashoffset={`-${(exerciseFocusPct / 100) * 238.76}`}
              />
              {/* Segment 3: Habits focus */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="none"
                stroke="#78706a"
                strokeWidth="10"
                strokeDasharray={`${(habitsFocusPct / 100) * 238.76} 238.76`}
                strokeDashoffset={`-${((exerciseFocusPct + languageFocusPct) / 100) * 238.76}`}
              />

              {/* Inner White Cutout circle */}
              <circle
                cx="50"
                cy="50"
                r="30"
                fill="#fff"
              />
            </svg>

            {/* Centered label inside Donut hole */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
              <span className="font-display text-[#3a302a] text-2xl font-bold">142h</span>
              <span className="font-sans text-[10px] text-[#9a9088] font-bold uppercase tracking-wider">Total Mensal</span>
            </div>
          </div>

          {/* Distribution list table details */}
          <div className="space-y-3 pt-4 border-t border-[#d8d0c8]/40">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c2652a]" />
                <span className="font-sans text-xs font-bold text-[#605850]">Exercício</span>
              </div>
              <span className="font-sans text-xs font-bold text-[#3a302a]">{exerciseFocusPct}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8c3c3c]" />
                <span className="font-sans text-xs font-bold text-[#605850]">Idiomas</span>
              </div>
              <span className="font-sans text-xs font-bold text-[#3a302a]">{languageFocusPct}%</span>
            </div>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#78706a]" />
                <span className="font-sans text-xs font-bold text-[#605850]">Hábitos Diários</span>
              </div>
              <span className="font-sans text-xs font-bold text-[#3a302a]">{habitsFocusPct}%</span>
            </div>
          </div>
        </div>

      </section>
    </motion.div>
  );
}
