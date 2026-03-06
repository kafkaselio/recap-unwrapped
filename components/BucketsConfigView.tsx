
import React from 'react';
import { ArrowLeft, ChevronRight, BarChart2, Calendar } from 'lucide-react';
import { BucketType, Moment } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface BucketsConfigViewProps {
  onBack: () => void;
  activeBuckets: BucketType[];
  onBucketClick: (t: BucketType) => void;
  themeColor: string;
  moments: Moment[];
}

const BucketsConfigView: React.FC<BucketsConfigViewProps> = ({ onBack, activeBuckets, onBucketClick, themeColor, moments }) => {
  
  // Helper to group moments by month for a specific bucket
  const getBucketGroups = (type: BucketType) => {
    const filtered = moments.filter(m => m.type === type);
    const groups: Record<string, Moment[]> = {};
    filtered.forEach(m => {
      const date = new Date(m.timestamp);
      const key = date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  };

  return (
    <div className="p-6 space-y-10 animate-fade-up">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Your Buckets</h1>
      </div>

      <div className="space-y-6">
        {(Object.keys(BUCKET_CONFIGS) as BucketType[]).map(bt => {
          const config = BUCKET_CONFIGS[bt];
          const groups = getBucketGroups(bt);
          const totalInBucket = moments.filter(m => m.type === bt).length;
          
          return (
            <div 
              key={bt}
              onClick={() => onBucketClick(bt)}
              className="bg-white/5 border border-white/5 rounded-[2.2rem] overflow-hidden hover:bg-white/[0.08] transition-all cursor-pointer group shadow-lg shadow-black/20"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${config.color} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                      {config.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg tracking-tight">{config.label}</h3>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        {totalInBucket} Total {config.unit}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </div>

                {totalInBucket > 0 ? (
                  <div className="space-y-5">
                    {Object.entries(groups).slice(0, 2).map(([month, monthMoments]) => (
                      <div key={month} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 flex items-center gap-2">
                            <Calendar className="w-2.5 h-2.5" /> {month}
                          </span>
                          <span className="text-[8px] font-bold text-zinc-700">{monthMoments.length} entries</span>
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                          {monthMoments.slice(0, 5).map(m => (
                            <div key={m.id} className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                              <img src={m.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="" />
                            </div>
                          ))}
                          {monthMoments.length > 5 && (
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-[8px] font-bold text-zinc-500">
                              +{monthMoments.length - 5}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-2 text-[10px] text-zinc-700 font-bold uppercase tracking-widest italic">
                    Start capturing {config.label.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="h-20" />
    </div>
  );
};

export default BucketsConfigView;
