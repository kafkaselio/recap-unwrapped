
import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Home, BarChart2, User as UserIcon, Grid as GridIcon, Menu } from 'lucide-react';
import { Moment, BucketType, ViewState, UserProfile } from './types';
import { BUCKET_CONFIGS, INITIAL_MOMENTS } from './constants';
import Dashboard from './components/Dashboard';
import BucketDetail from './components/BucketDetail';
import WrappedView from './components/WrappedView';
import YearlyTimeline from './components/YearlyTimeline';
import UploadModal from './components/UploadModal';
import ProfileView from './components/ProfileView';
import BucketsConfigView from './components/BucketsConfigView';
import SideBar from './components/SideBar';
import CalendarView from './components/CalendarView';
import TrashView from './components/TrashView';
import ArchiveView from './components/ArchiveView';
import InsightsView from './components/InsightsView';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('home');
  const [selectedBucket, setSelectedBucket] = useState<BucketType | null>(null);
  const [recapConfig, setRecapConfig] = useState<{ type: 'monthly' | 'yearly', monthIndex?: number }>({ type: 'monthly' });
  const [moments, setMoments] = useState<Moment[]>(() => {
    try {
      const saved = localStorage.getItem('recap_moments');
      return saved ? JSON.parse(saved).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })) : INITIAL_MOMENTS;
    } catch (e) {
      console.error("Failed to load moments", e);
      return INITIAL_MOMENTS;
    }
  });
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);
  const [activeBuckets, setActiveBuckets] = useState<BucketType[]>(['photos', 'music', 'games', 'location', 'screens', 'memes', 'movies', 'gifs', 'links', 'trends']);
  const [themeColor, setThemeColor] = useState('fuchsia-600');
  const [isSideBarOpen, setIsSideBarOpen] = useState(false);
  
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('recap_user');
      return saved ? JSON.parse(saved) : {
        name: 'Alex Morgan',
        email: 'alex.m@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        isLoggedIn: false
      };
    } catch (e) {
      return {
        name: 'Alex Morgan',
        email: 'alex.m@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        isLoggedIn: false
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('recap_moments', JSON.stringify(moments));
    } catch (e) {
      console.error("LocalStorage quota exceeded, could not save moments", e);
      alert("Storage full! Try deleting some old moments or using smaller images.");
    }
  }, [moments]);

  useEffect(() => {
    localStorage.setItem('recap_user', JSON.stringify(user));
  }, [user]);

  const activeMoments = useMemo(() => moments.filter(m => !m.isDeleted && !m.isArchived), [moments]);

  const stats = useMemo(() => {
    const counts: Record<BucketType, number> = {
      photos: 0, music: 0, games: 0, location: 0, screens: 0, memes: 0, movies: 0, gifs: 0, links: 0, trends: 0
    };
    activeMoments.forEach(m => {
      if (['music', 'games', 'location', 'movies'].includes(m.type)) counts[m.type] += m.value || 0;
      else counts[m.type] += 1;
    });
    return counts;
  }, [activeMoments]);

  const handleAddMoment = (moment: Moment) => {
    if (editingMoment) {
      setMoments(prev => prev.map(m => m.id === moment.id ? moment : m));
      setEditingMoment(null);
    } else {
      setMoments(prev => [moment, ...prev]);
    }
    setIsUploadOpen(false);
  };

  const handleEditMoment = (moment: Moment) => {
    setEditingMoment(moment);
    setIsUploadOpen(true);
  };

  const updateMoment = (id: string, updates: Partial<Moment>) => {
    setMoments(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const deletePermanently = (id: string) => {
    setMoments(prev => prev.filter(m => m.id !== id));
  };

  const renderContent = () => {
    switch (view) {
      case 'home':
        return (
          <Dashboard 
            stats={stats} 
            activeBuckets={activeBuckets}
            onBucketClick={(type) => { setSelectedBucket(type); setView('bucket-detail'); }} 
            onGenerateRecap={(type = 'monthly') => { setRecapConfig({ type }); setView('wrapped'); }}
            onOpenInsights={() => setView('insights')}
            moments={activeMoments}
            user={user}
            themeColor={themeColor}
            onOpenMenu={() => setIsSideBarOpen(true)}
            onOpenAdd={() => { setEditingMoment(null); setIsUploadOpen(true); }}
            onOpenCalendar={() => setView('calendar')}
            onEditMoment={handleEditMoment}
          />
        );
      case 'bucket-detail':
        return selectedBucket ? (
          <BucketDetail 
            type={selectedBucket} 
            moments={activeMoments.filter(m => m.type === selectedBucket)} 
            onBack={() => setView('home')} 
            themeColor={themeColor}
            onUpdateMoment={updateMoment}
            onEditMoment={handleEditMoment}
          />
        ) : null;
      case 'wrapped':
        return <WrappedView moments={activeMoments} onExit={() => setView('home')} type={recapConfig.type} monthIndex={recapConfig.monthIndex} />;
      case 'yearly':
        return (
          <YearlyTimeline 
            moments={activeMoments} 
            onExit={() => setView('home')} 
            onReplay={() => { setRecapConfig({ type: 'yearly' }); setView('wrapped'); }} 
            themeColor={themeColor}
            onMonthRecap={(index) => { setRecapConfig({ type: 'monthly', monthIndex: index }); setView('wrapped'); }}
          />
        );
      case 'profile':
        return <ProfileView user={user} setUser={setUser} onBack={() => setView('home')} themeColor={themeColor} setThemeColor={setThemeColor} moments={moments} />;
      case 'buckets-config':
        return (
          <BucketsConfigView 
            onBack={() => setView('home')} 
            activeBuckets={activeBuckets}
            onBucketClick={(type) => { setSelectedBucket(type); setView('bucket-detail'); }} 
            themeColor={themeColor}
            moments={activeMoments}
          />
        );
      case 'calendar':
        return <CalendarView moments={activeMoments} onBack={() => setView('home')} themeColor={themeColor} />;
      case 'trash':
        return <TrashView moments={moments.filter(m => m.isDeleted)} onBack={() => setView('home')} onRestore={(id) => updateMoment(id, { isDeleted: false })} onDeleteForever={deletePermanently} themeColor={themeColor} />;
      case 'archive':
        return <ArchiveView moments={moments.filter(m => m.isArchived && !m.isDeleted)} onBack={() => setView('home')} onUnarchive={(id) => updateMoment(id, { isArchived: false })} themeColor={themeColor} />;
      case 'insights':
        return <InsightsView moments={activeMoments} onBack={() => setView('home')} themeColor={themeColor} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white relative max-w-md mx-auto overflow-hidden shadow-2xl flex flex-col border-x border-zinc-900">
      <SideBar 
        isOpen={isSideBarOpen} 
        onClose={() => setIsSideBarOpen(false)} 
        themeColor={themeColor} 
        setThemeColor={setThemeColor}
        onNavigate={(v) => { setView(v); setIsSideBarOpen(false); }}
      />
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar">
        {renderContent()}
      </main>
      {view !== 'wrapped' && (
        <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/80 backdrop-blur-2xl border-t border-white/5 flex justify-around items-center py-5 px-6 z-40">
          <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 transition-all ${view === 'home' ? `text-${themeColor}` : 'text-zinc-500'}`}>
            <Home className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
          </button>
          <button onClick={() => setView('yearly')} className={`flex flex-col items-center gap-1 transition-all ${view === 'yearly' ? `text-${themeColor}` : 'text-zinc-500'}`}>
            <BarChart2 className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Timeline</span>
          </button>
          <div className="relative -top-6">
            <button onClick={() => { setEditingMoment(null); setIsUploadOpen(true); }} className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transform active:scale-90 transition-all">
              <Plus className="w-7 h-7" />
            </button>
          </div>
          <button onClick={() => setView('buckets-config')} className={`flex flex-col items-center gap-1 transition-all ${view === 'buckets-config' ? `text-${themeColor}` : 'text-zinc-500'}`}>
            <GridIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Buckets</span>
          </button>
          <button onClick={() => setView('profile')} className={`flex flex-col items-center gap-1 transition-all ${view === 'profile' ? `text-${themeColor}` : 'text-zinc-500'}`}>
            <UserIcon className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Profile</span>
          </button>
        </nav>
      )}
      {isUploadOpen && (
        <UploadModal 
          isOpen={isUploadOpen} 
          onClose={() => { setIsUploadOpen(false); setEditingMoment(null); }} 
          onAdd={handleAddMoment} 
          themeColor={themeColor}
          activeBuckets={activeBuckets}
          initialMoment={editingMoment}
        />
      )}
    </div>
  );
};

export default App;
