
import React, { useState, useRef } from 'react';
import { ArrowLeft, Mail, User, Shield, LogOut, Camera, Palette, Check, Download, FileJson, Archive } from 'lucide-react';
import { UserProfile, Moment } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  setUser: (u: UserProfile) => void;
  onBack: () => void;
  themeColor: string;
  setThemeColor: (c: string) => void;
  moments: Moment[];
}

const COLORS = [
  { name: 'Fuchsia', class: 'fuchsia-600' },
  { name: 'Indigo', class: 'indigo-500' },
  { name: 'Emerald', class: 'emerald-500' },
  { name: 'Orange', class: 'orange-500' },
  { name: 'Rose', class: 'rose-500' },
  { name: 'Zinc', class: 'zinc-400' },
];

const ProfileView: React.FC<ProfileViewProps> = ({ user, setUser, onBack, themeColor, setThemeColor, moments }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [gender, setGender] = useState(user.gender || '');
  const [age, setAge] = useState(user.age || '');
  const [isExporting, setIsExporting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const save = () => {
    setUser({ ...user, name, email, gender, age: Number(age) });
    setEditing(false);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const size = 300;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, size, size);
            const base64 = canvas.toDataURL('image/jpeg', 0.8);
            setUser({ ...user, avatar: base64 });
          }
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const exportDataAsZip = async () => {
    setIsExporting(true);
    try {
      // Dynamic import of JSZip to avoid initial load overhead
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();
      
      // Data Bundles
      const appData = {
        user,
        moments,
        exportedAt: new Date().toISOString(),
        version: "1.2.0"
      };

      zip.file("recap_moments.json", JSON.stringify(moments, null, 2));
      zip.file("user_profile.json", JSON.stringify(user, null, 2));
      
      // Create a text-based monthly summary report
      const months = Array.from(new Set(moments.map(m => 
        new Date(m.timestamp).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
      )));
      
      let report = `RECAP EXPORT REPORT\n====================\nGenerated on: ${new Date().toLocaleString()}\n\n`;
      months.forEach(month => {
        const monthMoments = moments.filter(m => 
          new Date(m.timestamp).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) === month
        );
        report += `MONTH: ${month}\n`;
        report += `Total Entries: ${monthMoments.length}\n`;
        monthMoments.forEach(m => {
          report += `- [${m.type.toUpperCase()}] ${m.title}: ${m.subtitle || ''} (${new Date(m.timestamp).toLocaleDateString()})\n`;
        });
        report += `\n`;
      });
      
      zip.file("monthly_recap_report.txt", report);

      const blob = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Recap_Backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed", error);
      alert("Failed to create ZIP. Try again later.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-6 space-y-10 animate-fade-up">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold tracking-tight">Account</h1>
      </div>

      <div className="flex flex-col items-center space-y-6">
        <div className="relative group">
          <img src={user.avatar} className="w-28 h-28 rounded-[2rem] bg-zinc-900 border border-white/10 p-1 object-cover" alt="Avatar" />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`absolute -bottom-1 -right-1 w-9 h-9 bg-${themeColor} rounded-full flex items-center justify-center border-4 border-[#050505] shadow-xl active:scale-90 transition-all`}
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
          <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
          <p className="text-zinc-500 font-medium text-xs mt-1">{user.email}</p>
        </div>
      </div>

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Palette className="w-4 h-4 text-zinc-600" />
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-600">Theme Palette</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {COLORS.map(c => (
              <button 
                key={c.class}
                onClick={() => setThemeColor(c.class)}
                className={`p-3 rounded-2xl bg-white/5 border transition-all flex flex-col items-center gap-2 ${themeColor === c.class ? 'border-white/40 ring-2 ring-white/5' : 'border-white/5 opacity-60'}`}
              >
                <div className={`w-5 h-5 rounded-full bg-${c.class}`}></div>
                <span className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400">{c.name}</span>
              </button>
            ))}
          </div>
        </section>

        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-600">Personal Info</h3>
            {!editing ? (
              <button onClick={() => setEditing(true)} className={`text-${themeColor} text-[10px] font-bold uppercase`}>Edit</button>
            ) : (
              <button onClick={save} className="text-emerald-400 text-[10px] font-bold uppercase">Save</button>
            )}
          </div>
          
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <User className="w-4 h-4 text-zinc-600" />
              {editing ? (
                <input value={name} onChange={e => setName(e.target.value)} className="bg-transparent border-b border-zinc-800 py-1 flex-1 font-bold text-sm focus:outline-none" />
              ) : (
                <p className="font-bold text-sm flex-1">{user.name}</p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Mail className="w-4 h-4 text-zinc-600" />
              {editing ? (
                <input value={email} onChange={e => setEmail(e.target.value)} className="bg-transparent border-b border-zinc-800 py-1 flex-1 font-bold text-sm focus:outline-none" />
              ) : (
                <p className="font-bold text-sm flex-1">{user.email}</p>
              )}
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Shield className="w-4 h-4 text-zinc-600" />
            <h3 className="font-bold text-[10px] uppercase tracking-widest text-zinc-600">Data & Safety</h3>
          </div>
          <button 
            onClick={exportDataAsZip}
            disabled={isExporting}
            className="w-full py-5 px-6 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between hover:bg-white/10 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Download className={`w-5 h-5 text-blue-400 ${isExporting ? 'animate-bounce' : ''}`} />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold block">Export All Data</span>
                <span className="text-[10px] text-zinc-500 font-medium">Download moments & recaps as ZIP</span>
              </div>
            </div>
            {isExporting ? <span className="text-[10px] font-bold text-blue-400">Zipping...</span> : <Check className="w-4 h-4 text-zinc-800" />}
          </button>

          <button 
            onClick={() => setUser({ ...user, isLoggedIn: false })}
            className="w-full py-5 bg-red-500/10 text-red-500 border border-red-500/10 rounded-3xl font-bold text-xs flex items-center justify-center gap-3 hover:bg-red-500 hover:text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </section>
      </div>
      <div className="h-20" />
    </div>
  );
};

export default ProfileView;
