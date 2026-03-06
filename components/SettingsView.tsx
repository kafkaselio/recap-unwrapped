
import React from 'react';
import { ArrowLeft, Check, Palette, Grid } from 'lucide-react';
import { BucketType } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface SettingsViewProps {
  onBack: () => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
  activeBuckets: BucketType[];
  toggleBucket: (t: BucketType) => void;
}

const COLORS = [
  { name: 'Fuchsia', class: 'fuchsia-600' },
  { name: 'Indigo', class: 'indigo-500' },
  { name: 'Emerald', class: 'emerald-500' },
  { name: 'Orange', class: 'orange-500' },
  { name: 'Rose', class: 'rose-500' },
  { name: 'Zinc', class: 'zinc-400' },
];

const SettingsView: React.FC<SettingsViewProps> = ({ onBack, themeColor, setThemeColor, activeBuckets, toggleBucket }) => {
  return (
    <div className="p-6 space-y-10 animate-in fade-in duration-700">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-black">App Settings</h1>
      </div>

      <div className="space-y-8">
        {/* Theme Colors */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Palette className="w-4 h-4 text-zinc-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Theme Accent</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {COLORS.map(c => (
              <button 
                key={c.class}
                onClick={() => setThemeColor(c.class)}
                className={`p-4 rounded-2xl bg-zinc-900 border transition-all flex flex-col items-center gap-2 ${themeColor === c.class ? 'border-white' : 'border-zinc-800'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-${c.class}`}></div>
                <span className="text-[10px] font-bold text-zinc-400">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bucket Management */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Grid className="w-4 h-4 text-zinc-500" />
            <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Manage Buckets</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {(Object.keys(BUCKET_CONFIGS) as BucketType[]).map(bt => {
              const active = activeBuckets.includes(bt);
              const config = BUCKET_CONFIGS[bt];
              return (
                <button 
                  key={bt}
                  onClick={() => toggleBucket(bt)}
                  className={`flex items-center justify-between p-4 rounded-2xl bg-zinc-900 border transition-all ${active ? 'border-zinc-700' : 'border-zinc-800 opacity-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${config.color} flex items-center justify-center`}>
                      {config.icon}
                    </div>
                    <span className="font-black tracking-tight">{config.label}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${active ? `bg-${themeColor} border-transparent` : 'border-zinc-700'}`}>
                    {active && <Check className="w-4 h-4 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
