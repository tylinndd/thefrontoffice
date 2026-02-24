import { useState, useEffect } from 'react'
import { TrendingUp, ChevronRight, Zap, Loader2, RefreshCw } from 'lucide-react'
import { fetchEdgeFeed, createBet, type EdgeItem } from '../lib/api'

export default function EdgeFeed() {
  const [items, setItems] = useState<EdgeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalAnalyzed, setTotalAnalyzed] = useState(0)
  const [addingId, setAddingId] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetchEdgeFeed()
      setItems(res.items)
      setTotalAnalyzed(res.total_props_analyzed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load edge feed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleAddToParlay = async (pick: EdgeItem) => {
    const key = `${pick.nba_player_id}-${pick.category}-${pick.line}-${pick.direction}`
    setAddingId(key)
    try {
      await createBet({
        nba_player_id: pick.nba_player_id,
        player_name: pick.player_name,
        category: pick.category,
        line: pick.line,
        direction: pick.direction,
        model_probability: pick.model_probability,
        market_probability: pick.market_probability,
        edge: pick.edge,
        confidence_score: pick.confidence_score,
      })
    } catch {
      // silent
    } finally {
      setAddingId(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Live Market Analysis
          </p>
          <h1 className="text-[26px] font-bold text-slate-700 leading-tight">Edge Discovery</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm mt-1"
        >
          <RefreshCw size={14} className={`text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-sm font-semibold text-emerald-700">
          {loading
            ? 'Scanning markets...'
            : `${items.length} high-EV play${items.length !== 1 ? 's' : ''} identified · ${totalAnalyzed} props analyzed`}
        </p>
        <Zap size={14} className="text-emerald-500 ml-auto" />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={28} className="text-emerald-500 animate-spin mb-3" />
          <p className="text-sm text-slate-400 font-medium">Crunching numbers...</p>
        </div>
      ) : items.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-slate-400 font-medium">No edges found right now. Check back closer to game time.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((pick) => {
            const key = `${pick.nba_player_id}-${pick.category}-${pick.line}-${pick.direction}`
            const edgePct = (pick.edge * 100).toFixed(1)
            const isPositive = pick.edge > 0
            return (
              <div
                key={key}
                className="w-full bg-white rounded-2xl border border-slate-200 p-4 text-left shadow-sm"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">
                        {pick.player_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{pick.player_name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {pick.category} {pick.direction.charAt(0).toUpperCase() + pick.direction.slice(1)} {pick.line}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex-shrink-0 ${
                    isPositive
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-red-50 text-red-500 border-red-100'
                  }`}>
                    {isPositive ? '+' : ''}{edgePct}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">Model</p>
                    <p className="text-sm font-bold text-slate-700">{(pick.model_probability * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                    <p className="text-[10px] text-slate-400 font-medium mb-0.5">Market</p>
                    <p className="text-sm font-bold text-slate-700">{(pick.market_probability * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                    <p className="text-[10px] text-emerald-600 font-medium mb-0.5">Confidence</p>
                    <p className="text-sm font-bold text-emerald-600">{Math.round(pick.confidence_score * 100)}%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-emerald-500" />
                    <p className="text-[11px] text-slate-400 font-medium">
                      Projected: {pick.projected_value}
                      {pick.bookmaker && ` · ${pick.bookmaker}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleAddToParlay(pick)}
                    disabled={addingId === key}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 active:text-emerald-500 transition-colors"
                  >
                    {addingId === key ? 'Saving...' : 'Add to Parlay'} <ChevronRight size={10} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
