import { Home, Crown, Target, ShoppingBag, Medal } from "lucide-react"
import { Link } from "react-router-dom"
import Elephant from "../assets/elephant.svg"

const Navbar = () => (
  <nav className="bg-dark-900 bg-opacity-70 backdrop-blur-md p-4 px-8 shadow-xl flex justify-between items-center text-white">
    <div className="flex items-center gap-3">
      <img src={Elephant} alt="Elephant Icon" onClick={() => window.location.reload()} className="w-10 cursor-pointer" />
    </div>
    <div className="flex gap-8 items-center text-sm md:text-base">
      <Link to="/" className="flex items-center gap-2 hover:text-pink-400 transition">
        <Home size={18} /> Home
      </Link>
      <Link to="/leaderboard" className="flex items-center gap-2 hover:text-pink-400 transition">
        <Crown size={18} /> Leaderboard
      </Link>
      <Link to="/tasks" className="flex items-center gap-2 hover:text-pink-400 transition">
        <Target size={18} /> Tasks
      </Link>
      <Link to="/store" className="flex items-center gap-2 hover:text-pink-400 transition">
        <ShoppingBag size={18} /> Store
      </Link>
      <Link to="/achievements" className="flex items-center gap-2 hover:text-pink-400 transition">
        <Medal size={18} /> Achievements
      </Link>
    </div>
  </nav>
)

export default Navbar
