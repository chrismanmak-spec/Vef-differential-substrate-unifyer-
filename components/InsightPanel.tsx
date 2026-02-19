
import React from 'react';
import { StrategicInsight } from '../types';

interface InsightPanelProps {
  insights: StrategicInsight[];
}

const InsightPanel: React.FC<InsightPanelProps> = ({ insights }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-sky-500 rounded-full"></div>
        <h3 className="text-[10px] font-mono font-black text-sky-400 uppercase tracking-[0.4em]">Automated Projections</h3>
      </div>
      {insights.map((insight, i) => (
        <div key={i} className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl group hover:border-indigo-500/30 transition-all duration-500">
          <div className="flex justify-between items-start mb-3">
            <span className={`text-[8px] font-mono uppercase px-2 py-0.5 rounded border ${
              insight.type === 'prediction' ? 'border-sky-500/30 text-sky-400 bg-sky-500/5' : 
              insight.type === 'optimization' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
              'border-indigo-500/30 text-indigo-400 bg-indigo-500/5'
            }`}>
              {insight.type.replace('_', ' ')}
            </span>
            <span className="text-[8px] font-mono text-slate-600 uppercase font-black tracking-tighter">Confidence: {insight.confidence}%</span>
          </div>
          <h4 className="text-sm font-black text-slate-100 mb-2 tracking-tight group-hover:text-white transition-colors">{insight.title}</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed font-light">{insight.projection}</p>
        </div>
      ))}
    </div>
  );
};

export default InsightPanel;
