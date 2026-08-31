import { SleeperRoster, SleeperUser, SleeperTransaction, ProcessedTeam, PlayerInfo } from './types';

const SLEEPER_BASE_URL = 'https://api.sleeper.app/v1';

// Cache player names and positions in memory
let playerDictionaryCache: Record<string, { full_name: string; position: string; team: string }> | null = null;

export async function getPlayerDatabase() {
  if (playerDictionaryCache) return playerDictionaryCache;
  try {
    const res = await fetch(`${SLEEPER_BASE_URL}/players/nfl`, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error('Failed to fetch player database');
    playerDictionaryCache = await res.json();
    return playerDictionaryCache;
  } catch (error) {
    console.error('Error fetching Sleeper players:', error);
    return {};
  }
}

export async function fetchLeagueData(leagueId: string, totalCap = 200): Promise<ProcessedTeam[]> {
  const [rostersRes, usersRes, playerMap] = await Promise.all([
    fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/rosters`, { cache: 'no-store' }),
    fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/users`, { cache: 'no-store' }),
    getPlayerDatabase(),
  ]);

  if (!rostersRes.ok || !usersRes.ok) {
    throw new Error('Failed to fetch league data from Sleeper');
  }

  const rosters: SleeperRoster[] = await rostersRes.json();
  const users: SleeperUser[] = await usersRes.json();

  const userMap = new Map<string, SleeperUser>();
  users.forEach((u) => userMap.set(u.user_id, u));

  return rosters.map((roster) => {
    const user = userMap.get(roster.owner_id);
    const managerName = user?.display_name || `Roster ${roster.roster_id}`;
    const teamName = user?.metadata?.team_name || managerName;
    const avatarUrl = user?.avatar 
      ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}` 
      : 'https://sleepercdn.com/images/v2/icons/player_default.webp';

    const players: PlayerInfo[] = (roster.players || []).map((playerId) => {
      const p = playerMap?.[playerId];
      // Default base salary logic ($1 baseline or pull from your contract table)
      return {
        id: playerId,
        name: p?.full_name || `Player #${playerId}`,
        position: p?.position || 'DEF/BN',
        team: p?.team || 'FA',
        salary: 1, 
      };
    });

    const totalSalary = players.reduce((sum, p) => sum + p.salary, 0);

    return {
      rosterId: roster.roster_id,
      ownerId: roster.owner_id,
      teamName,
      managerName,
      avatarUrl,
      players,
      totalSalary,
      remainingCap: totalCap - totalSalary,
      rosterCount: players.length,
    };
  });
}

export async function fetchLeagueTransactions(leagueId: string, week: number): Promise<SleeperTransaction[]> {
  try {
    const res = await fetch(`${SLEEPER_BASE_URL}/league/${leagueId}/transactions/${week}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const transactions: SleeperTransaction[] = await res.json();
    return transactions.filter((tx) => tx.status === 'complete');
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}