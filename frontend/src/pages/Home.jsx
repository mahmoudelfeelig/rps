import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE } from '../api';
import { Typewriter } from 'react-simple-typewriter';

export default function Home() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/leaderboard/users?sort=balance`)
      .then((r) => r.json())
      .then((data) => setTopUsers(data.slice(0, 5)))
      .catch((err) => console.error('Leaderboard fetch error:', err));
  }, []);

  return (
    <div className="text-white pt-24 min-h-screen bg-gradient-to-b from-black via-[#1a1a1a] to-[#121212]">
      {/* Hero Section */}
      <section className="text-center py-20 px-6">
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold mb-6 text-pink-400"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typewriter
            words={['Welcome to a new era of gambling.']}
            loop={false}
            cursor
            cursorStyle="|"
            typeSpeed={50}
            deleteSpeed={0}
            delaySpeed={1000}
          />
        </motion.h1>

        <motion.p
          className="text-xl max-w-2xl mx-auto text-gray-300 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Welcome to <span className="text-pink-400">Risk Paper Scammers</span> — the ultimate playground for high-stakes mini-games, stylish profiles, and leaderboard domination.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Link
            to="/dashboard"
            className="bg-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition"
          >
            Risky Playing Space!
          </Link>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          transition={{ staggerChildren: 0.15 }}
        >
          {[
            { title: 'Track Your Bets', desc: 'Analyze every prediction and result.' },
            { title: 'Unlock Badges', desc: 'Earn achievements that show off your skill.' },
            { title: 'Join Communities', desc: 'Compete with others in shared goals.' },
            { title: 'Complete Daily Tasks', desc: 'Earn coins and fame through routine grind.' },
            { title: 'Customize Profile', desc: 'Flex your style and stats visually.' },
            { title: 'Shop Powerups', desc: 'Spend wisely — or risk it all.' }
          ].map(({ title, desc }) => (
            <motion.div
              key={title}
              className="bg-white/5 p-6 rounded-xl shadow-md hover:scale-[1.02] transition backdrop-blur-md border border-white/10"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-2 text-pink-400">{title}</h3>
              <p className="text-gray-300">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Leaderboard Preview */}
      <section className="px-6 pb-20">
        <div className="max-w-2xl mx-auto bg-black/40 p-6 rounded-2xl backdrop-blur border border-white/10 shadow-md">
          <h2 className="text-xl font-bold text-center text-pink-400 mb-4">🏆 Top Players</h2>
          <ul className="divide-y divide-white/10">
            {topUsers.map((user, i) => (
              <li key={user._id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/60 w-5 text-right">{i + 1}.</span>
                  <img
                    src={
                      user.profileImage
                        ? user.profileImage.startsWith('http')
                          ? user.profileImage
                          : `${API_BASE}${user.profileImage}`
                        : '/default-avatar.png'
                    }
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-white/10"
                  />
                  <Link
                    to={`/profile/${user.username}`}
                    className="text-white hover:underline text-sm font-medium"
                  >
                    {user.username}
                  </Link>
                </div>
                <span className="text-pink-300 font-bold text-sm">${user.balance.toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
