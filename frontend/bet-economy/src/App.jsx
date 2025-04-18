import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Bets from './pages/Bets'
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
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar isAdmin={isAdmin} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/bets" element={<Bets />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/store" element={<Store />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
  )
}

export default App
