import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const Home = () => {
  return (
    <motion.div
      className="min-h-screen pt-32 px-6 text-center bg-gradient-to-b from-black via-gray-900 to-black text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <h1 className="text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#D94E8F] to-[#B145A1]">
        Welcome to BetEconomy 🤑
      </h1>
      <p className="text-xl mb-12 max-w-2xl mx-auto">
        Predict, play, and profit! Join groups, earn rewards, and rise to the top.
      </p>

      <div className="flex flex-wrap justify-center gap-6">
        <Link to="/auth" className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D94E8F] to-[#B145A1] hover:scale-105 transition text-white font-semibold">
          Get Started
        </Link>
        <Link to="/leaderboard" className="px-6 py-3 rounded-xl bg-white/10 border border-white hover:scale-105 transition text-white font-semibold">
          View Leaderboard
        </Link>
      </div>

      <motion.div
        className="mt-20 grid md:grid-cols-3 gap-6 text-left"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ staggerChildren: 0.3 }}
      >
        {["Make Bets", "Track Achievements", "Shop Unique Items"].map((title, i) => (
          <motion.div
            key={i}
            className="bg-white/5 p-6 rounded-xl shadow-md backdrop-blur-sm"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <h2 className="text-2xl font-bold mb-2 text-pink-400">{title}</h2>
            <p className="text-gray-300">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default Home
