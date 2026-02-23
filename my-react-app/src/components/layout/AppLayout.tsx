import { Outlet } from 'react-router'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <main className="pb-28">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
