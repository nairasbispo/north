import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Play, 
  HelpCircle, 
  Languages, 
  MessageSquare, 
  Calendar, 
  Check, 
  BookOpen, 
  Compass,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { LanguageProgress, LanguageType, LanguageLog } from '../types';

interface LanguagesTabProps {
  languageContext: LanguageType;
  englishProgress: LanguageProgress;
  frenchProgress: LanguageProgress;
  onAddLanguageHours: (hours: number, language?: LanguageType, skills?: string[]) => void;
  languageLogs: LanguageLog[];
}

export default function LanguagesTab({ 
  languageContext, 
  englishProgress, 
  frenchProgress,
  onAddLanguageHours,
  languageLogs
}: LanguagesTabProps) {
  // Tabs for local study charts
  const [chartRange, setChartRange] = useState<'month' | 'week'>('month');
  
  // Checklist states for Quick Session Log
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['listening', 'speaking', 'conversation']);
  const [successBanner, setSuccessBanner] = useState('');

  const currentProgress = languageContext === 'en' ? englishProgress : frenchProgress;
  const langName = languageContext === 'en' ? 'Inglês' : 'Francês';

  // Toggle checklist skills
  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) => 
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleSaveSession = () => {
    if (selectedSkills.length === 0) return;
    
    // Add 0.5 hours per skill practiced
    const loggedHours = selectedSkills.length * 0.5;
    onAddLanguageHours(loggedHours, languageContext, selectedSkills);

    setSuccessBanner(`Sessão de ${langName} guardada! +${loggedHours}h registradas.`);
    setTimeout(() => setSuccessBanner(''), 4000);
  };

  // Calculate weekly language study statistics
  const getWeeklyLanguageStats = () => {
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

    const dailyHours = [0, 0, 0, 0, 0, 0, 0]; // Mon to Sun
    const dayNames = ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo'];

    // Filter and sum logs for the current week and active language context
    let totalWeeklyHours = 0;
    languageLogs.forEach(log => {
      if (log.language !== languageContext) return;
      const logDate = new Date(log.date + 'T00:00:00');
      if (logDate >= mondayOfThisWeek && logDate <= sundayOfThisWeek) {
        const dayIndex = logDate.getDay() === 0 ? 6 : logDate.getDay() - 1;
        dailyHours[dayIndex] += log.hours;
        totalWeeklyHours += log.hours;
      }
    });

    const maxHours = Math.max(...dailyHours);
    
    // Find the day with maximum study in the current week
    let peakDayIndex = -1;
    let peakHours = 0;
    dailyHours.forEach((hours, idx) => {
      if (hours > peakHours) {
        peakHours = hours;
        peakDayIndex = idx;
      }
    });

    // If no activity in current week, look historically for fallback
    let isHistorical = false;
    let fallbackDayName = '';
    let fallbackHours = 0;

    const currentLangLogs = languageLogs.filter(log => log.language === languageContext);
    if (peakDayIndex === -1 && currentLangLogs.length > 0) {
      const historicalDailyHours = [0, 0, 0, 0, 0, 0, 0];
      currentLangLogs.forEach(log => {
        const logDate = new Date(log.date + 'T00:00:00');
        const dayIndex = logDate.getDay() === 0 ? 6 : logDate.getDay() - 1;
        historicalDailyHours[dayIndex] += log.hours;
      });

      let histMaxIdx = -1;
      let histMaxHours = 0;
      historicalDailyHours.forEach((hours, idx) => {
        if (hours > histMaxHours) {
          histMaxHours = hours;
          histMaxIdx = idx;
        }
      });

      if (histMaxIdx !== -1) {
        isHistorical = true;
        fallbackDayName = dayNames[histMaxIdx];
        fallbackHours = histMaxHours;
      }
    }

    return {
      dailyHours,
      maxHours,
      peakDayIndex,
      peakHours,
      isHistorical,
      fallbackDayName,
      fallbackHours,
      dayNames,
      totalWeeklyHours
    };
  };

  const weeklyLanguageStats = getWeeklyLanguageStats();

  // Coordinates helper for the SVG Radar chart
  // Radar has 6 points: Listening, Speaking, Reading, Writing, Grammar, Vocabulary
  const getRadarPoints = () => {
    const skills = [
      currentProgress.listening,
      currentProgress.speaking,
      currentProgress.reading,
      currentProgress.writing,
      currentProgress.grammar,
      currentProgress.vocabulary
    ];

    const centerX = 120;
    const centerY = 120;
    const maxVal = 100;
    const radius = 90;

    return skills.map((val, idx) => {
      const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
      const length = (val / maxVal) * radius;
      const x = centerX + length * Math.cos(angle);
      const y = centerY + length * Math.sin(angle);
      return { x, y, val };
    });
  };

  const points = getRadarPoints();
  const polygonString = points.map(p => `${p.x},${p.y}`).join(' ');

  // Coordinates helper for study hours Line chart (Last 30 days or last week)
  const lineChartData = chartRange === 'month' 
    ? [
        { label: '1', hours: 1.5 },
        { label: '5', hours: 2.0 },
        { label: '10', hours: 1.6 },
        { label: '15', hours: 3.0 },
        { label: '20', hours: 2.4 },
        { label: '25', hours: 4.0 },
        { label: '30', hours: 3.5 }
      ]
    : [
        { label: 'Seg', hours: 0.5 },
        { label: 'Ter', hours: 1.2 },
        { label: 'Qua', hours: 2.0 },
        { label: 'Qui', hours: 1.0 },
        { label: 'Sex', hours: 0.8 },
        { label: 'Sáb', hours: 2.5 },
        { label: 'Dom', hours: 1.8 }
      ];

  const getLinePoints = () => {
    const width = 360;
    const height = 150;
    const maxHours = 5.0;

    return lineChartData.map((d, idx) => {
      const x = (idx / (lineChartData.length - 1)) * (width - 40) + 20;
      const y = height - (d.hours / maxHours) * (height - 30) - 15;
      return { x, y, ...d };
    });
  };

  const linePoints = getLinePoints();
  const linePointsString = linePoints.map(p => `${p.x},${p.y}`).join(' ');
  const areaPointsString = `${linePoints[0].x},150 ` + linePointsString + ` ${linePoints[linePoints.length-1].x},150`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 text-left"
    >
      {/* Hero Banner Area */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-2">
        <div>
          <h2 className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-widest mb-1 md:hidden">
            {langName}
          </h2>
          <h3 className="font-display text-4xl md:text-5xl font-bold text-[#3a302a] tracking-tight">
            Foco atual: Fluência
          </h3>
          <p className="font-sans text-base text-[#605850] mt-2 max-w-2xl leading-relaxed">
            Mantenha a consistência. Cada sessão de {langName} aproxima-o dos seus objetivos de comunicação global.
          </p>
        </div>

        <button 
          onClick={() => {
            onAddLanguageHours(1.5, languageContext, ['listening', 'speaking', 'conversation']);
            setSuccessBanner(`Sessão de imersão de 1h30m gravada para ${langName}!`);
            setTimeout(() => setSuccessBanner(''), 4000);
          }}
          className="bg-[#c2652a] hover:bg-[#8a4518] text-white font-sans text-xs font-bold px-8 py-3.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Iniciar sessão</span>
        </button>
      </section>

      {/* Success alert banner */}
      {successBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-800 text-sm py-3.5 px-4 rounded-xl flex items-center gap-2 font-semibold"
        >
          <Check className="w-4 h-4 text-green-600" />
          <span>{successBanner}</span>
        </motion.div>
      )}

      {/* Language Weekly Metrics Cards Row */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Weekly Total Hours */}
        <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 text-[#78706a]">
            <Award className="w-4 h-4 text-[#8c3c3c]" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Estudo esta Semana</span>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-[#3a302a] leading-none">
              {weeklyLanguageStats.totalWeeklyHours.toFixed(1)}h
            </div>
            <p className="font-sans text-xs text-[#605850] mt-1.5 font-medium">
              Horas dedicadas a {langName} nos últimos 7 dias.
            </p>
          </div>
        </div>

        {/* Most Active Day of Study (Dia Mais Ativo de Idioma) */}
        <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 text-[#78706a]">
            <TrendingUp className="w-4 h-4 text-[#8c3c3c]" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Dia de Mais Ativo</span>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-[#3a302a] leading-none">
              {weeklyLanguageStats.peakDayIndex !== -1 ? (
                weeklyLanguageStats.dayNames[weeklyLanguageStats.peakDayIndex]
              ) : weeklyLanguageStats.isHistorical ? (
                weeklyLanguageStats.fallbackDayName
              ) : (
                'Nenhum registo'
              )}
            </div>
            <p className="font-sans text-xs text-[#605850] mt-1.5 font-medium">
              {weeklyLanguageStats.peakDayIndex !== -1 ? (
                `Sessões somando ${weeklyLanguageStats.peakHours.toFixed(1)}h de foco.`
              ) : weeklyLanguageStats.isHistorical ? (
                `Melhor dia histórico com ${weeklyLanguageStats.fallbackHours.toFixed(1)}h.`
              ) : (
                'Registe estudos para ver estatísticas.'
              )}
            </p>
          </div>
        </div>

        {/* Active Skills Count */}
        <div className="bg-white/60 border border-[#d8d0c8]/60 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-3 text-[#78706a]">
            <Sparkles className="w-4 h-4 text-[#8c3c3c]" />
            <span className="font-sans text-xs font-bold uppercase tracking-wider">Desempenho Geral</span>
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-[#3a302a] leading-none">
              Fluente Ativo
            </div>
            <p className="font-sans text-xs text-[#605850] mt-1.5 font-medium">
              Ritmo contínuo focado em conversação prática.
            </p>
          </div>
        </div>

      </section>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Radar Chart: Skill Distribution */}
        <div className="bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 flex flex-col shadow-sm lg:col-span-5">
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-display text-lg font-bold text-[#3a302a]">Distribuição de Skills</h4>
            <Compass className="w-5 h-5 text-[#9a9088]" />
          </div>

          <div className="flex-1 flex items-center justify-center min-h-[250px]">
            {/* SVG Radar Chart Representation */}
            <svg className="w-64 h-64 overflow-visible" viewBox="0 0 240 240">
              {/* Concentric Polygons / Grid */}
              {[20, 40, 60, 80, 100].map((step) => {
                const stepRadius = (step / 100) * 90;
                const gridPoints = Array.from({ length: 6 }).map((_, idx) => {
                  const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                  const x = 120 + stepRadius * Math.cos(angle);
                  const y = 120 + stepRadius * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ');

                return (
                  <polygon
                    key={step}
                    points={gridPoints}
                    fill="none"
                    stroke="#d8d0c8"
                    strokeWidth="0.5"
                    strokeDasharray={step === 100 ? "0" : "2,2"}
                  />
                );
              })}

              {/* Axis lines */}
              {Array.from({ length: 6 }).map((_, idx) => {
                const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                const x2 = 120 + 90 * Math.cos(angle);
                const y2 = 120 + 90 * Math.sin(angle);
                return (
                  <line
                    key={idx}
                    x1="120"
                    y1="120"
                    x2={x2}
                    y2={y2}
                    stroke="#d8d0c8"
                    strokeWidth="0.8"
                  />
                );
              })}

              {/* Filled Skill Polygon Area */}
              <polygon
                points={polygonString}
                fill="rgba(194, 101, 42, 0.2)"
                stroke="#c2652a"
                strokeWidth="2"
                className="transition-all duration-500 ease-out"
              />

              {/* Point circles */}
              {points.map((p, idx) => (
                <g key={idx} className="group/dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#fff"
                    stroke="#c2652a"
                    strokeWidth="2"
                  />
                  {/* Hover tooltip overlay */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="hidden group-hover/dot:block fill-[#3a302a] text-[10px] font-bold font-sans"
                  >
                    {p.val}%
                  </text>
                </g>
              ))}

              {/* Text labels for outer nodes */}
              {['Listening', 'Speaking', 'Reading', 'Writing', 'Grammar', 'Vocabulary'].map((label, idx) => {
                const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
                const labelRadius = 108;
                const x = 120 + labelRadius * Math.cos(angle);
                const y = 120 + labelRadius * Math.sin(angle);
                
                // Alignment anchors
                let textAnchor = "middle";
                if (Math.cos(angle) > 0.1) textAnchor = "start";
                else if (Math.cos(angle) < -0.1) textAnchor = "end";

                return (
                  <text
                    key={idx}
                    x={x}
                    y={y + 3}
                    textAnchor={textAnchor}
                    fill="#605850"
                    className="text-[10px] font-bold font-sans tracking-wide"
                  >
                    {label}
                  </text>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Study Hours Line Chart */}
        <div className="bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 flex flex-col shadow-sm lg:col-span-7">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-display text-lg font-bold text-[#3a302a]">Horas de Estudo</h4>
              <p className="font-sans text-[11px] text-[#78706a] font-semibold mt-0.5">
                {chartRange === 'month' ? 'Últimos 30 dias' : 'Última semana'}
              </p>
            </div>
            {/* Chart toggle controls */}
            <div className="flex gap-1.5 bg-[#f2ece4] rounded-lg p-1">
              <button
                onClick={() => setChartRange('month')}
                className={`px-3 py-1 font-sans text-xs font-bold rounded ${
                  chartRange === 'month' ? 'bg-white text-[#c2652a] shadow-sm' : 'text-[#605850]'
                }`}
              >
                Mês
              </button>
              <button
                onClick={() => setChartRange('week')}
                className={`px-3 py-1 font-sans text-xs font-bold rounded ${
                  chartRange === 'week' ? 'bg-white text-[#c2652a] shadow-sm' : 'text-[#605850]'
                }`}
              >
                Semana
              </button>
            </div>
          </div>

          <div className="flex-1 w-full h-[220px] relative mt-2">
            {/* Highly customized SVG Line Chart */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 360 150" preserveAspectRatio="none">
              {/* Grids / Dash lines */}
              {[0, 1.25, 2.5, 3.75, 5.0].map((val) => {
                const y = 150 - (val / 5.0) * 120 - 15;
                return (
                  <g key={val}>
                    <line
                      x1="15"
                      y1={y}
                      x2="350"
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
                      {val.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Shading Area */}
              <defs>
                <linearGradient id="siennaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c2652a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#faf5ee" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <polygon
                points={areaPointsString}
                fill="url(#siennaGradient)"
                className="transition-all duration-500 ease-out"
              />

              {/* Main Line path */}
              <polyline
                fill="none"
                stroke="#c2652a"
                strokeWidth="2.5"
                points={linePointsString}
                className="transition-all duration-500 ease-out"
              />

              {/* Dots and interactive tags */}
              {linePoints.map((p, idx) => (
                <g key={idx} className="group/line-dot cursor-pointer">
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="4"
                    fill="#fff"
                    stroke="#c2652a"
                    strokeWidth="2"
                  />
                  {/* Tooltip on hover */}
                  <rect
                    x={p.x - 18}
                    y={p.y - 24}
                    width="36"
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
                    {p.hours}h
                  </text>
                  {/* X Axis labels */}
                  <text
                    x={p.x}
                    y="146"
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
        </div>

        {/* Post-Session Logging (Micro-interaction tag tracker) */}
        <div className="bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 shadow-sm lg:col-span-12">
          <h4 className="font-display text-xl font-bold text-[#3a302a] mb-1">Registo Rápido de Estudos</h4>
          <p className="font-sans text-xs text-[#605850] mb-6">O que você praticou hoje para aperfeiçoar sua conversação e fluência?</p>
          
          <div className="flex flex-wrap gap-2.5">
            {[
              { id: 'listening', name: 'Listening', icon: '🎧' },
              { id: 'speaking', name: 'Speaking', icon: '🗣️' },
              { id: 'reading', name: 'Reading', icon: '📚' },
              { id: 'writing', name: 'Writing', icon: '✍️' },
              { id: 'grammar', name: 'Grammar', icon: '📝' },
              { id: 'vocabulary', name: 'Vocabulary', icon: '🔤' },
              { id: 'conversation', name: 'Conversation', icon: '💬' }
            ].map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);
              return (
                <button
                  key={skill.id}
                  onClick={() => toggleSkill(skill.id)}
                  className={`px-5 py-3 rounded-full border text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#c2652a] text-white border-[#c2652a] shadow-sm'
                      : 'bg-white text-[#605850] border-[#d8d0c8]/80 hover:border-[#c2652a]'
                  }`}
                >
                  <span>{skill.icon}</span>
                  <span>{skill.name}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveSession}
              disabled={selectedSkills.length === 0}
              className="bg-[#c2652a] hover:bg-[#8a4518] disabled:opacity-50 text-white font-sans text-xs font-bold px-6 py-3 rounded-full transition-all flex items-center gap-2"
            >
              <span>Guardar registo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
}
