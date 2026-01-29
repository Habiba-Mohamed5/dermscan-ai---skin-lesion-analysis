
import React from 'react';
import { AnalysisResult, DiagnosisLabel } from '../types';
import { translations, Language } from '../translations';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Info, Activity, ZoomIn, Scissors, Palette, Maximize, Clock } from 'lucide-react';

interface AnalysisDashboardProps {
  result: AnalysisResult;
  imageUrl: string;
  lang: Language;
}

const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result, imageUrl, lang }) => {
  const t = translations[lang];
  const isMalignant = result.label === DiagnosisLabel.MALIGNANT;
  const displayLabel = isMalignant ? t.malignant : t.benign;
  
  const chartData = [
    { name: t.aiConfidence, value: result.confidence },
    { name: 'Uncertainty', value: 100 - result.confidence },
  ];

  const COLORS = [isMalignant ? '#ef4444' : '#10b981', '#e2e8f0'];

  const ABCDE_ICONS = {
    asymmetry: <Activity className="w-5 h-5" />,
    border: <Scissors className="w-5 h-5" />,
    color: <Palette className="w-5 h-5" />,
    diameter: <Maximize className="w-5 h-5" />,
    evolving: <Clock className="w-5 h-5" />
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Image and Main Diagnosis */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <h3 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">{t.inputSpecimen}</h3>
            <img 
              src={imageUrl} 
              alt="Uploaded lesion" 
              className="w-full h-64 object-cover rounded-2xl shadow-inner border border-slate-100"
            />
          </div>

          <div className={`p-6 rounded-3xl shadow-sm border ${isMalignant ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-3 mb-4">
              {isMalignant ? (
                <AlertTriangle className="text-red-600 w-8 h-8" />
              ) : (
                <CheckCircle className="text-emerald-600 w-8 h-8" />
              )}
              <h2 className="text-2xl font-bold text-slate-800">
                {displayLabel}
              </h2>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {result.description}
            </p>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center -mt-28 mb-16">
                <span className="text-3xl font-bold text-slate-800">{result.confidence}%</span>
                <p className="text-xs text-slate-500 font-medium">{t.aiConfidence}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ZoomIn className="w-6 h-6 text-indigo-500" />
              {t.clinicalAbcde}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(result.abcdeAnalysis).map(([key, value]) => (
                <div key={key} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors">
                  <div className="bg-white p-3 rounded-xl shadow-sm text-indigo-500 self-start">
                    {ABCDE_ICONS[key as keyof typeof ABCDE_ICONS] || <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 capitalize">{key}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-indigo-900 p-8 rounded-3xl shadow-xl text-white">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-indigo-300" />
              {t.protocol}
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 text-indigo-100 text-sm">
                  <span className="bg-indigo-700/50 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                  {rec}
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 bg-white/10 rounded-2xl border border-white/10">
              <p className="text-[10px] text-white/60 uppercase font-bold tracking-widest mb-1">{t.disclaimerTitle}</p>
              <p className="text-[11px] text-indigo-200 leading-tight">
                {t.disclaimerBody}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
