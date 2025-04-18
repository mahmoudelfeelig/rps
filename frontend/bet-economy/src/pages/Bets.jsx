import React from 'react';
import { motion } from 'framer-motion';

const bets = [
  {
    id: 1,
    title: "Who’s Gonna Clutch in the Finals?",
    endTime: "2025-07-15",
    options: [
      { option: "Lakers in 5", odds: 2.2 },
      { option: "Oh my god we did it!", odds: 1.8 }
    ]
  },
  {
    id: 2,
    title: "Next Celebrity to Get Canceled",
    endTime: "2025-06-10",
    options: [
      { option: "Influencer #382", odds: 3.0 },
      { option: "The Guy Who Made Graduation", odds: 2.1 }
    ]
  },
  {
    id: 3,
    title: "Will RPSers Hangout Before Friday?",
    endTime: "2025-01-01",
    options: [
      { option: "Nope they're a bunch of monkeys!", odds: 4.5 },
      { option: "Absolutely!!(no.)", odds: 1.7 }
    ]
  },
  {
    id: 4,
    title: "Will RPS Survive civil war?",
    endTime: "2025-12-31",
    options: [
      { option: "Let’s Hope So!!", odds: 2.8 },
      { option: "First song on Take Care by drake.", odds: 2.4 }
    ]
  },
  {
    id: 5,
    title: "Will You Touch Grass This Month?",
    endTime: "2025-04-30",
    options: [
      { option: "Absolutely Not", odds: 1.5 },
      { option: "Only if Forced", odds: 2.6 }
    ]
  },
  {
    id: 6,
    title: "Will Zalabya's hairline be fixed?",
    endTime: "2025-04-19",
    options: [
      { option: "sure...", odds: 1.5 },
      { option: "laughing emoji", odds: 2.6 }
    ]
  }
];

const Bets = () => {
  return (
    <motion.section
      className="p-6 pt-28 bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] min-h-screen text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-4xl font-bold text-pink-400 mb-2">📈 Active Bets</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Real Paper Scammers™ is NOT responsible for any emotional damage.
          Bet at your own risk. Or don’t. I'm not your daddy or am I🤔?.
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bets.map((bet, index) => (
          <motion.div
            key={bet.id}
            className="p-5 bg-white/5 border border-white/10 rounded-xl hover:scale-[1.015] transition duration-300 backdrop-blur-md shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="mb-3">
              <h3 className="text-lg font-semibold text-pink-300">{bet.title}</h3>
              <p className="text-sm text-gray-400 mt-1">⏳ Ends on: {bet.endTime}</p>
            </div>
            <div className="space-y-3 mt-4">
              {bet.options.map((opt) => (
                <button
                  key={opt.option}
                  className="w-full flex justify-between items-center px-4 py-2 bg-pink-500/10 text-pink-300 border border-pink-500/30 rounded-md hover:bg-pink-500/20 transition"
                >
                  <span>{opt.option}</span>
                  <span className="font-bold">{opt.odds}x</span>
                </button>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        className="text-center mt-16 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p>Feeling lucky? No refunds. No regrets. 😎</p>
      </motion.div>
    </motion.section>
  );
};

export default Bets;
