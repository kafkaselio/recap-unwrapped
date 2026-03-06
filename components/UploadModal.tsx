
import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Music, Gamepad2, MapPin, Upload, Link as LinkIcon, FileText, ImageIcon, Image as CoverIcon, Plus, Calendar, Edit2 } from 'lucide-react';
import { BucketType, Moment } from '../types';
import { BUCKET_CONFIGS } from '../constants';
import ImageEditor from './ImageEditor';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (moment: Moment) => void;
  themeColor: string;
  activeBuckets: BucketType[];
  initialMoment?: Moment | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onAdd, themeColor, activeBuckets, initialMoment }) => {
  const [type, setType] = useState<BucketType>(initialMoment?.type || activeBuckets[0] || 'photos');
  const [title, setTitle] = useState(initialMoment?.title || '');
  const [subtitle, setSubtitle] = useState(initialMoment?.subtitle || '');
  const [value, setValue] = useState<number>(initialMoment?.value || 0);
  const [notes, setNotes] = useState(initialMoment?.notes || '');
  const [link, setLink] = useState(initialMoment?.link || '');
  const [locationDetails, setLocationDetails] = useState(initialMoment?.locationDetails || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(initialMoment?.additionalImages || []);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(initialMoment?.imageUrl || null);
  const [dateStr, setDateStr] = useState(initialMoment ? new Date(initialMoment.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const config = BUCKET_CONFIGS[type];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || isProcessing) return;

    const newMoment: Moment = {
      ...(initialMoment || {}),
      id: initialMoment?.id || Math.random().toString(36).substr(2, 9),
      type,
      title,
      subtitle,
      value: Number(value),
      timestamp: new Date(dateStr),
      imageUrl: coverPhoto || `https://images.unsplash.com/photo-${1600000000000 + Math.floor(Math.random() * 1000000)}?auto=format&fit=crop&q=80&w=400`,
      coverImageUrl: coverPhoto || undefined,
      notes,
      link,
      locationDetails,
      additionalImages
    };
    onAdd(newMoment);
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
            resolve(compressedBase64);
          } else {
            reject(new Error('Failed to get canvas context'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setIsProcessing(true);
      try {
        const compressedImages = await Promise.all(
          Array.from(files).map(file => compressImage(file as File))
        );
        
        if (!coverPhoto) {
          setCoverPhoto(compressedImages[0]);
          setAdditionalImages(prev => [...prev, ...compressedImages.slice(1)]);
        } else {
          setAdditionalImages(prev => [...prev, ...compressedImages]);
        }
      } catch (error) {
        console.error('Error processing images:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-end justify-center animate-in fade-in duration-300 max-w-md mx-auto">
      {isEditingImage && coverPhoto && (
        <ImageEditor 
          imageUrl={coverPhoto} 
          onSave={(url) => { setCoverPhoto(url); setIsEditingImage(false); }} 
          onCancel={() => setIsEditingImage(false)} 
          themeColor={themeColor}
        />
      )}
      
      <div className="w-full bg-[#0a0a0a] rounded-t-[2.5rem] p-6 border-t border-white/10 animate-in slide-in-from-bottom duration-500 max-h-[92vh] overflow-y-auto no-scrollbar shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold tracking-tight">{initialMoment ? 'Edit Moment' : 'Capture Memory'}</h2>
          <button onClick={onClose} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            multiple
            className="hidden" 
          />

          <div className="relative w-full aspect-[16/9] bg-white/5 rounded-3xl border border-white/10 overflow-hidden group">
            {coverPhoto ? (
              <>
                <img src={coverPhoto} className="w-full h-full object-cover" alt="Cover" />
                <div className="absolute top-4 right-4 flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setIsEditingImage(true)}
                    className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-black/80 transition-all"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={triggerFilePicker}
                    className="p-3 bg-black/60 backdrop-blur-md rounded-2xl text-white border border-white/10 hover:bg-black/80 transition-all"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div 
                onClick={triggerFilePicker}
                className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-2 cursor-pointer"
              >
                 <CoverIcon className="w-10 h-10 stroke-[1.5]" />
                 <p className="text-[10px] font-bold uppercase tracking-widest">
                   {isProcessing ? 'Processing...' : 'Select From Device'}
                 </p>
              </div>
            )}
          </div>

          {additionalImages.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-1">Gallery ({additionalImages.length})</label>
              <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                {additionalImages.map((img, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-white/10 group">
                    <img src={img} className="w-full h-full object-cover" alt={`Gallery ${idx}`} />
                    <button 
                      type="button"
                      onClick={() => setAdditionalImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button 
                  type="button"
                  onClick={triggerFilePicker}
                  className="flex-shrink-0 w-20 h-20 rounded-2xl border border-dashed border-white/20 flex items-center justify-center text-zinc-500 hover:text-white hover:border-white/40 transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-1">When did it happen?</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={dateStr}
                  onChange={e => setDateStr(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 font-semibold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm appearance-none"
                />
                <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 px-1">Choose Bucket</label>
              <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                {activeBuckets.map(bt => {
                  const isSelected = type === bt;
                  return (
                    <button 
                      key={bt} 
                      type="button" 
                      onClick={() => setType(bt)} 
                      className={`min-w-[100px] flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${isSelected ? `bg-${themeColor} border-transparent shadow-lg scale-105` : 'bg-white/5 border-white/5 opacity-60'}`}
                    >
                      <div className={isSelected ? 'text-white' : `text-zinc-400`}>{BUCKET_CONFIGS[bt].icon}</div>
                      <span className="text-[9px] font-bold uppercase tracking-wider">{BUCKET_CONFIGS[bt].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-2">
               <div className="space-y-1">
                 <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">Title</label>
                 <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  placeholder="The main event..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 font-bold placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">Details</label>
                 <input 
                  type="text" 
                  value={subtitle} 
                  onChange={e => setSubtitle(e.target.value)} 
                  placeholder="Contextual details..." 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 font-bold placeholder:text-zinc-700 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm" 
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[9px] font-bold uppercase tracking-widest text-zinc-500 px-1">{config.metricLabel}</label>
                 <div className="relative">
                    <input 
                      type="number" 
                      value={value} 
                      onChange={e => setValue(Number(e.target.value))} 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 font-bold focus:outline-none focus:ring-1 focus:ring-white/20 transition-all text-sm" 
                    />
                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase tracking-widest">{config.unit}</span>
                 </div>
               </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <FileText className="w-4 h-4 text-zinc-500" />
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Optional notes..." 
                  className="bg-transparent border-none flex-1 font-medium text-sm focus:outline-none resize-none h-10" 
                />
              </div>
              <div className="flex items-center gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <input 
                  type="text" 
                  value={locationDetails} 
                  onChange={e => setLocationDetails(e.target.value)} 
                  placeholder="Add location details" 
                  className="bg-transparent border-none flex-1 font-medium text-sm focus:outline-none" 
                />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className={`w-full py-5 bg-white text-black rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all mt-4 ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isProcessing ? <Plus className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            {isProcessing ? 'Optimizing...' : (initialMoment ? 'Save Changes' : 'Save Moment')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
