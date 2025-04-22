import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const NotFound = () => {
  return (
    <div className="relative min-h-screen bg-dark flex items-center justify-center text-center text-white px-4 overflow-hidden">
      {/* Glowing blob background */}
      <div className="absolute w-96 h-96 bg-gradient-to-br from-pink-500 to-purple-600 opacity-30 rounded-full blur-3xl animate-pulse -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-7xl font-extrabold text-pink-500 mb-4">404 🚫</h1>
        <p className="text-2xl font-light mb-3">Well, this is awkward.</p>
        <p className="text-lg text-white/70 mb-8">
          The page you're looking for doesn't exist. Maybe it ran off to join your species at the circus?
        </p>
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500 text-black font-semibold px-6 py-3 rounded-full shadow-lg transition-all"
        >
          🏠 Back to Safety
        </Link>
      </motion.div>
    </div>
  )
}

export default NotFound
