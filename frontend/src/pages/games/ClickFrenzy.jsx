import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';
import toast from 'react-hot-toast';
import { PageFrame, PageHero, StatCard } from '../../components/ui/page';

const ICONS = ['A', 'B', 'C', 'D', 'E'];
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
      const reward = json.reward ?? ((json.baseReward || 0) + (json.boostedProfit || 0));
      toast.success(`Collected ${reward} coins`);
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_5%,rgba(99,102,241,0.16),transparent_32%),radial-gradient(circle_at_88%_2%,rgba(34,211,238,0.11),transparent_32%),linear-gradient(180deg,#050816_0%,#09090b_55%,#020202_100%)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <PageHero
          title="Click Frenzy"
          description="Catch fast targets before the hourly cap runs out. Short bursts, low commitment, steady coin flow."
          actions={(
            <>
              <StatCard label="Caught" value={`${caught} / ${MAX_PER_HOUR}`} tone="text-cyan-100" />
              <StatCard label="Balance" value={`${Number(user?.balance || 0).toLocaleString()} coins`} tone="text-amber-100" />
            </>
          )}
        />

        <div className="relative min-h-[60vh] overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.03] shadow-2xl">
          {caught < MAX_PER_HOUR && targets.map(t => (
            <div
              key={t.id}
              onClick={() => handleCatch(t.id, t.icon)}
              className="target absolute flex h-16 w-16 cursor-pointer items-center justify-center rounded-full border border-cyan-200/25 bg-cyan-300/15 text-2xl font-black shadow-lg backdrop-blur-md transition-transform hover:scale-110 sm:h-20 sm:w-20"
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
    </PageFrame>
  );
}
