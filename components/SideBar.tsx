
import React from 'react';
import { X, Palette, User, Grid, Home, BarChart2, Star, Shield, Info, Archive, Trash2 } from 'lucide-react';
import { ViewState } from '../types';

interface SideBarProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
  onNavigate: (v: ViewState) => void;
}

const COLORS = [
  { class: 'fuchsia-600' },
  { class: 'indigo-500' },
  { class: 'emerald-500' },
  { class: 'orange-500' },
  { class: 'rose-500' },
];

const SideBar: React.FC<SideBarProps> = ({ isOpen, onClose, themeColor, setThemeColor, onNavigate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-72 bg-[#080808] h-full border-r border-white/10 p-8 flex flex-col animate-in slide-in-from-left duration-500 shadow-2xl">
        <div className="flex justify-between items-center mb-10">
           <h2 className="text-xl font-bold italic tracking-tighter">Recap</h2>
           <button onClick={onClose} className="p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
             <X className="w-5 h-5 text-zinc-500" />
           </button>
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => onNavigate('home')} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Dashboard</span>
          </button>
          <button onClick={() => onNavigate('buckets-config')} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <Grid className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Buckets</span>
          </button>
          <button onClick={() => onNavigate('archive')} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <Archive className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Archive</span>
          </button>
          <button onClick={() => onNavigate('trash')} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Deleted</span>
          </button>
          <button onClick={() => onNavigate('profile')} className="w-full flex items-center gap-4 py-3.5 px-4 rounded-2xl hover:bg-white/5 transition-colors text-zinc-400 hover:text-white group">
            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-widest">Profile</span>
          </button>
          
          <div className="pt-8 px-4 space-y-4">
             <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">Appearance</p>
             <div className="flex gap-2">
               {COLORS.map(c => (
                 <button 
                  key={c.class} 
                  onClick={() => setThemeColor(c.class)} 
                  className={`w-6 h-6 rounded-full bg-${c.class} border-2 ${themeColor === c.class ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'}`} 
                 />
               ))}
             </div>
          </div>
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-4">
           <div className="px-4 flex flex-col gap-3">
             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Recap v1.2</p>
             <button onClick={() => alert("Recap Premium Coming Soon!")} className="flex items-center gap-3 text-zinc-400 text-[10px] font-bold hover:text-white transition-colors">
                <Star className="w-4 h-4 text-amber-500" /> Unlock Premium
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
