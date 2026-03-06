
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, TrendingUp, Zap, Lightbulb, RefreshCw } from 'lucide-react';
import { Moment, SmartInsight } from '../types';
import { generateSmartInsights } from '../services/geminiService';
import { motion } from 'motion/react';

interface InsightsViewProps {
  moments: Moment[];
  onBack: () => void;
  themeColor: string;
}

const InsightsView: React.FC<InsightsViewProps> = ({ moments, onBack, themeColor }) => {
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    const data = await generateSmartInsights(moments);
    setInsights(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'correlation': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'trend': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'suggestion': return <Lightbulb className="w-5 h-5 text-blue-400" />;
      default: return <Sparkles className="w-5 h-5 text-fuchsia-400" />;
    }
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-[#050505]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-zinc-900 rounded-2xl border border-zinc-800">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black italic">Smart Insights</h1>
        </div>
        <button 
          onClick={fetchInsights} 
          disabled={loading}
          className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-xl text-zinc-400 hover:text-white disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-zinc-900/50 rounded-[2rem] animate-pulse border border-white/5" />
            ))}
          </div>
        ) : (
          insights.map((insight, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 space-y-4 relative overflow-hidden group"
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all" />
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  {getIcon(insight.type)}
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{insight.type}</p>
                  <h3 className="text-xl font-bold tracking-tight italic">{insight.title}</h3>
                </div>
              </div>
              
              <p className="text-zinc-400 text-sm leading-relaxed font-medium italic">
                "{insight.description}"
              </p>
            </motion.div>
          ))
        )}
        
        {!loading && insights.length === 0 && (
          <div className="text-center py-20 text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
            Not enough data for insights yet.<br/>Keep capturing moments!
          </div>
        )}
      </div>

      <div className="pt-10 text-center">
        <p className="text-[9px] font-black text-zinc-700 uppercase tracking-[0.4em]">Powered by Gemini AI</p>
      </div>
    </div>
  );
};

export default InsightsView;
