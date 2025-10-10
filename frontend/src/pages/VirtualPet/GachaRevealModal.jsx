import React, { useEffect, useRef, useState } from 'react';

const RARITY_EMOJI = {
  Mythical: '🌟',
  Legendary: '🔮',
  Rare: '💎',
  Uncommon: '✨',
  Common: '🔹'
};
const RARITY_COLOR = {
  Mythical: 'text-pink-400',
  Legendary: 'text-purple-400',
  Rare: 'text-blue-400',
  Uncommon: 'text-green-300',
  Common: 'text-gray-300'
};

export default function GachaRevealModal({ items, onClose }) {
  const [index, setIndex] = useState(-1);
  const [skipped, setSkipped] = useState(false);
  const timerRef = useRef();

  const sorted = [...items].sort(
    (a, b) => rarityOrder(b.rarity) - rarityOrder(a.rarity)
  );

  useEffect(() => {
    advance();
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (!skipped && index >= 0 && index < sorted.length) {
      advance();
    }
  }, [index, skipped]);

  function advance() {
    timerRef.current = setTimeout(
      () => setIndex(i => Math.min(i + 1, sorted.length)),
      600
    );
  }

  function handleSkip() {
    clearTimeout(timerRef.current);
    setSkipped(true);
    setIndex(sorted.length);
  }

  function rarityOrder(r) {
    return ['Common', 'Uncommon', 'Rare', 'Legendary', 'Mythical'].indexOf(r);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 p-6 rounded-xl w-11/12 max-w-2xl text-center relative">
        <button
          className="absolute top-3 right-3 text-white text-xl"
          onClick={onClose}
        >
          ✖
        </button>

        {!skipped && index < sorted.length ? (
          <>
            <div className="text-white mb-4">Revealing…</div>
            {index >= 0 && (
              <div className="inline-block p-4 bg-gray-800 rounded-lg animate-scale-up">
                <img
                  src={`/assets/critters/${sorted[index].species.toLowerCase()}.png`}
                  alt={sorted[index].species}
                  className="w-32 h-32 object-contain mx-auto"
                />
                <div className="mt-2 text-lg text-yellow-300">
                  {sorted[index].species}
                </div>
                <div
                  className={`text-sm ${RARITY_COLOR[sorted[index].rarity]}`}
                >
                  {RARITY_EMOJI[sorted[index].rarity]} {sorted[index].rarity}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {Object.entries(sorted[index].traits).map(([k, v]) => (
                    <span key={k} className="mr-2">
                      <strong>{k}:</strong> {v}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              className="mt-6 btn-secondary"
              onClick={handleSkip}
            >
              Skip Animation
            </button>
          </>
        ) : (
          <>
            <div className="text-white text-xl mb-4">Results</div>
            <div className="grid grid-cols-5 gap-4">
              {sorted.map((it, i) => (
                <div key={i} className="bg-gray-800 p-2 rounded-lg">
                  <img
                    src={`/assets/critters/${it.species.toLowerCase()}.png`}
                    alt={it.species}
                    className="w-full h-20 object-contain"
                  />
                  <div className="mt-1 text-sm text-yellow-300">
                    {it.species}
                  </div>
                  <div className={`text-xs ${RARITY_COLOR[it.rarity]}`}>
                    {RARITY_EMOJI[it.rarity]} {it.rarity}
                  </div>
                  <div className="text-xxs text-gray-400 mt-1">
                    {Object.entries(it.traits).map(([k, v]) => (
                      <div key={k}>
                        <strong>{k}:</strong> {v}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="mt-6 btn-primary">
              Done
            </button>
          </>
        )}
      </div>
    </div>
  );
}
