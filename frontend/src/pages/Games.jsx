import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';

const gameDetails = {
  spinner: {
    name: 'Lucky Spinner',
    description: 'Try your luck once a day!',
    icon: '🎰',
  },
  casino: {
    name: 'Casino',
    description: 'High stakes betting!',
    icon: '🃏',
  },
  minefield: {
    name: 'Minefield',
    description: 'Big risk, big reward!',
    icon: '💣',
  },
  'click-frenzy': {
    name: 'Click Frenzy',
    description: 'Click as fast as you can!',
    icon: '🖱️',
  },
  rps: {
    name: 'RPS PvP',
    description: 'Rock Paper Scissors with a twist!',
    icon: '✊✋✌️',
  },
  'puzzle-rush': {
    name: 'Puzzle Rush',
    description: 'Daily bite-sized puzzles for coins!',
    icon: '🧩',
  },
  'virtual-pet': {
    name: 'Pet Sanctuary',
    description: 'Adopt & care for critters to earn affection points!',
    icon: '🐾',
  },
  'mystery-box': {
    name: 'Mystery Box',
    description: 'Get surprise loot!',
    icon: '📦',
  },
  '-tycoon': {
    name: 'Factory Tycoon',
    description: 'Build production lines and prestige your corp!',
    icon: '🏭',
  },
  'merge-lab': {
    name: 'Merge Lab',
    description: 'Drag & merge identical items to upgrade!',
    icon: '🧪',
  },
  'quiz-duel': {
    name: 'Quiz Duel Arena',
    description: 'Head-to-head trivia battles under a timer!',
    icon: '❓',
  },
  'idle-ngu': {
    name: 'Idle NGU',
    description: 'Earn passively. Upgrade smart.',
    icon: '⚙️',
  },
};

export default function Games() {
  const { token } = useAuth();
  const navigate = useNavigate();


  // all games will be unlocked by default by commenting this out
  // useEffect(() => {
  //   fetch(`${API_BASE}/api/games/progress`, {
  //     headers: { Authorization: `Bearer ${token}` },
  //   })
  //     .then(r => r.json())
  //     .then(data => {
  //       setUnlocked(data.unlockedGames || []);
  //     })
  //     .catch(console.error);
  // }, [token]);

  return (
    <div className="min-h-screen pt-24 px-6 bg-black text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-purple-400">🎮 Your Games</h1>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(gameDetails).map(([slug, game]) => {
            const isUnlocked = true;

            return (
              <div
                key={slug}
                className={`rounded-xl p-5 border shadow-lg transition hover:scale-105 cursor-pointer ${
                  isUnlocked
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-white/5 border-white/10 text-white/40 pointer-events-none'
                }`}
                onClick={() => isUnlocked && navigate(`/games/${slug}`)}
              >
                <div className="text-4xl mb-2 text-center">{game.icon}</div>
                <h2 className="text-lg font-semibold">{game.name}</h2>
                <p className="text-sm">{game.description}</p>
                {!isUnlocked && (
                  <p className="text-xs mt-2 text-center text-red-400">Locked</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}