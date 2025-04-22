import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Bets from './pages/Bets'
import Dashboard from './pages/Dashboard'
import AuthForm from './components/AuthForm'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/AdminPanel'
import Profile from './pages/Profile'
import Rules from './pages/Rules'
import NotFound from './pages/NotFound'
import Achievements from './pages/Achievements'
import Tasks from './pages/Tasks'
import Store from './pages/Store'
import { AuthProvider } from './context/AuthContext';

function App() {
  // check if the user is an admin by checking the role of the user in local storage
  const user = JSON.parse(localStorage.getItem('user')); // Parse the user object
  const isAdmin = user && user.role === 'admin'; // Check if the role is 'admin'

  return (
    <AuthProvider>
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar isAdmin={isAdmin} />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<AuthForm isLogin={true} />} />
            <Route path="/register" element={<AuthForm isLogin={false} />} />
            {isAdmin && <Route path="/admin" element={<Admin />} />} {/* Admin route only for admin */}
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
    </AuthProvider>
  )
}

export default App;
