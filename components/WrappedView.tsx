
import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
// Added Plus to the lucide-react imports
import { X, Share2, Sparkles, Heart, Headphones, Gamepad, BarChart3, TrendingUp, Calendar, Trophy, Zap, Star, LayoutGrid, Image as ImageIcon, Music, Play, Camera, Plus, Loader2 } from 'lucide-react';
import { Moment, BucketType } from '../types';
import { BUCKET_CONFIGS } from '../constants';
import { generateMonthlyRecap, generateYearlyRecap, MonthlyRecapAI } from '../services/geminiService';

interface WrappedViewProps {
  moments: Moment[];
  onExit: () => void;
  type?: 'monthly' | 'yearly';
  monthIndex?: number; // 0-11
}

const WrappedView: React.FC<WrappedViewProps> = ({ moments, onExit, type = 'monthly', monthIndex }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [aiRecap, setAiRecap] = useState<MonthlyRecapAI | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const now = new Date();
  const currentYear = now.getFullYear();
  
  const targetMonthIndex = monthIndex !== undefined ? monthIndex : now.getMonth();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const targetMonthName = monthNames[targetMonthIndex];
  
  // 1. Filter moments
  const filteredMoments = useMemo(() => {
    if (type === 'yearly') {
      return moments.filter(m => new Date(m.timestamp).getFullYear() === currentYear);
    }
    return moments.filter(m => {
      const d = new Date(m.timestamp);
      return d.getMonth() === targetMonthIndex && d.getFullYear() === currentYear;
    });
  }, [moments, type, targetMonthIndex, currentYear]);

  const steps = filteredMoments.length > 0 ? 9 : 1;

  useEffect(() => {
    if (filteredMoments.length === 0) return;
    
    const fetchAiRecap = async () => {
      setIsAiLoading(true);
      let data;
      if (type === 'yearly') {
        data = await generateYearlyRecap(filteredMoments, currentYear);
      } else {
        data = await generateMonthlyRecap(filteredMoments, targetMonthName);
      }
      setAiRecap(data);
      setIsAiLoading(false);
    };
    
    fetchAiRecap();

    const timer = setInterval(() => {
      setCurrentStep(prev => (prev < steps - 1 ? prev + 1 : prev));
    }, 7000);
    return () => clearInterval(timer);
  }, [steps, filteredMoments.length, targetMonthName, type, currentYear]);

  useEffect(() => {
    if (currentStep === steps - 1 && filteredMoments.length > 0) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [currentStep, steps, filteredMoments.length]);

  const stats = useMemo(() => {
    if (filteredMoments.length === 0) return null;

    const bucketCounts: Record<string, number> = {};
    const bucketValues: Record<string, number> = {};
    
    filteredMoments.forEach(m => {
      bucketCounts[m.type] = (bucketCounts[m.type] || 0) + 1;
      bucketValues[m.type] = (bucketValues[m.type] || 0) + (m.value || 1);
    });

    const groupedItems: Record<string, { moment: Moment, score: number, totalValue: number, count: number }> = {};
    filteredMoments.forEach(m => {
      const key = `${m.type}-${m.title.toLowerCase()}`;
      if (!groupedItems[key]) {
        groupedItems[key] = { moment: m, score: 0, totalValue: 0, count: 0 };
      }
      groupedItems[key].count += 1;
      groupedItems[key].totalValue += (m.value || 1);
      
      // Smarter Scoring:
      // - Favorites get a huge boost (+100)
      // - Each "play" or value unit counts for 5 points
      // - Frequency (count) counts for 10 points
      const favoriteBonus = m.isFavorite ? 100 : 0;
      groupedItems[key].score = (groupedItems[key].count * 10) + (groupedItems[key].totalValue * 5) + favoriteBonus;
    });

    const top5 = Object.values(groupedItems)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const topByCategory: Record<string, any[]> = {};
    ['photos', 'music', 'screens', 'games', 'movies'].forEach(cat => {
      topByCategory[cat] = Object.values(groupedItems)
        .filter(item => item.moment.type === cat)
        .sort((a, b) => b.count - a.count) // "most adds or entries"
        .slice(0, 3);
    });

    const sortedCategories = (Object.entries(bucketCounts) as [BucketType, number][])
      .sort(([,a], [,b]) => b - a);

    const peakMusic = filteredMoments.filter(m => m.type === 'music').sort((a,b) => (b.value || 0) - (a.value || 0))[0];
    const peakPhotos = filteredMoments.filter(m => m.type === 'photos');

    const dayDist: Record<string, number> = {};
    filteredMoments.forEach(m => {
      const day = new Date(m.timestamp).toLocaleDateString(undefined, { weekday: 'long' });
      dayDist[day] = (dayDist[day] || 0) + 1;
    });
    const topDay = Object.entries(dayDist).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Day';

    return {
      top5,
      topByCategory,
      sortedCategories,
      peakMusic,
      peakPhotos,
      topDay,
      total: filteredMoments.length
    };
  }, [filteredMoments]);

  const renderStep = () => {
    const s = stats as any;
    // Handling Empty State
    if (!s) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-10 animate-fade-up">
           <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mb-8 border border-white/10">
              <Plus className="w-10 h-10 text-zinc-500" />
           </div>
           <h2 className="text-4xl font-black italic mb-4">Blank Canvas.</h2>
           <p className="text-zinc-500 font-medium mb-12">Capture your first {type === 'yearly' ? 'yearly' : targetMonthName} moment to start generating your story.</p>
           <button onClick={onExit} className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-widest text-xs">
              Go to Dashboard
           </button>
        </div>
      );
    }

    switch(currentStep) {
      case 0: // Intro
        return (
          <div className="flex flex-col items-center justify-center h-full text-center px-10 animate-in zoom-in duration-1000">
            <div className="mb-10 w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center border border-white/20 shadow-2xl relative">
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute inset-0 bg-white/10 rounded-full blur-2xl animate-pulse" />
            </div>
            <p className="text-white/40 font-black uppercase tracking-[0.5em] text-[10px] mb-4">{type === 'yearly' ? 'Yearly' : 'Monthly'} Recap • {currentYear}</p>
            <h1 className="text-7xl font-black italic leading-[0.85] text-white drop-shadow-2xl">
              {aiRecap ? aiRecap.title.split(' ').map((word, i) => <React.Fragment key={i}>{word}<br/></React.Fragment>) : <>Your<br/>{type === 'yearly' ? 'Year' : targetMonthName}<br/>Story</>}
            </h1>
            {aiRecap && (
              <p className="mt-6 text-fuchsia-400 font-bold italic text-sm max-w-[280px] animate-fade-up">
                "{aiRecap.summary}"
              </p>
            )}
            <p className="mt-8 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">{s.total} Moments Logged</p>
          </div>
        );

      case 1: // Top Habit
        const topHabit = s.sortedCategories[0];
        const config = BUCKET_CONFIGS[topHabit[0]];
        return (
          <div className="flex flex-col h-full justify-center px-8 animate-in slide-in-from-right-full duration-700">
             <div className="space-y-6">
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 block">The {type === 'yearly' ? 'Yearly' : targetMonthName} Obsession</span>
               <h2 className="text-5xl font-black leading-tight">
                You were<br/>deep into<br/><span className="italic underline decoration-fuchsia-500">{config.label}</span>.
               </h2>
               <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 flex flex-col gap-6 relative overflow-hidden group shadow-2xl">
                  <div className="absolute -top-10 -right-10 opacity-10">
                    {React.cloneElement(config.icon as React.ReactElement, { className: 'w-48 h-48' })}
                  </div>
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${config.color} flex items-center justify-center shadow-2xl`}>
                      {React.cloneElement(config.icon as React.ReactElement, { className: 'w-10 h-10 text-white' })}
                    </div>
                    <div>
                      <p className="text-4xl font-black italic tracking-tighter">{topHabit[1]}</p>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Total {config.metricLabel}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium leading-relaxed opacity-60 italic relative z-10 pr-12">
                    {aiRecap ? `"${aiRecap.vibeDescription}"` : `"${type === 'yearly' ? 'The year' : targetMonthName} was defined by your commitment to ${config.label.toLowerCase()}."`}
                  </p>
               </div>
             </div>
          </div>
        );

      case 2: // Top 5 Ranking
        return (
          <div className="flex flex-col h-full justify-center px-6 animate-in slide-in-from-bottom-full duration-700">
            <div className="flex items-center gap-3 mb-10 px-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              <h2 className="text-3xl font-black tracking-tighter italic uppercase">The Chart Toppers</h2>
            </div>
            <div className="space-y-3">
              {s.top5.map((item: any, idx: number) => (
                <div key={`${item.moment.id}-${idx}`} className="bg-white/5 p-4 rounded-3xl border border-white/10 flex items-center gap-4 animate-in fade-in" style={{ animationDelay: `${idx * 200}ms` }}>
                  <div className="w-10 h-10 rounded-full bg-white text-black font-black flex items-center justify-center flex-shrink-0 text-xs italic">
                    {idx + 1}
                  </div>
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 shadow-lg">
                    <img src={item.moment.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{item.moment.title}</p>
                    <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{BUCKET_CONFIGS[item.moment.type].label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black italic">{item.totalValue}</p>
                    <p className="text-[7px] font-bold opacity-20 uppercase">{BUCKET_CONFIGS[item.moment.type].unit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 3: // Spotlight (Music or Photo)
        const spotlight = s.peakMusic || s.top5[0].moment;
        return (
          <div className="flex flex-col h-full justify-center px-6 animate-in zoom-in duration-700">
            <div className="relative aspect-[4/5] rounded-[4.5rem] overflow-hidden shadow-2xl border-4 border-white/10 group">
               <img src={spotlight.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[20s] ease-linear" alt="" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent"></div>
               <div className="absolute top-10 left-10">
                  <div className={`px-5 py-2 bg-white text-black rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-2xl`}>
                    <Star className="w-3.5 h-3.5 fill-black" /> Your {type === 'yearly' ? 'Yearly' : targetMonthName} Peak
                  </div>
               </div>
               <div className="absolute bottom-12 left-10 right-10">
                  <p className="text-fuchsia-400 text-[10px] font-black uppercase tracking-[0.3em] mb-3">Top Discovery</p>
                  <h3 className="text-5xl font-black mb-2 leading-none drop-shadow-2xl italic">{spotlight.title}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold opacity-60">{spotlight.subtitle}</span>
                    <div className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="text-sm font-bold opacity-60">{spotlight.value || 1} {BUCKET_CONFIGS[spotlight.type].unit}</span>
                  </div>
               </div>
            </div>
          </div>
        );

      case 4: // Gallery Recap
        return (
          <div className="flex flex-col h-full justify-center px-8 text-center animate-in slide-in-from-right-full duration-700">
             <div className="mb-12">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-4xl font-black mb-4 tracking-tighter italic">Your Visual Pulse.</h2>
                <p className="text-zinc-500 text-sm font-medium">You curated <span className="text-white font-black">{s.peakPhotos.length}</span> images {type === 'yearly' ? 'this year' : 'this month'}. Every frame captured a core memory.</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4 max-h-64 overflow-hidden px-4">
                {s.peakPhotos.slice(0, 4).map((m: any, idx: number) => (
                  <div key={m.id} className={`aspect-square rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl transform ${idx % 2 === 0 ? 'rotate-3' : '-rotate-3'} hover:rotate-0 transition-transform`}>
                    <img src={m.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                ))}
                {s.peakPhotos.length === 0 && (
                   <div className="col-span-2 py-10 bg-white/5 rounded-3xl border border-white/5 text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
                      No photos found
                   </div>
                )}
             </div>
          </div>
        );

      case 5: // Top Rated per Category
        return (
          <div className="flex flex-col h-full justify-center px-6 animate-in slide-in-from-bottom-full duration-700">
            <div className="flex items-center gap-3 mb-8 px-2">
              <BarChart3 className="w-6 h-6 text-emerald-500" />
              <h2 className="text-3xl font-black tracking-tighter italic uppercase">Category Leaders</h2>
            </div>
            <div className="space-y-6">
              {Object.entries(s.topByCategory).filter(([_, items]) => (items as any[]).length > 0).map(([cat, items]) => (
                <div key={cat} className="space-y-2">
                  <div className="flex items-center gap-2 px-2">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-tr ${BUCKET_CONFIGS[cat as BucketType].color}`} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40">{BUCKET_CONFIGS[cat as BucketType].label}</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {(items as any[]).map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0">
                          <img src={item.moment.imageUrl} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs truncate">{item.moment.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-black italic">{item.count}</p>
                          <p className="text-[6px] font-bold opacity-20 uppercase">Entries</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 6: // Analysis Data
        return (
          <div className="flex flex-col h-full justify-center px-8 text-left animate-in fade-in duration-1000">
             <div className="flex items-center gap-4 mb-10">
                <BarChart3 className="w-10 h-10 text-white" />
                <h2 className="text-4xl font-black italic tracking-tighter uppercase leading-[0.8]">{type === 'yearly' ? 'Yearly' : targetMonthName}<br/>Analysis</h2>
             </div>
             
             <div className="space-y-3">
                <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Global Momentum</p>
                         <p className="text-xl font-bold">{s.total} Total Moments</p>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                   {s.sortedCategories.slice(0, 4).map(([type, count]: [BucketType, number], idx: number) => (
                     <div key={type} className="bg-white/5 p-5 rounded-[2rem] border border-white/5 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${BUCKET_CONFIGS[type].color} flex items-center justify-center shadow-lg`}>
                              {React.cloneElement(BUCKET_CONFIGS[type].icon as React.ReactElement, { className: 'w-5 h-5 text-white' })}
                           </div>
                           <div>
                              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Rank #{idx + 1}</p>
                              <p className="text-base font-bold">{BUCKET_CONFIGS[type].label}</p>
                           </div>
                        </div>
                        <span className="text-xl font-black italic">{count}</span>
                     </div>
                   ))}
                </div>

                <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 flex items-center gap-4">
                   <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                     <Calendar className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                      <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Peak Performance</p>
                      <p className="text-lg font-bold">Thrived on {s.topDay}s</p>
                   </div>
                </div>
             </div>
          </div>
        );

      case 7: // AI Funny Observation
        return (
          <div className="flex flex-col h-full justify-center px-10 text-center animate-in zoom-in duration-1000">
            <div className="w-20 h-20 bg-fuchsia-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-fuchsia-500/20">
              <Sparkles className="w-10 h-10 text-fuchsia-400" />
            </div>
            <h2 className="text-4xl font-black mb-6 italic tracking-tighter">AI Observation</h2>
            <div className="bg-white/5 p-8 rounded-[3rem] border border-white/10 relative">
              <p className="text-xl font-bold italic leading-relaxed">
                {aiRecap ? `"${aiRecap.funnyObservation}"` : "You've been quite busy! Your data shows a lot of interesting patterns."}
              </p>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-fuchsia-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        );

      case 8: // Outro
        return (
          <div className="flex flex-col h-full justify-center items-center px-10 text-center animate-in zoom-in duration-1000">
            <div className="w-28 h-28 bg-white/5 rounded-full flex items-center justify-center mb-10 border border-white/10 backdrop-blur-3xl shadow-2xl relative">
              <Sparkles className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-white/5 rounded-full animate-ping" />
            </div>
            <h2 className="text-5xl font-black mb-6 italic leading-tight">{type === 'yearly' ? 'Year' : targetMonthName}<br/>is Complete</h2>
            <p className="text-white/40 font-medium mb-12 text-sm leading-relaxed max-w-[240px]">Your history is now a legacy. Share your story or keep capturing the next chapter.</p>
            <div className="w-full space-y-4">
              <button className="w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all">
                 <Share2 className="w-6 h-6" />
                 Share Story
              </button>
              <button onClick={onExit} className="w-full py-4 text-white/20 font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
                Back to Feed
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] overflow-hidden max-w-md mx-auto shadow-2xl select-none">
      {/* Background Ambience */}
      <div className="absolute top-[-20%] left-[-20%] w-[100%] h-[100%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[100%] h-[100%] bg-fuchsia-600/10 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }} />

      {/* Progress Bars */}
      {filteredMoments.length > 0 && (
        <div className="absolute top-6 left-10 right-10 flex gap-2 z-[60]">
          {[...Array(steps)].map((_, i) => (
            <div key={i} className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white shadow-[0_0_10px_#fff] transition-all duration-[7000ms] ease-linear`}
                style={{ width: currentStep > i ? '100%' : (currentStep === i ? '100%' : '0%') }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Close Button */}
      <button onClick={onExit} className="absolute top-12 right-10 z-[60] text-white/30 hover:text-white transition-all p-3 bg-white/5 rounded-2xl backdrop-blur-xl border border-white/10 hover:scale-110 active:scale-90">
        <X className="w-6 h-6" />
      </button>

      {/* Slide Container */}
      <div className="h-full pt-20 pb-16 relative z-10">
        {renderStep()}
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 right-0 text-center opacity-20 pointer-events-none">
        <p className="text-[9px] font-black uppercase tracking-[0.6em] text-white italic">RECAP • {targetMonthName.toUpperCase()} {currentYear} • DATA STORY</p>
      </div>
    </div>
  );
};

export default WrappedView;
