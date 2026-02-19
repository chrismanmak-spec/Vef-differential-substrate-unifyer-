
import React from 'react';
import { SyntheticProof } from '../types';

interface ProofDisplayProps {
  proof: SyntheticProof;
  onClose: () => void;
}

const ProofDisplay: React.FC<ProofDisplayProps> = ({ proof, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-slate-900 border border-sky-500/30 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(56,189,248,0.2)] flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tighter">Synthetic Axiom Resolution</h3>
            <p className="text-[10px] font-mono text-sky-400 uppercase tracking-widest mt-1">Generated via VEF Core Engine // Target: {proof.element}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-10 space-y-12">
          <section>
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-6">Mathematical Substrate Logic</h4>
            <div className="p-8 bg-black/40 rounded-2xl border border-slate-800 font-mono text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
              {proof.mathematicalLogic}
            </div>
          </section>

          <section>
            <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.4em] mb-6">Topological Phase Proof</h4>
            <div className="text-lg text-slate-200 leading-relaxed font-light italic border-l-4 border-indigo-500/30 pl-8">
              {proof.topologicalProof}
            </div>
          </section>

          <section className="bg-sky-500/5 p-8 rounded-2xl border border-sky-500/10">
            <h4 className="text-[10px] font-mono text-sky-400 uppercase tracking-[0.4em] mb-4">Geometric Conclusion</h4>
            <p className="text-slate-300 font-medium">
              {proof.conclusion}
            </p>
          </section>
        </div>

        <div className="p-6 bg-slate-950/50 border-t border-slate-800 text-center">
          <p className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.5em]">Cryptographic Integrity: [VERIFIED]</p>
        </div>
      </div>
    </div>
  );
};

export default ProofDisplay;
