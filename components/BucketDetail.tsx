
import React, { useState, useMemo } from 'react';
import { ArrowLeft, MoreHorizontal, Heart, MapPin, Archive, Trash2, LayoutList, Calendar as CalendarIcon, ArrowUpDown, Clock, ChevronUp, ChevronDown, Edit2, Image as ImageIcon } from 'lucide-react';
import { BucketType, Moment } from '../types';
import { BUCKET_CONFIGS } from '../constants';

interface BucketDetailProps {
  type: BucketType;
  moments: Moment[];
  onBack: () => void;
  themeColor: string;
  onUpdateMoment: (id: string, updates: Partial<Moment>) => void;
  onEditMoment: (moment: Moment) => void;
}

const BucketDetail: React.FC<BucketDetailProps> = ({ type, moments, onBack, themeColor, onUpdateMoment, onEditMoment }) => {
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'added'>('newest');
  
  const config = BUCKET_CONFIGS[type];

  const processedMoments = useMemo(() => {
    return [...moments].sort((a, b) => {
      if (sortOrder === 'added') return 0; // Maintain original array order (stack order)
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
    });
  }, [moments, sortOrder]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Moment[]> = {};
    processedMoments.forEach(m => {
      const date = new Date(m.timestamp);
      const key = date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    });
    return groups;
  }, [processedMoments]);

  return (
    <div className="p-6 space-y-8 animate-in slide-in-from-right duration-500 min-h-full">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-full text-zinc-400 hover:text-white transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex gap-1.5 bg-white/5 p-1 rounded-full border border-white/5">
          <button 
            onClick={() => setViewMode('list')}
            title="List View"
            className={`p-2 rounded-full transition-all ${viewMode === 'list' ? `bg-${themeColor} text-white` : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <LayoutList className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setViewMode('timeline')}
            title="Calendar Timeline"
            className={`p-2 rounded-full transition-all ${viewMode === 'timeline' ? `bg-${themeColor} text-white` : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <CalendarIcon className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-white/10 self-center mx-1"></div>
          <button 
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : prev === 'oldest' ? 'added' : 'newest')}
            title={`Sorting: ${sortOrder}`}
            className={`p-2 rounded-full transition-all text-zinc-500 hover:text-white flex items-center gap-1`}
          >
            {sortOrder === 'added' ? <Clock className="w-4 h-4" /> : <ArrowUpDown className="w-4 h-4" />}
            <span className="text-[8px] font-bold uppercase tracking-tighter w-8 text-center">{sortOrder}</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div className={`w-16 h-16 rounded-3xl bg-gradient-to-tr ${config.color} flex items-center justify-center shadow-xl`}>
          <div className="scale-125">{config.icon}</div>
        </div>
        <div>
          <h1 className="text-4xl font-black tracking-tight">{config.label}</h1>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
            {moments.length} Captured {config.unit}
          </p>
        </div>
      </div>

      {viewMode === 'list' ? (
        <section className="space-y-4">
          {processedMoments.map((moment) => (
            <div key={moment.id} className="bg-white/5 border border-white/10 p-4 rounded-[1.8rem] flex flex-col gap-4 hover:bg-white/[0.08] transition-all group overflow-hidden">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => onEditMoment(moment)}
                  className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 flex-shrink-0 cursor-pointer"
                >
                  <img src={moment.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                </div>
                <div 
                  onClick={() => onEditMoment(moment)}
                  className="flex-1 min-w-0 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm truncate tracking-tight">{moment.title}</h4>
                    <Edit2 className="w-3 h-3 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">{moment.subtitle}</p>
                  <p className="text-[9px] text-zinc-600 font-medium mt-0.5">{new Date(moment.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                </div>
                
                <div className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                  <button 
                    onClick={() => onUpdateMoment(moment.id, { value: (moment.value || 0) + 1 })}
                    className="p-1 hover:text-white text-zinc-500 transition-colors"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <span className="text-[10px] font-black min-w-[1.5rem] text-center">{moment.value || 0}</span>
                  <button 
                    onClick={() => onUpdateMoment(moment.id, { value: Math.max(0, (moment.value || 0) - 1) })}
                    className="p-1 hover:text-white text-zinc-500 transition-colors"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <button 
                  onClick={() => onUpdateMoment(moment.id, { isFavorite: !moment.isFavorite })}
                  className="p-2"
                >
                   <Heart className={`w-5 h-5 transition-all ${moment.isFavorite ? `fill-${themeColor} text-${themeColor}` : 'text-zinc-800'}`} />
                </button>
              </div>

              {moment.additionalImages && moment.additionalImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {moment.additionalImages.map((img, i) => (
                    <div key={i} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 border border-white/5">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-4">
                   <button onClick={() => onUpdateMoment(moment.id, { isArchived: true })} className="flex items-center gap-1.5 text-[8px] font-black uppercase text-zinc-500 hover:text-white transition-colors">
                      <Archive className="w-3 h-3" /> Archive
                   </button>
                   <button onClick={() => onUpdateMoment(moment.id, { isDeleted: true })} className="flex items-center gap-1.5 text-[8px] font-black uppercase text-zinc-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3 h-3" /> Delete
                   </button>
                </div>
                {moment.locationDetails && (
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-zinc-600 uppercase">
                    <MapPin className="w-2.5 h-2.5" /> {moment.locationDetails}
                  </div>
                )}
              </div>
            </div>
          ))}
          {processedMoments.length === 0 && (
            <div className="py-20 text-center opacity-30 font-bold text-sm uppercase tracking-widest">
              Empty Bucket
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-8 relative pl-4">
          <div className="absolute left-[15px] top-0 bottom-0 w-px bg-white/10"></div>
          {(Object.entries(groupedByMonth) as [string, Moment[]][]).map(([month, monthMoments]) => (
            <div key={month} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full bg-${themeColor} relative z-10 ml-[-4.5px]`}></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{month}</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 pl-4">
                {monthMoments.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => onEditMoment(m)}
                    className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 group shadow-lg shadow-black/40 cursor-pointer"
                  >
                    <img src={m.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                    {m.additionalImages && m.additionalImages.length > 0 && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md rounded-lg px-1.5 py-0.5 border border-white/10 flex items-center gap-1">
                        <ImageIcon className="w-2.5 h-2.5 text-white" />
                        <span className="text-[8px] font-black text-white">+{m.additionalImages.length}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2">
                       <p className="text-[9px] font-black truncate">{m.title}</p>
                       <p className="text-[7px] text-zinc-400 font-bold uppercase">{new Date(m.timestamp).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {Object.keys(groupedByMonth).length === 0 && (
            <div className="py-20 text-center opacity-30 font-bold text-sm uppercase tracking-widest">
              Timeline Empty
            </div>
          )}
        </div>
      )}
      <div className="h-20" />
    </div>
  );
};

export default BucketDetail;
