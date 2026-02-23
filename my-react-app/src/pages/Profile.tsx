import { BarChart2, TrendingUp, Award, Settings, ChevronRight, Medal } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

const roiData = [
  { month: 'Sep', value: 200 },
  { month: 'Oct', value: 650 },
  { month: 'Nov', value: 420 },
  { month: 'Dec', value: 1100 },
  { month: 'Jan', value: 890 },
  { month: 'Feb', value: 2340 },
]

const stats = [
  { label: 'Total Bets', value: '187', icon: BarChart2 },
  { label: 'Win Rate', value: '68%', icon: TrendingUp },
  { label: 'Best Streak', value: '11W', icon: Award },
]

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#F8F9FB] px-4 pt-14 pb-4">
      {/* Syndicate Identity */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
            <Medal size={26} className="text-slate-600" />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-slate-700 leading-tight">
              The Bulls Capital Fund
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Alex Smith · Season 2025–26</p>
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
            All-Time ROI
          </p>
          <p className="text-3xl font-bold text-slate-700">+$6,840</p>
          <p className="text-sm text-emerald-600 font-semibold mt-0.5">+18.4% return</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-slate-400 font-medium mb-1">Model Accuracy</p>
          <p className="text-2xl font-bold text-slate-700">74.1%</p>
          <p className="text-[11px] text-slate-400 font-medium mt-0.5">vs. 52.4% baseline</p>
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
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-3">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-slate-700">Net Worth Over Time</p>
          <span className="text-[11px] font-bold text-emerald-500">+$2,340 this month</span>
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
