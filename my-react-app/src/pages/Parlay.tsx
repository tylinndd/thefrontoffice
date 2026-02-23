import { Layers, Plus, Trash2, ChevronRight } from 'lucide-react'

const legs = [
  {
    player: 'LeBron James',
    bet: 'PTS Over 24.5',
    confidence: 78,
    odds: '+115',
  },
  {
    player: 'S. Curry',
    bet: '3PM Over 3.5',
    confidence: 71,
    odds: '-108',
  },
  {
    player: 'N. Jokić',
    bet: 'AST Over 9.5',
    confidence: 74,
    odds: '+102',
  },
]

export default function Parlay() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Correlation-Adjusted
        </p>
        <h1 className="text-[26px] font-bold text-slate-700 leading-tight">
          Parlay Simulator
        </h1>
      </div>

      {/* Summary Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
        <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-widest mb-3">
          Active Parlay
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-1">Legs</p>
            <p className="text-slate-700 text-xl font-bold">3</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-1">Payout</p>
            <p className="text-slate-700 text-xl font-bold">12.4x</p>
          </div>
          <div>
            <p className="text-slate-400 text-[10px] font-medium mb-1">Win Chance</p>
            <p className="text-emerald-500 text-xl font-bold">34.2%</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-400 text-[11px] font-medium">Simulated vs. Market</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-slate-400 text-[10px]">Model 34.2%</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <p className="text-slate-400 text-[10px]">Market 28.1%</p>
              </div>
            </div>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '34.2%' }} />
          </div>
        </div>
      </div>

      {/* Legs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-3">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
              <Layers size={14} className="text-slate-600" />
            </div>
            <p className="text-sm font-bold text-slate-700">Parlay Legs</p>
          </div>
          <button className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
            <Plus size={12} />
            Add Leg
          </button>
        </div>

        <div className="flex flex-col">
          {legs.map((leg, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">
                    {leg.player.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{leg.player}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {leg.bet} · <span className="text-slate-500">{leg.odds}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                  {leg.confidence}%
                </span>
                <button className="text-slate-300 active:text-red-400 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="w-full bg-emerald-500 text-white text-sm font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-sm">
        Simulate Parlay
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
