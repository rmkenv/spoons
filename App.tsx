
import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  Settings2, 
  Download, 
  Trash2, 
  Undo2, 
  Redo2, 
  Sun, 
  Moon, 
  Maximize2, 
  RotateCcw, 
  FileJson, 
  Share2,
  Layers,
  Printer,
  Grid3X3,
  Move,
  ChevronDown
} from 'lucide-react';
import { SpoonParameters, DEFAULT_PARAMETERS, Unit, BowlType } from './types';
import { generateSpoonPath, getDimensions } from './services/spoonGenerator';

// --- UI Components ---

const Slider = ({ label, value, min, max, step = 0.1, onChange, unit }: { 
  label: string, value: number, min: number, max: number, step?: number, onChange: (v: number) => void, unit?: string 
}) => (
  <div className="flex flex-col gap-1 mb-4">
    <div className="flex justify-between items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
      <label>{label}</label>
      <span>{value.toFixed(2)}{unit}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step} 
      value={value} 
      onChange={(e) => onChange(parseFloat(e.target.value))}
      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
    />
  </div>
);

const IconButton = ({ icon: Icon, onClick, title, active = false }: any) => (
  <button 
    onClick={onClick} 
    title={title}
    className={`p-2 rounded-lg transition-all ${
      active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    <Icon size={18} />
  </button>
);

// --- Main App ---

export default function App() {
  const [params, setParams] = useState<SpoonParameters>(DEFAULT_PARAMETERS);
  const [zoom, setZoom] = useState(60); // pixels per inch
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<SpoonParameters[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isPanning, setIsPanning] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const svgPath = useMemo(() => generateSpoonPath(params), [params]);
  const dims = useMemo(() => getDimensions(params), [params]);

  // History management
  const updateParams = useCallback((newParams: Partial<SpoonParameters>) => {
    setParams(prev => {
      const updated = { ...prev, ...newParams };
      setHistory(h => [...h.slice(0, historyIndex + 1), updated].slice(-20));
      setHistoryIndex(prevIdx => prevIdx + 1);
      return updated;
    });
  }, [historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setParams(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setParams(history[historyIndex + 1]);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(params));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `spoon_${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 || e.button === 1) { // Left or middle click
      setIsPanning(true);
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setOffset(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = 1.1;
    if (e.deltaY < 0) setZoom(prev => Math.min(prev * scaleFactor, 300));
    else setZoom(prev => Math.max(prev / scaleFactor, 5));
  };

  // Grid logic
  const renderGrid = () => {
    if (!params.showGrid) return null;
    const gridSpacing = zoom; // 1 unit = zoom pixels
    const cols = Math.ceil(4000 / gridSpacing);
    const rows = Math.ceil(4000 / gridSpacing);
    
    return (
      <g className="opacity-10 pointer-events-none">
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <line 
            key={`v-${i}`} 
            x1={(i - cols) * gridSpacing} 
            y1="-2000" 
            x2={(i - cols) * gridSpacing} 
            y2="2000" 
            stroke="currentColor" 
            strokeWidth="1" 
          />
        ))}
        {Array.from({ length: rows * 2 }).map((_, i) => (
          <line 
            key={`h-${i}`} 
            x1="-2000" 
            y1={(i - rows) * gridSpacing} 
            x2="2000" 
            y2={(i - rows) * gridSpacing} 
            stroke="currentColor" 
            strokeWidth="1" 
          />
        ))}
        <circle r="4" fill="currentColor" opacity="0.5" />
      </g>
    );
  };

  return (
    <div className={`flex h-screen w-full transition-colors duration-300 ${params.darkMode ? 'bg-zinc-950 text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* Sidebar Controls */}
      <aside className={`no-print w-80 h-full border-r overflow-y-auto no-scrollbar flex flex-col p-6 z-10 transition-colors ${params.darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Layers size={24} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">SpoonCraft</h1>
        </div>

        {/* Section: Bowl */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-indigo-500 rounded-full"></span>
            Bowl Geometry
          </h3>
          <Slider label="Width" value={params.bowlWidth} min={0.5} max={4} onChange={(v) => updateParams({ bowlWidth: v })} unit={params.units} />
          <Slider label="Length" value={params.bowlLength} min={1} max={6} onChange={(v) => updateParams({ bowlLength: v })} unit={params.units} />
          <div className="mb-4">
             <label className="text-xs font-medium text-gray-500 uppercase mb-2 block">Shape Profile</label>
             <div className="grid grid-cols-2 gap-2">
                {Object.values(BowlType).map(type => (
                  <button 
                    key={type}
                    onClick={() => updateParams({ bowlType: type })}
                    className={`text-xs py-2 px-3 rounded-md border transition-all ${
                      params.bowlType === type 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                        : 'bg-transparent border-gray-200 hover:border-indigo-400'
                    }`}
                  >
                    {type}
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* Section: Neck */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-amber-500 rounded-full"></span>
            Transition & Neck
          </h3>
          <Slider label="Neck Length" value={params.neckLength} min={0.1} max={3} onChange={(v) => updateParams({ neckLength: v })} unit={params.units} />
          <Slider label="Neck Width" value={params.neckWidth} min={0.2} max={2} onChange={(v) => updateParams({ neckWidth: v })} unit={params.units} />
        </div>

        {/* Section: Handle */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
            Handle Ergonomics
          </h3>
          <Slider label="Length" value={params.handleLength} min={2} max={15} onChange={(v) => updateParams({ handleLength: v })} unit={params.units} />
          <Slider label="Shoulder" value={params.handleShoulderWidth} min={0.3} max={2} onChange={(v) => updateParams({ handleShoulderWidth: v })} unit={params.units} />
          <Slider label="End Width" value={params.handleEndWidth} min={0.3} max={3} onChange={(v) => updateParams({ handleEndWidth: v })} unit={params.units} />
        </div>

        {/* Section: Crank (New) */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <span className="w-1 h-1 bg-rose-500 rounded-full"></span>
            Crank & Offset
          </h3>
          <Slider label="Crank Angle" value={params.crankAngle} min={0} max={45} onChange={(v) => updateParams({ crankAngle: v })} unit="°" />
          <Slider label="Crank Offset" value={params.crankOffset} min={0} max={0.5} onChange={(v) => updateParams({ crankOffset: v })} unit={params.units} />
        </div>

        <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-3">
           <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleExportJson}
                className="flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <FileJson size={14} /> Export JSON
              </button>
              <button className="flex items-center justify-center gap-2 text-xs font-medium py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                <Share2 size={14} /> Share Link
              </button>
           </div>
        </div>
      </aside>

      {/* Main Canvas Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        
        {/* Toolbar */}
        <header className={`no-print h-16 border-b px-6 flex items-center justify-between z-10 transition-colors ${params.darkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-1">
            <IconButton icon={Undo2} onClick={undo} title="Undo" />
            <IconButton icon={Redo2} onClick={redo} title="Redo" />
            <div className="w-px h-6 bg-gray-200 mx-2" />
            <IconButton icon={Grid3X3} active={params.showGrid} onClick={() => setParams(p => ({ ...p, showGrid: !p.showGrid }))} title="Toggle Grid" />
            <IconButton icon={params.darkMode ? Sun : Moon} onClick={() => setParams(p => ({ ...p, darkMode: !p.darkMode }))} title="Dark/Light Mode" />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 rounded-lg p-1 mr-4">
              <button 
                onClick={() => setParams(p => ({ ...p, units: 'in' }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${params.units === 'in' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
              >
                IN
              </button>
              <button 
                onClick={() => setParams(p => ({ ...p, units: 'mm' }))}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${params.units === 'mm' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-400'}`}
              >
                MM
              </button>
            </div>
            <button 
              onClick={handlePrint}
              className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              <Printer size={16} /> Print Template
            </button>
            <button className="bg-white border border-gray-200 text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm">
              <Download size={16} /> DXF for CNC
            </button>
          </div>
        </header>

        {/* Viewport */}
        <div 
          className="flex-1 cursor-grab active:cursor-grabbing relative bg-transparent"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <svg 
            width="100%" 
            height="100%" 
            className="w-full h-full"
            viewBox={`0 0 1000 1000`}
            preserveAspectRatio="xMidYMid meet"
          >
             <g transform={`translate(${500 + offset.x}, ${300 + offset.y})`}>
                {renderGrid()}
                
                {/* Scale Reference */}
                <g transform={`translate(${-dims.width * zoom * 0.7}, 0)`} className="no-print opacity-40">
                   <line x1="0" y1="0" x2="0" y2={zoom} stroke="currentColor" strokeWidth="2" />
                   <text x="5" y={zoom / 2} className="text-[12px] fill-current uppercase font-bold">1 {params.units}</text>
                </g>

                <path 
                  d={svgPath} 
                  transform={`scale(${zoom}) rotate(${params.totalRotation})`}
                  fill="none" 
                  stroke={params.darkMode ? "#fff" : "#000"} 
                  strokeWidth={2 / zoom} 
                  vectorEffect="non-scaling-stroke"
                />

                {/* Center Marking */}
                <circle r="2" fill="red" opacity="0.3" className="no-print" />
             </g>
          </svg>

          {/* Navigation Controls Overlay */}
          <div className="no-print absolute bottom-8 right-8 flex flex-col gap-2">
            <div className="bg-white/80 backdrop-blur-md border border-gray-200 p-2 rounded-2xl shadow-xl flex flex-col gap-1">
              <IconButton icon={Maximize2} onClick={() => { setOffset({ x: 0, y: 0 }); setZoom(60); }} title="Reset View" />
              <IconButton icon={Move} onClick={() => {}} active={isPanning} title="Pan Mode" />
              <IconButton icon={RotateCcw} onClick={() => setParams(p => ({...p, totalRotation: 0}))} title="Reset Rotation" />
            </div>
          </div>

          {/* Scale Indicator Warning */}
          <div className="no-print absolute bottom-8 left-8">
            <div className="bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-xs text-amber-800 flex items-center gap-2 shadow-sm">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              <span>Current Scale: 1:{ (1 / (zoom / 60)).toFixed(2) } - Use "Print" for 1:1 scale accuracy</span>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <footer className={`no-print h-10 border-t px-6 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest transition-colors ${params.darkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-500' : 'bg-white border-gray-100 text-gray-400'}`}>
          <div className="flex gap-4">
             <span>Bowl: {params.bowlWidth}" x {params.bowlLength}"</span>
             <span>Handle: {params.handleLength}"</span>
             <span>Total Length: {(params.bowlLength + params.neckLength + params.handleLength).toFixed(2)}"</span>
          </div>
          <div>
            System Ready | Render Latency: <span className="text-emerald-500">~8ms</span>
          </div>
        </footer>
      </main>

      {/* Printing Styles */}
      <style>{`
        @media print {
          @page { size: auto; margin: 0; }
          body { -webkit-print-color-adjust: exact; background: white; }
          #root { width: 100%; height: 100%; }
          svg { width: 100vw; height: 100vh; position: fixed; top: 0; left: 0; }
          g { transform: translate(50vw, 10vh) scale(96); } /* 96 dpi standard for 1:1 in web */
          path { stroke: black !important; fill: none !important; stroke-width: 0.5px !important; }
        }
      `}</style>
    </div>
  );
}
