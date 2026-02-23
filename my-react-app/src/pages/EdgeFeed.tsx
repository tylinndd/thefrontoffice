import { TrendingUp, ChevronRight, Zap } from 'lucide-react'

const picks = [
  {
    player: 'LeBron James',
    team: 'LAL',
    bet: 'PTS Over 24.5',
    edge: '+6.2%',
    confidence: 78,
    line: 24.5,
    modelProb: '64.8%',
    marketProb: '58.6%',
  },
  {
    player: "N. Jokić",
    team: 'DEN',
    bet: 'AST Over 9.5',
    edge: '+5.1%',
    confidence: 74,
    line: 9.5,
    modelProb: '61.4%',
    marketProb: '56.3%',
  },
  {
    player: 'J. Tatum',
    team: 'BOS',
    bet: 'REB Over 7.5',
    edge: '+4.8%',
    confidence: 71,
    line: 7.5,
    modelProb: '59.6%',
    marketProb: '54.8%',
  },
  {
    player: 'S. Curry',
    team: 'GSW',
    bet: '3PM Over 3.5',
    edge: '+3.9%',
    confidence: 68,
    line: 3.5,
    modelProb: '57.2%',
    marketProb: '53.3%',
  },
  {
    player: 'K. Durant',
    team: 'PHX',
    bet: 'PTS Over 27.5',
    edge: '+3.2%',
    confidence: 65,
    line: 27.5,
    modelProb: '55.8%',
    marketProb: '52.6%',
  },
]

export default function EdgeFeed() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      <div className="mb-6">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
          Live Market Analysis
        </p>
        <h1 className="text-[26px] font-bold text-slate-700 leading-tight">Edge Discovery</h1>
      </div>

      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3 mb-4">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <p className="text-sm font-semibold text-emerald-700">
          5 high-EV plays identified today
        </p>
        <Zap size={14} className="text-emerald-500 ml-auto" />
      </div>

      <div className="flex flex-col gap-3">
        {picks.map((pick, i) => (
          <button
            key={i}
            className="w-full bg-white rounded-2xl border border-slate-200 p-4 text-left shadow-sm active:scale-[0.99] transition-transform"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">
                    {pick.player.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{pick.player}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {pick.team} · {pick.bet}
                  </p>
                </div>
              </div>
              <span className="bg-emerald-50 text-emerald-600 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 flex-shrink-0">
                {pick.edge}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-1">
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">Model</p>
                <p className="text-sm font-bold text-slate-700">{pick.modelProb}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2.5 text-center">
                <p className="text-[10px] text-slate-400 font-medium mb-0.5">Market</p>
                <p className="text-sm font-bold text-slate-700">{pick.marketProb}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-2.5 text-center border border-emerald-100">
                <p className="text-[10px] text-emerald-600 font-medium mb-0.5">Confidence</p>
                <p className="text-sm font-bold text-emerald-600">{pick.confidence}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={12} className="text-emerald-500" />
                <p className="text-[11px] text-slate-400 font-medium">Last 15 games avg</p>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                Add to Parlay <ChevronRight size={10} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
