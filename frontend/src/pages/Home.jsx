import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import gambling from '../assets/gambling.png';

const Home = () => {
  return (
    <div className="text-white pt-24 min-h-screen bg-gradient-to-b from-black via-[#1a1a1a] to-[#121212]">
      <section className="text-center py-20 px-6">
        <motion.h1
          className="text-5xl md:text-6xl font-bold mb-4"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Welcome to <span className="text-pink-400">Real Paper Scammers</span>
        </motion.h1>
        <motion.p
          className="text-xl max-w-2xl mx-auto text-gray-300 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          RPS is your gateway to social prediction games. Join groups, earn points, unlock badges, and rise to the top in style!
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            to="/dashboard"
            className="bg-white text-black px-8 py-3 rounded-full font-semibold shadow-md hover:scale-105 transition"
          >
            Risky Play Space!
          </Link>
        </motion.div>
      </section>

      <section className="py-16 px-6 max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          transition={{ staggerChildren: 0.2 }}
        >
          {[
            { id: 'track-bets', title: 'Track Your Bets', desc: 'Log and analyze every prediction you make.' },
            { id: 'unlock-badges', title: 'Unlock Badges', desc: 'Earn exclusive rewards for completing tasks.' },
            { id: 'join-communities', title: 'Join Communities', desc: 'Compete in dynamic groups and dominate rankings.' },
            { id: 'daily-tasks', title: 'Complete Daily Tasks', desc: 'Stay active and earn hearts daily.' },
            { id: 'customize-profile', title: 'Customize Your Profile', desc: 'Show off your style and stats.' },
            { id: 'shop-powerups', title: 'Shop for Powerups', desc: 'Buy badges, XP boosts, and rare items.' },
          ].map(({ id, title, desc }) => (
            <motion.div
              key={id}
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

        <div className="mt-20 text-center">
          <img
            src={gambling}
            alt="Gambling"
            className="rounded-2xl mx-auto shadow-xl max-w-lg border border-pink-500/30"
          />
          <p className="text-sm text-gray-400 mt-4">Bet irresponsibly. Enjoy the game.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
