import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Bets from './pages/Bets'
import Parlay from './pages/Parlay' 
import Dashboard from './pages/Dashboard'
import AuthForm from './pages/AuthForm'
import Home from './pages/Home'
import Leaderboard from './pages/Leaderboard'
import Admin from './pages/AdminPanel'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import Rules from './pages/Rules'
import NotFound from './pages/NotFound'
import Achievements from './pages/Achievements'
import Tasks from './pages/Tasks'
import Store from './pages/Store'
import { AuthProvider } from './context/AuthContext';
import Service from './pages/Service';
import { Toaster } from 'react-hot-toast';

function App() {
  // check if the user is an admin by checking the role of the user in local storage
  const user = JSON.parse(localStorage.getItem('user')); // Parse the user object
  const isAdmin = user && user.role === 'admin';

  return (
    <>
          <Toaster position="top-right" />
    <AuthProvider>
    <div className="flex flex-col min-h-screen">
      <Router>
        <Navbar isAdmin={isAdmin} />
        <main className="flex-grow">
          <Routes>

            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/rules" element={<Rules />} />
            <Route path="/login" element={<AuthForm isLogin={true} />} />
            <Route path="/register" element={ <AuthForm isLogin={false} />} />
            <Route path="/profile/:username" element={<PublicProfile />} />
            {/* Protected routes */}
            <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard /> 
            </ProtectedRoute>
            }
            />
            <Route path="/leaderboard" element={
              <ProtectedRoute>
              <Leaderboard />
              </ProtectedRoute>
              } />
            {isAdmin && <Route path="/admin" element={
              <ProtectedRoute>
              <Admin />
              </ProtectedRoute>
              } 
              />}
            <Route path="/bets" element={
              <ProtectedRoute>
              <Bets />
              </ProtectedRoute>
              } />
            <Route path="/bets/parlay" element={
              <ProtectedRoute>
              <Parlay />
              </ProtectedRoute>
              } />
            <Route path="/profile" element={
              <ProtectedRoute>
              <Profile />
              </ProtectedRoute>
              } />
            <Route path="/achievements" element={
              <ProtectedRoute>
              <Achievements />
              </ProtectedRoute>
              } />
            <Route path="/tasks" element={
              <ProtectedRoute>
              <Tasks />
              </ProtectedRoute>
              } />
            <Route path="/store" element={
              <ProtectedRoute>
              <Store />
              </ProtectedRoute>
              } />
            <Route path="/services" element={
              <ProtectedRoute>
              <Service />
              </ProtectedRoute>
              } />
            
            {/* Catch-all route for 404 Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>
    </AuthProvider>
    </>
  )
}

export default App;
