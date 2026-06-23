import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageShell from './components/PageShell';

import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const Home = lazy(() => import('./pages/core/Home'));
const Rules = lazy(() => import('./pages/core/Rules'));
const AuthForm = lazy(() => import('./pages/core/AuthForm'));
const VerifyEmail = lazy(() => import('./pages/core/VerifyEmail'));
const PublicProfile = lazy(() => import('./pages/user/PublicProfile'));
const Dashboard = lazy(() => import('./pages/user/Dashboard'));
const Leaderboard = lazy(() => import('./pages/features/Leaderboard'));
const Admin = lazy(() => import('./pages/core/AdminPanel'));
const Bets = lazy(() => import('./pages/bets/Bets'));
const Parlay = lazy(() => import('./pages/bets/Parlay'));
const Profile = lazy(() => import('./pages/user/Profile'));
const Achievements = lazy(() => import('./pages/user/Achievements'));
const Tasks = lazy(() => import('./pages/features/Tasks'));
const Store = lazy(() => import('./pages/features/Store'));
const Service = lazy(() => import('./pages/features/Service'));
const Market = lazy(() => import('./pages/market/Market'));
const Games = lazy(() => import('./pages/games/Games'));
const Spinner = lazy(() => import('./pages/games/Spinner'));
const Minefield = lazy(() => import('./pages/games/Minefield'));
const Casino = lazy(() => import('./pages/games/Casino'));
const ClickFrenzy = lazy(() => import('./pages/games/ClickFrenzy'));
const RPS = lazy(() => import('./pages/games/RPS'));
const PuzzleRush = lazy(() => import('./pages/games/PuzzleRush'));
const SanctuaryPage = lazy(() => import('./pages/virtual-pet/SanctuaryPage'));
const GachaPage = lazy(() => import('./pages/virtual-pet/GachaPage'));
const PetShop = lazy(() => import('./pages/virtual-pet/PetShop'));
const BreedingPage = lazy(() => import('./pages/virtual-pet/BreedingPage'));
const NotFound = lazy(() => import('./pages/core/NotFound'));
const BetRequest = lazy(() => import('./pages/bets/BetRequest'));

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Router>
            <Navbar />
            <Suspense fallback={<div className="container py-10 text-center text-gray-400">Loading…</div>}>
              <Routes>
                <Route element={<PageShell />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/rules" element={<Rules />} />
                  <Route path="/login" element={<AuthForm isLogin={true} />} />
                  <Route path="/register" element={<AuthForm isLogin={false} />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  <Route path="/profile/:username" element={<PublicProfile />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                  <Route path="/bets" element={<ProtectedRoute><Bets /></ProtectedRoute>} />
                  <Route path="/bets/parlay" element={<ProtectedRoute><Parlay /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
                  <Route path="/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
                  <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
                  <Route path="/services" element={<ProtectedRoute><Service /></ProtectedRoute>} />
                  <Route path="/market" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                  <Route path="/investments" element={<ProtectedRoute><Market /></ProtectedRoute>} />
                  <Route path="/requests/bets" element={<ProtectedRoute><BetRequest /></ProtectedRoute>} />
                  <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
                  <Route path="/games/spinner" element={<ProtectedRoute><Spinner /></ProtectedRoute>} />
                  <Route path="/games/minefield" element={<ProtectedRoute><Minefield /></ProtectedRoute>} />
                  <Route path="/games/casino" element={<ProtectedRoute><Casino /></ProtectedRoute>} />
                  <Route path="/games/click-frenzy" element={<ProtectedRoute><ClickFrenzy /></ProtectedRoute>} />
                  <Route path="/games/rps" element={<ProtectedRoute><RPS /></ProtectedRoute>} />
                  <Route path="/games/puzzle-rush" element={<ProtectedRoute><PuzzleRush /></ProtectedRoute>} />
                  <Route path="/games/virtual-pet" element={<ProtectedRoute><SanctuaryPage /></ProtectedRoute>} />
                  <Route path="/games/virtual-pet/gacha" element={<ProtectedRoute><GachaPage /></ProtectedRoute>} />
                  <Route path="/games/virtual-pet/shop" element={<ProtectedRoute><PetShop /></ProtectedRoute>} />
                  <Route path="/games/virtual-pet/breeding" element={<ProtectedRoute><BreedingPage /></ProtectedRoute>} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
            <Footer />
          </Router>
        </div>
      </AuthProvider>
    </>
  );
}

export default App;
