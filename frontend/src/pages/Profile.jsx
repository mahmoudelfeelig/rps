import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, LogOut, Ghost, UploadCloud, Smile, Trash2, Eye, EyeOff, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useAuth } from '../context/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { API_BASE } from '../api';

const compliments = [
  "you lowkey the blueprint", "you a whole vibe fr", "you been that", "you move like a main quest character",
  "you got ppl pressed without trying", "ur energy got ppl in a chokehold", "you real for that", "you slay without clocking in",
  "you got that soft menace charm", "you funny w/o tryna be", "ur aura be radiating peace & chaos", "you walk like you own background music",
  "you the reason good days happen", "you built like a plot twist", "you different and it’s obvious", "you dress like your Pinterest boards came to life",
  "you got that good kinda delulu", "you trend in private", "you make silence feel safe", "you got NPCs turning heads",
  "you laugh like a blessing", "you out here rewriting vibes", "you healed and chaotic, I fear", "you be giving nostalgia for moments that never happened",
  "you a whole soft launch", "you act like a signed artist", "you existing makes the room better", "you look like the internet missed you",
  "you talk like soft thunder", "you be ghosting like a pro and we respect it", "you shine like it’s personal", "you just... *you* and that’s the flex"
];
const insults = [
  "you move like your phone always on 1%", "you built like a late assignment", "you laugh like a skipped ad", "you got main character energy... in a filler episode",
  "you give strong ‘unseasoned fries’ vibes", "you out here serving glitchy energy", "you got beef with peace", "you post like a Tumblr ghost",
  "you be taking Ls recreationally", "you look like a reboot nobody asked for", "you text like autocorrect gave up", "you got that ‘left on read’ aura",
  "you built like a soft block", "you ghost like WiFi in the woods", "you move like a group project member", "you got rizz… but it’s expired",
  "you deliver like USPS on Sunday", "you confuse vibes for personality", "you built like a forgotten password", "you try hard but it's giving beta energy",
  "you walk like a loading screen", "you bring snacks to red flags", "you got the sauce… but it’s mayo", "you move like you got one brain cell on break",
  "you dress like vibes betrayed you", "you talk like captions off", "you a limited edition... but for a reason", "you be missing the vibe check like it's dodgeball",
  "you got ick energy on standby", "you be thinking out loud and it shows", "you bold... and it’s concerning", "you’re the ‘before’ pic in a transformation story"
];

const Profile = () => {
  const { user, token, login, logout } = useAuth();
  const [compliment, setCompliment] = useState('');
  const [ghostMode, setGhostMode] = useState(false);
  const [showEditFields, setShowEditFields] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [image, setImage] = useState(user?.image ? `${API_BASE}${user.image}` : null);
  const [imageFile, setImageFile] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [screenInverted, setScreenInverted] = useState(false);
  const [lockedOrbs, setLockedOrbs] = useState(false);
  const [orbEmojis, setOrbEmojis] = useState(['', '', '']);
  const [userInteracted, setUserInteracted] = useState(false);
  const [stats, setStats]       = useState(null)
  const [error, setError]       = useState('')


  useEffect(() => {
    const handler = () => setUserInteracted(true);
    window.addEventListener('click', handler, { once: true });
    return () => window.removeEventListener('click', handler);
  }, []);

  useEffect(() => {
    if (!token) return
    const load = async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/user/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.message || 'Could not load stats')
        setStats(data)
      } catch (err) {
        setError(err.message)
        toast.error(err.message)
      }
    }
    load()
  }, [token])
  

  const MoodOrb = ({ index, onUpdate, locked }) => {
    const moods = ['🌈', '✨', '💅', '🌀', '💀', '🔥', '😈', '🌸', '🤡', '🫠', '🧃', '🧸', '🍲'];
    const [emoji, setEmoji] = useState(moods[Math.floor(Math.random() * moods.length)]);
  
    useEffect(() => {
      if (locked) return;
  
      const interval = setInterval(() => {
        const newEmoji = moods[Math.floor(Math.random() * moods.length)];
        setEmoji(newEmoji);
        onUpdate(index, newEmoji);
      }, 5000);
  
      return () => clearInterval(interval);
    }, [locked, index, onUpdate]);
  
    return (
      <motion.div 
        className="text-5xl text-center cursor-pointer"
        whileHover={{ scale: 1.2 }}
        onClick={() => {
          if (emoji === '💀') {
            setScreenInverted(true);
            setTimeout(() => setScreenInverted(false), 10000);
            new Audio('/sounds/spooky.mp3').play();
          }
        }}
      >
        {emoji}
      </motion.div>
    );
  };
  
  const updateOrbEmoji = (index, newEmoji) => {
    if (lockedOrbs) return;
  
    setOrbEmojis((prev) => {
      const updated = [...prev];
      updated[index] = newEmoji;
  
      const allMatch = updated.every(e => e && e === updated[0]);
      if (allMatch) {
        setLockedOrbs(true);
  
        const matchEmoji = updated[0];
  
        if (matchEmoji === '🍲') {
          setCompliment('You are a culinary genius!');
          playSadSound();
        } else if (matchEmoji === '💀') {
          setCompliment('You are a ghostly presence!');
          playSpookySound();
        } else {
          setCompliment('DING DING DING YOU WIN! 🎰🎰🎰');
          playGoodSound();
          showMoneyEffect();
        }
  
        // Unlock + clear after 5 seconds
        setTimeout(() => {
          setLockedOrbs(false);
          setOrbEmojis(['', '', '']);
        }, 5000);
      }
  
      return updated;
    });
  };
  

  useEffect(() => {
    if (ghostMode) {
      const trail = document.createElement('div')
      trail.className = 'ghost-trail'
      document.body.appendChild(trail)
  
      const ghostInterval = setInterval(() => {
        const ghost = document.createElement('div')
        ghost.textContent = '👻'
        ghost.className = 'ghost'
        ghost.style.left = `${Math.random() * 95}vw`
        ghost.style.top = `${Math.random() * 95}vh`
        ghost.style.transform = `scale(${Math.random() * 0.5 + 0.5})`
        document.body.appendChild(ghost)
  
        ghost.animate([
          { opacity: 1, transform: 'translateY(0) rotate(0deg)' },
          { opacity: 0.5, transform: 'translateY(-20px) rotate(15deg)' },
          { opacity: 0, transform: 'translateY(-50px) rotate(30deg)' }
        ], {
          duration: 1500,
          easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        }).onfinish = () => ghost.remove()
  
      }, 100) // Faster spawn rate for denser trail
  
      setTimeout(() => {
        clearInterval(ghostInterval)
        trail.remove()
        setGhostMode(false)
      }, 5000)
  
      return () => {
        clearInterval(ghostInterval)
        trail.remove()
      }
    }
  }, [ghostMode])

  const handleCompliment = () => {
    const allLines = Math.random() > 0.5 ? compliments : insults;
    const random = allLines[Math.floor(Math.random() * allLines.length)];
    setCompliment(random);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setImageFile(file);
    }
  };
  
  const showMoneyEffect = () => {
    for (let i = 0; i < 15; i++) {
      const coin = document.createElement('div');
      coin.textContent = '💸';
      coin.className = 'ghost';
      coin.style.left = `${Math.random() * 100}vw`;
      coin.style.top = `${Math.random() * 100}vh`;
      document.body.appendChild(coin);
      setTimeout(() => coin.remove(), 1200);
    }
  };
  
  const playGoodSound = () => {
    if (!userInteracted) return;
    const audio = new Audio('/sounds/cash-register.mp3');
    setTimeout(() => audio.play().catch(() => {}), 100);
  };
  
  const playSadSound = () => {
    if (!userInteracted) return;
    const audio = new Audio('/sounds/sad-trombone.mp3');
    setTimeout(() => audio.play().catch(() => {}), 100);
  };
  
  const playSpookySound = () => {
    if (!userInteracted) return;
    const audio = new Audio('/sounds/spooky.mp3');
    setTimeout(() => audio.play().catch(() => {}), 100);
  };

  const getPasswordStrength = (password) => {
    if (!password) return '';
    if (password.length >= 12 && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password)) {
      return 'strong';
    } else if (password.length >= 8) {
      return 'medium';
    } else {
      return 'weak';
    }
  };  
  
  const handleSave = async () => {
    setIsLoading(true);
    try {

      const formData = new FormData();
      if (username !== user.username) formData.append('username', username);
      if (password) formData.append('password', password);
      if (imageFile) formData.append('image', imageFile);

      const res = await fetch(`${API_BASE}/api/user/update`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      
      const data = await res.json();
      if (res.ok) {
        login({ token, user: data });
        toast.success('Profile updated!');
        setPassword('');
        setShowEditFields(false);
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className={`min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white relative ${screenInverted ? 'invert filter' : ''}`}>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#333', color: '#fff' } }} />

      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="flex flex-col items-center gap-4"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <div className="w-12 h-12 border-4 border-t-pink-500 border-r-purple-500 border-b-transparent border-l-transparent rounded-full" />
              <span className="text-gray-300">Processing...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="max-w-2xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>

        {/* Profile Header */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-purple-700 overflow-hidden">
            <img src={
              user.profileImage
                ? `${API_BASE}${user.profileImage}`
                : '/default-avatar.png'
            } 
            alt="Profile" 
            className="w-full h-full object-cover" />
          </div>
          <div>
          <Link to={`/profile/${user?.username}`} className="text-blue-500 hover:underline">
            @{user.username}
          </Link>  
          <p className="text-sm text-gray-400">{user?.role || 'user'} · 🪙 {user?.balance || 0}</p>
          </div>
        </div>

        {/* Feel Good Section */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl backdrop-blur">          <h2 className="text-xl font-semibold text-pink-400 flex items-center gap-2"><Smile className="w-5 h-5" />Vibe Zone</h2>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={handleCompliment}
              disabled={isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              {isLoading ? "Manifesting..." : "Vibe Check"}
            </Button>
            
            <Button
              onClick={() => setGhostMode(true)}
              disabled={isLoading}
              className="bg-purple-700 hover:bg-purple-800 text-white flex items-center gap-2"
            >
              <Ghost className="w-5 h-5" />
              Boo..
            </Button>

            <div className="flex gap-4 relative">
              {[0, 1, 2].map((index) => (
                <div key={index} className={`relative ${lockedOrbs ? 'animate-pulse' : ''}`}>
                  <MoodOrb index={index} onUpdate={updateOrbEmoji} locked={lockedOrbs} />
                  {lockedOrbs && <div className="absolute inset-0 bg-white/10 backdrop-sm rounded-full" />}
                </div>
              ))}
            </div>
          </div>
          {compliment && <p className="mt-4 text-lg text-center text-purple-300 italic">“{compliment}”</p>}
        </div>

        {/* Edit Profile Section */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-6 shadow-xl backdrop-blur">
          <Button
            onClick={() => setShowEditFields(!showEditFields)}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white flex items-center justify-center gap-2"
          >
            <Edit className="w-5 h-5" />
            {showEditFields ? "Close Editor" : "Glow Up Mode"}
          </Button>

          {showEditFields && (
            <div className="mt-6 space-y-4">
              <label className="flex items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-white/20 bg-white/10">
                  {image ? <img src={image} alt="Preview" className="w-full h-full object-cover" /> : <UploadCloud className="w-full h-full p-3 text-gray-400" />}
                </div>
                <input type="file" className="hidden" onChange={handleImageChange} />
                <span className="text-sm text-gray-400">New FitPic</span>
              </label>

              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="New Username" className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg" />

              <div className="relative">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPassword(val);
                    setPasswordStrength(getPasswordStrength(val));
                  }}
                  placeholder="New Password"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg pr-10"
                />
                <div className="absolute right-3 top-2.5 cursor-pointer text-gray-400" onClick={() => setPasswordVisible(!passwordVisible)}>
                  {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </div>
              </div>
              
              {password && (
                <p className={`text-sm font-medium ${passwordStrength === 'strong' ? 'text-green-400' : passwordStrength === 'medium' ? 'text-yellow-400' : 'text-red-400'}`}>
                  Password strength: {passwordStrength}
                </p>
              )}

              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 w-full"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                ) : 'Lock It In'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl backdrop-blur flex justify-between items-center">
        <Button
          onClick={logout}
          disabled={isLoading}
          className="border border-red-600 text-red-400 hover:bg-red-900/50 flex items-center gap-2"
        >
          <LogOut className="w-5 h-5" />
          Peace Out
        </Button>
        
        <Button
          onClick={() => setShowDeleteModal(true)}
          disabled={isLoading}
          className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          {isLoading ? 'Self-Destructing...' : 'Nuke Account'}
        </Button>
      </div>
    </motion.div>

      {/* Ghost Mode Effect */}
      <AnimatePresence>
        {ghostMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 pointer-events-none"
          >
            {[...Array(40)].map((_, i) => (
              <motion.div
                key={i}
                className="ghost absolute text-2xl"
                initial={{
                  x: Math.random() * 100 + 'vw',
                  y: Math.random() * 100 + 'vh',
                  scale: Math.random() * 0.5 + 0.5
                }}
                animate={{
                  x: Math.random() * 100 + 'vw',
                  y: '-30vh',
                  opacity: [1, 0.5, 0],
                  scale: [1, 1.5],
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 2 + Math.random() * 3,
                  repeat: Infinity,
                  repeatType: 'loop'
                }}
              >
                👻
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Profile;