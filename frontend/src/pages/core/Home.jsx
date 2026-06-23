import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_BASE } from '../../api';
import {
  CircleDollarSign,
  Gamepad2,
  ShieldCheck,
  Sparkles,
  PawPrint,
  BarChart3
} from 'lucide-react';

export default function Home() {
  const [topUsers, setTopUsers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/leaderboard/users?sort=balance`)
      .then((r) => r.json())
      .then((data) => setTopUsers(data.slice(0, 5)))
      .catch((err) => console.error('Leaderboard fetch error:', err));
  }, []);

  return (
    <div className="text-white pt-24 min-h-screen">
      <section className="py-14 sm:py-20 px-2 sm:px-6">
        <motion.h1
          className="max-w-4xl mx-auto text-4xl sm:text-6xl font-black text-center text-white"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          A browser arcade for bets, pets, and quick games.
        </motion.h1>

        <motion.p
          className="mt-5 max-w-2xl mx-auto text-center text-base sm:text-lg text-white/65"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Risk Paper Scammers keeps the loop short: open the app, play a round, manage your critters, and move on.
        </motion.p>

        <motion.div className="mt-8 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
          <Link
            to="/dashboard"
            className="btn-primary px-6 py-3 text-sm sm:text-base"
          >
            Open dashboard
          </Link>
        </motion.div>
      </section>
      <section className="px-2 sm:px-6 py-6 sm:py-12 max-w-7xl mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-120px' }}
          transition={{ staggerChildren: 0.08 }}
        >
          {[
            { title: 'Track bets', desc: 'Review results, histories, and outcomes.', icon: CircleDollarSign },
            { title: 'Play arcade games', desc: 'Spinner, Minefield, RPS, and daily puzzles.', icon: Gamepad2 },
            { title: 'Manage critters', desc: 'Feed, evolve, breed, and run mini-games.', icon: PawPrint },
            { title: 'Claim progress', desc: 'Earn tasks, achievements, and shop rewards.', icon: Sparkles },
            { title: 'Protect accounts', desc: 'Keep profiles, privacy, and admin controls tidy.', icon: ShieldCheck },
            { title: 'Watch the board', desc: 'Follow balances and top-player movement.', icon: BarChart3 },
          ].map(({ title, desc, icon: Icon }) => (
            <motion.div
              key={title}
              className="glass-card p-6 hover:-translate-y-1 transition will-change-transform"
              whileHover={{ scale: 1.02 }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-pink-300">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{title}</h3>
              <p className="text-sm text-white/65 leading-6">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>
      <section className="px-2 sm:px-6 pb-20">
        <div className="max-w-3xl mx-auto glass-card-strong p-5 sm:p-6">
          <h2 className="text-center text-xl sm:text-2xl font-bold mb-4">Top players</h2>
          <ul className="divide-y divide-white/10">
            {topUsers.map((user, i) => (
              <li key={user._id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50 w-5 text-right">{i + 1}.</span>
                  <img
                    src={
                      user.profileImage
                        ? user.profileImage.startsWith('http')
                          ? user.profileImage
                          : `${API_BASE}${user.profileImage}`
                        : '/assets/avatars/default-avatar.png'
                    }
                    alt={user.username}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                  />
                  <Link to={`/profile/${user.username}`} className="text-white text-sm font-medium hover:underline">
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
