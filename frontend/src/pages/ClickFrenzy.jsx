import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api';
import toast from 'react-hot-toast';

const ICONS = ['🐭','🦉','🐧','🦋','🐞'];
const MAX_PER_HOUR = 100;

export default function ClickFrenzy() {
  const { token, refreshUser, user } = useAuth();
  // Local caught state, starts at 0
  const [caught, setCaught] = useState(0);
  const [targets, setTargets] = useState([]);
  const spawnerRef = useRef();

  // On mount, you could load previous count if your API returned it;
  // here we start fresh each session.

  // Spawn targets every 0.8s while under limit
  useEffect(() => {
    if (caught >= MAX_PER_HOUR) return;
    spawnerRef.current = setInterval(() => {
      const id = Date.now() + Math.random();
      setTargets(t => [
        ...t,
        {
          id,
          icon: ICONS[Math.floor(Math.random() * ICONS.length)],
          left: `${10 + Math.random() * 80}%`
        }
      ]);
    }, 800);
    return () => clearInterval(spawnerRef.current);
  }, [caught]);

  // Remove targets older than 6s
  useEffect(() => {
    const remover = setInterval(() => {
      setTargets(t => t.filter(x => Date.now() - x.id < 6000));
    }, 2000);
    return () => clearInterval(remover);
  }, []);

  const handleCatch = async id => {
    // remove from UI immediately
    setTargets(t => t.filter(x => x.id !== id));
    if (caught >= MAX_PER_HOUR) return;

    try {
      const res = await fetch(`${API_BASE}/api/games/click-frenzy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clicks: 1 })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      // update caught from backend's frenzyTotal
      setCaught(json.frenzyTotal);

      // refresh balance and other stats
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white main-content">
      <header className="p-6 flex justify-between items-center border-b border-white/10">
        <h1 className="text-4xl font-bold">🖱️ Click Frenzy</h1>
        <div className="text-lg flex items-center space-x-4">
          <span><strong>{caught}</strong> / {MAX_PER_HOUR}</span>
          <span>|</span>
          <span>Balance: <strong>{user.balance}</strong></span>
        </div>
      </header>

      <div className="relative flex-1 overflow-hidden">
        {caught < MAX_PER_HOUR && targets.map(t => (
          <div
            key={t.id}
            onClick={() => handleCatch(t.id)}
            className="absolute target cursor-pointer text-5xl p-2 rounded-full bg-white/20 backdrop-blur-sm shadow-lg hover:scale-110 transition-transform"
            style={{ top: '-3rem', left: t.left }}
          >
            {t.icon}
          </div>
        ))}

        {caught >= MAX_PER_HOUR && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <p className="text-2xl font-semibold">Hourly limit reached! Come back later.</p>
          </div>
        )}
      </div>
    </div>
  );
}
