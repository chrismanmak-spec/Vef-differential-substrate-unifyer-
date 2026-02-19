
import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface Node extends d3.SimulationNodeDatum {
  id: number;
  type: 'VEF' | 'SM' | 'Superheavy';
  z?: number;
  nf: number; // Neutral Fluid density / Binding energy proxy
  label: string;
  anomalyLevel?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

interface Link extends d3.SimulationLinkDatum<Node> {
  source: number | Node;
  target: number | Node;
  strength: number;
}

const SimplexMesh: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const width = 600;
    const height = 450;
    const N_ATOMS = 50;

    const anomalies = [
      "Muon g-2", "Proton Radius", "W Boson Mass", "B-meson Decay", 
      "Hubble Tension", "DM Rotation", "Neutron Lifetime", "Lithium Problem",
      "Hadron Mag Moments", "Neutrino Mass", "Electron EDM", "Kaon CPV",
      "Positron Excess", "Li-6/Li-7 Ratio", "Proton Spin"
    ];

    const anomalyLevels = ["Critical", "Moderate", "Phase-Shifted", "Observation Gap", "High-Sigma"];

    // Generate nodes
    const nodes: Node[] = Array.from({ length: N_ATOMS }, (_, i) => {
      let type: 'VEF' | 'SM' | 'Superheavy' = 'VEF';
      let label = 'VEF Substrate Node';
      let z: number | undefined;
      let anomalyLevel: string | undefined;

      // Assign SM Anomalies (Indices 0-14)
      if (i < 15) {
        type = 'SM';
        label = anomalies[i];
        anomalyLevel = anomalyLevels[i % anomalyLevels.length];
      } 
      // Assign Superheavy (Last 13 nodes, Z=114-126)
      else if (i >= N_ATOMS - 13) {
        type = 'Superheavy';
        z = 114 + (i - (N_ATOMS - 13));
        label = `Superheavy Z=${z}`;
      }

      return {
        id: i,
        type,
        z,
        nf: Math.random() * 0.5 + 0.5, // Initial binding energy
        label,
        anomalyLevel,
        x: width / 2 + (Math.random() - 0.5) * 300,
        y: height / 2 + (Math.random() - 0.5) * 300
      };
    });

    // Generate topological links based on proximity
    const links: Link[] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x! - nodes[j].x!;
        const dy = nodes[i].y! - nodes[j].y!;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 90) {
          links.push({ 
            source: i, 
            target: j, 
            strength: dist < 50 ? 0.8 : 0.2 
          });
        }
      }
    }

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    svg.selectAll("*").remove();

    // Define Glow and Shadow Filters
    const defs = svg.append('defs');
    const filter = defs.append('filter')
      .attr('id', 'glow-physics')
      .attr('x', '-50%')
      .attr('y', '-50%')
      .attr('width', '200%')
      .attr('height', '200%');
    filter.append('feGaussianBlur')
      .attr('stdDeviation', '2.5')
      .attr('result', 'blur');
    filter.append('feComposite')
      .attr('in', 'SourceGraphic')
      .attr('in2', 'blur')
      .attr('operator', 'over');

    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).strength(d => d.strength))
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(20));

    const linkElements = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.8)
      .attr('stroke-opacity', 0.4);

    const nodeElements = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', d => d.type === 'Superheavy' ? 7 : 4.5)
      .attr('filter', 'url(#glow-physics)')
      .on('mouseover', (event, d) => setHoveredNode(d))
      .on('mouseout', () => setHoveredNode(null))
      .call(d3.drag<SVGCircleElement, Node>()
        .on('start', (event) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          event.subject.fx = event.subject.x;
          event.subject.fy = event.subject.y;
        })
        .on('drag', (event) => {
          event.subject.fx = event.x;
          event.subject.fy = event.y;
        })
        .on('end', (event) => {
          if (!event.active) simulation.alphaTarget(0);
          event.subject.fx = null;
          event.subject.fy = null;
        })
      );

    simulation.on('tick', () => {
      // Update NF density and colors dynamically
      nodeElements.each((d) => {
        // Subtle binding energy pulse
        d.nf = 0.6 + 0.4 * Math.sin(Date.now() / 1000 + d.id);
      });

      linkElements
        .attr('x1', d => (d.source as Node).x || 0)
        .attr('y1', d => (d.source as Node).y || 0)
        .attr('x2', d => (d.target as Node).x || 0)
        .attr('y2', d => (d.target as Node).y || 0);

      nodeElements
        .attr('cx', d => d.x || 0)
        .attr('cy', d => d.y || 0)
        .attr('fill', d => {
          if (d.type === 'SM') return '#ff9900'; // Orange
          if (d.type === 'Superheavy') {
            const t = (d.z! - 114) / 12; // 114 -> 126 scale
            return d3.interpolateYlGn(t); // Yellow (114) to Green (126)
          }
          return '#00ffff'; // Cyan standard VEF
        })
        .attr('fill-opacity', d => 0.5 + (d.nf * 0.5)) // Color intensity relative to binding energy
        .attr('stroke', d => d.type === 'SM' ? 'rgba(255,153,0,0.4)' : 'rgba(255,255,255,0.1)')
        .attr('stroke-width', 2);
    });

    return () => simulation.stop();
  }, []);

  return (
    <div className="relative bg-slate-900/40 border border-slate-800 p-8 rounded-3xl overflow-hidden group">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-[11px] font-mono text-sky-400 uppercase tracking-[0.4em] font-black">Geometric Symplex Simulation</h4>
          <p className="text-[9px] text-slate-500 font-mono mt-1 uppercase tracking-widest leading-relaxed max-w-md">
            Interactive Substrate Mapping // D<sub>eff</sub> = 0.656 Scaling // Topological Lock Dynamics
          </p>
        </div>
        <div className="text-right hidden md:block">
           <div className="text-[20px] font-black text-slate-800 font-mono tracking-tighter select-none"> Island of Stability </div>
           <div className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">Active NF Calculation</div>
        </div>
      </div>

      <div className="relative bg-[#01040f] rounded-2xl border border-slate-800/50 cursor-crosshair overflow-hidden shadow-inner shadow-black/80">
        <svg ref={svgRef} className="w-full h-auto min-h-[400px]"></svg>
        
        {/* Physics Overlay Tooltip */}
        {hoveredNode && (
          <div className="absolute top-6 left-6 bg-slate-950/95 border border-sky-500/40 p-5 rounded-2xl backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] z-30 animate-in fade-in zoom-in duration-300 pointer-events-none border-l-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${hoveredNode.type === 'SM' ? 'bg-orange-500 shadow-[0_0_10px_#ff9900]' : hoveredNode.type === 'Superheavy' ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-sky-400 shadow-[0_0_10px_#38bdf8]'}`}></div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Substrate Node #{hoveredNode.id}</div>
            </div>
            
            <div className="text-lg font-black text-white mb-4 tracking-tight leading-none">{hoveredNode.label}</div>
            
            <div className="space-y-2.5">
              <div className="flex justify-between gap-12 text-[10px] font-mono border-b border-slate-800/50 pb-1.5">
                <span className="text-slate-500 uppercase">Phase Type:</span>
                <span className={`${hoveredNode.type === 'SM' ? 'text-orange-400' : 'text-slate-200'}`}>{hoveredNode.type.toUpperCase()}</span>
              </div>
              
              {hoveredNode.anomalyLevel && (
                <div className="flex justify-between gap-12 text-[10px] font-mono border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-500 uppercase">Anomaly Level:</span>
                  <span className="text-orange-500 font-bold">{hoveredNode.anomalyLevel}</span>
                </div>
              )}

              {hoveredNode.z && (
                <div className="flex justify-between gap-12 text-[10px] font-mono border-b border-slate-800/50 pb-1.5">
                  <span className="text-slate-500 uppercase">Atomic Z:</span>
                  <span className="text-green-400 font-bold">{hoveredNode.z}</span>
                </div>
              )}

              <div className="flex justify-between gap-12 text-[10px] font-mono">
                <span className="text-slate-500 uppercase">NF Density (ψ):</span>
                <div className="flex items-center gap-2">
                   <div className="w-12 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-sky-400" style={{ width: `${hoveredNode.nf * 100}%` }}></div>
                   </div>
                   <span className="text-sky-400 font-bold">{(hoveredNode.nf).toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* High-Tech Legend Panel */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-slate-950/50 rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-4 group">
          <div className="w-4 h-4 rounded-full bg-[#00ffff] shadow-[0_0_12px_#00ffff] border border-white/20"></div>
          <div>
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">VEF Substrate</div>
            <div className="text-[8px] font-mono text-slate-600 uppercase">Standard Phase-Lock</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-4 h-4 rounded-full bg-[#ff9900] shadow-[0_0_12px_#ff9900] border border-white/20"></div>
          <div>
            <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest">SM Anomaly</div>
            <div className="text-[8px] font-mono text-slate-600 uppercase">Physics Discrepancy node</div>
          </div>
        </div>
        <div className="flex items-center gap-4 col-span-1 sm:col-span-2">
          <div className="w-12 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-green-500 shadow-[0_0_12px_rgba(34,197,94,0.3)] border border-white/10"></div>
          <div className="flex-1">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Superheavy elements (Z=114–126)</div>
            <div className="text-[8px] font-mono text-slate-600 uppercase">Binding Energy Gradient // Island of Stability</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplexMesh;
