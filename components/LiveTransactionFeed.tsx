'use client';

import React from 'react';
import { SleeperTransaction } from '@/lib/types';

interface Props {
  transactions: SleeperTransaction[];
}

export default function LiveTransactionFeed({ transactions }: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Transaction Feed
        </h2>
        <span className="text-xs text-slate-500">Auto-refreshing</span>
      </div>

      <div className="overflow-y-auto space-y-3 pr-1 max-h-[500px]">
        {transactions.length === 0 ? (
          <p className="text-slate-500 text-xs text-center py-6">No recent transactions found.</p>
        ) : (
          transactions.map((tx) => {
            const isAdd = tx.type === 'waiver' || tx.type === 'free_agent';
            const bid = tx.settings?.waiver_bid ?? 0;

            return (
              <div key={tx.transaction_id} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className={`px-1.5 py-0.5 rounded font-mono font-semibold text-[10px] ${
                    isAdd ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                  }`}>
                    {tx.type.toUpperCase()}
                  </span>
                  <span className="text-slate-500 font-mono text-[10px]">
                    {new Date(tx.created).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="text-slate-300 font-mono pt-1">
                  {tx.adds && Object.keys(tx.adds).length > 0 && (
                    <span className="text-emerald-400">Added: Player #{Object.keys(tx.adds)[0]} </span>
                  )}
                  {tx.drops && Object.keys(tx.drops).length > 0 && (
                    <span className="text-rose-400">Dropped: Player #{Object.keys(tx.drops)[0]} </span>
                  )}
                </div>

                {bid > 0 && (
                  <div className="text-slate-400 text-[11px]">
                    Waiver Bid: <span className="font-mono text-cyan-400">${bid}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}