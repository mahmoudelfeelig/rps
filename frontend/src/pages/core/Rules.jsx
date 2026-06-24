import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, ShieldCheck, Award, AlertTriangle, Receipt, Trophy } from 'lucide-react';

const rules = [
  {
    icon: Clock3,
    title: 'Start with games',
    text: 'Play RPS, casino games, puzzle rush, and pet mini-games to build your balance and unlock progress.'
  },
  {
    icon: Award,
    title: 'Earn coins',
    text: 'Coins come from wins, daily tasks, achievements, market dividends, and special rewards.'
  },
  {
    icon: Receipt,
    title: 'Place smart bets',
    text: 'Check odds and timers before joining a bet. Once a bet closes, your pick is locked.'
  },
  {
    icon: Trophy,
    title: 'Grow your profile',
    text: 'Use your winnings to buy items, collect badges, raise critters, and climb the leaderboards.'
  },
  {
    icon: ShieldCheck,
    title: 'Trade carefully',
    text: 'Review every trade before accepting. Inventory, coins, and services should only move when you confirm.'
  },
  {
    icon: AlertTriangle,
    title: 'Play fair',
    text: 'Do not automate games, abuse bugs, or spam requests. Exploits can lead to removed rewards or bans.'
  }
];

export default function Rules() {
  return (
    <div className="min-h-screen pt-24 px-2 sm:px-4 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black">Rules</h1>
            <p className="mt-4 text-sm sm:text-base text-white/65 max-w-2xl mx-auto">
              A quick guide for earning, betting, trading, and keeping the game fair.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {rules.map((rule) => (
              <motion.div
                key={rule.title}
                className="glass-card p-5"
                whileHover={{ y: -2 }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-pink-300">
                  <rule.icon size={20} />
                </div>
                <h2 className="text-lg font-semibold">{rule.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/65">{rule.text}</p>
              </motion.div>
            ))}
          </div>
          <div className="glass-card-strong p-5 sm:p-6 text-center">
            <p className="text-sm sm:text-base text-white/70 leading-7">
              Check your dashboard for open trades, active rewards, inventory, and recent progress.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
