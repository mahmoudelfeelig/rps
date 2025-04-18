import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Rules from './pages/Rules'
import Dashboard from './components/Dashboard'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import AuthForm from './components/AuthForm'
import NotFound from './pages/NotFound'

const App = () => {
  const isAdmin = true // Replace with actual admin check
  
  return (
    <Router>
      <Navbar isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<AuthForm isLogin />} />
        <Route path="/register" element={<AuthForm />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  )
}

export default App