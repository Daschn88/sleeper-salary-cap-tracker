'use client';

import React from 'react';
import { ProcessedTeam } from '@/lib/types';

interface Props {
  team: ProcessedTeam | null;
  onClose: () => void;
  onSalaryUpdate: (rosterId: number, playerId: string, newSalary: number) => void;
}

export default function TeamRosterModal({ team, onClose, onSalaryUpdate }: Props) {
  if (!team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
          <div>
            <h2 className="text-lg font-bold text-slate-100">{team.teamName}</h2>
            <p className="text-xs text-slate-400">Manager: @{team.managerName} &bull; Total Cap Spent: ${team.totalSalary}</p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-100 bg-slate-800 px-3 py-1 rounded text-sm transition"
          >
            Close
          </button>
        </div>

        <div className="p-5 overflow-y-auto divide-y divide-slate-800/60">
          {team.players.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No players found on this roster.</p>
          ) : (
            team.players.map((player) => (
              <div key={player.id} className="py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-9 text-center font-mono font-bold text-xs py-1 rounded bg-slate-800 text-cyan-400">
                    {player.position}
                  </span>
                  <div>
                    <div className="text-slate-200 font-semibold">{player.name}</div>
                    <div className="text-xs text-slate-500 font-mono">{player.team}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Salary: $</span>
                  <input
                    type="number"
                    min="0"
                    value={player.salary}
                    onChange={(e) => onSalaryUpdate(team.rosterId, player.id, Number(e.target.value) || 0)}
                    className="w-16 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right text-slate-100 font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}