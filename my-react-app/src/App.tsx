import { BrowserRouter, Routes, Route } from 'react-router'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import EdgeFeed from './pages/EdgeFeed'
import Analyzer from './pages/Analyzer'
import Parlay from './pages/Parlay'
import Profile from './pages/Profile'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="edge" element={<EdgeFeed />} />
          <Route path="analyzer" element={<Analyzer />} />
          <Route path="parlay" element={<Parlay />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
