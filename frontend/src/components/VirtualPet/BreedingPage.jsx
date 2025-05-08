import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useAuth }      from '../../context/AuthContext';
import { API_BASE }     from '../../api';
import { toast }        from 'react-toastify';

const ONE_DAY_MS      = 24*60*60*1000;
const PET_COST       = 500;
const GOLD_MULTIPLIER= 10;

// Tailwind colors → hex for inline styling in <option>
const rarityHex = {
  Common:    '#9CA3AF',
  Uncommon:  '#4ADE80',
  Rare:      '#60A5FA',
  Legendary: '#C084FC',
  Mythical:  '#F472B6'
};

const rarityColors = {
  Common:    'text-gray-400',
  Uncommon:  'text-green-300',
  Rare:      'text-blue-400',
  Legendary: 'text-purple-400',
  Mythical:  'text-pink-400'
};

// format ms -> HH:MM:SS
function formatMs(ms) {
  const totalSec = Math.max(0, Math.floor(ms/1000));
  const h = String(Math.floor(totalSec/3600)).padStart(2,'0');
  const m = String(Math.floor((totalSec%3600)/60)).padStart(2,'0');
  const s = String(totalSec%60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

// display name helper
const getDisplayName = c => c.variant || c.species;

// combine names + gen
function makeChildName(a, b, gen) {
  const halfA = Math.ceil(a.length/2);
  const halfB = Math.floor(b.length/2);
  return `${a.slice(0,halfA)}${b.slice(halfB)}-G${gen}`;
}

// countdown card
function CountdownCard({ critter, label, targetAt }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const iv = setInterval(()=>setNow(Date.now()),1000);
    return ()=>clearInterval(iv);
  }, []);
  const rem = targetAt - now;
  return (
    <div className="flex items-center gap-3 bg-gray-800 p-3 rounded-lg shadow">
      <img
        src={`/assets/critters/${critter.species.toLowerCase()}.png`}
        alt={getDisplayName(critter)}
        className="w-16 h-16 rounded-lg"
      />
      <div>
        <div className={`font-medium ${rarityColors[critter.rarity] || ''}`}>
          {getDisplayName(critter)}
        </div>
        <div className="text-sm text-yellow-400">
          {label}: {formatMs(rem)}
        </div>
      </div>
    </div>
  );
}

export default function BreedingPage() {
  const { token } = useAuth();
  const [critters, setCritters] = useState([]);
  const [eggs, setEggs]         = useState([]);
  const [parentA, setParentA]   = useState('');
  const [parentB, setParentB]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pet');
  const [balanceData, setBalanceData] = useState({ gold:0, pet:0 });

  // reload data every 10s
  useEffect(() => {
    const load = () => {
      axios.get(`${API_BASE}/api/critters/mine`, { headers:{Authorization:`Bearer ${token}`} })
        .then(r=>setCritters(r.data))
        .catch(()=>toast.error('Load critters failed'));
      axios.get(`${API_BASE}/api/breeding/eggs`, { headers:{Authorization:`Bearer ${token}`} })
        .then(r=>setEggs(r.data))
        .catch(()=>setEggs([]));
    };
    load();
    const iv = setInterval(load, 10000);
    return ()=>clearInterval(iv);
  }, [token]);

  // balances
  useEffect(() => {
    axios.get(`${API_BASE}/api/user/me`, { headers:{Authorization:`Bearer ${token}`} })
      .then(r=>setBalanceData({ gold:r.data.balance, pet:r.data.resources.coins }))
      .catch(console.error);
  }, [token]);

  const now = Date.now();
  const critA = critters.find(c=>c._id===parentA);
  const critB = critters.find(c=>c._id===parentB);

  // classify parents
  const activeBreed = critters.filter(c=>c.breeding?.hatchAt && new Date(c.breeding.hatchAt) > now);
  const cooling     = critters.filter(c=>
    !c.breeding?.hatchAt &&
    c.lastHatchedAt &&
    now - new Date(c.lastHatchedAt) < ONE_DAY_MS
  );
  const availableParents = critters.filter(c=>
    !activeBreed.includes(c) && !cooling.includes(c)
  );

  // preview offspring
  const preview = React.useMemo(() => {
    if (!critA || !critB) return null;
    const R = ['Common','Uncommon','Rare','Legendary','Mythical'];
    const iA = R.indexOf(critA.rarity), iB = R.indexOf(critB.rarity);
    const childRarity = R[Math.min(iA,iB)];
    let childSpecies;
    if (childRarity===critA.rarity && childRarity===critB.rarity) {
      childSpecies = `${critA.species} / ${critB.species}`;
    } else {
      childSpecies = iA < iB ? critA.species : critB.species;
    }
    const generation = Math.max(critA.generation, critB.generation) + 1;
    const variant = makeChildName(critA.variant||critA.species, critB.variant||critB.species, generation);
    return { childSpecies, childRarity, generation, variant };
  }, [critA, critB]);

  // costs & cooldown
  const costPet  = PET_COST;
  const costGold = PET_COST * GOLD_MULTIPLIER;
  const cost     = paymentMethod==='gold'?costGold:costPet;
  const canAfford= paymentMethod==='gold'
    ? balanceData.gold >= cost
    : balanceData.pet >= cost;
  const parentACd = critA?.breeding?.hatchAt && now < new Date(critA.breeding.hatchAt);
  const parentBCd = critB?.breeding?.hatchAt && now < new Date(critB.breeding.hatchAt);
  const canBreed  = critA && critB && !parentACd && !parentBCd && canAfford;

  const handleBreed = () => {
    if (!canBreed) return;
    axios.post(`${API_BASE}/api/breeding/critters/breed`,
      { parentA, parentB, paymentMethod },
      { headers:{Authorization:`Bearer ${token}`}}
    )
    .then(()=>toast.success('Breeding started!'))
    .catch(e=>toast.error(e.response?.data?.error||'Failed'));
  };

  const handleHatch = id => {
    axios.post(`${API_BASE}/api/breeding/eggs/${id}/hatch`, {}, { headers:{Authorization:`Bearer ${token}`}})
      .then(()=>toast.success('Hatched!'))
      .catch(e=>toast.error(e.response?.data?.error||'Hatch failed'));
  };

  const selectClasses = `
    w-full bg-gray-700 text-white text-sm
    px-4 py-2 rounded border border-gray-600
    focus:outline-none focus:ring-2 focus:ring-purple-500
    appearance-none
  `;

  return (
    <div className="pt-20 p-6 text-white space-y-6">
      {/* Title + Balances */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">🧬 Breed Critters</h2>
        <div className="text-lg">
          🪙 Gold: <span className="font-semibold">{balanceData.gold}</span> 
          🍪 Pet Coins: <span className="font-semibold">{balanceData.pet}</span>
        </div>
      </div>

      {/* Breeding form */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {['A','B'].map(side=>{
          const setter = side==='A' ? setParentA : setParentB;
          const val    = side==='A' ? parentA : parentB;
          return (
            <div key={side}>
              <label className="block mb-2 font-medium">Parent {side}</label>
              <select
                value={val}
                onChange={e=>setter(e.target.value)}
                className={selectClasses}
              >
                <option value="">-- choose --</option>
                {availableParents.map(c=>(
                  <option
                    key={c._id}
                    value={c._id}
                    style={{ color: rarityHex[c.rarity] }}
                  >
                    {getDisplayName(c)} (Lvl {c.level})
                  </option>
                ))}
              </select>
            </div>
          );
        })}

        {/* Payment & Breed */}
        <div className="flex flex-col justify-center">
          <div className="mb-4">
            <label className="mr-4">
              <input type="radio" name="pay" value="pet"
                checked={paymentMethod==='pet'}
                onChange={()=>setPaymentMethod('pet')}
                className="mr-2"/>
              Pet Coins ({PET_COST})
            </label>
            <label>
              <input type="radio" name="pay" value="gold"
                checked={paymentMethod==='gold'}
                onChange={()=>setPaymentMethod('gold')}
                className="mr-2"/>
              Gold Coins ({costGold})
            </label>
          </div>
          <button
            onClick={handleBreed}
            disabled={!canBreed}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            Breed {cost} {paymentMethod==='gold'?'🪙':'🍪'}
          </button>
        </div>
      </section>

      {/* Preview Offspring */}
      {preview && (
        <section className="bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">👶 Expected Offspring</h3>
          <div className="flex items-center gap-4">
            <img
              src={`/assets/critters/${preview.childSpecies.split(' / ')[0].toLowerCase()}.png`}
              alt={preview.variant}
              className="w-20 h-20 rounded-lg"
            />
            <div>
              <div className={`font-medium ${rarityColors[preview.childRarity]}`}>
                {preview.variant}
              </div>
              <div className="text-sm text-white/60">
                Species:{' '}
                <span className={rarityColors[preview.childRarity]}>
                  {preview.childSpecies}
                </span>
              </div>
              <div className="text-sm">
                Rarity:{' '}
                <span className={rarityColors[preview.childRarity]}>
                  {preview.childRarity}
                </span>
              </div>
              <div className="text-sm">Generation: {preview.generation}</div>
            </div>
          </div>
        </section>
      )}

      {/* Pending Eggs */}
      {eggs.length>0 && (
        <section>
          <h3 className="font-semibold mb-2">Pending Eggs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {eggs.map(egg => {
              const rem = new Date(egg.hatchAt) - now;
              const ready = rem <= 0;
              return (
                <div key={egg._id} className="bg-gray-800 p-4 rounded-lg">
                  <div className={`font-medium ${rarityColors[egg.child.rarity]}`}>
                    {egg.child.variant}
                  </div>
                  <div className="text-sm text-white/60 mb-2">
                    {egg.child.species} (Gen {egg.child.generation})
                  </div>
                  <div className="text-sm mb-2">
                    {ready
                      ? <span className="text-green-400">Ready to hatch</span>
                      : <span className="text-yellow-400">
                          Hatches in {formatMs(rem)}
                        </span>}
                  </div>
                  <button
                    onClick={()=>handleHatch(egg._id)}
                    disabled={!ready}
                    className="btn-primary btn-sm w-full disabled:opacity-50"
                  >
                    Hatch
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Currently Breeding */}
      {activeBreed.length>0 && (
        <section>
          <h3 className="font-semibold mb-2">Currently Breeding</h3>
          <div className="space-y-2">
            {activeBreed.map(c=>(
              <CountdownCard 
                key={c._id} 
                critter={c} 
                label="Hatches in" 
                targetAt={new Date(c.breeding.hatchAt)} 
              />
            ))}
          </div>
        </section>
      )}

      {/* Cooldown */}
      {cooling.length>0 && (
        <section>
          <h3 className="font-semibold mb-2">Cooldown (1d)</h3>
          <div className="space-y-2">
            {cooling.map(c=>{
              const elapsed = now - new Date(c.lastHatchedAt);
              const rem     = ONE_DAY_MS - elapsed;
              return (
                <CountdownCard
                  key={c._id}
                  critter={c}
                  label="Available in"
                  targetAt={now + rem}
                />
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
