import { useState, useEffect, useRef } from 'react'
import { BarChart2, ChevronDown, ArrowRight, Loader2, Search, X } from 'lucide-react'
import {
  searchPlayers,
  analyzeBet,
  createBet,
  type PlayerSearchResult,
  type AnalysisResult,
  type StatCategory,
  type Direction,
} from '../lib/api'

const CATEGORIES: StatCategory[] = ['PTS', 'REB', 'AST', '3PM', 'STL', 'BLK', 'PRA']
const DIRECTIONS: Direction[] = ['over', 'under']

const confidenceLabel = (c: number) => {
  if (c >= 0.7) return 'strong'
  if (c >= 0.55) return 'moderate'
  return 'neutral'
}

const resultStyles: Record<string, string> = {
  strong: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  moderate: 'bg-blue-50 text-blue-600 border-blue-100',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function Analyzer() {
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<PlayerSearchResult[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSearchResult | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [category, setCategory] = useState<StatCategory>('PTS')
  const [direction, setDirection] = useState<Direction>('over')
  const [line, setLine] = useState('')
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [history, setHistory] = useState<AnalysisResult[]>([])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (query.length < 2) {
      setPlayers([])
      return
    }
    setSearching(true)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlayers(query)
        setPlayers(results)
        setShowDropdown(true)
      } catch {
        setPlayers([])
      } finally {
        setSearching(false)
      }
    }, 300)
  }, [query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAnalyze = async () => {
    if (!selectedPlayer || !line) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await analyzeBet({
        player_id: selectedPlayer.nba_player_id,
        category,
        line: parseFloat(line),
        direction,
      })
      setResult(res)
      setHistory(prev => [res, ...prev].slice(0, 10))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBet = async () => {
    if (!result || !selectedPlayer) return
    setSaving(true)
    try {
      await createBet({
        nba_player_id: selectedPlayer.nba_player_id,
        player_name: result.player_name,
        category: result.category,
        line: result.line,
        direction: result.direction,
        model_probability: result.model_probability,
        confidence_score: result.confidence_score,
        hit_rate: result.hit_rate,
      })
    } catch {
      // silent fail — bet saving is non-critical
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Manual Input
        </p>
        <h1 className="text-[26px] font-bold text-slate-700 leading-tight">Bet Analyzer</h1>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
        <p className="text-sm font-bold text-slate-700 mb-4">Analyze a Bet</p>

        <div className="flex flex-col gap-3">
          {/* Player Search */}
          <div ref={dropdownRef} className="relative">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Player
            </label>
            {selectedPlayer ? (
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <span className="text-sm text-slate-700 font-medium">
                  {selectedPlayer.full_name}
                  {selectedPlayer.team_abbreviation && (
                    <span className="text-slate-400 ml-1.5">· {selectedPlayer.team_abbreviation}</span>
                  )}
                </span>
                <button onClick={() => { setSelectedPlayer(null); setQuery(''); setResult(null) }}>
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                  <Search size={14} className="text-slate-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search player..."
                    className="text-sm text-slate-700 bg-transparent outline-none w-full placeholder:text-slate-400"
                  />
                  {searching && <Loader2 size={14} className="text-slate-400 animate-spin" />}
                </div>
                {showDropdown && players.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-20 max-h-48 overflow-y-auto">
                    {players.map(p => (
                      <button
                        key={p.nba_player_id}
                        onClick={() => {
                          setSelectedPlayer(p)
                          setQuery(p.full_name)
                          setShowDropdown(false)
                        }}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors text-sm text-slate-700 border-b border-slate-100 last:border-0"
                      >
                        {p.full_name}
                        {p.team_abbreviation && (
                          <span className="text-slate-400 ml-1.5">· {p.team_abbreviation}</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as StatCategory)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 font-medium outline-none"
                >
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Direction
              </label>
              <div className="relative">
                <select
                  value={direction}
                  onChange={e => setDirection(e.target.value as Direction)}
                  className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 font-medium outline-none"
                >
                  {DIRECTIONS.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Line
            </label>
            <input
              type="number"
              step="0.5"
              value={line}
              onChange={e => setLine(e.target.value)}
              placeholder="e.g. 22.5"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!selectedPlayer || !line || loading}
            className="mt-1 w-full bg-slate-900 text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Analyzing...' : 'Run Analysis'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Analysis Result */}
      {result && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm mb-4">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-slate-700">{result.player_name}</p>
              <p className="text-[11px] text-slate-400 font-medium">
                {result.category} {result.direction.charAt(0).toUpperCase() + result.direction.slice(1)} {result.line}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {Math.round(result.confidence_score * 100)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Hit Rate</p>
              <p className="text-sm font-bold text-slate-700">{(result.hit_rate * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-slate-400 font-medium mb-0.5">Model Prob</p>
              <p className="text-sm font-bold text-slate-700">{(result.model_probability * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-medium mb-0.5">Projected</p>
              <p className="text-sm font-bold text-emerald-600">{result.projected_value}</p>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 font-medium mb-2">
            Based on last {result.last_n_games} games · Recent: {result.recent_values.slice(0, 5).join(', ')}
          </p>

          <button
            onClick={handleSaveBet}
            disabled={saving}
            className="w-full bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
          >
            {saving ? 'Saving...' : 'Save to Bet Tracker'}
          </button>
        </div>
      )}

      {/* Recent Analyses */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <BarChart2 size={14} className="text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-700">Recent Analyses</p>
          </div>

          <div className="flex flex-col gap-3">
            {history.map((item, i) => {
              const level = confidenceLabel(item.confidence_score)
              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">
                        {item.player_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{item.player_name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {item.category} {item.direction} {item.line} · {(item.hit_rate * 100).toFixed(0)}% hit rate
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${resultStyles[level]}`}>
                    {Math.round(item.confidence_score * 100)}%
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
