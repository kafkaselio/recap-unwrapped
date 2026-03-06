
import React from 'react';
import { ArrowLeft, RefreshCw, Trash2 } from 'lucide-react';
import { Moment } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface TrashViewProps {
  moments: Moment[];
  onBack: () => void;
  onRestore: (id: string) => void;
  onDeleteForever: (id: string) => void;
  themeColor: string;
}

const TrashView: React.FC<TrashViewProps> = ({ moments, onBack, onRestore, onDeleteForever, themeColor }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-black">Deleted Items</h1>
      </div>

      <div className="space-y-4">
        {moments.length > 0 ? moments.map(m => (
          <div key={m.id} className="bg-zinc-900/30 p-5 rounded-[2.5rem] border border-white/5 flex flex-col gap-4">
             <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center opacity-50`}>
                  {BUCKET_CONFIGS[m.type].icon}
                </div>
                <div className="flex-1 min-w-0 opacity-50">
                  <h4 className="font-bold text-sm truncate">{m.title}</h4>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase">{BUCKET_CONFIGS[m.type].label}</p>
                </div>
             </div>
             <div className="flex gap-2 pt-4 border-t border-white/5">
                <button onClick={() => onRestore(m.id)} className={`flex-1 py-3 rounded-2xl bg-${themeColor}/10 text-${themeColor} font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-${themeColor}/20`}>
                  <RefreshCw className="w-3.5 h-3.5" /> Restore
                </button>
                <button onClick={() => onDeleteForever(m.id)} className="flex-1 py-3 rounded-2xl bg-red-500/10 text-red-500 font-black text-[10px] uppercase flex items-center justify-center gap-2 border border-red-500/20">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Forever
                </button>
             </div>
          </div>
        )) : (
          <div className="text-center py-20 text-zinc-600 font-medium">Trash is empty.</div>
        )}
      </div>
    </div>
  );
};

export default TrashView;
