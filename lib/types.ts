export interface SleeperUser {
  user_id: string;
  display_name: string;
  avatar: string;
  metadata?: {
    team_name?: string;
    avatar?: string;
  };
}

export interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[] | null;
  starters: string[] | null;
  settings: {
    wins: number;
    losses: number;
    fpts: number;
    total_moves: number;
    waiver_budget_used?: number;
  };
}

export interface SleeperTransaction {
  transaction_id: string;
  type: string;
  status: string;
  created: number;
  roster_ids: number[];
  adds?: Record<string, number> | null;
  drops?: Record<string, number> | null;
  settings?: {
    waiver_bid?: number;
  };
}

export interface PlayerInfo {
  id: string;
  name: string;
  position: string;
  team: string;
  salary: number;
}

export interface ProcessedTeam {
  rosterId: number;
  ownerId: string;
  teamName: string;
  managerName: string;
  avatarUrl: string;
  players: PlayerInfo[];
  totalSalary: number;
  remainingCap: number;
  rosterCount: number;
}