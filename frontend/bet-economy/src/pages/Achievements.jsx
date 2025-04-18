import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Confetti from 'react-confetti'
import { ProgressBar } from '../components/ui/progressBar'
import {
  BadgeCheck,
  Users,
  Star,
  DollarSign,
  EyeOff,
  Eye,
  ChevronDown,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
} from 'lucide-react'

const achievementIcons = {
  bet: <DollarSign className="text-yellow-400" size={20} />,
  group: <Users className="text-blue-400" size={20} />,
  streak: <Star className="text-pink-400" size={20} />,
  badge: <BadgeCheck className="text-green-400" size={20} />,
}

const initialAchievements = [
  { id: 1, title: 'Place your first bet', progress: 100, icon: 'bet', reward: '💸 500' },
  { id: 2, title: 'Join a group', progress: 100, icon: 'group', reward: 'Badge: Socialite' },
  { id: 3, title: 'Win 3 bets in a row', progress: 67, icon: 'streak', reward: '💸 1000' },
  { id: 4, title: 'Buy a badge', progress: 0, icon: 'badge', reward: 'Badge: Collector' },
  { id: 5, title: 'Reach 10,000 coins', progress: 20, icon: 'bet', reward: '💸 5000' },
  { id: 6, title: 'Invite 3 friends', progress: 33, icon: 'group', reward: 'Badge: Influencer' },
]

const Achievements = () => {
  const [showCompleted, setShowCompleted] = useState(true)
  const [sortBy, setSortBy] = useState('title')
  const [ascending, setAscending] = useState(true)

  const filteredAndSorted = useMemo(() => {
    let filtered = showCompleted ? initialAchievements : initialAchievements.filter(a => a.progress < 100)
    const sorted = [...filtered].sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      if (sortBy === 'title' || sortBy === 'reward') {
        return ascending ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (sortBy === 'progress') {
        return ascending ? aVal - bVal : bVal - aVal
      }
      return 0
    })
    return sorted
  }, [showCompleted, sortBy, ascending])

  const showConfetti = initialAchievements.some(a => a.progress >= 100)

  return (
    <motion.div className="max-w-4xl mx-auto px-6 pt-28 relative" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}>
      {showConfetti && <Confetti recycle={false} numberOfPieces={300} />}
      <h1 className="text-4xl font-bold text-center mb-6">🏅 Achievements</h1>

      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        {/* Toggle completed button */}
        <button
          onClick={() => setShowCompleted(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:brightness-110 transition shadow-md"
        >
          {showCompleted ? <EyeOff size={18} /> : <Eye size={18} />}
          {showCompleted ? 'Hide Completed' : 'Show Completed'}
        </button>

        {/* Sorting dropdown and direction */}
        <div className="flex items-center gap-2">
  <label htmlFor="sort" className="text-sm text-white/70">Sort By:</label>
  <div className="relative">
    <select
      id="sort"
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="text-pink-400 bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-md px-3 py-1 pr-8 rounded-lg appearance-none shadow-sm transition"
    >
      <option className="bg-dark-100 text-pink-400 hover:bg-pink-500 hover:text-white" value="title">Title</option>
      <option className="bg-dark-100 text-pink-400 hover:bg-pink-500 hover:text-white" value="progress">Progress</option>
      <option className="bg-dark-100 text-pink-400 hover:bg-pink-500 hover:text-white" value="reward">Reward</option>
    </select>
    <ChevronDown className="absolute right-2 top-2.5 text-pink-400 pointer-events-none" size={16} />
  </div>
  <button
    onClick={() => setAscending(prev => !prev)}
    className="text-pink-400 hover:text-pink-300 transition"
    title="Toggle sort direction"
  >
    {ascending ? <ArrowUpNarrowWide size={20} /> : <ArrowDownWideNarrow size={20} />}
  </button>
</div>
      </div>

      <div className="grid gap-5">
        {filteredAndSorted.map((a) => (
          <motion.div
            key={a.id}
            className="bg-dark-100 border border-white/10 rounded-xl p-5 flex items-center gap-4"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex-shrink-0">{achievementIcons[a.icon]}</div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold">{a.title}</h2>
              <p className="text-sm text-muted mt-1">Reward: <span className="text-white">{a.reward}</span></p>
              <ProgressBar progress={a.progress} />
            </div>
            {a.progress >= 100 && (
              <span className="text-green-400 font-semibold">✔ Completed</span>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Achievements
