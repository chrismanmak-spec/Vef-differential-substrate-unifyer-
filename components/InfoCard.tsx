
import React from 'react';

interface InfoCardProps {
  title: string;
  description: string;
  details: string[];
  index: number;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, details, index }) => {
  return (
    <div className="bg-slate-900/50 border border-slate-700 p-6 rounded-xl hover:border-sky-500/50 transition-all group">
      <div className="flex items-center gap-3 mb-4">
        <span className="bg-sky-500/20 text-sky-400 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border border-sky-500/30">
          {index + 1}
        </span>
        <h3 className="text-xl font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
          {title}
        </h3>
      </div>
      <p className="text-slate-400 mb-4 text-sm leading-relaxed">
        {description}
      </p>
      <ul className="space-y-2">
        {details.map((detail, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
            <span className="text-sky-500 mt-1">▹</span>
            {detail}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfoCard;
