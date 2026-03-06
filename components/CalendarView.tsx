
import React, { useState, useMemo } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Moment } from '../types';
import { BUCKET_CONFIGS } from '../constants';
import { motion, AnimatePresence } from 'motion/react';

interface CalendarViewProps {
  moments: Moment[];
  onBack: () => void;
  themeColor: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ moments, onBack, themeColor }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    
    const arr = [];
    for (let i = 0; i < startDay; i++) arr.push(null);
    for (let i = 1; i <= totalDays; i++) arr.push(new Date(year, month, i));
    return arr;
  }, [currentDate]);

  const momentsForDay = useMemo(() => {
    if (!selectedDate) return [];
    return moments.filter(m => {
      const d = new Date(m.timestamp);
      return d.getDate() === selectedDate.getDate() && 
             d.getMonth() === selectedDate.getMonth() && 
             d.getFullYear() === selectedDate.getFullYear();
    });
  }, [selectedDate, moments]);

  const hasMomentsOnDay = (date: Date) => {
    return moments.some(m => {
      const d = new Date(m.timestamp);
      return d.getDate() === date.getDate() && 
             d.getMonth() === date.getMonth() && 
             d.getFullYear() === date.getFullYear();
    });
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-black">History Calendar</h1>
      </div>

      <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-6 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-black uppercase tracking-widest">{currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 bg-zinc-800 rounded-xl"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2 bg-zinc-800 rounded-xl"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 text-center">
          {['S','M','T','W','T','F','S'].map(d => (
            <span key={d} className="text-[10px] font-black text-zinc-500 pb-4">{d}</span>
          ))}
          {days.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const isSelected = selectedDate && date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
            const hasData = hasMomentsOnDay(date);
            return (
              <button 
                key={i} 
                onClick={() => setSelectedDate(date)}
                className={`relative h-12 flex items-center justify-center font-black text-sm rounded-2xl transition-all ${isSelected ? `bg-${themeColor} text-white scale-110 shadow-lg` : 'hover:bg-zinc-800/50'}`}
              >
                {date.getDate()}
                {hasData && !isSelected && <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full bg-${themeColor}`} />}
              </button>
            );
          })}
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">
            {selectedDate?.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} Snapshot
          </h3>
          <span className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">{momentsForDay.length} Moments</span>
        </div>
        
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {momentsForDay.length > 0 ? momentsForDay.map((m, idx) => (
              <motion.div 
                key={m.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-zinc-900/40 p-5 rounded-[2rem] border border-white/5 flex items-center gap-5 group hover:bg-zinc-800/50 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-800 border border-white/5 flex-shrink-0 relative">
                  <img src={m.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                  <div className={`absolute inset-0 bg-gradient-to-tr ${BUCKET_CONFIGS[m.type].color} opacity-20`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-lg bg-gradient-to-tr ${BUCKET_CONFIGS[m.type].color} flex items-center justify-center`}>
                      {React.cloneElement(BUCKET_CONFIGS[m.type].icon as React.ReactElement, { className: 'w-3 h-3 text-white' })}
                    </div>
                    <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{BUCKET_CONFIGS[m.type].label}</span>
                  </div>
                  <h4 className="font-bold text-base truncate tracking-tight italic">{m.title}</h4>
                  <div className="flex items-center gap-3 mt-1 text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px] font-bold">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    {m.value && (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-zinc-800" />
                        <span className="text-[10px] font-bold">{m.value} {m.unit || BUCKET_CONFIGS[m.type].unit}</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-zinc-900/20 rounded-[2.5rem] border border-dashed border-white/5"
              >
                <CalendarIcon className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest">No memories captured on this day.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
      <div className="h-10" />
    </div>
  );
};

export default CalendarView;
