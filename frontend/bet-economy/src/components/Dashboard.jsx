import { useState } from 'react'
import BetList from '../pages/Bets'
import PropTypes from 'prop-types'

const Dashboard = () => {
  const balance = 2450.75

  const badges = [
    { name: 'High Roller', desc: 'Awarded for maintaining a high balance over time.' },
    { name: 'Newbie', desc: 'Given to all new users. Welcome aboard!' },
    { name: 'Lucky Streak', desc: 'You’ve won 5+ bets in a row. Luck is real.' },
  ]

  const [selectedBadge, setSelectedBadge] = useState(null)

  const handleBadgeClick = (badge) => {
    setSelectedBadge((prev) => (prev?.name === badge.name ? null : badge))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* Welcome & Balance */}
        <section className="bg-gradient-to-r from-pink-500 to-purple-700 p-8 rounded-2xl shadow-lg border border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-4xl font-extrabold mb-1 tracking-tight text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                Welcome Back, Addict!!
              </h1>
              <p className="text-sm text-white/70">Ready to roll the dice?</p>
            </div>
            <span className="px-4 py-1 text-sm bg-white/10 text-white rounded-full border border-white/10 backdrop-blur">
              💎 VIP Member
            </span>
          </div>

          <div className="text-5xl font-extrabold text-white mt-6 tracking-tight">
            ${balance.toLocaleString()}
          </div>
        </section>

        {/* BetList */}
        <section>
          <BetList />
        </section>

        {/* Badges */}
        <section className="bg-white/5 p-6 sm:p-8 rounded-2xl shadow-md border border-white/10 backdrop-blur">
          <h2 className="text-2xl font-bold text-pink-400 mb-6 flex items-center gap-2">
            ✨ your badges
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <div
                key={badge.name}
                onClick={() => handleBadgeClick(badge)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleBadgeClick(badge)}
                className={`bg-white/5 border border-white/10 rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform shadow-sm ${
                  selectedBadge?.name === badge.name ? 'ring-2 ring-pink-500' : ''
                }`}
              >
                <div className="text-3xl mb-2">🏅</div>
                <div className="text-white font-medium">{badge.name}</div>
              </div>
            ))}
          </div>

          {selectedBadge && (
            <div className="mt-6 bg-white/10 p-4 rounded-xl text-white border border-white/10 transition-all duration-300">
              <h3 className="text-lg font-semibold mb-1">{selectedBadge.name}</h3>
              <p className="text-sm text-white/80">{selectedBadge.desc}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

Dashboard.propTypes = {}

export default Dashboard
