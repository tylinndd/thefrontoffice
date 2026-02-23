import { useNavigate } from 'react-router'
import { TrendingUp, BarChart2, Layers, Brain, ChevronRight, Zap, Bell, Medal } from 'lucide-react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'

const sparklineData = [
  { v: 900 },
  { v: 1100 },
  { v: 800 },
  { v: 1400 },
  { v: 1200 },
  { v: 1700 },
  { v: 1500 },
  { v: 2100 },
  { v: 1800 },
  { v: 2340 },
]

const edgePicks = [
  { player: 'LeBron James', bet: 'PTS O 24.5', edge: '+6.2%' },
  { player: 'J. Tatum', bet: 'REB O 7.5', edge: '+4.8%' },
  { player: 'N. Jokić', bet: 'AST O 9.5', edge: '+5.1%' },
]

export default function Dashboard() {
  const navigate = useNavigate()

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

      {/* Bento Grid */}
      <div className="grid grid-cols-2 gap-3">

        {/* Syndicate Banner — full width */}
        <div className="col-span-2 rounded-2xl bg-white border border-slate-200 p-5 relative overflow-hidden min-h-[130px] shadow-sm">
          <div className="relative">
            <p className="text-slate-900 text-[10px] font-bold uppercase tracking-widest mb-1.5">
              Your Syndicate
            </p>
            <h2 className="text-slate-700 text-xl font-bold leading-snug mb-1">
              The Bulls Capital Fund
            </h2>
            <p className="text-slate-400 text-sm mb-4">
              Quantitative Edge. Disciplined Capital.
            </p>
            <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-600 text-[11px] font-bold px-3 py-1.5 rounded-full border border-emerald-100">
              <Zap size={11} />
              +18.4% ROI All-Time
            </span>
          </div>
        </div>

        {/* Edge Picks — half */}
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
            <p className="text-sm font-bold text-slate-700">3 live plays</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-2.5 border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-600">+6.2% Edge</p>
            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
              LeBron PTS O 24.5
            </p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 mt-auto">
            View all <ChevronRight size={10} />
          </div>
        </button>

        {/* Monthly P&L — half */}
        <button
          onClick={() => navigate('/profile')}
          className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col gap-1 text-left shadow-sm active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <BarChart2 size={14} className="text-slate-600" />
            </div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Monthly P&L
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-500 mt-1">+$2,340</p>
          <p className="text-[11px] text-slate-400 font-medium">34 bets · 68% win rate</p>
          <div className="mt-2 h-10 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparklineData}>
                <Line
                  type="monotone"
                  dataKey="v"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </button>

        {/* Bet Analyzer — full width */}
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
                S. Curry 3PM Over 3.5
              </p>
              <p className="text-slate-400 text-sm font-medium">71% Confidence Score</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center ml-3 flex-shrink-0">
              <span className="text-white font-bold text-sm">71%</span>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-white text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl w-fit border border-slate-200">
            Analyze a New Bet
            <ChevronRight size={14} />
          </div>
        </button>

        {/* Active Parlay — half */}
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
            <p className="text-2xl font-bold text-slate-700">12.4x</p>
            <p className="text-[11px] text-slate-400 font-medium">3 legs</p>
          </div>
          <div className="mt-auto w-full">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] text-slate-400 font-medium">Win Chance</p>
              <p className="text-[10px] font-bold text-emerald-500">34.2%</p>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: '34.2%' }}
              />
            </div>
          </div>
        </button>

        {/* Model Accuracy — half */}
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
            <p className="text-2xl font-bold text-slate-700">74.1%</p>
            <p className="text-[11px] text-slate-500 font-medium">Accuracy · 30d</p>
          </div>
          <div className="mt-auto pt-3 border-t border-emerald-100">
            <p className="text-[10px] text-slate-400 font-medium">Market baseline</p>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5">52.4%</p>
          </div>
        </div>

        {/* Recent Edge Picks list — full width */}
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
                      {pick.player.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{pick.player}</p>
                    <p className="text-[11px] text-slate-400 font-medium">{pick.bet}</p>
                  </div>
                </div>
                <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100">
                  {pick.edge}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
