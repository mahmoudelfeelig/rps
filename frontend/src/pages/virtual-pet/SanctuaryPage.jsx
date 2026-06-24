import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../../api';
import toast from 'react-hot-toast';
import CritterCard from './CritterCard';
import { ActionButton, EmptyState, PageFrame, PageHero, StatCard } from '../../components/ui/page';

export default function SanctuaryPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [critters, setCritters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState({ coins: 0, food: {}, toys: {} });
  const [nextClaim, setNextClaim] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [starters, setStarters] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [crittersRes, userRes] = await Promise.all([
          axios.get(`${API_BASE}/api/critters/mine`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/api/user/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setCritters(crittersRes.data);
        const r = userRes.data.resources;
        if (r) {
          setResources(r);
          if (r.nextClaim) {
            const now = Date.now();
            setNextClaim(now + r.nextClaim);
            setTimeLeft(r.nextClaim);
          }
        }

        if (crittersRes.data.length === 0) {
          const starterRes = await axios.get(`${API_BASE}/api/critters/starters`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setStarters(starterRes.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [token]);

  useEffect(() => {
    if (!nextClaim) return;
    const iv = setInterval(() => {
      const diff = nextClaim - Date.now();
      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(iv);
      } else {
        setTimeLeft(diff);
      }
    }, 500);
    return () => clearInterval(iv);
  }, [nextClaim]);

  const formatTime = ms => {
    const m = Math.floor(ms / 60000);
    const s = String(Math.floor((ms % 60000) / 1000)).padStart(2, '0');
    return `${m}:${s}`;
  };

  const sum = obj => Object.values(obj || {}).reduce((a, b) => a + b, 0);

  const claimResources = () => {
    axios.get(`${API_BASE}/api/sanctuary/resources`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      const { newInventory, coinsAdded, foodAdded, toysAdded, nextClaim } = res.data;
      setResources(newInventory);
      setNextClaim(nextClaim);
      setTimeLeft(nextClaim - Date.now());
      toast.success(`+${coinsAdded} 🪙  +${sum(foodAdded)} 🍎  +${sum(toysAdded)} 🧸`);
    }).catch(err => {
      if (err.response?.status === 400 && err.response.data.nextClaim) {
        const n = err.response.data.nextClaim;
        setNextClaim(n);
        setTimeLeft(n - Date.now());
        toast.info('Too soon — try again later');
      } else {
        toast.error('Resource claim failed.');
      }
    });
  };

  const adoptStarter = (species) => {
    axios.post(`${API_BASE}/api/critters/adopt`, { species }, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      toast.success("Welcome your new critter!");
      window.location.reload();
    }).catch(() => toast.error("Adoption failed."));
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black pt-24 text-white">
        <div className="animate-pulse text-xl text-purple-300">Loading your sanctuary...</div>
      </div>
    );
  }

  if (critters.length === 0) {
    return (
      <PageFrame className="bg-[radial-gradient(circle_at_top,rgba(132,204,22,0.13),transparent_32%),linear-gradient(180deg,#04100b_0%,#09090b_55%,#020202_100%)]">
        <PageHero title="Choose your starter" description="Pick one critter to begin the sanctuary loop. You can collect more through gacha, shop, and breeding." meta="Pet Sanctuary" />
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {starters.map(s => (
            <div key={s.species} className="rounded-[32px] border border-white/10 bg-white/[0.06] p-5 text-center shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-lime-200/30">
              <img src={s.image} alt={s.species} className="mx-auto mb-3 h-28 w-28 object-contain" />
              <h2 className="text-lg font-semibold">{s.species}</h2>
              <p className="text-sm text-lime-300">{s.rarity}</p>
              <ActionButton
                onClick={() => adoptStarter(s.species)}
                className="mt-4 w-full"
                variant="emerald"
              >
                Adopt
              </ActionButton>
            </div>
          ))}
        </div>
      </PageFrame>
    );
  }

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_12%_0%,rgba(34,197,94,0.14),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(244,114,182,0.12),transparent_32%),linear-gradient(180deg,#04100b_0%,#09090b_55%,#020202_100%)]">
      <PageHero
        meta="Pet Sanctuary"
        title="Critter hub"
        description="Care for your critters, collect resources, open packs, visit the shop, and breed new generations."
        actions={(
          <>
            <StatCard label="Pet coins" value={resources.coins} tone="text-yellow-100" />
            <StatCard label="Critters" value={critters.length} tone="text-lime-100" />
          </>
        )}
      />

      <section className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ActionButton
            onClick={claimResources}
            disabled={timeLeft > 0}
            variant="emerald"
          >
            {timeLeft > 0 ? `Next claim in ${formatTime(timeLeft)}` : 'Claim Resources'}
        </ActionButton>
        <ActionButton onClick={() => navigate('/games/virtual-pet/gacha')} variant="rose">Gacha</ActionButton>
        <ActionButton onClick={() => navigate('/games/virtual-pet/shop')} variant="cyan">Shop</ActionButton>
        <ActionButton onClick={() => navigate('/games/virtual-pet/breeding')}>Breeding</ActionButton>
      </section>

      <section className="mb-8 rounded-[28px] border border-white/10 bg-white/[0.05] p-4 text-sm shadow-inner backdrop-blur-xl">
        <div className="mb-3 font-semibold text-white/80">Resources</div>
        <div className="flex flex-wrap gap-3">
        <div>Coins: <span className="text-yellow-300">{resources.coins}</span></div>
        {Object.entries(resources.food).map(([k, v]) => (
          <div key={k}>{k}: <span className="text-green-300">{v}</span></div>
        ))}
        {Object.entries(resources.toys).map(([k, v]) => (
          <div key={k}>{k}: <span className="text-blue-300">{v}</span></div>
        ))}
        </div>
      </section>

      {critters.length === 0 ? (
        <EmptyState title="No critters yet" description="Choose a starter or open a pack to begin." />
      ) : (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {critters.map(c => <CritterCard key={c._id} critter={c} />)}
      </div>
      )}
    </PageFrame>
  );
}
