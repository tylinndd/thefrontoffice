import { BarChart2, ChevronDown, ArrowRight } from 'lucide-react'

const recentAnalyses = [
  {
    player: 'S. Curry',
    bet: '3PM Over 3.5',
    confidence: 71,
    hitRate: '68%',
    result: 'strong',
  },
  {
    player: 'A. Davis',
    bet: 'PTS Over 22.5',
    confidence: 58,
    hitRate: '54%',
    result: 'neutral',
  },
  {
    player: 'G. Antetokounmpo',
    bet: 'REB Over 11.5',
    confidence: 63,
    hitRate: '61%',
    result: 'moderate',
  },
]

const resultStyles: Record<string, string> = {
  strong: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  moderate: 'bg-blue-50 text-blue-600 border-blue-100',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
}

export default function Analyzer() {
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
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Player
            </label>
            <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
              <span className="text-sm text-slate-400">Select player...</span>
              <ChevronDown size={16} className="text-slate-400" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Category
              </label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <span className="text-sm text-slate-400">PTS</span>
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
                Direction
              </label>
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
                <span className="text-sm text-slate-400">Over</span>
                <ChevronDown size={16} className="text-slate-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">
              Line
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-3">
              <span className="text-sm text-slate-400">e.g. 22.5</span>
            </div>
          </div>

          <button className="mt-1 w-full bg-slate-900 text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            Run Analysis
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center">
            <BarChart2 size={14} className="text-slate-600" />
          </div>
          <p className="text-sm font-bold text-slate-700">Recent Analyses</p>
        </div>

        <div className="flex flex-col gap-3">
          {recentAnalyses.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-slate-600">
                    {item.player.split(' ').map(w => w[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.player}</p>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {item.bet} · {item.hitRate} hit rate
                  </p>
                </div>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${resultStyles[item.result]}`}
              >
                {item.confidence}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
