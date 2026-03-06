
import React, { useMemo, useState } from 'react';
import { Play, ChevronRight, Plus, Sparkles, Calendar, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { Moment, BucketType } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface YearlyTimelineProps {
  moments: Moment[];
  onExit: () => void;
  onReplay: () => void;
  themeColor: string;
  onMonthRecap: (index: number) => void;
}

const YearlyTimeline: React.FC<YearlyTimelineProps> = ({ moments, onExit, onReplay, themeColor, onMonthRecap }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthsData = useMemo(() => {
    return monthNames.map((name, index) => {
      const monthMoments = moments.filter(m => {
        const d = new Date(m.timestamp);
        return d.getMonth() === index && d.getFullYear() === currentYear;
      });
      
      const isCurrent = new Date().getMonth() === index;
      const isPast = new Date().getMonth() > index;
      const isFuture = new Date().getMonth() < index;
      
      // Placeholder images if no moments
      const placeholderImg = `https://picsum.photos/seed/${name}${currentYear}/400/400`;
      const firstMomentImg = monthMoments.find(m => m.imageUrl)?.imageUrl;

      return {
        name,
        index,
        count: monthMoments.length,
        img: firstMomentImg || placeholderImg,
        isCurrent,
        isPast,
        isFuture,
        hasData: monthMoments.length > 0,
        moments: monthMoments
      };
    });
  }, [moments, currentYear]);

  const yearProgress = Math.round(((new Date().getMonth() + 1) / 12) * 100);

  const renderMonthDetail = () => {
    if (selectedMonthIndex === null) return null;
    const monthData = monthsData[selectedMonthIndex];
    
    // Group moments by category
    const groupedMoments: Record<string, Moment[]> = {};
    monthData.moments.forEach(m => {
      if (!groupedMoments[m.type]) groupedMoments[m.type] = [];
      groupedMoments[m.type].push(m);
    });

    return (
      <div className="fixed inset-0 z-50 bg-[#050505] overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-500">
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setSelectedMonthIndex(null)} 
              className="p-3 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-black tracking-tight">{monthData.name} {currentYear}</h2>
            <button 
              onClick={() => onMonthRecap(monthData.index)}
              className="p-3 bg-white text-black rounded-full hover:scale-110 transition-all shadow-lg"
              title="Generate Monthly Recap"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-10">
            {Object.entries(groupedMoments).length > 0 ? (
              Object.entries(groupedMoments).map(([type, items]) => {
                const config = BUCKET_CONFIGS[type as BucketType];
                return (
                  <section key={type} className="space-y-4">
                    <div className="flex items-center gap-3 px-1">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${config.color} flex items-center justify-center scale-90`}>
                        {config.icon}
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-zinc-400">{config.label}</h3>
                      <span className="ml-auto text-[10px] font-bold text-zinc-600">{items.length} items</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {items.map(m => (
                        <div key={m.id} className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-lg shadow-black/40">
                          <img src={m.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                          <div className="absolute bottom-2 left-2 right-2">
                             <p className="text-[9px] font-black truncate">{m.title}</p>
                             <p className="text-[7px] text-zinc-400 font-bold uppercase">{new Date(m.timestamp).toLocaleDateString(undefined, { day: 'numeric' })}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              <div className="py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                  <Calendar className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">No memories captured yet</p>
                <p className="text-zinc-600 text-xs max-w-[200px] mx-auto leading-relaxed">
                  Start adding moments to see your {monthData.name} story unfold.
                </p>
              </div>
            )}
          </div>
          
          <div className="h-20" />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full p-6 space-y-10 animate-in fade-in slide-in-from-left-4 duration-700">
      <header className="space-y-6">
         <span className="px-4 py-1.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
            Year in Review
           </span>
          <h1 className="text-6xl font-black italic tracking-tighter leading-tight">Your {currentYear}<br/>Story.</h1>
          <p className="text-zinc-500 font-medium text-sm leading-relaxed max-max-w-[80%]">
            Every beat, every step, and every capture. Relive your entire {currentYear} journey in one place.
          </p>
      </header>

      <button 
        onClick={onReplay}
        className="w-full py-6 bg-white text-black rounded-[2rem] flex items-center justify-center gap-4 font-black text-xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all group"
      >
        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center pl-1 group-hover:scale-110 transition-transform">
          <Play className="w-5 h-5 fill-white text-white" />
        </div>
        Replay the Year
      </button>

      {/* Timeline */}
      <div className="relative pl-12 space-y-12 py-10">
        {/* Continuous Line */}
        <div className="absolute left-5 top-0 bottom-0 w-[1px] bg-gradient-to-b from-white/20 via-zinc-800 to-transparent"></div>

        {monthsData.map((m, idx) => (
          <div key={m.name} className="relative">
            {/* Timeline Dot */}
            <div className={`absolute -left-[42px] top-10 w-4 h-4 rounded-full border-[3px] border-black z-10 
              ${m.isCurrent ? 'bg-white animate-pulse' : m.isFuture ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-700'}`}
            ></div>
            
            <div 
              onClick={() => setSelectedMonthIndex(m.index)}
              className={`bg-zinc-900/20 border border-white/5 rounded-[2.5rem] overflow-hidden transform transition-all hover:bg-zinc-900/40 cursor-pointer group ${m.isFuture ? 'opacity-40 grayscale' : ''}`}
            >
              <div className="flex p-5 gap-6 items-center">
                <div className="w-24 h-24 rounded-3xl overflow-hidden flex-shrink-0 relative border border-white/5">
                  <img src={m.img} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" alt="" />
                  {m.isCurrent && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]">
                       <Sparkles className="w-6 h-6 text-white animate-pulse" />
                    </div>
                  )}
                  {m.isFuture && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                       <Calendar className="w-6 h-6 text-white/20" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black tracking-tight">{m.name}</h3>
                    {m.isCurrent && (
                       <span className="px-2 py-0.5 bg-white text-black text-[8px] font-black rounded uppercase">Live</span>
                    )}
                    {m.isFuture && (
                       <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 text-[8px] font-black rounded uppercase">Soon</span>
                    )}
                  </div>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest leading-tight">
                    {m.isFuture ? 'Waiting for memories' : `${m.count} Moments captured`}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-zinc-800/50 group-hover:bg-white group-hover:text-black transition-all">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Yearly Summary Card */}
      <div className="bg-gradient-to-br from-zinc-900 to-black p-8 rounded-[3rem] border border-white/5 text-center space-y-4">
        <h3 className="text-xl font-black">{currentYear} is {yearProgress}% Complete</h3>
        <p className="text-zinc-500 text-xs font-medium">Keep capturing your moments to generate the Ultimate Yearly Recap.</p>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div className="h-full bg-white transition-all duration-1000" style={{ width: `${yearProgress}%` }} />
        </div>
      </div>
      
      <div className="h-24" />
      
      {/* Month Detail Overlay */}
      {renderMonthDetail()}
    </div>
  );
};

export default YearlyTimeline;
