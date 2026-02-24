import { useState, useEffect } from 'react'
import { BarChart2, TrendingUp, Award, Settings, ChevronRight, Medal, Loader2 } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { fetchProfile, fetchBets, type Profile, type Bet } from '../lib/api'

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const results = await Promise.allSettled([fetchProfile(), fetchBets()])
      if (results[0].status === 'fulfilled') setProfile(results[0].value)
      if (results[1].status === 'fulfilled') setBets(results[1].value)
      setLoading(false)
    }
    load()
  }, [])

  const settled = bets.filter(b => b.result !== 'pending')
  const won = bets.filter(b => b.result === 'won')
  const winRate = settled.length > 0 ? Math.round((won.length / settled.length) * 100) : 0

  const totalPnl = bets.reduce((sum, b) => {
    if (b.result === 'won' && b.payout) return sum + b.payout - (b.stake || 0)
    if (b.result === 'lost' && b.stake) return sum - b.stake
    return sum
  }, 0)

  const bestStreak = (() => {
    let max = 0, cur = 0
    const sorted = [...settled].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    for (const b of sorted) {
      if (b.result === 'won') { cur++; max = Math.max(max, cur) }
      else cur = 0
    }
    return max
  })()

  const roiData = (() => {
    const sorted = [...settled].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    if (sorted.length === 0) return []
    const byMonth = new Map<string, number>()
    let running = 0
    for (const b of sorted) {
      const d = new Date(b.created_at)
      const key = d.toLocaleDateString('en-US', { month: 'short' })
      if (b.result === 'won' && b.payout) running += b.payout - (b.stake || 0)
      else if (b.result === 'lost' && b.stake) running -= b.stake
      byMonth.set(key, running)
    }
    return Array.from(byMonth.entries()).map(([month, value]) => ({ month, value }))
  })()

  const avgConfidence = (() => {
    const withConf = bets.filter(b => b.confidence_score != null)
    if (withConf.length === 0) return 0
    return Math.round(withConf.reduce((s, b) => s + (b.confidence_score || 0), 0) / withConf.length * 100)
  })()

  const stats = [
    { label: 'Total Bets', value: bets.length.toString(), icon: BarChart2 },
    { label: 'Win Rate', value: winRate > 0 ? `${winRate}%` : '—', icon: TrendingUp },
    { label: 'Best Streak', value: bestStreak > 0 ? `${bestStreak}W` : '—', icon: Award },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 size={28} className="text-emerald-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      {/* Syndicate Identity */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            {profile?.logo_url ? (
              <img src={profile.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Medal size={26} className="text-slate-600" />
            )}
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-700 leading-tight">
              {profile?.team_name || 'My Syndicate'}
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Season 2025–26</p>
          </div>
        </div>
        <button className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
          <Settings size={16} className="text-slate-500" />
        </button>
      </div>

      {/* ROI Badge */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
            All-Time P&L
          </p>
          <p className="text-3xl font-bold text-slate-700">
            {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toFixed(0)}
          </p>
          {settled.length > 0 && (
            <p className="text-sm text-emerald-600 font-semibold mt-0.5">
              {settled.length} settled bets
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Avg Confidence</p>
          <p className="text-2xl font-bold text-slate-700">
            {avgConfidence > 0 ? `${avgConfidence}%` : '—'}
          </p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">
            Win rate: {winRate > 0 ? `${winRate}%` : '—'}
          </p>
        </div>
      </div>

      {/* Stat Pills */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200 p-3.5 flex flex-col items-center gap-1.5 shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Icon size={14} className="text-slate-600" />
            </div>
            <p className="text-lg font-bold text-slate-700">{value}</p>
            <p className="text-[10px] text-slate-400 font-medium text-center">{label}</p>
          </div>
        ))}
      </div>

      {/* P&L Chart */}
      {roiData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-slate-700">P&L Over Time</p>
          </div>
          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={roiData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#94A3B8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#0F172A',
                    border: 'none',
                    borderRadius: 12,
                    padding: '8px 12px',
                    fontSize: 12,
                    color: '#fff',
                  }}
                  formatter={(value: number) => [`$${value}`, 'P&L']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#roiGradient)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Settings Row */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {['Syndicate Settings', 'Notification Preferences', 'Connected Accounts'].map(
          (item, i, arr) => (
            <button
              key={item}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-sm font-semibold text-slate-700 active:bg-slate-50 transition-colors ${
                i < arr.length - 1 ? 'border-b border-slate-100' : ''
              }`}
            >
              {item}
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          )
        )}
      </div>
    </div>
  )
}
