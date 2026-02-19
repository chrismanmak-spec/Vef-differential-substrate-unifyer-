
import React from 'react';
import { AnomalyResolution } from '../types';

interface AnomalyMatrixProps {
  anomalies: AnomalyResolution[];
}

const AnomalyMatrix: React.FC<AnomalyMatrixProps> = ({ anomalies }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {anomalies.map((item, i) => (
        <div key={i} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl hover:border-sky-500/40 transition-all group relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
            <span className="text-[40px] font-black text-slate-700 pointer-events-none select-none">{(i + 1).toString().padStart(2, '0')}</span>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-2 gap-2">
              <h5 className="text-[10px] font-mono text-sky-400 font-extrabold uppercase tracking-widest leading-tight">{item.observable}</h5>
              <div className={`w-1.5 h-1.5 rounded-full mt-1 ${item.status === 'resolved' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}></div>
            </div>

            <div className="space-y-3 mb-4">
              <div>
                <span className="text-[7px] uppercase text-slate-600 font-black tracking-widest block mb-1">SM Issue</span>
                <p className="text-[10px] text-slate-500 leading-tight font-medium">{item.smIssue}</p>
              </div>
              <div className="p-2 bg-black/30 rounded border border-white/5">
                <span className="text-[7px] uppercase text-indigo-400 font-black tracking-widest block mb-1">VEF Resolution</span>
                <p className="text-[10px] text-slate-300 leading-tight italic">"{item.vefResolution}"</p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/50 mt-auto flex justify-between items-center">
             <span className="text-[8px] font-mono text-sky-500/80 font-bold uppercase tracking-tighter">{item.keyFeature}</span>
             <span className="text-[8px] font-mono text-slate-700 uppercase">{item.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnomalyMatrix;
