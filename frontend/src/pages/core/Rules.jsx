import React from 'react';
import { motion } from 'framer-motion';
import { Clock3, ShieldCheck, Award, AlertTriangle, MessageSquareQuote, Receipt, Trophy, Sparkles } from 'lucide-react';

const rules = [
  {
    icon: Clock3,
    title: 'Timed markets',
    text: 'Bets and games close when their timer ends. Once a window is closed, it stays closed.'
  },
  {
    icon: ShieldCheck,
    title: 'Account integrity',
    text: 'Keep profiles, badges, and inventory tied to the correct account.'
  },
  {
    icon: Award,
    title: 'Earned progress',
    text: 'Rewards should come from play, tasks, or collection progress.'
  },
  {
    icon: AlertTriangle,
    title: 'Fair play',
    text: 'No automation, abuse, or intentional exploitation of game systems.'
  },
  {
    icon: MessageSquareQuote,
    title: 'Clear feedback',
    text: 'When something fails, the app should explain why and keep the state readable.'
  },
  {
    icon: Receipt,
    title: 'Proof matters',
    text: 'Bets, trades, and final results should leave a visible history.'
  },
  {
    icon: Trophy,
    title: 'Competition stays visible',
    text: 'Leaderboards and progress indicators should make the loop easy to understand.'
  },
  {
    icon: Sparkles,
    title: 'Keep it tidy',
    text: 'Prefer coherent design and concise copy over decorative noise.'
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
              Short version: keep the app usable, fair, and easy to read.
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
              If something looks noisy, inconsistent, or hard to read, it should be simplified.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
