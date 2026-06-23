import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import toast from 'react-hot-toast';

const ICONS = ['🐭', '🦉', '🐧', '🦋', '🐞'];
const MAX_PER_HOUR = 100;

export default function ClickFrenzy() {
  const { token, refreshUser, user } = useAuth();
  const [caught, setCaught]   = useState(0);
  const [targets, setTargets] = useState([]);
  const spawnerRef = useRef();

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
    }, 250);
    return () => clearInterval(spawnerRef.current);
  }, [caught]);

  useEffect(() => {
    const remover = setInterval(() => {
      setTargets(t => t.filter(x => Date.now() - x.id < 6000));
    }, 2000);
    return () => clearInterval(remover);
  }, []);

  useEffect(() => {
    async function loadFrenzyStats() {
      try {
        const res = await fetch(`${API_BASE}/api/games/click-frenzy`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Couldn’t load your click frenzy stats');
        const json = await res.json();
        setCaught(json.frenzyTotal);
      } catch (err) {
        console.error(err);
      }
    }
    loadFrenzyStats();
  }, [token]);

  const handleCatch = async (id, icon) => {
    setTargets(t => t.filter(x => x.id !== id));
    if (caught >= MAX_PER_HOUR) return;

    try {
      const res = await fetch(`${API_BASE}/api/games/click-frenzy`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clicks: 1, emoji: icon })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setCaught(json.frenzyTotal);
      toast.success(`+${json.reward} coins!`);
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_28%),linear-gradient(180deg,#050816_0%,#09090b_55%,#020202_100%)] pt-20 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <header className="rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-2xl backdrop-blur-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/45">Arcade</p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">Click Frenzy</h1>
              <p className="mt-2 text-white/65">Catch fast targets before the hourly cap runs out.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
                {caught} / {MAX_PER_HOUR}
              </span>
              <span className="rounded-full border border-white/10 bg-black/20 px-4 py-2">
                Balance {user.balance}
              </span>
            </div>
          </div>
        </header>

        <div className="relative min-h-[60vh] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03]">
          {caught < MAX_PER_HOUR && targets.map(t => (
            <div
              key={t.id}
              onClick={() => handleCatch(t.id, t.icon)}
              className="absolute target cursor-pointer rounded-full bg-white/15 p-2 text-5xl shadow-lg backdrop-blur-md transition-transform hover:scale-110"
              style={{ top: 0, left: t.left }}
            >
              {t.icon}
            </div>
          ))}

          {caught >= MAX_PER_HOUR && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <p className="text-center text-2xl font-semibold">
                Hourly limit reached! Come back later.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
