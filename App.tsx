/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, QuantumComputerScene } from './components/QuantumScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { PaperData, defaultPaperData } from './src/paperData';
import { 
  ArrowDown, 
  Menu, 
  X, 
  BookOpen, 
  Sliders, 
  Copy, 
  Check, 
  Info, 
  HelpCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Code, 
  ExternalLink,
  RefreshCw,
  Palette,
  Layers,
  ChevronRight
} from 'lucide-react';

// Theme Presets Definition
export const THEMES = {
  'gold-cream': {
    name: 'Sand & Gold (Classic)',
    isDark: false,
    bg: '#F9F8F4',
    cardBg: '#FFFFFF',
    textMain: '#1C1917', // stone-900
    textBody: '#44403C', // stone-700
    textMuted: '#78716C', // stone-500
    border: '#E7E5E4', // stone-200
    accent: '#C5A059', // nobel-gold
    accentMuted: 'rgba(197, 160, 89, 0.1)',
  },
  'cosmic-slate': {
    name: 'Cosmic Slate (Dark)',
    isDark: true,
    bg: '#0F172A', // slate-900
    cardBg: '#1E293B', // slate-800
    textMain: '#F8FAFC', // slate-50
    textBody: '#CBD5E1', // slate-300
    textMuted: '#94A3B8', // slate-400
    border: '#334155', // slate-700
    accent: '#06B6D4', // cyan-500
    accentMuted: 'rgba(6, 182, 212, 0.1)',
  },
  'academic-indigo': {
    name: 'Academic Indigo (Light)',
    isDark: false,
    bg: '#F8FAFC', // slate-50
    cardBg: '#FFFFFF',
    textMain: '#0F172A', // slate-900
    textBody: '#334155', // slate-700
    textMuted: '#64748B', // slate-500
    border: '#E2E8F0', // slate-200
    accent: '#1D4ED8', // royal blue
    accentMuted: 'rgba(29, 78, 216, 0.1)',
  },
  'forest-emerald': {
    name: 'Forest Emerald (Dark)',
    isDark: true,
    bg: '#0A0F0D', // dark forest
    cardBg: '#141F1A', // forest card
    textMain: '#ECFDF5', // emerald-50
    textBody: '#D1FAE5', // emerald-100
    textMuted: '#34D399', // emerald-400
    border: '#1F2F28', // dark forest border
    accent: '#10B981', // emerald-500
    accentMuted: 'rgba(16, 185, 129, 0.1)',
  }
};

// Font Presets Definition
export const FONTS_HEADING = {
  'Playfair Display': '"Playfair Display", serif',
  'Space Grotesk': '"Space Grotesk", sans-serif',
  'JetBrains Mono': '"JetBrains Mono", monospace',
  'Lora': '"Lora", serif',
  'Inter': '"Inter", sans-serif'
};

export const FONTS_BODY = {
  'Inter': '"Inter", sans-serif',
  'Lora': '"Lora", serif',
  'JetBrains Mono': '"JetBrains Mono", monospace'
};

const AuthorCard = ({ name, role, delay }: { name: string, role: string, delay: string }) => {
  return (
    <div 
      className="flex flex-col group animate-fade-in-up items-center p-8 bg-theme-card rounded-xl border border-theme-border shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-xs hover:border-theme-accent/50" 
      style={{ animationDelay: delay }}
    >
      <h3 className="font-serif text-2xl text-theme-main text-center mb-3">{name}</h3>
      <div className="w-12 h-0.5 bg-theme-accent mb-4 opacity-60"></div>
      <p className="text-xs text-theme-muted font-bold uppercase tracking-widest text-center leading-relaxed">{role}</p>
    </div>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Paper Data State
  const [paper, setPaper] = useState<PaperData>(() => {
    // Attempt to load from localStorage if available, so that when they edit their paper, it persists across refreshes!
    try {
      const saved = localStorage.getItem('academic_paper_data');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return defaultPaperData;
  });

  const updatePaperField = (key: keyof PaperData, value: any) => {
    const updated = { ...paper, [key]: value };
    setPaper(updated);
    try {
      localStorage.setItem('academic_paper_data', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const resetPaperData = () => {
    setPaper(defaultPaperData);
    try {
      localStorage.removeItem('academic_paper_data');
    } catch (e) {
      console.error(e);
    }
  };

  // Styling and Integration States
  const [activeThemeKey, setActiveThemeKey] = useState<keyof typeof THEMES>('gold-cream');
  const [activeFontHeadingKey, setActiveFontHeadingKey] = useState<keyof typeof FONTS_HEADING>('Playfair Display');
  const [activeFontBodyKey, setActiveFontBodyKey] = useState<keyof typeof FONTS_BODY>('Inter');
  const [embedMode, setEmbedMode] = useState(false);
  const [hideCustomizer, setHideCustomizer] = useState(false);
  
  // Customizer Dashboard Controls
  const [panelOpen, setPanelOpen] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [customizerTab, setCustomizerTab] = useState<'style' | 'content' | 'embed' | 'guide'>('style');
  const [visitorControlsEnabled, setVisitorControlsEnabled] = useState(false);

  const currentBaseUrl = window.location.origin + window.location.pathname;

  // Handle URL query parameters for seamless integration
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    
    // Parse Theme
    const tParam = params.get('theme');
    if (tParam) {
      if (tParam === 'cosmic' || tParam === 'cosmic-slate') {
        setActiveThemeKey('cosmic-slate');
      } else if (tParam === 'academic' || tParam === 'academic-indigo') {
        setActiveThemeKey('academic-indigo');
      } else if (tParam === 'forest' || tParam === 'forest-emerald') {
        setActiveThemeKey('forest-emerald');
      } else if (tParam === 'gold' || tParam === 'gold-cream') {
        setActiveThemeKey('gold-cream');
      }
    }
    
    // Parse Fonts
    const fontHeadParam = params.get('font-heading') || params.get('font');
    if (fontHeadParam) {
      const decodedHead = decodeURIComponent(fontHeadParam).toLowerCase();
      if (decodedHead.includes('playfair')) setActiveFontHeadingKey('Playfair Display');
      else if (decodedHead.includes('space') || decodedHead.includes('grotesk')) setActiveFontHeadingKey('Space Grotesk');
      else if (decodedHead.includes('mono') || decodedHead.includes('jetbrains')) setActiveFontHeadingKey('JetBrains Mono');
      else if (decodedHead.includes('lora')) setActiveFontHeadingKey('Lora');
      else if (decodedHead.includes('inter')) setActiveFontHeadingKey('Inter');
    }
    
    const fontBodyParam = params.get('font-body');
    if (fontBodyParam) {
      const decodedBody = decodeURIComponent(fontBodyParam).toLowerCase();
      if (decodedBody.includes('inter')) setActiveFontBodyKey('Inter');
      else if (decodedBody.includes('lora')) setActiveFontBodyKey('Lora');
      else if (decodedBody.includes('mono') || decodedBody.includes('jetbrains')) setActiveFontBodyKey('JetBrains Mono');
    }
    
    // Parse Embed Mode
    const embedParam = params.get('embed');
    if (embedParam === 'true' || embedParam === '1') {
      setEmbedMode(true);
    }

    // Parse Hide Customizer option
    const hideCustomizerParam = params.get('hide-customizer');
    const controlsParam = params.get('controls');
    if (hideCustomizerParam === 'true' || controlsParam === 'false') {
      setHideCustomizer(true);
    }
  }, []);

  // Update document body and root styles when theme/font options change
  useEffect(() => {
    const root = document.documentElement;
    const theme = THEMES[activeThemeKey];
    
    root.style.setProperty('--color-bg', theme.bg);
    root.style.setProperty('--color-card-bg', theme.cardBg);
    root.style.setProperty('--color-text-main', theme.textMain);
    root.style.setProperty('--color-text-body', theme.textBody);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    root.style.setProperty('--color-border', theme.border);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-accent-muted', theme.accentMuted);
    
    root.style.setProperty('--font-serif', FONTS_HEADING[activeFontHeadingKey]);
    root.style.setProperty('--font-sans', FONTS_BODY[activeFontBodyKey]);
  }, [activeThemeKey, activeFontHeadingKey, activeFontBodyKey]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = embedMode ? 40 : 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Generate iframe embed URL with active options
  const getEmbedUrl = () => {
    let url = `${currentBaseUrl}?embed=true&theme=${activeThemeKey}&font-heading=${encodeURIComponent(activeFontHeadingKey)}&font-body=${encodeURIComponent(activeFontBodyKey)}`;
    if (!visitorControlsEnabled) {
      url += '&hide-customizer=true';
    }
    return url;
  };

  // Generate iframe HTML code snippet
  const getIframeCode = () => {
    return `<iframe src="${getEmbedUrl()}" width="100%" height="700" style="border:none; border-radius:12px; background:${THEMES[activeThemeKey].bg}; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);" allow="geolocation; microphone; camera"></iframe>`;
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(getIframeCode());
    setCopiedEmbed(true);
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(getEmbedUrl());
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleResetStyle = () => {
    setActiveThemeKey('gold-cream');
    setActiveFontHeadingKey('Playfair Display');
    setActiveFontBodyKey('Inter');
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body selection:bg-theme-accent selection:text-white transition-colors duration-500">
      
      {/* Dynamic Google Sites Embed Indicator Badge */}
      {embedMode && (
        <div className="fixed top-4 left-4 z-40 bg-theme-card/85 backdrop-blur-md border border-theme-border rounded-full py-1.5 px-3.5 shadow-sm text-[11px] font-sans flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-theme-accent animate-pulse"></span>
          <span className="text-theme-main font-bold tracking-wider uppercase text-[10px]">Embedded Frame</span>
          <button 
            onClick={() => setEmbedMode(false)}
            className="text-theme-accent hover:text-theme-main border-l border-theme-border pl-2 ml-1 font-semibold flex items-center gap-1"
            title="Preview full site layout"
          >
            Show Full
          </button>
          <a 
            href={currentBaseUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-theme-muted hover:text-theme-main border-l border-theme-border pl-2 flex items-center gap-1"
            title="Open in new tab"
          >
            <ExternalLink size={12} />
          </a>
        </div>
      )}

      {/* Navigation (Hidden in Compact Embed Mode) */}
      {!embedMode && (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-theme-bg/95 backdrop-blur-md shadow-sm py-4 border-b border-theme-border/50' : 'bg-transparent py-6'}`}>
          <div className="container mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-8 h-8 bg-theme-accent rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm pb-1 transition-transform hover:scale-105">{(paper.title && paper.title[0]) || 'α'}</div>
              <span className={`font-serif font-bold text-lg tracking-wide text-theme-main transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                {paper.title.toUpperCase()} <span className="font-normal text-theme-muted">{paper.publishDate.split(' ').pop() || ''}</span>
              </span>
            </div>
            
            <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-theme-body">
              <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase">Introduction</a>
              <a href="#science" onClick={scrollToSection('science')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase">{paper.scienceTitle}</a>
              <a href="#impact" onClick={scrollToSection('impact')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase">Impact</a>
              <a href="#authors" onClick={scrollToSection('authors')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase">Authors</a>
              <a 
                href={paper.doiUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-5 py-2 bg-theme-main text-theme-bg rounded-full hover:opacity-90 transition-all shadow-sm cursor-pointer font-semibold"
              >
                View Paper
              </a>
            </div>

            <button className="md:hidden text-theme-main p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      )}

      {/* Mobile Menu (Hidden in Embed Mode) */}
      {!embedMode && menuOpen && (
        <div className="fixed inset-0 z-45 bg-theme-bg flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
            <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase text-theme-main">Introduction</a>
            <a href="#science" onClick={scrollToSection('science')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase text-theme-main">{paper.scienceTitle}</a>
            <a href="#impact" onClick={scrollToSection('impact')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase text-theme-main">Impact</a>
            <a href="#authors" onClick={scrollToSection('authors')} className="hover:text-theme-accent transition-colors cursor-pointer uppercase text-theme-main">Authors</a>
            <a 
              href={paper.doiUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              onClick={() => setMenuOpen(false)} 
              className="px-6 py-3 bg-theme-main text-theme-bg rounded-full shadow-lg cursor-pointer font-semibold"
            >
              View Paper
            </a>
        </div>
      )}

      {/* Hero Section */}
      <header className={`relative flex items-center justify-center overflow-hidden transition-all duration-500 ${embedMode ? 'h-[75vh] min-h-[460px] border-b border-theme-border' : 'h-screen'}`}>
        <HeroScene />
        
        {/* Dynamic Gradient Overlay using background custom variable */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none transition-all duration-500" 
          style={{
            background: `radial-gradient(circle at center, ${THEMES[activeThemeKey].bg}eb 0%, ${THEMES[activeThemeKey].bg}90 55%, ${THEMES[activeThemeKey].bg}33 100%)`
          }}
        />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-theme-accent text-theme-accent text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-theme-card/25">
            {paper.journal} • {paper.publishDate}
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight mb-8 text-theme-main drop-shadow-sm">
            {paper.title} <br/><span className="italic font-normal text-theme-muted text-2xl md:text-4xl block mt-4 font-serif">{paper.subtitle}</span>
          </h1>
          <p className="max-w-2xl mx-auto text-base md:text-lg text-theme-body font-light leading-relaxed mb-12">
            {paper.description}
          </p>
          
          <div className="flex justify-center">
             <a href="#introduction" onClick={scrollToSection('introduction')} className="group flex flex-col items-center gap-2 text-xs font-bold text-theme-muted hover:text-theme-main transition-colors cursor-pointer">
                <span>EXPLORE</span>
                <span className="p-2 border border-theme-border rounded-full group-hover:border-theme-main transition-colors bg-theme-card/40 backdrop-blur-sm">
                    <ArrowDown size={14} className="text-theme-accent" />
                </span>
             </a>
          </div>
        </div>
      </header>

      <main>
        {/* Introduction */}
        <section id="introduction" className="py-20 bg-theme-card border-b border-theme-border/40">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
            <div className="md:col-span-4">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-theme-muted uppercase">Introduction</div>
              <h2 className="font-serif text-4xl mb-6 leading-tight text-theme-main">{paper.introTitle}</h2>
              <div className="w-16 h-1 bg-theme-accent mb-6"></div>
            </div>
            <div className="md:col-span-8 text-lg text-theme-body leading-relaxed space-y-6">
              <p>
                <span className="text-5xl float-left mr-3 mt-[-8px] font-serif text-theme-accent font-semibold">{paper.introDropcap}</span>{paper.introText1}
              </p>
              <p>
                {paper.introText2}
              </p>
            </div>
          </div>
        </section>

        {/* The Science: Surface Code */}
        <section id="science" className="py-20 bg-theme-card border-b border-theme-border/40">
            <div className="container mx-auto px-6">
                <div className={paper.showFigSurfaceCode ? "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" : "max-w-3xl mx-auto"}>
                    <div className={paper.showFigSurfaceCode ? "" : "text-center md:text-left"}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-theme-bg text-theme-body text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-theme-border">
                            <BookOpen size={14} className="text-theme-accent"/> THE SYSTEM
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-6 text-theme-main">{paper.scienceTitle}</h2>
                        <p className="text-lg text-theme-body mb-6 leading-relaxed">
                           {paper.scienceText1}
                        </p>
                        <p className="text-lg text-theme-body mb-6 leading-relaxed">
                            {paper.scienceText2}
                        </p>
                    </div>
                    {paper.showFigSurfaceCode && (
                      <div>
                          <SurfaceCodeDiagram paper={paper} />
                      </div>
                    )}
                </div>
            </div>
        </section>

        {/* The Science: Transformer Decoder (Permanently Dark Section for Contrast) */}
        <section className="py-20 bg-stone-950 text-stone-100 overflow-hidden relative border-y border-stone-800">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                {/* Decorative background pattern - Gold/Stone theme */}
                <div className="w-96 h-96 rounded-full bg-stone-800 blur-[100px] absolute top-[-100px] left-[-100px]"></div>
                <div className="w-96 h-96 rounded-full bg-amber-500/30 blur-[100px] absolute bottom-[-100px] right-[-100px]"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10">
                <div className={paper.showFigTransformer ? "grid grid-cols-1 lg:grid-cols-2 gap-16 items-center" : "max-w-3xl mx-auto text-center md:text-left"}>
                     {paper.showFigTransformer && (
                       <div className="order-2 lg:order-1">
                          <TransformerDecoderDiagram paper={paper} />
                       </div>
                     )}
                     <div className={`order-1 ${paper.showFigTransformer ? "lg:order-2" : ""} animate-fade-in`}>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-900 text-amber-400 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-800">
                            {paper.innovationBadge}
                        </div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white leading-tight">{paper.innovationTitle}</h2>
                        <p className="text-lg text-stone-300 mb-6 leading-relaxed font-sans">
                            {paper.innovationText1}
                        </p>
                        <p className="text-lg text-stone-300 leading-relaxed font-sans">
                            {paper.innovationText2}
                        </p>
                     </div>
                </div>
            </div>
        </section>

        {/* The Science: Results */}
        <section className="py-20 bg-theme-bg">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center mb-12">
                    <h2 className="font-serif text-4xl md:text-5xl mb-6 text-theme-main">{paper.resultsTitle}</h2>
                    <p className="text-lg text-theme-body leading-relaxed">
                        {paper.resultsText}
                    </p>
                </div>
                {paper.showFigPerformance && (
                  <div className="max-w-3xl mx-auto">
                      <PerformanceMetricDiagram paper={paper} />
                  </div>
                )}
            </div>
        </section>

        {/* Impact */}
        <section id="impact" className="py-20 bg-theme-card border-t border-b border-theme-border/50">
             <div className="container mx-auto px-6">
                 <div className={paper.showFigCryostat ? "grid grid-cols-1 md:grid-cols-12 gap-12" : "max-w-3xl mx-auto"}>
                    {paper.showFigCryostat && (
                      <div className="md:col-span-5 relative">
                          <div className="aspect-square bg-theme-bg/60 rounded-xl overflow-hidden relative border border-theme-border shadow-inner">
                              <QuantumComputerScene />
                              <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-theme-muted font-serif italic z-10 px-4 bg-theme-card/75 backdrop-blur-sm py-1 border-t border-theme-border">
                                Interactive Cryostat visualization
                              </div>
                          </div>
                      </div>
                    )}
                    <div className={paper.showFigCryostat ? "md:col-span-7 flex flex-col justify-center" : "flex flex-col justify-center text-center md:text-left"}>
                        <div className="inline-block mb-3 text-xs font-bold tracking-widest text-theme-muted uppercase">IMPACT</div>
                        <h2 className="font-serif text-4xl mb-6 text-theme-main leading-tight">{paper.impactTitle}</h2>
                        <p className="text-lg text-theme-body mb-6 leading-relaxed">
                            {paper.impactText1}
                        </p>
                        <p className="text-lg text-theme-body mb-8 leading-relaxed">
                            {paper.impactText2}
                        </p>
                        
                        <div className="p-6 bg-theme-bg border border-theme-border rounded-lg border-l-4 border-l-theme-accent transition-all duration-300 text-left">
                            <p className="font-serif italic text-xl text-theme-main mb-4 leading-relaxed">
                                "{paper.quote}"
                            </p>
                            <span className="text-sm font-bold text-theme-muted tracking-wider uppercase">{paper.quoteAuthor}</span>
                        </div>
                    </div>
                 </div>
             </div>
        </section>

        {/* Authors */}
        <section id="authors" className="py-20 bg-theme-bg border-b border-theme-border/50">
           <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <div className="inline-block mb-3 text-xs font-bold tracking-widest text-theme-muted uppercase">RESEARCH TEAM</div>
                    <h2 className="font-serif text-3xl md:text-5xl mb-4 text-theme-main">Key Contributors</h2>
                    <p className="text-theme-muted max-w-2xl mx-auto">A collaboration of dedicated authors and researchers.</p>
                </div>
                
                <div className="flex flex-col md:flex-row gap-8 justify-center items-center flex-wrap">
                    {paper.authors.map((author, index) => (
                      <AuthorCard 
                        key={index}
                        name={author.name}
                        role={author.role}
                        delay={`${index * 0.1}s`}
                      />
                    ))}
                </div>
                <div className="text-center mt-12">
                    <p className="text-theme-muted italic">And many others contributing to theory, hardware, and research.</p>
                </div>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400 py-16 border-t border-stone-900">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
                <div className="text-white font-serif font-bold text-2xl mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className="w-6 h-6 bg-theme-accent rounded-full text-white font-serif font-bold text-sm flex items-center justify-center pb-0.5">{(paper.title && paper.title[0]) || 'α'}</span>
                  {paper.title}
                </div>
                <p className="text-sm text-stone-500">Visualizing "{paper.title} - {paper.subtitle}"</p>
            </div>
            {!embedMode && (
              <div className="flex gap-6 text-xs tracking-wider font-mono text-stone-500 uppercase">
                <a href="#introduction" onClick={scrollToSection('introduction')} className="hover:text-white transition-colors">Intro</a>
                <a href="#science" onClick={scrollToSection('science')} className="hover:text-white transition-colors">{paper.scienceTitle}</a>
                <a href="#impact" onClick={scrollToSection('impact')} className="hover:text-white transition-colors">Impact</a>
                <a href="#authors" onClick={scrollToSection('authors')} className="hover:text-white transition-colors">Team</a>
              </div>
            )}
        </div>
        <div className="text-center mt-12 text-xs text-stone-700 flex flex-col md:flex-row justify-center items-center gap-4 border-t border-stone-900/60 pt-8 max-w-6xl mx-auto">
            <span>Based on research published in {paper.journal} ({paper.publishDate.split(' ').pop() || '2024'}). Created with Google AI Studio.</span>
            <span className="hidden md:inline">•</span>
            <button 
              onClick={() => { setEmbedMode(false); setPanelOpen(true); }}
              className="text-stone-500 hover:text-white underline transition-colors"
            >
              Get Embed Code for Google Sites
            </button>
        </div>
      </footer>

      {/* Floating Panel / Drawer Trigger Button */}
      {!hideCustomizer && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        {panelOpen ? (
          /* Floating Drawer Panel */
          <div className="w-[92vw] sm:w-[420px] max-h-[85vh] overflow-y-auto bg-theme-card border border-theme-border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-all duration-300 p-6 flex flex-col text-theme-main font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-theme-border mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded bg-theme-accent/15 text-theme-accent">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide uppercase">Integration & Styling</h3>
                  <p className="text-[10px] text-theme-muted font-mono leading-none">GOOGLE SITES COMPATIBLE</p>
                </div>
              </div>
              <button 
                onClick={() => setPanelOpen(false)}
                className="p-1 rounded-full hover:bg-theme-bg text-theme-muted hover:text-theme-main transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Presets Section */}
            <div className="mb-5">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2.5 flex items-center gap-1.5">
                <Sparkles size={11} className="text-theme-accent" />
                Cohesive Visual Presets
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveThemeKey('gold-cream');
                    setActiveFontHeadingKey('Playfair Display');
                    setActiveFontBodyKey('Inter');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeThemeKey === 'gold-cream' && activeFontHeadingKey === 'Playfair Display'
                      ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                      : 'border-theme-border hover:bg-theme-bg/50'
                  }`}
                >
                  <div className="font-bold text-xs">Sand & Gold</div>
                  <div className="text-[9px] text-theme-muted font-mono truncate">Editorial Serif</div>
                </button>
                <button
                  onClick={() => {
                    setActiveThemeKey('cosmic-slate');
                    setActiveFontHeadingKey('Space Grotesk');
                    setActiveFontBodyKey('Inter');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeThemeKey === 'cosmic-slate' && activeFontHeadingKey === 'Space Grotesk'
                      ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                      : 'border-theme-border hover:bg-theme-bg/50'
                  }`}
                >
                  <div className="font-bold text-xs">Cosmic Slate</div>
                  <div className="text-[9px] text-theme-muted font-mono truncate">Modern Tech</div>
                </button>
                <button
                  onClick={() => {
                    setActiveThemeKey('academic-indigo');
                    setActiveFontHeadingKey('Lora');
                    setActiveFontBodyKey('Inter');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeThemeKey === 'academic-indigo' && activeFontHeadingKey === 'Lora'
                      ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                      : 'border-theme-border hover:bg-theme-bg/50'
                  }`}
                >
                  <div className="font-bold text-xs">Academic Ink</div>
                  <div className="text-[9px] text-theme-muted font-mono truncate">Scholarly Paper</div>
                </button>
                <button
                  onClick={() => {
                    setActiveThemeKey('forest-emerald');
                    setActiveFontHeadingKey('JetBrains Mono');
                    setActiveFontBodyKey('JetBrains Mono');
                  }}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    activeThemeKey === 'forest-emerald' && activeFontHeadingKey === 'JetBrains Mono'
                      ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent'
                      : 'border-theme-border hover:bg-theme-bg/50'
                  }`}
                >
                  <div className="font-bold text-xs">Forest Emerald</div>
                  <div className="text-[9px] text-theme-muted font-mono truncate">Technical Lab</div>
                </button>
              </div>
            </div>

            {/* Customizer Tabs Navigation */}
            <div className="flex border-b border-theme-border mb-4 text-xs font-medium">
              <button 
                onClick={() => setCustomizerTab('style')}
                className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'style' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
              >
                Style
              </button>
              <button 
                onClick={() => setCustomizerTab('content')}
                className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'content' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
              >
                Edit Content
              </button>
              <button 
                onClick={() => setCustomizerTab('embed')}
                className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'embed' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
              >
                Embed
              </button>
              <button 
                onClick={() => setCustomizerTab('guide')}
                className={`flex-1 py-1.5 text-center border-b-2 transition-colors ${customizerTab === 'guide' ? 'border-theme-accent text-theme-accent font-semibold' : 'border-transparent text-theme-muted hover:text-theme-main'}`}
              >
                Guide
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1">
              
              {/* STYLE TAB */}
              {customizerTab === 'style' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  {/* Theme Selector */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2">Color Scheme Palette</label>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(THEMES).map(([key, t]) => (
                        <button
                          key={key}
                          onClick={() => setActiveThemeKey(key as any)}
                          className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                            activeThemeKey === key ? 'border-theme-accent bg-theme-accent/5 ring-1 ring-theme-accent' : 'border-theme-border hover:bg-theme-bg/50'
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-theme-border/50 flex-shrink-0 flex items-center justify-center" 
                            style={{ backgroundColor: t.bg }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.accent }}></span>
                          </span>
                          <span className="font-medium text-xs truncate">{t.name.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Heading Font */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2">Header Font (Serif)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(FONTS_HEADING).map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFontHeadingKey(f as any)}
                          className={`px-2.5 py-1.5 rounded border text-[11px] transition-all font-serif ${
                            activeFontHeadingKey === f ? 'border-theme-accent bg-theme-accent/5 text-theme-accent font-bold' : 'border-theme-border hover:bg-theme-bg/50 text-theme-body'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Body Font */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-theme-muted mb-2">Body Font (Sans)</label>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.keys(FONTS_BODY).map((f) => (
                        <button
                          key={f}
                          onClick={() => setActiveFontBodyKey(f as any)}
                          className={`px-2.5 py-1.5 rounded border text-[11px] transition-all font-sans ${
                            activeFontBodyKey === f ? 'border-theme-accent bg-theme-accent/5 text-theme-accent font-bold' : 'border-theme-border hover:bg-theme-bg/50 text-theme-body'
                          }`}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reset to defaults */}
                  <div className="pt-2 border-t border-theme-border flex justify-end">
                    <button 
                      onClick={handleResetStyle}
                      className="flex items-center gap-1 px-3 py-1.5 rounded text-theme-muted hover:text-theme-main hover:bg-theme-bg transition-colors"
                    >
                      <RefreshCw size={12} />
                      <span>Reset Styles</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CONTENT TAB */}
              {customizerTab === 'content' && (
                <div className="space-y-4 animate-fade-in text-xs max-h-[50vh] overflow-y-auto pr-1 pb-4">
                  <div className="p-3 bg-theme-accent/5 border border-theme-accent/20 rounded-xl mb-2">
                    <h5 className="font-bold text-[11px] text-theme-accent mb-1 flex items-center gap-1">
                      <Sparkles size={12} />
                      Academic Paper Editor
                    </h5>
                    <p className="text-[10px] text-theme-muted leading-relaxed">
                      Customize the text content of this interactive applet for your own academic work. Changes apply instantly and persist in your browser.
                    </p>
                  </div>

                  {/* RESET BUTTON */}
                  <div className="flex justify-end">
                    <button 
                      onClick={resetPaperData}
                      className="text-[10px] text-theme-muted hover:text-red-500 font-semibold flex items-center gap-1 transition-colors border border-theme-border/60 rounded px-2 py-1 bg-theme-bg/40"
                    >
                      <RefreshCw size={10} />
                      Reset to AlphaQubit
                    </button>
                  </div>

                  {/* SECTION: GENERAL METADATA */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">1. Paper Metadata</h4>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Paper Title</label>
                        <input 
                          type="text" 
                          value={paper.title} 
                          onChange={(e) => updatePaperField('title', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                          placeholder="e.g. My Custom Paper"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Subtitle / Research Goal</label>
                        <input 
                          type="text" 
                          value={paper.subtitle} 
                          onChange={(e) => updatePaperField('subtitle', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                          placeholder="e.g. A New Approach to ..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Journal / Conference</label>
                          <input 
                            type="text" 
                            value={paper.journal} 
                            onChange={(e) => updatePaperField('journal', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                            placeholder="e.g. Nature"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Publish Date</label>
                          <input 
                            type="text" 
                            value={paper.publishDate} 
                            onChange={(e) => updatePaperField('publishDate', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main animate-none"
                            placeholder="e.g. Nov 2026"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">DOI or Web URL</label>
                        <input 
                          type="text" 
                          value={paper.doiUrl} 
                          onChange={(e) => updatePaperField('doiUrl', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main font-mono text-[10px]"
                          placeholder="e.g. https://doi.org/..."
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Abstract / Hero Description</label>
                        <textarea 
                          rows={3}
                          value={paper.description} 
                          onChange={(e) => updatePaperField('description', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                          placeholder="Brief high-level summary of the paper..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION: INTRODUCTION */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">2. Section 1: Introduction</h4>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Intro Section Title</label>
                        <input 
                          type="text" 
                          value={paper.introTitle} 
                          onChange={(e) => updatePaperField('introTitle', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3">
                          <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Dropcap</label>
                          <input 
                            type="text" 
                            maxLength={1}
                            value={paper.introDropcap} 
                            onChange={(e) => updatePaperField('introDropcap', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main text-center font-bold font-serif text-base"
                          />
                        </div>
                        <div className="col-span-9">
                          <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Intro Paragraph 1 (Continues Dropcap)</label>
                          <textarea 
                            rows={2}
                            value={paper.introText1} 
                            onChange={(e) => updatePaperField('introText1', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Intro Paragraph 2</label>
                        <textarea 
                          rows={3}
                          value={paper.introText2} 
                          onChange={(e) => updatePaperField('introText2', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION: SYSTEM / SCIENCE */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">3. Section 2: Core System</h4>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">System Section Title</label>
                        <input 
                          type="text" 
                          value={paper.scienceTitle} 
                          onChange={(e) => updatePaperField('scienceTitle', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Paragraph 1</label>
                        <textarea 
                          rows={3}
                          value={paper.scienceText1} 
                          onChange={(e) => updatePaperField('scienceText1', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Paragraph 2</label>
                        <textarea 
                          rows={3}
                          value={paper.scienceText2} 
                          onChange={(e) => updatePaperField('scienceText2', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION: INNOVATION & RESULTS */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">4. Section 3: Innovation & Results</h4>
                    <div className="space-y-2.5">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Badge</label>
                          <input 
                            type="text" 
                            value={paper.innovationBadge} 
                            onChange={(e) => updatePaperField('innovationBadge', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Title</label>
                          <input 
                            type="text" 
                            value={paper.innovationTitle} 
                            onChange={(e) => updatePaperField('innovationTitle', e.target.value)}
                            className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Desc 1</label>
                        <textarea 
                          rows={3}
                          value={paper.innovationText1} 
                          onChange={(e) => updatePaperField('innovationText1', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Innovation Desc 2</label>
                        <textarea 
                          rows={3}
                          value={paper.innovationText2} 
                          onChange={(e) => updatePaperField('innovationText2', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Results Section Title</label>
                        <input 
                          type="text" 
                          value={paper.resultsTitle} 
                          onChange={(e) => updatePaperField('resultsTitle', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Results Text Summary</label>
                        <textarea 
                          rows={3}
                          value={paper.resultsText} 
                          onChange={(e) => updatePaperField('resultsText', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION: IMPACT & QUOTE */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">5. Section 4: Impact & Key Quote</h4>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Impact Title</label>
                        <input 
                          type="text" 
                          value={paper.impactTitle} 
                          onChange={(e) => updatePaperField('impactTitle', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Impact Text 1</label>
                        <textarea 
                          rows={3}
                          value={paper.impactText1} 
                          onChange={(e) => updatePaperField('impactText1', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Impact Text 2</label>
                        <textarea 
                          rows={3}
                          value={paper.impactText2} 
                          onChange={(e) => updatePaperField('impactText2', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Featured Quote</label>
                        <textarea 
                          rows={3}
                          value={paper.quote} 
                          onChange={(e) => updatePaperField('quote', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main resize-none italic"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-theme-muted mb-1 font-semibold uppercase">Quote Author / Citation</label>
                        <input 
                          type="text" 
                          value={paper.quoteAuthor} 
                          onChange={(e) => updatePaperField('quoteAuthor', e.target.value)}
                          className="w-full p-2 text-xs rounded-lg border border-theme-border bg-theme-bg text-theme-main"
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION: FIGURES & DIAGRAMS */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2.5 flex items-center gap-1.5">
                      <Layers size={11} className="text-theme-accent" />
                      6. Figures & Diagrams
                    </h4>
                    <p className="text-[10px] text-theme-muted leading-relaxed mb-3">
                      Select which visual aids to include in the draft and customize their underlying simulation parameters or labels.
                    </p>

                    <div className="space-y-3 mb-4">
                      {/* Figure 1 */}
                      <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[11px] text-theme-main">Fig 1: Surface Code Simulator</span>
                          <button
                            onClick={() => updatePaperField('showFigSurfaceCode', !paper.showFigSurfaceCode)}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${paper.showFigSurfaceCode ? 'bg-theme-accent' : 'bg-theme-border'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${paper.showFigSurfaceCode ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        {paper.showFigSurfaceCode && (
                          <div className="mt-2.5 space-y-2 border-t border-theme-border/40 pt-2.5 animate-fade-in">
                            <div>
                              <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Diagram Title</label>
                              <input 
                                type="text" 
                                value={paper.diagram1Title} 
                                onChange={(e) => updatePaperField('diagram1Title', e.target.value)}
                                className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Interactive Guide</label>
                              <textarea 
                                rows={2}
                                value={paper.diagram1Desc} 
                                onChange={(e) => updatePaperField('diagram1Desc', e.target.value)}
                                className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main resize-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Qubit Label</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram1DataLabel} 
                                  onChange={(e) => updatePaperField('diagram1DataLabel', e.target.value)}
                                  className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Stabilizer Label</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram1StabilizerLabel} 
                                  onChange={(e) => updatePaperField('diagram1StabilizerLabel', e.target.value)}
                                  className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Figure 2 */}
                      <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[11px] text-theme-main">Fig 2: Architecture Layout</span>
                          <button
                            onClick={() => updatePaperField('showFigTransformer', !paper.showFigTransformer)}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${paper.showFigTransformer ? 'bg-theme-accent' : 'bg-theme-border'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${paper.showFigTransformer ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        {paper.showFigTransformer && (
                          <div className="mt-2.5 space-y-2 border-t border-theme-border/40 pt-2.5 animate-fade-in">
                            <div>
                              <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Diagram Title</label>
                              <input 
                                type="text" 
                                value={paper.diagram2Title} 
                                onChange={(e) => updatePaperField('diagram2Title', e.target.value)}
                                className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Architecture Summary</label>
                              <textarea 
                                rows={2}
                                value={paper.diagram2Desc} 
                                onChange={(e) => updatePaperField('diagram2Desc', e.target.value)}
                                className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main resize-none"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Input Stage</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram2InputLabel} 
                                  onChange={(e) => updatePaperField('diagram2InputLabel', e.target.value)}
                                  className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Core Model</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram2ModelLabel} 
                                  onChange={(e) => updatePaperField('diagram2ModelLabel', e.target.value)}
                                  className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Output Stage</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram2OutputLabel} 
                                  onChange={(e) => updatePaperField('diagram2OutputLabel', e.target.value)}
                                  className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Figure 3 */}
                      <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[11px] text-theme-main">Fig 3: Performance Chart</span>
                          <button
                            onClick={() => updatePaperField('showFigPerformance', !paper.showFigPerformance)}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${paper.showFigPerformance ? 'bg-theme-accent' : 'bg-theme-border'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${paper.showFigPerformance ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                        {paper.showFigPerformance && (
                          <div className="mt-2.5 space-y-2 border-t border-theme-border/40 pt-2.5 animate-fade-in">
                            <div>
                              <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Diagram Title</label>
                              <input 
                                type="text" 
                                value={paper.diagram3Title} 
                                onChange={(e) => updatePaperField('diagram3Title', e.target.value)}
                                className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                              />
                            </div>
                            <div>
                              <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Performance Summary</label>
                              <textarea 
                                rows={2}
                                value={paper.diagram3Desc} 
                                onChange={(e) => updatePaperField('diagram3Desc', e.target.value)}
                                className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main resize-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Baseline Method</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram3LabelStandard} 
                                  onChange={(e) => updatePaperField('diagram3LabelStandard', e.target.value)}
                                  className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-theme-muted mb-0.5 font-semibold uppercase">Our Proposed Method</label>
                                <input 
                                  type="text" 
                                  value={paper.diagram3LabelOurs} 
                                  onChange={(e) => updatePaperField('diagram3LabelOurs', e.target.value)}
                                  className="w-full p-1.5 text-[11px] rounded border border-theme-border bg-theme-bg text-theme-main"
                                />
                              </div>
                            </div>
                            <div className="p-2 bg-theme-bg/80 border border-theme-border rounded-lg space-y-1.5">
                              <span className="block text-[9px] font-bold text-theme-accent uppercase tracking-wider">Custom Logical Error Rates (%)</span>
                              <div className="grid grid-cols-3 gap-1.5 text-[8px] text-theme-muted font-bold uppercase text-center">
                                <div>D=3</div>
                                <div>D=5</div>
                                <div>D=11</div>
                              </div>
                              <div className="grid grid-cols-3 gap-1.5">
                                <div className="space-y-1">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={paper.lerD3Standard} 
                                    onChange={(e) => updatePaperField('lerD3Standard', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-muted font-mono text-center"
                                    placeholder="MWPM"
                                    title="Standard LER Distance 3"
                                  />
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={paper.lerD3Ours} 
                                    onChange={(e) => updatePaperField('lerD3Ours', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-accent font-mono font-semibold text-center"
                                    placeholder="Ours"
                                    title="Ours LER Distance 3"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={paper.lerD5Standard} 
                                    onChange={(e) => updatePaperField('lerD5Standard', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-muted font-mono text-center"
                                    placeholder="MWPM"
                                    title="Standard LER Distance 5"
                                  />
                                  <input 
                                    type="number" 
                                    step="0.01"
                                    value={paper.lerD5Ours} 
                                    onChange={(e) => updatePaperField('lerD5Ours', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-accent font-mono font-semibold text-center"
                                    placeholder="Ours"
                                    title="Ours LER Distance 5"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <input 
                                    type="number" 
                                    step="0.0001"
                                    value={paper.lerD11Standard} 
                                    onChange={(e) => updatePaperField('lerD11Standard', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-muted font-mono text-center"
                                    placeholder="MWPM"
                                    title="Standard LER Distance 11"
                                  />
                                  <input 
                                    type="number" 
                                    step="0.0001"
                                    value={paper.lerD11Ours} 
                                    onChange={(e) => updatePaperField('lerD11Ours', parseFloat(e.target.value) || 0)}
                                    className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-accent font-mono font-semibold text-center"
                                    placeholder="Ours"
                                    title="Ours LER Distance 11"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Figure 4 */}
                      <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border/60">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-[11px] text-theme-main">Fig 4: Cryostat 3D Visualizer</span>
                          <button
                            onClick={() => updatePaperField('showFigCryostat', !paper.showFigCryostat)}
                            className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${paper.showFigCryostat ? 'bg-theme-accent' : 'bg-theme-border'}`}
                          >
                            <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${paper.showFigCryostat ? 'translate-x-4.5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION: AUTHORS */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-2">7. Research Contributors</h4>
                    <div className="space-y-2">
                      {paper.authors.map((auth, index) => (
                        <div key={index} className="flex gap-1 items-center bg-theme-bg/40 p-1.5 rounded border border-theme-border/50">
                          <div className="flex-1 space-y-1">
                            <input 
                              type="text" 
                              value={auth.name} 
                              onChange={(e) => {
                                const newAuthors = [...paper.authors];
                                newAuthors[index].name = e.target.value;
                                updatePaperField('authors', newAuthors);
                              }}
                              className="w-full p-1 text-[10px] rounded border border-theme-border bg-theme-bg text-theme-main"
                              placeholder="Contributor Name"
                            />
                            <input 
                              type="text" 
                              value={auth.role} 
                              onChange={(e) => {
                                const newAuthors = [...paper.authors];
                                newAuthors[index].role = e.target.value;
                                updatePaperField('authors', newAuthors);
                              }}
                              className="w-full p-1 text-[9px] rounded border border-theme-border bg-theme-bg text-theme-muted"
                              placeholder="Affiliation / Role"
                            />
                          </div>
                          <button 
                            onClick={() => {
                              const newAuthors = paper.authors.filter((_, i) => i !== index);
                              updatePaperField('authors', newAuthors);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded transition-colors self-stretch flex items-center justify-center animate-none"
                            title="Remove Author"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      <button 
                        onClick={() => updatePaperField('authors', [...paper.authors, { name: '', role: '' }])}
                        className="w-full py-1.5 mt-1 border border-dashed border-theme-accent/40 rounded-lg text-theme-accent hover:bg-theme-accent/5 text-[10px] font-bold transition-all text-center"
                      >
                        + Add New Contributor
                      </button>
                    </div>
                  </div>

                  {/* SECTION: TS CODE EXPORT */}
                  <div className="border-t border-theme-border/50 pt-3">
                    <h4 className="font-bold text-[11px] uppercase tracking-wider text-theme-muted mb-1 flex items-center gap-1">
                      <Code size={11} />
                      Export TypeScript Configuration
                    </h4>
                    <p className="text-[9px] text-theme-muted leading-relaxed mb-2">
                      Copy this structure to overwrite the hardcoded contents in <code className="font-mono bg-theme-bg px-1 rounded">/src/paperData.ts</code> for a static deployment:
                    </p>
                    <div className="relative">
                      <pre className="p-2.5 bg-stone-950 text-stone-300 font-mono text-[9px] rounded-lg overflow-x-auto max-h-40 overflow-y-auto select-all leading-normal whitespace-pre-wrap">
                        {`export const customPaperData: PaperData = ${JSON.stringify(paper, null, 2)};`}
                      </pre>
                    </div>
                  </div>

                </div>
              )}

              {/* EMBED TAB */}
              {customizerTab === 'embed' && (
                <div className="space-y-4 animate-fade-in text-xs">
                  {/* Embed Layout Mode Toggle */}
                  <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Layers size={14} className="text-theme-accent" />
                        <span className="font-bold text-xs">Compact Embed Mode</span>
                      </div>
                      <button
                        onClick={() => setEmbedMode(!embedMode)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${embedMode ? 'bg-theme-accent' : 'bg-theme-border'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${embedMode ? 'translate-x-5.5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-theme-muted leading-relaxed">
                      Hides standard top-navbar, adjusts page paddings, and optimizes margins. Toggle this to preview how seamless it will look inside Google Sites!
                    </p>
                  </div>

                  {/* Hide Controls Option for Visitors */}
                  <div className="p-3 bg-theme-bg/60 rounded-xl border border-theme-border">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <EyeOff size={14} className="text-theme-accent" />
                        <span className="font-bold text-xs">Hide Customizer for Visitors</span>
                      </div>
                      <button
                        onClick={() => setVisitorControlsEnabled(!visitorControlsEnabled)}
                        className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${!visitorControlsEnabled ? 'bg-theme-accent' : 'bg-theme-border'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${!visitorControlsEnabled ? 'translate-x-5.5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                    <p className="text-[10px] text-theme-muted leading-relaxed">
                      When enabled, the floating customizer panel is completely hidden from page visitors, presenting a perfectly clean, professional layout.
                    </p>
                  </div>

                  {/* Direct Embed URL */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">Direct Embed URL</span>
                      <button 
                        onClick={handleCopyUrl}
                        className="text-theme-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]"
                      >
                        {copiedUrl ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                        <span>{copiedUrl ? 'Copied' : 'Copy URL'}</span>
                      </button>
                    </div>
                    <div className="p-2 bg-theme-bg border border-theme-border rounded-lg font-mono text-[10px] text-theme-body break-all max-h-16 overflow-y-auto select-all">
                      {getEmbedUrl()}
                    </div>
                  </div>

                  {/* Full iframe Code */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-theme-muted">iframe HTML Code</span>
                      <button 
                        onClick={handleCopyEmbed}
                        className="text-theme-accent hover:underline flex items-center gap-0.5 font-semibold text-[10px]"
                      >
                        {copiedEmbed ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
                        <span>{copiedEmbed ? 'Copied' : 'Copy Code'}</span>
                      </button>
                    </div>
                    <div className="p-2 bg-theme-bg border border-theme-border rounded-lg font-mono text-[10px] text-theme-body break-all max-h-24 overflow-y-auto select-all leading-normal">
                      {getIframeCode()}
                    </div>
                  </div>
                </div>
              )}

              {/* GUIDE TAB */}
              {customizerTab === 'guide' && (
                <div className="space-y-3.5 animate-fade-in text-[11px] text-theme-body leading-relaxed">
                  <div className="p-3 bg-theme-accent/5 border border-theme-accent/20 rounded-xl">
                    <h5 className="font-bold text-xs text-theme-accent mb-1 flex items-center gap-1">
                      <Info size={13} />
                      Adding to Google Sites is incredibly easy!
                    </h5>
                    <p className="text-[10px] text-theme-muted leading-relaxed">
                      Follow these simple steps to integrate this interactive presentation perfectly:
                    </p>
                  </div>
                  
                  <ol className="space-y-2.5 list-decimal list-inside px-1">
                    <li>
                      Go to the <span className="font-semibold text-theme-main">Google Sites Embed tab</span> above and click <span className="font-semibold text-theme-accent">Copy Code</span> (or Copy URL).
                    </li>
                    <li>
                      Open your Google Sites editor page, locate the sidebar panel on the right, and choose <span className="font-semibold text-theme-main">Embed</span> under the Insert menu.
                    </li>
                    <li>
                      In the popup, click on the <span className="font-semibold text-theme-main">Embed code</span> tab (if you copied the iframe snippet) or keep <span className="font-semibold text-theme-main">By URL</span> (if you copied the direct URL).
                    </li>
                    <li>
                      Paste the code/URL into the box and click <span className="font-semibold text-theme-accent font-bold">Next</span>, then click <span className="font-semibold text-theme-accent font-bold">Insert</span>.
                    </li>
                    <li>
                      Drag the corner handles of the newly created card on your Google Site page to resize it so that the content displays beautifully without scrollbars!
                    </li>
                  </ol>

                  <div className="pt-2 text-[10px] text-theme-muted border-t border-theme-border italic">
                    Tip: Dynamic options are encoded in the URL, so any style toggles you make here are automatically preserved in the generated code!
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          /* Sleek FAB Trigger Button when closed */
          <button 
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-theme-accent text-white rounded-full shadow-lg hover:shadow-xl hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 cursor-pointer text-xs font-bold uppercase tracking-wider select-none border border-white/10"
            id="styling-customizer-trigger"
          >
            <Palette size={16} className="animate-pulse" />
            <span>Customize Style & Google Sites</span>
          </button>
        )}
      </div>
      )}

    </div>
  );
};

export default App;
