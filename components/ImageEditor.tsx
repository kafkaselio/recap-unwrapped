
import React, { useState, useRef, useEffect } from 'react';
import { X, RotateCw, Crop, Wand2, Check, Undo2 } from 'lucide-react';

interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageUrl: string) => void;
  onCancel: () => void;
  themeColor: string;
}

const FILTERS = [
  { name: 'Original', filter: 'none' },
  { name: 'Vibrant', filter: 'saturate(1.5) contrast(1.1)' },
  { name: 'Mono', filter: 'grayscale(1) contrast(1.2)' },
  { name: 'Warm', filter: 'sepia(0.3) saturate(1.2) hue-rotate(-10deg)' },
  { name: 'Cool', filter: 'hue-rotate(180deg) saturate(0.8) brightness(1.1)' },
  { name: 'Dramatic', filter: 'contrast(1.5) brightness(0.8)' },
  { name: 'Fade', filter: 'brightness(1.1) contrast(0.9) saturate(0.8)' },
];

const ImageEditor: React.FC<ImageEditorProps> = ({ imageUrl, onSave, onCancel, themeColor }) => {
  const [rotation, setRotation] = useState(0);
  const [activeFilter, setActiveFilter] = useState('none');
  const [isSquare, setIsSquare] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imageRef.current = img;
      renderImage();
    };
    img.src = imageUrl;
  }, [imageUrl]);

  const renderImage = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate dimensions based on rotation
    const isVertical = (rotation / 90) % 2 !== 0;
    let width = isVertical ? img.height : img.width;
    let height = isVertical ? img.width : img.height;

    if (isSquare) {
      const size = Math.min(width, height);
      width = size;
      height = size;
    }

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Apply filters
    ctx.filter = activeFilter;

    // Handle rotation and cropping
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    if (isSquare) {
      const sourceSize = Math.min(img.width, img.height);
      const sx = (img.width - sourceSize) / 2;
      const sy = (img.height - sourceSize) / 2;
      ctx.drawImage(img, sx, sy, sourceSize, sourceSize, -width / 2, -height / 2, width, height);
    } else {
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
    }
    ctx.restore();
  };

  useEffect(() => {
    renderImage();
  }, [rotation, activeFilter]);

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onSave(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-in fade-in duration-300 max-w-md mx-auto">
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <button onClick={onCancel} className="p-2 text-zinc-400 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        <h3 className="text-sm font-black uppercase tracking-[0.2em]">Edit Image</h3>
        <button 
          onClick={handleSave}
          className={`px-4 py-2 bg-${themeColor} text-white rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2`}
        >
          <Check className="w-4 h-4" /> Done
        </button>
      </header>

      <div className="flex-1 relative flex items-center justify-center p-8 bg-zinc-950 overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="max-w-full max-h-full shadow-2xl rounded-lg transition-transform duration-300"
          style={{ 
            filter: activeFilter,
          }}
        />
      </div>

      <footer className="p-6 bg-black border-t border-white/10 space-y-6">
        {/* Filters */}
        <div className="space-y-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">Filters</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
            {FILTERS.map((f) => (
              <button
                key={f.name}
                onClick={() => setActiveFilter(f.filter)}
                className={`flex-shrink-0 flex flex-col items-center gap-2 group`}
              >
                <div 
                  className={`w-14 h-14 rounded-xl border-2 transition-all overflow-hidden ${activeFilter === f.filter ? `border-${themeColor}` : 'border-transparent opacity-60'}`}
                  style={{ filter: f.filter }}
                >
                  <img src={imageUrl} className="w-full h-full object-cover" alt={f.name} />
                </div>
                <span className={`text-[8px] font-bold uppercase tracking-tighter ${activeFilter === f.filter ? 'text-white' : 'text-zinc-600'}`}>
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tools */}
        <div className="flex justify-around items-center pt-2">
          <button 
            onClick={handleRotate}
            className="flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <RotateCw className="w-6 h-6" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Rotate</span>
          </button>
          <button 
            onClick={() => setIsSquare(!isSquare)}
            className={`flex flex-col items-center gap-2 transition-colors ${isSquare ? `text-${themeColor}` : 'text-zinc-500 hover:text-white'}`}
          >
            <Crop className="w-6 h-6" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Square</span>
          </button>
          <button 
            onClick={() => { setRotation(0); setActiveFilter('none'); setIsSquare(false); }}
            className="flex flex-col items-center gap-2 text-zinc-500 hover:text-white transition-colors"
          >
            <Undo2 className="w-6 h-6" />
            <span className="text-[8px] font-bold uppercase tracking-widest">Reset</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ImageEditor;
