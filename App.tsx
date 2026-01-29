
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Upload, Plus, History, Beaker, ShieldCheck, User, Github, Globe } from 'lucide-react';
import { analyzeSkinLesion } from './services/geminiService';
import { AnalysisResult, AnalysisHistory } from './types';
import { translations, Language } from './translations';
import AnalysisDashboard from './components/AnalysisDashboard';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentResult, setCurrentResult] = useState<AnalysisResult | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setCurrentImage(base64);
      setCurrentResult(null);
      setIsAnalyzing(true);
      
      try {
        const result = await analyzeSkinLesion(base64, lang);
        setCurrentResult(result);
        
        const newHistoryItem: AnalysisHistory = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US'),
          imageUrl: base64,
          result: result
        };
        setHistory(prev => [newHistoryItem, ...prev]);
      } catch (error) {
        console.error("Analysis failed:", error);
        alert(lang === 'ar' ? "فشل التحليل. يرجى التحقق من اتصالك والمحاولة مرة أخرى." : "System encountered an error during analysis. Please check your connection and try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetAnalysis = () => {
    setCurrentImage(null);
    setCurrentResult(null);
    setIsAnalyzing(false);
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'ar' : 'en');
  };

  return (
    <div className={`min-h-screen flex flex-col ${lang === 'ar' ? 'font-sans' : ''}`}>
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
                <Beaker className="text-white w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">{t.title}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{t.subtitle}</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => setShowHistory(false)}
                className={`text-sm font-medium transition-colors ${!showHistory ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'}`}
              >
                {t.dashboard}
              </button>
              <button 
                onClick={() => setShowHistory(true)}
                className={`text-sm font-medium transition-colors ${showHistory ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-900'} flex items-center gap-2`}
              >
                <History className="w-4 h-4" />
                {t.history}
              </button>
              <div className="h-6 w-px bg-slate-200 mx-2" />
              
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-xs font-bold"
              >
                <Globe className="w-4 h-4" />
                {lang === 'en' ? 'العربية' : 'English'}
              </button>

              <div className="flex items-center gap-3 text-slate-600 border-l border-slate-200 pl-6 rtl:border-l-0 rtl:border-r rtl:pl-0 rtl:pr-6">
                <User className="w-5 h-5" />
                <span className="text-sm font-semibold">Habiba Mohamed</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {showHistory ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold text-slate-900 mb-8">{t.archives}</h2>
            {history.length === 0 ? (
              <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <History className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{t.noHistory}</h3>
                <p className="text-slate-500 max-w-sm mx-auto">{t.noHistoryDesc}</p>
                <button 
                  onClick={() => setShowHistory(false)}
                  className="mt-8 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                >
                  {t.returnDashboard}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {history.map((item) => (
                  <div key={item.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="relative mb-4">
                      <img src={item.imageUrl} alt="Archived" className="w-full h-48 object-cover rounded-2xl" />
                      <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${item.result.label === 'Malignant' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {item.result.label === 'Malignant' ? t.malignant : t.benign}
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-2">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{item.date}</p>
                        <p className="text-lg font-bold text-slate-900">{item.result.confidence}% {t.aiConfidence}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setCurrentImage(item.imageUrl);
                          setCurrentResult(item.result);
                          setShowHistory(false);
                        }}
                        className="p-2 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors"
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            {/* Hero Section */}
            {!currentImage && (
              <div className="text-center max-w-3xl mx-auto py-12">
                <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-700 font-bold text-xs uppercase tracking-widest mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  {t.crossRef}
                </div>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                  {t.heroTitle} <br/><span className="text-indigo-600">{t.heroTitleSpan}</span>
                </h1>
                <p className="text-lg text-slate-500 leading-relaxed mb-10 px-4">
                  {t.heroDesc}
                </p>

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative cursor-pointer mx-auto max-w-xl p-10 rounded-[40px] border-2 border-dashed border-indigo-200 bg-white hover:border-indigo-400 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-100"
                >
                  <div className="bg-indigo-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Upload className="w-10 h-10 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{t.initScanner}</h3>
                  <p className="text-slate-500 text-sm">{t.dropHint}</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                </div>
              </div>
            )}

            {/* Analysis State */}
            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <div className="relative">
                  <div className="w-32 h-32 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600 font-bold">AI</div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mt-8 mb-2">{t.analyzing}</h3>
                <p className="text-slate-500">{t.crossRef}</p>
              </div>
            )}

            {/* Results Section */}
            {currentResult && currentImage && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={resetAnalysis}
                      className="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-colors shadow-sm"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900">{t.reportTitle}</h2>
                  </div>
                  <button className="text-sm font-bold text-indigo-600 hover:underline">{t.downloadPdf}</button>
                </div>
                
                <AnalysisDashboard result={currentResult} imageUrl={currentImage} lang={lang} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Beaker className="text-indigo-400 w-6 h-6" />
                <span className="text-xl font-bold text-white tracking-tight">{t.title}</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs text-slate-500">
                Pioneering AI-driven diagnostic assistance for oncology students and healthcare professionals.
              </p>
            </div>
            
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">94%</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t.accuracy}</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-white mb-1">2ms</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t.latency}</p>
              </div>
            </div>

            <div className="flex md:justify-end gap-4 items-center">
              <a href="#" className="p-3 bg-slate-800 rounded-2xl hover:bg-slate-700 transition-colors">
                <Github className="w-5 h-5 text-white" />
              </a>
              <div className="text-right rtl:text-left">
                <p className="text-xs font-bold text-white">{t.developedBy}</p>
                <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">{t.studentInfo}</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.2em]">
              Copyright &copy; 2025 {t.title} Research Group. All Rights Reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
