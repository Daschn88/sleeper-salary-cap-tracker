'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface AuctionLot {
  id: string;
  playerName: string;
  position: string;
  nflTeam: string;
  currentBid: number;
  highBidder: string;
  secondsRemaining: number;
}

const INITIAL_LOTS: AuctionLot[] = [
  { id: '1', playerName: 'Justin Jefferson', position: 'WR', nflTeam: 'MIN', currentBid: 45, highBidder: 'Skol Squad', secondsRemaining: 42 },
  { id: '2', playerName: 'Breece Hall', position: 'RB', nflTeam: 'NYJ', currentBid: 38, highBidder: 'Gridiron King', secondsRemaining: 18 },
  { id: '3', playerName: 'Trey McBride', position: 'TE', nflTeam: 'ARI', currentBid: 16, highBidder: 'Desert Dawgs', secondsRemaining: 75 },
  { id: '4', playerName: 'Malik Nabers', position: 'WR', nflTeam: 'NYG', currentBid: 24, highBidder: 'Big Blue', secondsRemaining: 30 },
];

export default function AuctionRoomPage() {
  const [lots, setLots] = useState<AuctionLot[]>(INITIAL_LOTS);
  const [userTeam, setUserTeam] = useState('My Cap Dynasty');
  const [capRemaining, setCapRemaining] = useState(65);
  const [emptySlots, setEmptySlots] = useState(5);

  // Calculate maximum allowable bid reserving $1 for each remaining empty roster slot
  const maxAllowableBid = Math.max(1, capRemaining - (emptySlots - 1));

  // Ticking countdown clock logic
  useEffect(() => {
    const timer = setInterval(() => {
      setLots((prevLots) =>
        prevLots.map((lot) => ({
          ...lot,
          secondsRemaining: Math.max(0, lot.secondsRemaining - 1),
        }))
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleBid = (lotId: string, increment: number) => {
    setLots((prevLots) =>
      prevLots.map((lot) => {
        if (lot.id !== lotId || lot.secondsRemaining <= 0) return lot;

        const nextBid = lot.currentBid + increment;
        if (nextBid > maxAllowableBid) {
          alert(`Bid exceeds maximum allowable cap space ($${maxAllowableBid})!`);
          return lot;
        }

        // Anti-snipe soft-close: bump timer to 25s if under 15s remaining
        const nextSeconds = lot.secondsRemaining < 15 ? 25 : lot.secondsRemaining;

        return {
          ...lot,
          currentBid: nextBid,
          highBidder: userTeam,
          secondsRemaining: nextSeconds,
        };
      })
    );
  };

  const handleNominate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('playerName') as HTMLInputElement).value;
    const pos = (form.elements.namedItem('position') as HTMLSelectElement).value;
    const team = (form.elements.namedItem('nflTeam') as HTMLInputElement).value || 'FA';
    const bid = Number((form.elements.namedItem('startingBid') as HTMLInputElement).value) || 1;

    if (!name) return;

    const newLot: AuctionLot = {
      id: Date.now().toString(),
      playerName: name,
      position: pos,
      nflTeam: team.toUpperCase(),
      currentBid: bid,
      highBidder: userTeam,
      secondsRemaining: 60,
    };

    setLots((prev) => [newLot, ...prev]);
    form.reset();
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                &larr; Back to Cap Dashboard
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2 flex items-center gap-3">
              ⚡ Live Concurrent Auction Block
            </h1>
            <p className="text-slate-400 text-sm">Multiple simultaneous bids with soft-close anti-snipe timers.</p>
          </div>

          <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 rounded-xl px-5 py-3 shadow-lg">
            <div>
              <span className="text-xs text-slate-400 block font-mono">My Remaining Cap</span>
              <span className="text-xl font-bold font-mono text-emerald-400">${capRemaining}</span>
            </div>
            <div className="border-l border-slate-800 pl-4">
              <span className="text-xs text-slate-400 block font-mono">Max Single Bid</span>
              <span className="text-xl font-bold font-mono text-cyan-400">${maxAllowableBid}</span>
            </div>
          </div>
        </header>

        {/* Nomination Form */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4">
            Nominate New Player to Block
          </h2>
          <form onSubmit={handleNominate} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              name="playerName"
              placeholder="Player Name (e.g. Bijan Robinson)"
              required
              className="sm:col-span-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <select
              name="position"
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="QB">QB</option>
              <option value="RB">RB</option>
              <option value="WR">WR</option>
              <option value="TE">TE</option>
            </select>
            <input
              name="nflTeam"
              placeholder="Team (e.g. ATL)"
              maxLength={3}
              className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-2 px-4 rounded-lg text-sm transition font-semibold"
            >
              Nominate ($1)
            </button>
          </form>
        </section>

        {/* Concurrent Auction Lots Grid */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Active Lots on the Block ({lots.filter((l) => l.secondsRemaining > 0).length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {lots.map((lot) => {
              const isExpired = lot.secondsRemaining === 0;
              const isHighBidder = lot.highBidder === userTeam;

              return (
                <div
                  key={lot.id}
                  className={`bg-slate-900 border rounded-xl p-5 flex flex-col justify-between transition-all ${
                    isExpired
                      ? 'border-slate-800/50 opacity-60'
                      : isHighBidder
                      ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400">
                        {lot.position} &bull; {lot.nflTeam}
                      </span>
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                          lot.secondsRemaining < 15 && !isExpired
                            ? 'bg-rose-950 text-rose-400 border border-rose-800 animate-pulse'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {isExpired ? 'CLOSED' : `00:${lot.secondsRemaining.toString().padStart(2, '0')}`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-100 mt-3 truncate">{lot.playerName}</h3>

                    <div className="mt-4 p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-xs text-slate-500">Current High Bid</div>
                      <div className="text-2xl font-mono font-extrabold text-white">${lot.currentBid}</div>
                      <div className="text-xs text-slate-400 mt-1 truncate">
                        Bidder: <span className={isHighBidder ? 'text-emerald-400 font-bold' : 'text-slate-300'}>{lot.highBidder}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    {!isExpired ? (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleBid(lot.id, 1)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono py-2 rounded-lg text-sm border border-slate-700 transition"
                        >
                          + $1
                        </button>
                        <button
                          onClick={() => handleBid(lot.id, 5)}
                          className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold py-2 rounded-lg text-sm transition"
                        >
                          + $5
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-2 bg-slate-950 border border-slate-800 text-slate-400 text-xs font-mono rounded-lg">
                        Sold to {lot.highBidder} for ${lot.currentBid}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}