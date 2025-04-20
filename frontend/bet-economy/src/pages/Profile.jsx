import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Edit,
  LogOut,
  Trash,
  Smile,
  Ghost,
  UploadCloud,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { useAuth } from '../context/AuthContext'

const compliments = [
  'you ate that',
  'not everyone can pull it off like you',
  'your vibe is immaculate',
  'you’re the main character',
  'you slayed effortlessly',
  'ur energy is unmatched',
  'you understood the assignment',
  'you got that dog in you',
  'ur glow is unignorable',
  'your aura says boss',
  'ur laugh cures depression',
  'you’re serving looks and substance',
  'not everyone’s built like you',
  'you make chaos look good',
  'you radiate iconic energy',
  'you’re fashion week without trying',
  'you dev like a menace in the best way',
  'you’re built like a cheat code',
  'ur whole vibe is elite',
  'ur presence is a flex',
  'ur existence is a soft launch for greatness',
  'you’re the plot twist no one saw coming',
  'ur jokes hit every time',
  'you’re literally the reason the internet exists',
  'ur enemies stay obsessed',
  'you code like a sleep paralysis demon',
  'ur app crashes more than my self-esteem',
  'your logic got beef with reality',
  'even ai can’t fix you',
  'you write code like it’s fanfiction',
  'you debug like a confused grandma',
  'you got that deprecated aura',
  'ur app screams “beta energy”',
  'you style divs like you’re blindfolded',
  'you test in prod like a menace',
  'even clippy wouldn’t help you',
  'you commit like you’re starting drama',
  'ur code needs therapy',
  'you type like you hate the keyboard',
  'you be shipping bugs with confidence',
  'you out here freelancing for chaos',
  'ur repo gives me trust issues',
  'ur css is crying for help',
  'ur bug count is giving leaderboard vibes',
  'you dev like it’s a prank show',
  'ur project got ghosted by standards',
  'ur codebase got jump scares',
  'you be committing sins not code',
  'your frontend is a crime scene',
  'you dev like your keyboard owes you money'
]
const Profile = () => {
  const { user, token, login, logout } = useAuth()
  const [compliment, setCompliment] = useState('')
  const [ghostMode, setGhostMode] = useState(false)
  const [showEditFields, setShowEditFields] = useState(false)
  const [username, setUsername] = useState(user?.username || '')
  const [email, setEmail] = useState(user?.email || '')
  const [password, setPassword] = useState('')
  const [image, setImage] = useState(user?.image || null)
  const [imageFile, setImageFile] = useState(null)

  useEffect(() => {
    if (ghostMode) {
      const trail = document.createElement('div')
      trail.className = 'ghost-trail'
      document.body.appendChild(trail)

      const interval = setInterval(() => {
        const ghost = document.createElement('div')
        ghost.textContent = '👻'
        ghost.className = 'ghost'
        ghost.style.left = `${Math.random() * 100}vw`
        ghost.style.top = `${Math.random() * 100}vh`
        document.body.appendChild(ghost)
        setTimeout(() => ghost.remove(), 1000)
      }, 150)

      setTimeout(() => {
        clearInterval(interval)
        setGhostMode(false)
      }, 5000)
    }
  }, [ghostMode])

  const handleCompliment = () => {
    const random = compliments[Math.floor(Math.random() * compliments.length)]
    setCompliment(random)
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImage(URL.createObjectURL(file))
      setImageFile(file)
    }
  }

  const handleSave = async () => {
    const formData = new FormData()
    formData.append('username', username)
    formData.append('email', email)
    if (password) formData.append('password', password)
    if (imageFile) formData.append('image', imageFile)

    try {
      const res = await fetch(`http://localhost:5000/user/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        login({ token, user: data }) // update context/localStorage
        alert('Profile updated!')
      } else {
        alert(data.message || 'Failed to update profile')
      }
    } catch (err) {
      console.error(err)
      alert('Error updating profile')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <motion.div className="max-w-2xl mx-auto space-y-8" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Profile Info */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 flex items-center justify-center text-2xl font-bold overflow-hidden">
            {image ? <img src={image} alt="Preview" className="w-full h-full object-cover" /> : 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-semibold">Your Profile</h1>
            <p className="text-sm text-gray-400">real pluh scum idk man</p>
          </div>
        </div>

        {/* Feel Good Section */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold text-pink-400 flex items-center gap-2"><Smile className="w-5 h-5" />Feel Good Stuff</h2>
          <div className="flex gap-4 flex-wrap">
            <Button onClick={handleCompliment}><Smile className="w-5 h-5" /> Compliment Me</Button>
            <Button onClick={() => setGhostMode(true)} className="bg-purple-700 hover:bg-purple-800"><Ghost className="w-5 h-5" /> Ghost Mode</Button>
          </div>
          {compliment && <p className="mt-4 text-lg text-center text-purple-300 italic">“{compliment}”</p>}
        </div>

        {/* Edit Profile */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold text-blue-400 flex items-center gap-2"><Edit className="w-5 h-5" /> Profile Settings</h2>
          <Button onClick={() => setShowEditFields(!showEditFields)} className="bg-pink-600 hover:bg-pink-700"><Edit className="w-5 h-5" /> Edit Profile</Button>

          {showEditFields && (
            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white/10">
                  {image ? <img src={image} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-full h-full p-3 text-gray-400" />}
                </div>
                <input type="file" className="hidden" onChange={handleImageChange} />
                <span className="text-sm text-gray-400">Change Profile Picture</span>
              </label>

              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="New Username" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="New Email" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg" />

              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave}>Save Changes</Button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold text-red-400">☠️ Danger Zone</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="bg-red-600 hover:bg-red-700"><Trash className="w-5 h-5" /> Delete Account</Button>
            <Button onClick={logout} className="border border-red-600 text-red-400 hover:bg-red-600/10"><LogOut className="w-5 h-5" /> Logout</Button>
          </div>
        </div>
      </motion.div>

      <style>{`
        .ghost {
          position: absolute;
          font-size: 1.5rem;
          pointer-events: none;
          animation: floaty 1s ease-out forwards;
        }
        @keyframes floaty {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px) scale(1.2); }
        }
      `}</style>
    </div>
  )
}

export default Profile
