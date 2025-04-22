import React from "react";
import { motion } from "framer-motion";

const Rules = () => {
  const rules = [
    { 
      emoji: "⏳", 
      title: "Clockout Chronicles", 
      text: "Bets close when the timer's drier than the 'we need to talk' text. No extensions - im not your delulu ex(if you even have one)" 
    },
    { 
      emoji: "💎", 
      title: "Flex Lock", 
      text: "Hearts/badges stay on lock like last year's FitPics. No group projects energy here" 
    },
    { 
      emoji: "🤖", 
      title: "Algorithm Overlords", 
      text: "The algorithm feeds on chaos. Argue with it = automatic L + ratio + your WiFi gets shy + pharaoh curse" 
    },
    { 
      emoji: "👀", 
      title: "Vibe Violations", 
      text: "No NPC behavior. If your takes are mid, we reserve the right to: 🚫 your icks" 
    },
    { 
      emoji: "📉", 
      title: "Brokeology 101", 
      text: "This ain't Webull. Lose pretend money = free therapy. Win pretend money = temporary rizz" 
    },
    { 
      emoji: "🚫", 
      title: "Hindsight Haters", 
      text: "'Knew it' people get Thanos-snapped. Take your silent L like canned laughter" 
    },
    { 
      emoji: "🍿", 
      title: "Drama Dividend", 
      text: "Spill tea = +5% odds boost. I'm here for the plot twists and my DMs are open" 
    },
    { 
      emoji: "📸", 
      title: "Receipts Rule", 
      text: "Post Ws without proof? That's a 2am 'u up?' energy. We need screenshots or it's cap" 
    },
    { 
      emoji: "🎰", 
      title: "Devious Deals", 
      text: "Final odds hit different than your Spotify Wrapped. No takebacksies - cope or mald" 
    },
    { 
      emoji: "🐘", 
      title: "Elephant in the Room", 
      text: "I made this for me, not you. If you don't like it, go cry in the corner or get a therapist"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-black text-gray-100 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            The Unspoken Scriptures 🌚
          </h1>

          <div className="space-y-6">
            {rules.map((rule, index) => (
              <motion.div
                key={index}
                className="group bg-zinc-900/50 backdrop-blur-sm p-6 rounded-xl border border-zinc-800 hover:border-purple-400/30 transition-all"
                whileHover={{ x: 5 }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{rule.emoji}</span>
                  <div>
                    <h3 className="font-medium text-lg mb-1.5 text-gray-200">
                      {rule.title}
                    </h3>
                    <p className="text-gray-400 font-light leading-relaxed">
                      {rule.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="mt-12 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-center"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <p className="text-sm text-zinc-400 italic mb-2">
              "By reading this, you agree that:<br/>
              delulu was the solulu • no taksie backsies • i own your firstborn and 5th favorite cousin"
            </p>
            <div className="text-xs text-zinc-600 mt-2">
              [Not financial advice • Not relationship advice • Not actual advice]
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rules;