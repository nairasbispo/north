import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Check, 
  Plus, 
  Trash2, 
  Flame, 
  Calendar, 
  Info, 
  AlertCircle,
  MoreHorizontal
} from 'lucide-react';
import { Habit } from '../types';

interface HabitsTabProps {
  habits: Habit[];
  onToggleHabit: (id: string) => void;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
  streak: number;
}

export default function HabitsTab({ 
  habits, 
  onToggleHabit, 
  onAddHabit, 
  onDeleteHabit,
  streak 
}: HabitsTabProps) {
  const [newHabitName, setNewHabitName] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Stats calculation
  const completedCount = habits.filter(h => h.completed).length;
  const totalCount = habits.length;
  const percentCompleted = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;
    onAddHabit(newHabitName.trim());
    setNewHabitName('');
    setShowAddForm(false);
  };

  // Mock Calendar Contributions for October Habit heatmap
  // 35 blocks representing days. Heatmap colors:
  // level 0: bg-[#f2ece4], level 1: bg-[#fbe8d8], level 2: bg-[#f0a878], level 3: bg-[#e08850], level 4: bg-[#c2652a]
  const octHeatmapDays = [
    { day: 1, level: 1, completed: '2 de 6' },
    { day: 2, level: 2, completed: '4 de 6' },
    { day: 3, level: 3, completed: '5 de 6' },
    { day: 4, level: 4, completed: '6 de 6' },
    { day: 5, level: 4, completed: '6 de 6' },
    { day: 6, level: 0, completed: '0 de 6' },
    { day: 7, level: 1, completed: '2 de 6' },
    { day: 8, level: 2, completed: '4 de 6' },
    { day: 9, level: 4, completed: '6 de 6' },
    { day: 10, level: 3, completed: '5 de 6' },
    { day: 11, level: 4, completed: '6 de 6' },
    { day: 12, level: 4, completed: '6 de 6' },
    { day: 13, level: 2, completed: '4 de 6' },
    { day: 14, level: 4, completed: '6 de 6' },
    { day: 15, level: 4, completed: '6 de 6' },
    { day: 16, level: 4, completed: '6 de 6' },
    { day: 17, level: 3, completed: '5 de 6' },
    { day: 18, level: 4, completed: '6 de 6' },
    { day: 19, level: 4, completed: '6 de 6' },
    { day: 20, level: 2, completed: '4 de 6' },
    { day: 21, level: 4, completed: '6 de 6' },
    { day: 22, level: 4, completed: '6 de 6' },
    { day: 23, level: 4, completed: '6 de 6' },
    { day: 24, level: 4, completed: `${completedCount} de ${totalCount}` }, // Bind to current day state!
  ];

  const getHeatmapColor = (level: number) => {
    switch (level) {
      case 0: return 'bg-[#f2ece4]';
      case 1: return 'bg-[#fbe8d8]';
      case 2: return 'bg-[#f0a878]';
      case 3: return 'bg-[#e08850]';
      case 4: return 'bg-[#c2652a]';
      default: return 'bg-[#faf5ee]';
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
      {/* Header controls */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="font-sans text-xs font-bold text-[#c2652a] uppercase tracking-wider mb-1.5">Hoje</p>
          <h2 className="font-display text-4xl font-bold text-[#3a302a]">24 de Outubro</h2>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-6 py-3 rounded-full border border-[#d8d0c8]/80 bg-white hover:bg-[#faf5ee] text-[#3a302a] font-sans text-xs font-bold shadow-sm flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4 text-[#c2652a]" />
          <span>Gerenciar Hábitos</span>
        </button>
      </section>

      {/* Slide down custom add form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateHabit}
            className="bg-white border border-[#d8d0c8]/60 p-5 rounded-2xl shadow-sm space-y-4 overflow-hidden"
          >
            <div className="flex flex-col gap-1.5">
              <label className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider">
                Novo Hábito
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g. Meditação matinal, Alongamento..."
                  className="flex-1 bg-[#faf5ee] border border-[#d8d0c8] rounded-xl px-4 py-2.5 font-sans text-sm text-[#3a302a] focus:outline-none focus:border-[#c2652a] transition-colors"
                  required
                />
                <button
                  type="submit"
                  className="bg-[#c2652a] text-white rounded-full px-6 py-2.5 font-sans text-xs font-bold hover:bg-[#8a4518] transition-colors"
                >
                  Adicionar
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left checklist routine card (Spans 7) */}
        <div className="md:col-span-7 bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-display text-xl font-bold text-[#3a302a]">Minha Rotina</h3>
            <button 
              onClick={() => setShowAddForm(true)}
              className="text-[#c2652a] hover:bg-[#c2652a]/10 p-2 rounded-full transition-colors"
              title="Adicionar hábito"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* List display */}
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                  habit.completed
                    ? 'border-transparent hover:bg-[#f2ece4]/50'
                    : 'border-[#d8d0c8]/60 bg-white hover:border-[#c2652a] shadow-sm'
                }`}
              >
                <div 
                  onClick={() => onToggleHabit(habit.id)}
                  className="flex-1 flex items-center gap-4"
                >
                  {/* Round toggle checkbox */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    habit.completed
                      ? 'border-[#c2652a] bg-[#c2652a]'
                      : 'border-[#d8d0c8] group-hover:border-[#c2652a]'
                  }`}>
                    <Check className={`w-3.5 h-3.5 text-white ${habit.completed ? 'block' : 'hidden'}`} strokeWidth={3} />
                  </div>

                  <span className={`font-sans text-base transition-all ${
                    habit.completed
                      ? 'line-through text-[#605850]/60 font-medium'
                      : 'text-[#3a302a] font-semibold'
                  }`}>
                    {habit.name}
                  </span>
                </div>

                {/* Hover Delete Action */}
                <button
                  onClick={() => onDeleteHabit(habit.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-all"
                  title="Apagar hábito"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Stats & Monthly calendar side panels (Spans 5) */}
        <div className="md:col-span-5 flex flex-col gap-6">
          
          {/* Top Daily Progress Panel */}
          <div className="bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 shadow-sm">
            <h3 className="font-sans text-xs font-bold text-[#78706a] uppercase tracking-wider mb-4">
              Progresso Diário
            </h3>
            
            <div className="flex items-end gap-4 mb-6">
              <span className="font-display text-5xl font-bold text-[#3a302a] leading-none">
                {percentCompleted}%
              </span>
              <div className="pb-1">
                <p className="font-sans text-sm font-bold text-[#c2652a]">{completedCount} de {totalCount}</p>
                <p className="font-sans text-[11px] text-[#78706a] font-semibold">Hábitos concluídos hoje</p>
              </div>
            </div>

            {/* Simple progress bar */}
            <div className="w-full h-2 bg-[#f2ece4] rounded-full overflow-hidden mb-6">
              <div 
                className="h-full bg-[#c2652a] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percentCompleted}%` }}
              />
            </div>

            {/* Streak row */}
            <div className="flex items-center gap-3 p-4 bg-[#faf5ee] rounded-xl border border-[#d8d0c8]/40">
              <div className="w-10 h-10 rounded-full bg-[#8c3c3c]/10 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#8c3c3c] fill-[#8c3c3c]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-[#3a302a]">{streak} dias seguidos</p>
                <p className="text-xs text-[#78706a] font-medium">Você está em uma excelente sequência!</p>
              </div>
            </div>
          </div>

          {/* Monthly grid calendar visual (Heatmap map) */}
          <div className="bg-white/70 rounded-2xl border border-[#d8d0c8]/60 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-lg font-bold text-[#3a302a]">Outubro</h3>
              <span className="font-sans text-xs font-bold text-[#78706a] uppercase">Este Mês</span>
            </div>

            {/* Week labels */}
            <div className="grid grid-cols-7 gap-1.5 mb-2 text-center text-[10px] font-bold text-[#78706a]">
              <span>D</span><span>S</span><span>T</span><span>Q</span><span>Q</span><span>S</span><span>S</span>
            </div>

            {/* Heatmap Grid */}
            <div className="grid grid-cols-7 gap-2">
              {/* Offset days for October start weekday */}
              <div className="aspect-square rounded" />
              <div className="aspect-square rounded" />

              {octHeatmapDays.map((d) => (
                <div
                  key={d.day}
                  className={`aspect-square rounded transition-colors duration-300 ${getHeatmapColor(d.level)}`}
                  title={`${d.day} Out • ${d.completed} hábitos`}
                />
              ))}

              {/* Future offset days placeholder */}
              {Array.from({ length: 6 }).map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded bg-[#f2ece4]/40 border border-dashed border-[#d8d0c8]/60" 
                />
              ))}
            </div>

            {/* Legend bar */}
            <div className="flex items-center justify-end gap-1.5 mt-5">
              <span className="text-[9px] font-bold text-[#78706a] uppercase mr-1">Menos</span>
              <div className="w-3.5 h-3.5 rounded bg-[#f2ece4]" />
              <div className="w-3.5 h-3.5 rounded bg-[#fbe8d8]" />
              <div className="w-3.5 h-3.5 rounded bg-[#f0a878]" />
              <div className="w-3.5 h-3.5 rounded bg-[#e08850]" />
              <div className="w-3.5 h-3.5 rounded bg-[#c2652a]" />
              <span className="text-[9px] font-bold text-[#78706a] uppercase ml-1">Mais</span>
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
