import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BetList from './components/BetList'
import Dashboard from './components/Dashboard'
import AuthForm from './components/AuthForm'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import Rules from './pages/Rules'
import NotFound from './pages/NotFound'
import Achievements from './pages/Achievements'
import Tasks from './pages/Tasks'
import Store from './pages/Store'

function App() {
  const isAdmin = true

  return (
    <Router>
      <Navbar isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/bets" element={<BetList />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/store" element={<Store />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App