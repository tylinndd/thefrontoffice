import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { TrendingUp, BarChart2, Layers, Brain, ChevronRight, Zap, Bell, Medal, Loader2 } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
import { fetchProfile, fetchEdgeFeed, fetchBets, type Profile, type EdgeItem, type Bet } from '../lib/api'

export default function Dashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [edgePicks, setEdgePicks] = useState<EdgeItem[]>([])
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const results = await Promise.allSettled([
        fetchProfile(),
        fetchEdgeFeed(0.03, 5),
        fetchBets(),
      ])
      if (results[0].status === 'fulfilled') setProfile(results[0].value)
      if (results[1].status === 'fulfilled') setEdgePicks(results[1].value.items.slice(0, 3))
      if (results[2].status === 'fulfilled') setBets(results[2].value)
      setLoading(false)
    }
    load()
  }, [])

  const wonBets = bets.filter(b => b.result === 'won')
  const settledBets = bets.filter(b => b.result !== 'pending')
  const winRate = settledBets.length > 0 ? Math.round((wonBets.length / settledBets.length) * 100) : 0
  const totalPnl = bets.reduce((sum, b) => {
    if (b.result === 'won' && b.payout) return sum + b.payout - (b.stake || 0)
    if (b.result === 'lost' && b.stake) return sum - b.stake
    return sum
  }, 0)

  const sparklineData = (() => {
    if (settledBets.length === 0) return [{ v: 0 }]
    let running = 0
    return settledBets
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(b => {
        if (b.result === 'won' && b.payout) running += b.payout - (b.stake || 0)
        else if (b.result === 'lost' && b.stake) running -= b.stake
        return { v: running }
      })
  })()

  const avgConfidence = bets.length > 0
    ? Math.round(bets.filter(b => b.confidence_score).reduce((s, b) => s + (b.confidence_score || 0), 0) / bets.filter(b => b.confidence_score).length * 100)
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
            The Front Office
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Bell size={16} className="text-slate-500" />
          </button>
          <div className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Medal size={18} className="text-slate-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Syndicate Banner */}
        <div className="col-span-2 rounded-2xl bg-white border border-slate-200 p-5 relative overflow-hidden min-h-[130px] shadow-sm">
          <div className="relative">
            <p className="text-slate-900 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              Your Syndicate
            </p>
            <h2 className="text-slate-700 text-xl font-bold leading-snug mb-1">
              {profile?.team_name || 'My Syndicate'}
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Quantitative Edge. Disciplined Capital.
            </p>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-100">
              <Zap size={11} />
              {totalPnl >= 0 ? '+' : ''}{totalPnl > 0 ? `$${totalPnl.toFixed(0)}` : `${totalPnl.toFixed(0)}`} P&L All-Time
            </span>
          </div>
        </div>

        {/* Edge Picks */}
        <button
          onClick={() => navigate('/edge')}
          className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-2 text-left shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-500" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Edge Picks
            </p>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-bold text-slate-700">
              {edgePicks.length > 0 ? `${edgePicks.length} live plays` : 'Check feed'}
            </p>
          </div>
          {edgePicks.length > 0 && (
            <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
              <p className="text-[11px] font-bold text-emerald-600">
                +{(edgePicks[0].edge * 100).toFixed(1)}% Edge
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                {edgePicks[0].player_name} {edgePicks[0].category} {edgePicks[0].direction.charAt(0).toUpperCase() + edgePicks[0].direction.slice(1)} {edgePicks[0].line}
              </p>
            </div>
          )}
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-auto">
            View all <ChevronRight size={10} />
          </div>
        </button>

        {/* Monthly P&L */}
        <button
          onClick={() => navigate('/profile')}
          className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-1 text-left shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <BarChart2 size={14} className="text-slate-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              P&L
            </p>
          </div>
          <p className={`text-2xl font-bold mt-1 ${totalPnl >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toFixed(0)}
          </p>
          <p className="text-[11px] text-slate-400 font-medium">
            {settledBets.length} bets · {winRate}% win rate
          </p>
          {sparklineData.length > 1 && (
            <div className="mt-2 h-10 -mx-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparklineData}>
                  <Line type="monotone" dataKey="v" stroke="#10B981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </button>

        {/* Bet Analyzer */}
        <button
          onClick={() => navigate('/analyzer')}
          className="col-span-2 rounded-2xl bg-white border border-slate-200 p-5 relative overflow-hidden text-left active:scale-[0.99] transition-transform shadow-sm"
        >
          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
                  <BarChart2 size={14} className="text-slate-600" />
                </div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Bet Analyzer
                </p>
              </div>
              <p className="text-slate-700 text-[17px] font-bold leading-snug mb-0.5">
                Analyze any player prop
              </p>
              <p className="text-slate-400 text-sm font-medium">Search, set line, get instant edge</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-white text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl w-fit border border-slate-200">
            Analyze a New Bet
            <ChevronRight size={14} />
          </div>
        </button>

        {/* Active Parlay */}
        <button
          onClick={() => navigate('/parlay')}
          className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-2 text-left shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Layers size={14} className="text-slate-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Parlay
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-700">
              {bets.filter(b => b.result === 'pending').length}
            </p>
            <p className="text-[11px] text-slate-400 font-medium">pending legs</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-auto">
            Build parlay <ChevronRight size={10} />
          </div>
        </button>

        {/* Model Accuracy */}
        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Brain size={14} className="text-emerald-600" />
            </div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              Model
            </p>
          </div>
          <div className="mt-1">
            <p className="text-2xl font-bold text-slate-700">
              {avgConfidence > 0 ? `${avgConfidence}%` : '—'}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">Avg Confidence</p>
          </div>
          <div className="mt-auto pt-3 border-t border-emerald-100">
            <p className="text-[10px] text-slate-400 font-medium">Win rate</p>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">
              {winRate > 0 ? `${winRate}%` : '—'}
            </p>
          </div>
        </div>

        {/* Today's Top Picks */}
        {edgePicks.length > 0 && (
          <div className="col-span-2 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-700">Today's Top Picks</p>
              <button
                onClick={() => navigate('/edge')}
                className="text-[11px] font-bold text-emerald-500 flex items-center gap-0.5"
              >
                See all <ChevronRight size={10} />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {edgePicks.map((pick, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-600">
                        {pick.player_name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{pick.player_name}</p>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {pick.category} {pick.direction} {pick.line}
                      </p>
                    </div>
                  </div>
                  <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                    +{(pick.edge * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
