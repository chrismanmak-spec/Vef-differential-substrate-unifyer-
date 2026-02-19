
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VEFAnalysis, SyntheticProof } from './types';
import { analyzeVEFModel, synthesizeMissingAxiom } from './services/geminiService';
import InfoCard from './components/InfoCard';
import SimplexMesh from './components/SimplexMesh';
import AnomalyMatrix from './components/AnomalyMatrix';
import ProofDisplay from './components/ProofDisplay';
import InsightPanel from './components/InsightPanel';

const DEFAULT_IMAGE_URL = "https://images.lumacdn.com/cdn-cgi/image/format=auto,fit=cover,dpr=2,quality=75,width=620,height=310/event-covers/q4/3685f67e-128c-4f10-908a-b94f1082c505.png";

function App() {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState<string>("");
  const [analysis, setAnalysis] = useState<VEFAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(DEFAULT_IMAGE_URL);
  const [syntheticProof, setSyntheticProof] = useState<SyntheticProof | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getBase64Data = async (url: string): Promise<string> => {
    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.contents?.includes('base64,')) return data.contents.split('base64,')[1];
      }
    } catch (e) {}
    try {
      const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`);
      if (res.ok) return await blobToBase64(await res.blob());
    } catch (e) {}
    throw new Error("Handshake failed. Protocol data retrieval timed out.");
  };

  const processAnalysis = async (base64: string) => {
    setLoading(true);
    setError(null);
    try {
      setLoadingStage("Resolving 15 SM Anomaly Vectors...");
      const result = await analyzeVEFModel(base64);
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || "Substrate decryption parity error.");
    } finally {
      setLoading(false);
      setLoadingStage("");
    }
  };

  const performInitialAnalysis = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLoadingStage("Initializing VEF Protocol Sync...");
    try {
      const base64 = await getBase64Data(DEFAULT_IMAGE_URL);
      await processAnalysis(base64);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  const handleSynthesize = async (element: string) => {
    setIsSynthesizing(true);
    try {
      const proof = await synthesizeMissingAxiom(element);
      setSyntheticProof(proof);
    } catch (err) {
      console.error("Synthesis failed", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      await processAnalysis(result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    performInitialAnalysis();
  }, [performInitialAnalysis]);

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-sky-500/30">
      {syntheticProof && <ProofDisplay proof={syntheticProof} onClose={() => setSyntheticProof(null)} />}
      
      <header className="w-full max-w-screen-2xl mx-auto py-12 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between border-b border-slate-900/50 mb-12">
        <div className="flex flex-col">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-r from-sky-400 via-indigo-300 to-sky-500 bg-clip-text text-transparent drop-shadow-2xl">
            VEF MASTER PROTOCOL
          </h1>
          <p className="text-slate-600 font-mono text-[10px] mt-4 tracking-[0.5em] uppercase opacity-70">
            Topological Clarity v2.0 // Standard Model Tension Diagnostic
          </p>
        </div>
        <div className="flex gap-4 mt-8 md:mt-0">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 border border-slate-800 hover:border-sky-500/40 rounded-lg text-[10px] font-mono text-slate-500 hover:text-sky-400 transition-all uppercase tracking-widest bg-slate-900/40"
          >
            Load Feed
          </button>
          <button 
            onClick={() => performInitialAnalysis()}
            disabled={loading}
            className="px-8 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-30 rounded-lg font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-lg shadow-sky-900/20"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'RE-SYNC PROTOCOL'}
          </button>
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 md:px-12 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-12">
            <div className="relative group rounded-3xl overflow-hidden border border-slate-800/80 bg-slate-900/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500/50 to-transparent"></div>
              <img src={imagePreview} alt="Protocol Substrate" className={`w-full h-auto transition-all duration-1000 ${loading ? 'opacity-10 blur-xl scale-95 grayscale' : 'opacity-80 hover:opacity-100'}`} />
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm">
                  <div className="text-sky-400 font-mono text-[10px] tracking-[0.6em] uppercase animate-pulse mb-8">{loadingStage}</div>
                  <div className="w-64 h-[1px] bg-slate-800/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-sky-500 shadow-[0_0_15px_rgba(56,189,248,1)] animate-[loading_1.5s_infinite]"></div>
                  </div>
                </div>
              )}
            </div>

            <SimplexMesh />
          </div>

          <div className="lg:col-span-5 space-y-10">
            {error ? (
              <div className="bg-red-500/5 border border-red-500/20 p-10 rounded-3xl text-red-400 font-mono text-xs leading-relaxed animate-in fade-in zoom-in shadow-2xl">
                <div className="flex items-center gap-3 mb-6 text-red-500 font-black tracking-widest text-[10px]">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  [CRITICAL_SYSTEM_ERROR]
                </div>
                {error}
                <button onClick={() => performInitialAnalysis()} className="mt-8 block w-full py-4 border border-red-500/30 hover:bg-red-500/10 rounded-xl text-[10px] uppercase tracking-widest transition-all">Manual Substrate Re-Handshake</button>
              </div>
            ) : analysis && (
              <div className="space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
                <div className="bg-slate-900/60 border border-slate-800/80 p-10 rounded-3xl relative shadow-2xl backdrop-blur-2xl">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="inline-block px-4 py-1 rounded-full bg-sky-500/5 border border-sky-500/20 text-sky-400 text-[9px] font-mono uppercase mb-6 tracking-[0.3em] font-black">
                        {analysis.isComplete ? 'Substrate Unified' : 'Protocol Incomplete'}
                      </div>
                      <h2 className="text-4xl font-black text-white tracking-tight">Diagnostic Verdict</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-6xl font-black text-white drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">{analysis.completenessScore}<span className="text-lg opacity-30">%</span></div>
                      <div className="text-[9px] font-mono text-slate-600 uppercase tracking-[0.4em] mt-2 font-bold">Protocol Clarity</div>
                    </div>
                  </div>
                  <p className="text-slate-400 text-base leading-relaxed mb-10 border-l-4 border-sky-500/20 pl-8 italic font-light">
                    {analysis.verdict}
                  </p>
                  
                  {analysis.missingElements.length > 0 && (
                    <div className="mb-10 p-6 bg-amber-500/5 border border-amber-500/20 rounded-2xl">
                       <h4 className="text-[10px] font-mono text-amber-500 uppercase mb-4 tracking-widest font-black">Missing Protocol Axioms</h4>
                       <div className="flex flex-wrap gap-2">
                         {analysis.missingElements.map((el, i) => (
                           <button 
                             key={i} 
                             disabled={isSynthesizing}
                             onClick={() => handleSynthesize(el)}
                             className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[9px] text-amber-200 hover:bg-amber-500/20 transition-all font-mono uppercase tracking-tighter flex items-center gap-2"
                           >
                             Synthesize {el} {isSynthesizing && "..."}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-6 mb-10">
                    {analysis.sections.slice(0, 2).map((s, i) => (
                      <InfoCard key={i} index={i} title={s.title} description={s.description} details={s.details} />
                    ))}
                  </div>

                  {/* New Automated Insight Section */}
                  <InsightPanel insights={analysis.strategicInsights} />
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 p-10 rounded-3xl flex flex-col justify-center relative overflow-hidden group">
                  <h4 className="text-[10px] font-mono text-indigo-400 mb-6 uppercase tracking-[0.4em] font-black">Tension Resolution</h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-[0.2em]">Map Coverage</span>
                      <span className="text-sky-400 font-mono text-sm font-bold">{analysis.resolutionCoverage}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800/50 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-sky-600 to-indigo-500 transition-all duration-[2500ms]" style={{ width: `${analysis.resolutionCoverage}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {analysis && (
          <div className="mt-32 space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="max-w-2xl">
              <h3 className="text-4xl font-black text-white mb-4 tracking-tighter">Substrate Anomaly Matrix</h3>
              <p className="text-slate-500 text-sm font-light leading-relaxed">
                Mapping 15 critical Standard Model physical tensions to deterministic VEF topological resolutions via the NF lattice (D_eff = 0.656).
              </p>
            </div>
            <AnomalyMatrix anomalies={analysis.anomalies} />
          </div>
        )}
      </main>

      <footer className="py-20 border-t border-slate-900 bg-[#01040f] flex flex-col items-center gap-10">
        <div className="flex flex-wrap justify-center gap-16 text-slate-700 text-[9px] font-mono uppercase tracking-[0.6em] font-black">
           <span>Proprietary VEF Engine</span>
           <span>Substrate D_eff = 0.656</span>
           <span>VEF Research // 2025</span>
        </div>
      </footer>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
      `}</style>
    </div>
  );
}

export default App;
