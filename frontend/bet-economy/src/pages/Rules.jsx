import React from "react";
import { motion } from "framer-motion";

const Rules = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] text-gray-100 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto py-20 px-6">
        <motion.div
          className="bg-dark-100 p-10 rounded-xl border border-dark-200 shadow-xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-pink-400 mb-8">📜 The Officially Unofficial Rules</h1>

          <ul className="space-y-6 list-disc list-inside text-lg leading-relaxed">
            <li>
              🕒 <strong>Place your bets before the timer runs out.</strong> I don't do time machines here (yet).
            </li>
            <li>
              💔 <strong>Hearts and badges are strictly personal.</strong> No tradesies with your beta cuck "friends".
            </li>
            <li>
              💸 <strong>Final odds = final payout.</strong> When "Lakers in 🖐️" wins and you didn’t bet, cope.
            </li>
            <li>
              🧠 <strong>The algorithm is always right.</strong> Unless it isn’t. I don’t care either way.
            </li>
            <li>
              🚫 <strong>No actual money involved(unless🤔).</strong> If you think you're rich, I promise you that you're not.
            </li>
            <li>
              🔥 <strong>If you're not having fun...</strong> maybe you're the problem gang.
            </li>
            <li>
              🪙 <strong>There's no I in team,</strong> But there's I in win idk where I'm going with this.
            </li>
            <li>
              🎰 <strong>ALL IN ON GREEN</strong> 🤑🤑🤑🤑🤑
            </li>
            <li>
              🐘 <strong>Respect the Elephant.</strong> You don't wanna get trunked.
            </li>
          </ul>

          <div className="mt-10 text-center text-sm text-gray-500 italic">
            <p>
              “By reading these, you waive all rights to common sense. Ready, Play, Show!(im running out of ideas)”
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Rules;
