
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sun, Moon, Languages, Wifi, WifiOff, Send, Clock, 
  Settings as SettingsIcon, Sparkles, Type as TypeIcon, 
  Monitor, RefreshCw, Layers, MoveLeft, MoveRight, 
  MoveUp, MoveDown, Square, Zap, Box, Layout as LayoutIcon,
  ChevronRight, ChevronLeft, AlertTriangle, Coffee, ArrowLeftRight, Calendar
} from 'lucide-react';
import { translations } from './translations';
import { Language, Theme, DisplayConfig, FONTS, STANDARD_RESOLUTIONS, ScrollEffect, BorderStyle, DisplayMode } from './types';
import { updateESP } from './services/espService';
import { getMessageSuggestion } from './services/geminiService';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('ar');
  const [theme, setTheme] = useState<Theme>('dark');
  const [activeTab, setActiveTab] = useState<'live' | 'settings'>('live');
  const [isConnected, setIsConnected] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [time, setTime] = useState(new Date());
  const [activeTextIndex, setActiveTextIndex] = useState(0);
  
  const [config, setConfig] = useState<DisplayConfig & { showSeconds: boolean }>({
    ipAddress: '',
    brightness: 180,
    speed: 4,
    font: 'Arabic-Modern',
    clockMode: 'digital',
    clockFormat: '24h',
    showDate: true,
    showCalendar: true,
    showSeconds: true,
    panelsX: 2,
    panelsY: 2, // Adjusted default to 2x2 for better calendar visibility
    width: 64,
    height: 32,
    currentText: 'أهلاً بك',
    secondaryText: 'P10 Display',
    switchInterval: 5,
    scrollEffect: 'left',
    borderStyle: 'none',
    isAutoBrightness: false,
    layout: 'top-message',
    displayMode: 'normal'
  });

  const t = translations[lang];

  // Clock Update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Alternating Text Switcher for Preview
  useEffect(() => {
    const switcher = setInterval(() => {
      setActiveTextIndex(prev => (prev === 0 ? 1 : 0));
    }, config.switchInterval * 1000);
    return () => clearInterval(switcher);
  }, [config.switchInterval]);

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.className = theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900';
  }, [lang, theme]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    const result: any = await updateESP(config, []);
    setIsUpdating(false);
    setIsConnected(result.success);
  };

  const generateAISuggestion = async (context: 'morning' | 'night' | 'general', target: 'primary' | 'secondary') => {
    const suggestion = await getMessageSuggestion(context, lang);
    if (suggestion) {
      setConfig(prev => ({
        ...prev,
        [target === 'primary' ? 'currentText' : 'secondaryText']: suggestion
      }));
    }
  };

  const formattedTime = useMemo(() => {
    let hours = time.getHours();
    const minutes = time.getMinutes().toString().padStart(2, '0');
    const seconds = time.getSeconds().toString().padStart(2, '0');
    let ampm = '';

    if (config.clockFormat === '12h') {
      ampm = hours >= 12 ? ' PM' : ' AM';
      hours = hours % 12 || 12;
    }

    const hStr = hours.toString().padStart(2, '0');
    return `${hStr}:${minutes}${config.showSeconds ? `:${seconds}` : ''}${ampm}`;
  }, [time, config.clockFormat, config.showSeconds]);

  // Hijri Date Calculation
  const hijriDate = useMemo(() => {
    return new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'short'
    }).format(time);
  }, [time]);

  // Miladi (Gregorian) Date Calculation
  const miladiDate = useMemo(() => {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      day: 'numeric',
      month: 'short'
    }).format(time);
  }, [time, lang]);

  const ledDots = useMemo(() => {
    const total = Math.min(config.width * config.height, 2048); 
    return Array.from({ length: total });
  }, [config.width, config.height]);

  const getBorderClass = (style: BorderStyle) => {
    switch (style) {
      case 'thin': return 'border border-red-600/50';
      case 'thick': return 'border-2 border-red-600';
      case 'dashed': return 'border-2 border-dashed border-red-600/70';
      case 'corners': return 'ring-inset ring-2 ring-red-600';
      default: return '';
    }
  };

  const getAnimationClass = (effect: ScrollEffect) => {
    if (config.displayMode === 'party') return 'animate-bounce text-yellow-500';
    if (config.displayMode === 'pulse') return 'animate-pulse';
    if (config.displayMode === 'emergency') return 'animate-ping text-red-500 font-black';
    
    switch (effect) {
      case 'left': return 'animate-marquee-left';
      case 'right': return 'animate-marquee-right';
      case 'up': return 'animate-marquee-up';
      case 'down': return 'animate-marquee-down';
      case 'blink': return 'animate-pulse';
      case 'scroll-up-down': return 'animate-bounce';
      default: return '';
    }
  };

  const updatePanelCount = (dim: 'x' | 'y', val: number) => {
    const newVal = Math.max(1, Math.min(dim === 'x' ? 16 : 8, val));
    const newConfig = { ...config };
    if (dim === 'x') {
      newConfig.panelsX = newVal;
      newConfig.width = newVal * 32;
    } else {
      newConfig.panelsY = newVal;
      newConfig.height = newVal * 16;
    }
    setConfig(newConfig);
  };

  const activeDisplayMessage = activeTextIndex === 0 ? config.currentText : config.secondaryText;

  return (
    <div className={`min-h-screen pb-28 transition-colors duration-300 font-sans ${theme === 'dark' ? 'dark text-white' : 'text-slate-900'}`}>
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="text-red-500" size={24} />
            <h1 className="text-xl font-bold tracking-tight">{t.appTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:scale-105 transition-all">
              <Languages size={18} />
            </button>
            <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:scale-105 transition-all">
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${isConnected ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="hidden xs:inline">{isConnected ? t.connected : t.disconnected}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {/* P10 PREVIEW */}
        <section className={`bg-black rounded-3xl p-4 sm:p-8 shadow-2xl border-[6px] transition-all overflow-hidden relative ${config.displayMode === 'emergency' ? 'border-red-900 animate-pulse' : 'border-slate-800'}`}>
          <div className="flex justify-between items-center mb-6 text-slate-500 text-[10px] font-black uppercase tracking-widest">
             <span className="flex items-center gap-2"><Monitor size={14} /> {t.preview}</span>
             <div className="flex items-center gap-2 font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-white/5">
                <span className="text-red-500 font-bold">{config.panelsX}x{config.panelsY}</span>
                <span className="opacity-40">|</span>
                <span>{config.width}x{config.height} PX</span>
             </div>
          </div>
          <div 
            className={`bg-slate-950 overflow-hidden relative border-slate-900 mx-auto transition-all duration-500 ${getBorderClass(config.borderStyle)}`}
            style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${config.width}, 1fr)`,
                gridTemplateRows: `repeat(${config.height}, 1fr)`,
                gap: '1px',
                aspectRatio: `${config.width}/${config.height}`,
                maxWidth: '100%',
                boxShadow: config.displayMode === 'emergency' ? '0 0 50px rgba(255, 0, 0, 0.4)' : '0 0 30px rgba(220, 38, 38, 0.2)'
            }}
          >
            {ledDots.map((_, i) => (
              <div key={i} className={`led-dot w-full h-full ${Math.random() > 0.95 ? 'bg-red-600/80 led-glow' : 'bg-slate-900/30'}`} />
            ))}
            
            {/* Calendar Overlays */}
            {config.showCalendar && (
              <>
                {/* Hijri: Top Right */}
                <div className="absolute top-1 right-1 text-[8px] sm:text-[10px] font-bold text-red-500/90 pointer-events-none z-20 bg-black/40 px-1 rounded select-none">
                  {hijriDate}
                </div>
                {/* Miladi: Bottom Left */}
                <div className="absolute bottom-1 left-1 text-[8px] sm:text-[10px] font-bold text-red-500/90 pointer-events-none z-20 bg-black/40 px-1 rounded select-none">
                  {miladiDate}
                </div>
              </>
            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-red-600 font-mono text-center">
              <div key={activeTextIndex} className={`flex flex-col items-center justify-center w-full h-full p-2 transition-all duration-700 fade-in ${config.scrollEffect !== 'static' || config.displayMode !== 'normal' ? getAnimationClass(config.scrollEffect) : ''}`}>
                
                {config.layout === 'centered' && (
                  <span className="text-3xl sm:text-5xl font-black uppercase tracking-tighter whitespace-nowrap">
                    {config.clockMode !== 'none' && activeTextIndex === 1 ? formattedTime : activeDisplayMessage}
                  </span>
                )}

                {config.layout === 'top-message' && (
                  <div className="flex flex-col gap-1 items-center w-full">
                    {config.clockMode !== 'none' && <span className="text-xl sm:text-3xl font-black">{formattedTime}</span>}
                    <span className="text-xs sm:text-lg uppercase px-2 py-0.5 bg-red-600/10 rounded font-bold">{activeDisplayMessage}</span>
                  </div>
                )}

                {config.layout === 'side-by-side' && (
                  <div className="flex items-center justify-between w-full px-4 gap-2">
                    {config.clockMode !== 'none' && <span className="text-lg sm:text-2xl font-black">{formattedTime.split(' ')[0].substring(0, 5)}</span>}
                    <span className="flex-1 text-xs sm:text-sm border-l-2 border-red-600 pl-4 h-full flex items-center justify-center font-bold">{activeDisplayMessage}</span>
                  </div>
                )}
                
                {config.showDate && !config.showCalendar && config.clockMode !== 'none' && config.displayMode === 'normal' && config.layout !== 'centered' && (
                  <span className="text-[10px] mt-1 font-bold opacity-80 bg-red-600/5 px-2">
                    {time.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* NAVIGATION */}
        <nav className="flex bg-slate-200/50 dark:bg-slate-800/50 p-1.5 rounded-2xl">
          {(['live', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 shadow-lg text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {tab === 'live' && <Send size={20} />}
              {tab === 'settings' && <SettingsIcon size={20} />}
              {t[tab as keyof typeof t]}
            </button>
          ))}
        </nav>

        <div className="bg-white dark:bg-slate-800/40 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
          {activeTab === 'live' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              {/* DISPLAY MODE */}
              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm font-black text-slate-500 uppercase tracking-wider">
                  <Zap size={18} className="text-yellow-500" />
                  {t.displayMode}
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'normal', icon: <Monitor size={18}/> },
                    { id: 'party', icon: <Sparkles size={18}/> },
                    { id: 'pulse', icon: <Zap size={18}/> },
                    { id: 'eco', icon: <Coffee size={18}/> },
                    { id: 'emergency', icon: <AlertTriangle size={18}/> }
                  ].map(mode => (
                    <button 
                      key={mode.id} 
                      onClick={() => setConfig({...config, displayMode: mode.id as DisplayMode})}
                      className={`flex flex-col items-center gap-2 py-3 rounded-2xl text-[9px] font-black transition-all border ${config.displayMode === mode.id ? 'bg-blue-600 border-blue-600 text-white shadow-xl' : 'bg-slate-50 dark:bg-slate-900 border-transparent text-slate-400'}`}
                    >
                      {mode.icon}
                      {t[mode.id as keyof typeof t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* MESSAGE INPUTS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Message A */}
                 <div className="space-y-3 p-5 bg-blue-500/5 rounded-3xl border border-blue-500/10">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-blue-500 uppercase">{t.messageA}</label>
                        <div className="flex gap-2">
                            <button onClick={() => generateAISuggestion('morning', 'primary')} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-amber-500"><Sun size={14}/></button>
                            <button onClick={() => generateAISuggestion('night', 'primary')} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-indigo-500"><Moon size={14}/></button>
                        </div>
                    </div>
                    <textarea value={config.currentText} onChange={(e) => setConfig({...config, currentText: e.target.value})} className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-blue-500/50 font-bold" rows={2} placeholder={t.enterText}/>
                 </div>

                 {/* Message B */}
                 <div className="space-y-3 p-5 bg-purple-500/5 rounded-3xl border border-purple-500/10">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-purple-500 uppercase">{t.messageB}</label>
                        <div className="flex gap-2">
                            <button onClick={() => generateAISuggestion('morning', 'secondary')} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-amber-500"><Sun size={14}/></button>
                            <button onClick={() => generateAISuggestion('night', 'secondary')} className="p-1.5 rounded-lg bg-white dark:bg-slate-800 shadow-sm text-indigo-500"><Moon size={14}/></button>
                        </div>
                    </div>
                    <textarea value={config.secondaryText} onChange={(e) => setConfig({...config, secondaryText: e.target.value})} className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 ring-purple-500/50 font-bold" rows={2} placeholder={t.enterText}/>
                 </div>
              </div>

              {/* CONFIG GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-slate-100 dark:border-white/10">
                {/* CLOCK SETUP */}
                <div className="space-y-5">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                    <Clock size={18} className="text-blue-500" />
                    {t.clockMode}
                  </label>
                  <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                    <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                      {(['none', 'digital', 'analog'] as const).map(mode => (
                        <button key={mode} onClick={() => setConfig({...config, clockMode: mode})} className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${config.clockMode === mode ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'}`}>
                          {t[mode as keyof typeof t]}
                        </button>
                      ))}
                    </div>
                    {config.clockMode !== 'none' && (
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button onClick={() => setConfig({...config, clockFormat: config.clockFormat === '24h' ? '12h' : '24h'})} className="flex flex-col items-center gap-1 py-3 px-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 hover:scale-[1.02] transition-all">
                          <span className="text-[10px] uppercase font-black opacity-40">{t.clockFormat}</span>
                          <span className="text-xs font-bold">{config.clockFormat === '24h' ? t.h24 : t.h12}</span>
                        </button>
                        <button onClick={() => setConfig({...config, showSeconds: !config.showSeconds})} className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl border transition-all hover:scale-[1.02] ${config.showSeconds ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-500'}`}>
                          <span className="text-[10px] uppercase font-black opacity-60">{t.showSeconds}</span>
                          <span className="text-xs font-bold">{config.showSeconds ? (lang === 'ar' ? 'نعم' : 'Yes') : (lang === 'ar' ? 'لا' : 'No')}</span>
                        </button>
                      </div>
                    )}
                    {/* Calendar Toggle */}
                    <button onClick={() => setConfig({...config, showCalendar: !config.showCalendar})} className={`w-full flex items-center justify-between py-3 px-4 rounded-2xl border transition-all ${config.showCalendar ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-white/5 text-slate-500'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar size={16}/>
                        <span className="text-xs font-bold">{t.showCalendar}</span>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${config.showCalendar ? 'bg-white' : 'bg-slate-400'}`}/>
                    </button>
                  </div>
                </div>

                {/* SWITCH INTERVAL & LAYOUT */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                      <ArrowLeftRight size={18} className="text-emerald-500" />
                      {t.switchInterval}
                    </label>
                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-3xl">
                        <input type="range" min="1" max="30" value={config.switchInterval} onChange={(e) => setConfig({...config, switchInterval: parseInt(e.target.value)})} className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-emerald-500"/>
                        <span className="font-black text-emerald-500 min-w-[30px] text-center">{config.switchInterval}s</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase">
                      <LayoutIcon size={18} className="text-purple-500" />
                      {t.layout}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['centered', 'top-message', 'side-by-side'].map(l => (
                        <button key={l} onClick={() => setConfig({...config, layout: l as any})} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${config.layout === l ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500'}`}>
                          {t[l as keyof typeof t]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-10 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest"><Wifi size={18} /> {t.connectionStatus}</label>
                  <div className="relative group">
                    <input type="text" value={config.ipAddress} onChange={(e) => setConfig({...config, ipAddress: e.target.value})} placeholder={t.ipPlaceholder} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-4 py-5 outline-none focus:ring-2 ring-blue-500 transition-all font-mono font-bold" />
                    <Wifi size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-slate-500 flex items-center gap-2 uppercase tracking-widest"><Layers size={18} /> {t.panelConfig}</label>
                  <div className="bg-slate-50 dark:bg-slate-900/40 p-5 rounded-3xl border border-slate-100 dark:border-white/5 space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold opacity-60">{t.horizontalPanels}</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updatePanelCount('x', config.panelsX - 1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"><ChevronLeft size={16}/></button>
                                <span className="font-mono font-bold w-8 text-center">{config.panelsX}</span>
                                <button onClick={() => updatePanelCount('x', config.panelsX + 1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold opacity-60">{t.verticalPanels}</span>
                            <div className="flex items-center gap-3">
                                <button onClick={() => updatePanelCount('y', config.panelsY - 1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"><ChevronLeft size={16}/></button>
                                <span className="font-mono font-bold w-8 text-center">{config.panelsY}</span>
                                <button onClick={() => updatePanelCount('y', config.panelsY + 1)} className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:bg-blue-500 hover:text-white transition-all shadow-sm"><ChevronRight size={16}/></button>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-12 pt-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-500"><Sun size={20} className="text-amber-500" /> {t.brightness}</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setConfig({...config, isAutoBrightness: !config.isAutoBrightness})} className={`text-[10px] font-black px-4 py-1.5 rounded-full border transition-all ${config.isAutoBrightness ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 dark:border-white/10 opacity-50'}`}>
                        {t.autoBrightness}
                      </button>
                      <span className="text-sm font-black bg-blue-500/10 text-blue-500 px-4 py-1 rounded-xl">{Math.round((config.brightness/255)*100)}%</span>
                    </div>
                  </div>
                  {!config.isAutoBrightness && (
                    <input type="range" min="0" max="255" step="5" value={config.brightness} onChange={(e) => setConfig({...config, brightness: parseInt(e.target.value)})} className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-blue-600 shadow-inner" />
                  )}
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-500"><RefreshCw size={20} className="text-green-500" /> {t.speed}</label>
                    <span className="text-sm font-black bg-green-500/10 text-green-500 px-4 py-1 rounded-xl">Level {config.speed}</span>
                  </div>
                  <input type="range" min="1" max="10" value={config.speed} onChange={(e) => setConfig({...config, speed: parseInt(e.target.value)})} className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-green-500 shadow-inner" />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white dark:from-slate-900 via-white/95 dark:via-slate-900/95 to-transparent backdrop-blur-md z-40">
        <div className="max-w-4xl mx-auto">
          <button disabled={isUpdating} onClick={handleUpdate} className={`w-full h-20 rounded-[2.5rem] font-black text-xl shadow-2xl flex items-center justify-center gap-4 active:scale-[0.97] transition-all disabled:opacity-50 ${isUpdating ? 'bg-slate-600 cursor-not-allowed text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/40'}`}>
            {isUpdating ? <RefreshCw size={32} className="animate-spin" /> : <><Send size={32} /> {t.update}</>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
