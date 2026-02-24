import { supabase } from './supabase'

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (token) {
    return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  }
  return { 'Content-Type': 'application/json' }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders()
  const res = await fetch(path, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `API error ${res.status}`)
  }
  return res.json()
}

// ── Profile ────────────────────────────────────────────────

export interface Profile {
  id: string
  team_name: string
  logo_url: string | null
  logo_description: string | null
  created_at: string
  updated_at: string
}

export const fetchProfile = () => request<Profile>('/api/profile')

export const updateProfile = (body: Partial<Profile>) =>
  request<Profile>('/api/profile', { method: 'PATCH', body: JSON.stringify(body) })

// ── Players ────────────────────────────────────────────────

export interface PlayerSearchResult {
  nba_player_id: number
  full_name: string
  team_abbreviation: string | null
  position: string | null
  is_active: boolean
}

export const searchPlayers = (q: string) =>
  request<PlayerSearchResult[]>(`/api/players/search?q=${encodeURIComponent(q)}`)

// ── Analysis ───────────────────────────────────────────────

export type StatCategory = 'PTS' | 'REB' | 'AST' | '3PM' | 'STL' | 'BLK' | 'PRA'
export type Direction = 'over' | 'under'

export interface AnalysisRequest {
  player_id: number
  category: StatCategory
  line: number
  direction: Direction
}

export interface AnalysisResult {
  player_id: number
  player_name: string
  category: StatCategory
  line: number
  direction: Direction
  hit_rate: number
  model_probability: number
  projected_value: number
  confidence_score: number
  last_n_games: number
  recent_values: number[]
}

export const analyzeBet = (body: AnalysisRequest) =>
  request<AnalysisResult>('/api/analysis/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
  })

// ── Edge Feed ──────────────────────────────────────────────

export interface EdgeItem {
  player_name: string
  nba_player_id: number
  category: StatCategory
  line: number
  direction: Direction
  model_probability: number
  market_probability: number
  edge: number
  confidence_score: number
  projected_value: number
  bookmaker: string | null
}

export interface EdgeFeedResponse {
  items: EdgeItem[]
  generated_at: string
  total_props_analyzed: number
}

export const fetchEdgeFeed = (minEdge = 0.03, maxItems = 25) =>
  request<EdgeFeedResponse>(`/api/edge/feed?min_edge=${minEdge}&max_items=${maxItems}`)

// ── Bets ───────────────────────────────────────────────────

export interface BetCreate {
  nba_player_id: number
  player_name: string
  category: StatCategory
  line: number
  direction: Direction
  model_probability?: number
  market_probability?: number
  edge?: number
  confidence_score?: number
  hit_rate?: number
  odds?: number
  stake?: number
  game_date?: string
}

export interface Bet {
  id: string
  user_id: string
  nba_player_id: number
  player_name: string
  category: string
  line: number
  direction: string
  model_probability: number | null
  market_probability: number | null
  edge: number | null
  confidence_score: number | null
  hit_rate: number | null
  result: string
  odds: number | null
  stake: number | null
  payout: number | null
  game_date: string | null
  created_at: string
  settled_at: string | null
}

export const createBet = (body: BetCreate) =>
  request<Bet>('/api/bets', { method: 'POST', body: JSON.stringify(body) })

export const fetchBets = (status?: string) =>
  request<Bet[]>(`/api/bets${status ? `?status=${status}` : ''}`)

export const updateBet = (id: string, body: { result?: string; stake?: number; odds?: number }) =>
  request<Bet>(`/api/bets/${id}`, { method: 'PATCH', body: JSON.stringify(body) })

// ── Parlays ────────────────────────────────────────────────

export interface Parlay {
  id: string
  user_id: string
  name: string | null
  status: string
  simulated_probability: number | null
  market_implied_probability: number | null
  total_odds: number | null
  stake: number | null
  potential_payout: number | null
  result: string
  legs: Bet[]
  created_at: string
  settled_at: string | null
}

export const createParlay = (body: { name?: string; bet_ids: string[]; stake?: number }) =>
  request<Parlay>('/api/bets/parlays', { method: 'POST', body: JSON.stringify(body) })

export const fetchParlays = () => request<Parlay[]>('/api/bets/parlays')
