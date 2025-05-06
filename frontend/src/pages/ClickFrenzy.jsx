import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api';
import toast from 'react-hot-toast';

// icons to “hunt”
const ICONS = ['🐭','🦉','🐧','🦋','🐞'];
const MAX_PER_HOUR = 100;

export default function ClickFrenzy() {
  const { token, refreshUser, user } = useAuth();
  const [targets, setTargets] = useState([]);
  const [caught,  setCaught]  = useState(0);

  // spawn one target per second
  useEffect(() => {
    const spawner = setInterval(() => {
      const id = Date.now() + Math.random();
      setTargets(t => [...t, {
        id,
        icon: ICONS[Math.floor(Math.random()*ICONS.length)],
        left: `${Math.random()*90}%`
      }]);
    }, 1000);
    return () => clearInterval(spawner);
  }, []);

  // remove offscreen after 6s
  useEffect(() => {
    const remover = setInterval(() => {
      setTargets(t => t.filter(x => Date.now() - x.id < 6000));
    }, 2000);
    return () => clearInterval(remover);
  }, []);

  const handleCatch = async id => {
    if (caught >= MAX_PER_HOUR) return;
    setTargets(t => t.filter(x => x.id !== id));
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
      setCaught(c => c + 1);
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-b from-indigo-900 to-black text-white">
      <header className="p-4 flex justify-between items-center">
        <h1 className="text-3xl font-bold">🖱️ Click Frenzy</h1>
        <div className="text-sm">
          Caught: <span className="font-semibold">{caught}</span> / {MAX_PER_HOUR} &nbsp;|&nbsp;
          Balance: <span className="font-semibold">{user.balance}</span>
        </div>
      </header>

      {targets.map(t => (
        <button
          key={t.id}
          onPointerDown={() => handleCatch(t.id)}
          className="absolute target text-3xl p-1 rounded-full shadow-lg animate-fall"
          style={{ top: -50, left: t.left }}
        >
          {t.icon}
        </button>
      ))}

      {caught >= MAX_PER_HOUR && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
          <p className="text-xl">Hourly limit reached! Come back later.</p>
        </div>
      )}
    </div>
  );
}
