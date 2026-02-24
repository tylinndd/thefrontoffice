import { useState, useEffect } from 'react'
import { Layers, Trash2, ChevronRight, Loader2, RefreshCw } from 'lucide-react'
import { fetchBets, fetchParlays, createParlay, type Bet, type Parlay } from '../lib/api'

export default function ParlayPage() {
  const [pendingBets, setPendingBets] = useState<Bet[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [parlays, setParlays] = useState<Parlay[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [bets, existingParlays] = await Promise.all([
        fetchBets('pending'),
        fetchParlays(),
      ])
      setPendingBets(bets)
      setParlays(existingParlays)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const toggleLeg = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSimulate = async () => {
    if (selectedIds.size < 2) return
    setCreating(true)
    setError('')
    try {
      const parlay = await createParlay({ bet_ids: Array.from(selectedIds) })
      setParlays(prev => [parlay, ...prev])
      setSelectedIds(new Set())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create parlay')
    } finally {
      setCreating(false)
    }
  }

  const selected = pendingBets.filter(b => selectedIds.has(b.id))
  const combinedProb = selected.length > 0
    ? selected.reduce((p, b) => p * (b.model_probability || 0.5), 1)
    : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 size={28} className="text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            Correlation-Adjusted
          </p>
          <h1 className="text-[26px] font-bold text-slate-700 leading-tight">
            Parlay Simulator
          </h1>
        </div>
        <button
          onClick={load}
          className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm mt-1"
        >
          <RefreshCw size={14} className="text-slate-500" />
        </button>
      </div>

      {/* Summary Card */}
      {selected.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-3">
            Building Parlay
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-slate-400 text-[10px] font-medium mb-1">Legs</p>
              <p className="text-slate-700 text-xl font-bold">{selected.length}</p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-medium mb-1">Combined</p>
              <p className="text-slate-700 text-xl font-bold">
                {combinedProb > 0 ? `${(1 / combinedProb).toFixed(1)}x` : '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-medium mb-1">Win Chance</p>
              <p className="text-emerald-500 text-xl font-bold">
                {(combinedProb * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400 text-[11px] font-medium">Simulated Probability</p>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{ width: `${Math.min(combinedProb * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 mb-4">
          <p className="text-sm text-red-600 font-medium">{error}</p>
        </div>
      )}

      {/* Pending Bets to Select */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-3">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Layers size={14} className="text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-700">
              Your Bets ({pendingBets.length})
            </p>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Tap to add legs</p>
        </div>

        {pendingBets.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-slate-400 font-medium">
              No pending bets. Analyze or save bets first.
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {pendingBets.map(bet => {
              const isSelected = selectedIds.has(bet.id)
              return (
                <button
                  key={bet.id}
                  onClick={() => toggleLeg(bet.id)}
                  className={`flex items-center justify-between px-4 py-3.5 border-b border-slate-100 last:border-0 transition-colors ${
                    isSelected ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                    }`}>
                      {isSelected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-700">{bet.player_name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {bet.category} {bet.direction} {bet.line}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5">
                    {bet.confidence_score && (
                      <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                        {Math.round(bet.confidence_score * 100)}%
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected.length >= 2 && (
        <button
          onClick={handleSimulate}
          disabled={creating}
          className="w-full bg-emerald-500 text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm disabled:opacity-50 mb-4"
        >
          {creating ? <Loader2 size={16} className="animate-spin" /> : null}
          {creating ? 'Creating Parlay...' : `Simulate ${selected.length}-Leg Parlay`}
          <ChevronRight size={16} />
        </button>
      )}

      {/* Existing Parlays */}
      {parlays.length > 0 && (
        <div className="mt-2">
          <p className="text-sm font-bold text-slate-700 mb-3">Saved Parlays</p>
          <div className="flex flex-col gap-3">
            {parlays.map(parlay => (
              <div key={parlay.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-slate-700">
                    {parlay.name || `${parlay.legs.length}-Leg Parlay`}
                  </p>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                    parlay.status === 'active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    {parlay.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {parlay.legs.map(leg => (
                    <div key={leg.id} className="flex items-center justify-between text-[12px]">
                      <span className="text-slate-600 font-medium">
                        {leg.player_name} — {leg.category} {leg.direction} {leg.line}
                      </span>
                      {leg.confidence_score && (
                        <span className="text-emerald-600 font-bold">
                          {Math.round(leg.confidence_score * 100)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
