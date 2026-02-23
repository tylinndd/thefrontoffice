import { useLocation, useNavigate } from 'react-router'
import { LayoutGrid, TrendingUp, BarChart2, Layers, User } from 'lucide-react'

const tabs = [
  { label: 'Home', icon: LayoutGrid, path: '/' },
  { label: 'Edge', icon: TrendingUp, path: '/edge' },
  { label: 'Analyze', icon: BarChart2, path: '/analyzer' },
  { label: 'Parlay', icon: Layers, path: '/parlay' },
  { label: 'Profile', icon: User, path: '/profile' },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
    >
      <div className="flex items-center gap-1 px-2 py-2 bg-[#EFEFEF] rounded-full shadow-lg">
        {tabs.map(({ label, icon: Icon, path }) => {
          const isActive =
            path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              aria-label={label}
              className={`w-11 h-11 flex items-center justify-center rounded-full transition-all active:scale-90 ${
                isActive ? 'bg-slate-900 shadow-sm' : 'bg-transparent hover:bg-white/60'
              }`}
            >
              <Icon
                size={19}
                strokeWidth={isActive ? 2.2 : 1.8}
                className={isActive ? 'text-white' : 'text-slate-500'}
              />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
