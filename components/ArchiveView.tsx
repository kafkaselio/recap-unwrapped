
import React from 'react';
import { ArrowLeft, Inbox } from 'lucide-react';
import { Moment } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface ArchiveViewProps {
  moments: Moment[];
  onBack: () => void;
  onUnarchive: (id: string) => void;
  themeColor: string;
}

const ArchiveView: React.FC<ArchiveViewProps> = ({ moments, onBack, onUnarchive, themeColor }) => {
  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800"><ArrowLeft className="w-6 h-6" /></button>
        <h1 className="text-2xl font-black">Archive</h1>
      </div>

      <div className="space-y-4">
        {moments.length > 0 ? moments.map(m => (
          <div key={m.id} className="bg-zinc-900/30 p-5 rounded-[2.5rem] border border-white/5 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${BUCKET_CONFIGS[m.type].color} flex items-center justify-center`}>
              {BUCKET_CONFIGS[m.type].icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm truncate">{m.title}</h4>
              <p className="text-[10px] text-zinc-500 font-bold uppercase">{new Date(m.timestamp).toLocaleDateString()}</p>
            </div>
            <button onClick={() => onUnarchive(m.id)} className={`p-3 bg-${themeColor}/10 rounded-xl text-${themeColor}`}>
              <Inbox className="w-5 h-5" />
            </button>
          </div>
        )) : (
          <div className="text-center py-20 text-zinc-600 font-medium">Archive is empty.</div>
        )}
      </div>
    </div>
  );
};

export default ArchiveView;
