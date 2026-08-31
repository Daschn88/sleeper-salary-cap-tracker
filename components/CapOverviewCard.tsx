'use client';

import React from 'react';
import { ProcessedTeam } from '@/lib/types';

interface Props {
  team: ProcessedTeam;
  totalCap: number;
  onSelect: (team: ProcessedTeam) => void;
}

export default function CapOverviewCard({ team, totalCap, onSelect }: Props) {
  const percentage = Math.min(100, Math.round((team.totalSalary / totalCap) * 100));

  const getBarColor = (pct: number) => {
    if (pct >= 100) return 'bg-rose-500';
    if (pct >= 85) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  return (
    <div 
      onClick={() => onSelect(team)}
      className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-cyan-500 transition-all cursor-pointer shadow-lg hover:shadow-cyan-500/10 flex flex-col justify-between"
    >
      <div className="flex items-center gap-4">
        <img 
          src={team.avatarUrl} 
          alt={team.managerName} 
          className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800 object-cover" 
        />
        <div className="overflow-hidden">
          <h3 className="text-base font-semibold text-slate-100 truncate">{team.teamName}</h3>
          <p className="text-xs text-slate-400 font-mono">@{team.managerName}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div className="flex justify-between items-baseline text-sm">
          <span className="text-slate-400">Cap Space:</span>
          <span className={`font-mono font-bold text-base ${team.remainingCap < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            ${team.remainingCap}
          </span>
        </div>

        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-1">
            <span>Spent: ${team.totalSalary}</span>
            <span>Limit: ${totalCap} ({percentage}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getBarColor(percentage)}`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex justify-between text-xs text-slate-400 font-medium">
        <span>Roster: {team.rosterCount} Players</span>
        <span className="text-cyan-400">View Roster &rarr;</span>
      </div>
    </div>
  );
}