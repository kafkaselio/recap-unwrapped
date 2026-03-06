
import React from 'react';
import { Menu, ChevronRight, Sparkles, Plus, Calendar, Edit2, BarChart3, Trophy } from 'lucide-react';
import { BucketType, Moment, UserProfile } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface DashboardProps {
  stats: Record<BucketType, number>;
  activeBuckets: BucketType[];
  onBucketClick: (type: BucketType) => void;
  onGenerateRecap: (type?: 'monthly' | 'yearly') => void;
  moments: Moment[];
  user: UserProfile;
  themeColor: string;
  onOpenMenu: () => void;
  onOpenAdd: () => void;
  onOpenCalendar: () => void;
  onEditMoment: (moment: Moment) => void;
  onOpenInsights: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ stats, activeBuckets, onBucketClick, onGenerateRecap, moments, user, themeColor, onOpenMenu, onOpenAdd, onOpenCalendar, onEditMoment, onOpenInsights }) => {
  const now = new Date();
  const currentMonthName = now.toLocaleDateString(undefined, { month: 'long' });
  const currentYear = now.getFullYear();

  return (
    <div className="p-6 space-y-8 animate-fade-up">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={user.avatar} className="w-11 h-11 rounded-2xl object-cover bg-zinc-900 border border-white/10 p-0.5" alt="Avatar" />
          <div>
            <p className="text-zinc-500 text-[9px] font-black uppercase tracking-[0.2em]">{currentMonthName} {currentYear}</p>
            <h1 className="text-lg font-bold tracking-tight">Hey, {user.name.split(' ')[0]}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenCalendar} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl text-zinc-400 hover:text-white border border-white/5 transition-colors">
            <Calendar className="w-4.5 h-4.5" />
          </button>
          <button onClick={onOpenMenu} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl text-zinc-400 hover:text-white border border-white/5 transition-colors">
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>
      </header>

      {/* Quick Add Button */}
      <button 
        onClick={onOpenAdd}
        className={`w-full py-6 bg-gradient-to-br from-white to-zinc-200 rounded-[2rem] flex items-center justify-between px-8 text-black font-black shadow-2xl transform active:scale-[0.98] transition-all group overflow-hidden relative`}
      >
        <div className="flex flex-col items-start relative z-10 text-black">
          <span className="text-[9px] uppercase tracking-[0.3em] opacity-60">Momentum</span>
          <span className="text-xl tracking-tighter">Capture Memory</span>
        </div>
        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center relative z-10 shadow-lg group-hover:scale-110 transition-transform">
          <Plus className="w-6 h-6 text-white" />
        </div>
      </button>

      {/* Highlight Grid */}
      <section>
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-500">Your Highlights</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {activeBuckets.filter(type => stats[type] > 0 || ['photos', 'music', 'games', 'location'].includes(type)).slice(0, 4).map(type => {
            const config = BUCKET_CONFIGS[type];
            return (
              <button 
                key={type}
                onClick={() => onBucketClick(type)}
                className="bg-white/5 border border-white/10 rounded-[1.8rem] p-5 text-left hover:bg-white/[0.08] transition-all group relative overflow-hidden shadow-lg shadow-black/20"
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${config.color} flex items-center justify-center mb-5 group-hover:rotate-6 transition-all`}>
                  {config.icon}
                </div>
                <div className="space-y-0.5">
                  <p className="text-3xl font-bold tracking-tighter leading-none">{stats[type]}</p>
                  <p className="text-[8px] text-zinc-500 font-black uppercase tracking-widest">{config.metricLabel}</p>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Recent Feed */}
      <section className="space-y-4">
        <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-500 px-1">Recent Activity</h3>
        <div className="space-y-3">
          {moments.slice(0, 3).map(moment => (
            <div 
              key={moment.id} 
              onClick={() => onEditMoment(moment)}
              className="bg-white/5 p-4 rounded-3xl flex items-center gap-4 border border-white/5 hover:bg-white/[0.08] hover:border-white/20 cursor-pointer transition-all group shadow-sm shadow-black/20"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 flex-shrink-0">
                <img src={moment.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={moment.title} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm truncate tracking-tight">{moment.title}</h4>
                  <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
                  {new Date(moment.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {BUCKET_CONFIGS[moment.type]?.label}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
            </div>
          ))}
          {moments.length === 0 && (
            <div className="py-10 text-center text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
              No entries yet
            </div>
          )}
        </div>
      </section>

      {/* Monthly Report Recap Buttons */}
      <div className="grid grid-cols-1 gap-3 pt-4 pb-8">
        <button 
          onClick={onGenerateRecap}
          className={`w-full py-5 rounded-3xl bg-gradient-to-r from-zinc-900 to-black border border-white/10 flex items-center justify-between px-6 shadow-xl active:scale-95 transition-all group`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl bg-${themeColor}/10 flex items-center justify-center`}>
              <Sparkles className={`w-5 h-5 text-${themeColor}`} />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">{currentMonthName} Wrapped</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Monthly Story</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={() => onGenerateRecap('yearly')}
          className={`w-full py-5 rounded-3xl bg-zinc-900/50 border border-white/5 flex items-center justify-between px-6 shadow-xl active:scale-95 transition-all group hover:bg-zinc-900`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center`}>
              <Trophy className={`w-5 h-5 text-amber-500`} />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">{currentYear} Full Recap</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Yearly Story so far</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
        </button>

        <button 
          onClick={onOpenInsights}
          className={`w-full py-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between px-6 shadow-xl active:scale-95 transition-all group hover:bg-white/10`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-2xl bg-zinc-800 flex items-center justify-center`}>
              <BarChart3 className={`w-5 h-5 text-zinc-400`} />
            </div>
            <div className="text-left">
              <span className="text-sm font-bold block">Analysis Report</span>
              <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Data-driven month summary</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors" />
        </button>
      </div>

      <div className="h-4" />
    </div>
  );
};

export default Dashboard;
