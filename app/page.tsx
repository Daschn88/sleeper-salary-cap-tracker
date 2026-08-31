'use client';

import React, { useEffect, useState } from 'react';
import { fetchLeagueData, fetchLeagueTransactions } from '@/lib/sleeper';
import { ProcessedTeam, SleeperTransaction } from '@/lib/types';
import CapOverviewCard from '@/components/CapOverviewCard';
import TeamRosterModal from '@/components/TeamRosterModal';
import LiveTransactionFeed from '@/components/LiveTransactionFeed';

const DEFAULT_LEAGUE_ID = '104838291039829192'; // Replace with your target Sleeper league ID
const DEFAULT_CAP_LIMIT = 200;

export default function SalaryCapDashboard() {
  const [leagueId, setLeagueId] = useState<string>(DEFAULT_LEAGUE_ID);
  const [capLimit, setCapLimit] = useState<number>(DEFAULT_CAP_LIMIT);
  const [teams, setTeams] = useState<ProcessedTeam[]>([]);
  const [transactions, setTransactions] = useState<SleeperTransaction[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<ProcessedTeam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (id: string, cap: number) => {
    try {
      setError(null);
      const [teamData, txData] = await Promise.all([
        fetchLeagueData(id, cap),
        fetchLeagueTransactions(id, 1), // Defaults to week 1 or latest round
      ]);
      setTeams(teamData);
      setTransactions(txData);
    } catch (err: any) {
      setError(err.message || 'Failed to sync with Sleeper');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(leagueId, capLimit);

    // Auto-polling interval every 30 seconds for live updates
    const interval = setInterval(() => {
      loadData(leagueId, capLimit);
    }, 30000);

    return () => clearInterval(interval);
  }, [leagueId, capLimit]);

  const handleSalaryChange = (rosterId: number, playerId: string, newSalary: number) => {
    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        if (t.rosterId !== rosterId) return t;

        const updatedPlayers = t.players.map((p) => (p.id === playerId ? { ...p, salary: newSalary } : p));
        const totalSalary = updatedPlayers.reduce((sum, p) => sum + p.salary, 0);

        const updatedTeam = {
          ...t,
          players: updatedPlayers,
          totalSalary,
          remainingCap: capLimit - totalSalary,
        };

        if (selectedTeam?.rosterId === rosterId) {
          setSelectedTeam(updatedTeam);
        }

        return updatedTeam;
      })
    );
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header & Settings Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              🏈 Sleeper Salary Cap Tracker
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time cap validation, rosters, and transaction logs.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
              <label className="text-xs text-slate-400 font-mono">League ID:</label>
              <input
                type="text"
                value={leagueId}
                onChange={(e) => setLeagueId(e.target.value)}
                className="bg-transparent text-sm text-slate-100 focus:outline-none w-44 font-mono"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
              <label className="text-xs text-slate-400 font-mono">Cap:</label>
              <input
                type="number"
                value={capLimit}
                onChange={(e) => setCapLimit(Number(e.target.value) || 0)}
                className="bg-transparent text-sm text-slate-100 focus:outline-none w-16 font-mono"
              />
            </div>

            <button
              onClick={() => {
                setLoading(true);
                loadData(leagueId, capLimit);
              }}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-1.5 rounded-lg text-sm transition"
            >
              Sync
            </button>
          </div>
        </header>

        {error && (
          <div className="p-4 bg-rose-950/50 border border-rose-800 text-rose-300 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-44 bg-slate-900/60 rounded-xl animate-pulse border border-slate-800" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {teams.map((team) => (
                  <CapOverviewCard
                    key={team.rosterId}
                    team={team}
                    totalCap={capLimit}
                    onSelect={(t) => setSelectedTeam(t)}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <LiveTransactionFeed transactions={transactions} />
          </div>
        </div>
      </div>

      {/* Roster Management Modal */}
      <TeamRosterModal
        team={selectedTeam}
        onClose={() => setSelectedTeam(null)}
        onSalaryUpdate={handleSalaryChange}
      />
    </main>
  );
}