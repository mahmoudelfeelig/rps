import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import {
  CheckCircle,
  CalendarDays,
  Award,
  Flame,
  Search,
  EyeOff,
  Eye,
  ArrowDownAZ,
  ArrowUpZA,
} from 'lucide-react';

const allTasks = [
  // --- DAILY ---
  { title: 'Place 5 Bets', description: 'Complete 5 bets today.', type: 'Daily', reward: '💸 50', completed: true },
  { title: 'Win 3 Bets', description: 'Win 3 bets in a row.', type: 'Daily', reward: '🔥 Badge', completed: false },
  { title: 'Open the App', description: 'Just log in. That’s it.', type: 'Daily', reward: '💸 20', completed: true },
  { title: 'Click Stuff Fast', description: 'Tap random buttons like your life depends on it.', type: 'Daily', reward: '💸 10', completed: false },
  { title: 'Daily Stretch', description: 'Do one stretch IRL. Honor system.', type: 'Daily', reward: '🏅 Badge', completed: false },
  { title: 'Meme React', description: 'React to a bet with the crying emoji.', type: 'Daily', reward: '💸 25', completed: false },
  { title: 'Ghost Ping Someone', description: 'Send a message then delete it. Why not?', type: 'Daily', reward: '💸 30', completed: false },
  { title: 'Post a Win Streak', description: 'Flex your wins in the group chat.', type: 'Daily', reward: '🏆 Badge', completed: false },

  // --- WEEKLY ---
  { title: 'Invite a Friend', description: 'Get a friend to join your group.', type: 'Weekly', reward: '💸 100', completed: false },
  { title: 'Complete All Tasks', description: 'Finish every task for extra rewards!', type: 'Weekly', reward: '🏆 Badge', completed: false },
  { title: 'Join a Group', description: 'Be social, kinda.', type: 'Weekly', reward: '💸 75', completed: true },
  { title: 'Talk Trash (Nicely)', description: 'Send a message with 🔥 in it.', type: 'Weekly', reward: '💸 40', completed: false },
  { title: 'Watch a Bet Lose in Real Time', description: 'Cry together.', type: 'Weekly', reward: '🥲 Badge', completed: false },
  { title: 'Host a Group Bet', description: 'Lead your minions.', type: 'Weekly', reward: '💸 60', completed: false },
  { title: 'Clown Yourself', description: 'Admit you fumbled a lock.', type: 'Weekly', reward: '🤡 Badge', completed: false },

  // --- BONUS ---
  { title: 'Win a Bonus Bet', description: 'Clutch that underdog pick.', type: 'Bonus', reward: '💸 200', completed: false },
  { title: 'Spam the Leaderboard', description: 'Click it 20 times.', type: 'Bonus', reward: '🐘 Trophy', completed: false },
  { title: 'Lose Gracefully', description: 'Lose 3 bets in a row (oops).', type: 'Bonus', reward: '😂 Badge', completed: false },
  { title: 'Bet on Something Ridiculous', description: 'Like weather or coin flips.', type: 'Bonus', reward: '💸 90', completed: false },
  { title: 'Start Drama in Chat', description: 'Lighthearted only. No actual beef.', type: 'Bonus', reward: '🍿 Badge', completed: false },
  { title: 'Randomly Switch Picks', description: 'Change sides for no reason.', type: 'Bonus', reward: '🎭 Badge', completed: false },
  { title: 'Type in All Caps', description: 'YELL FOR NO REASON.', type: 'Bonus', reward: '💸 50', completed: false },
  { title: 'Take a Break', description: 'Log out for 10 minutes.', type: 'Bonus', reward: '🧘 Badge', completed: false },
];

const tabIcons = {
  Daily: <CalendarDays className="inline-block w-4 h-4 mr-2" />,
  Weekly: <Flame className="inline-block w-4 h-4 mr-2" />,
  Bonus: <Award className="inline-block w-4 h-4 mr-2" />,
};

const typeStyles = {
  Daily: 'from-pink-500/10 to-purple-500/10 border-pink-400/30 text-pink-400',
  Weekly: 'from-blue-500/10 to-indigo-500/10 border-blue-400/30 text-blue-400',
  Bonus: 'from-yellow-500/10 to-orange-500/10 border-yellow-400/30 text-yellow-400',
};

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('Daily');
  const [search, setSearch] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortKey, setSortKey] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);

  const parseRewardValue = (reward) => {
    const match = reward.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const sortOptions = [
    { key: 'title', label: 'Title' },
    { key: 'rewardValue', label: 'Reward Money' },
    { key: 'completed', label: 'Completion' },
  ];

  let filteredTasks = allTasks
    .filter((task) => task.type === activeTab)
    .filter((task) => !hideCompleted || !task.completed)
    .filter((task) => task.title.toLowerCase().includes(search.toLowerCase()))
    .map((task) => ({
      ...task,
      rewardValue: parseRewardValue(task.reward),
    }))
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      } else {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
    });

  const total = allTasks.filter((t) => t.type === activeTab).length;
  const completed = allTasks.filter((t) => t.type === activeTab && t.completed).length;

  return (
    <div className="flex flex-col min-h-screen pt-24 px-6 max-w-6xl mx-auto">
      <div className="sticky top-0 bg-dark-900 pb-4 z-50">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex gap-4">
            {['Daily', 'Weekly', 'Bonus'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full border shadow transition text-sm font-medium flex items-center ${
                  activeTab === tab
                    ? `bg-gradient-to-r ${typeStyles[tab]} border-opacity-50`
                    : 'bg-dark-200 text-gray-400 border-gray-700'
                }`}
              >
                {tabIcons[tab]}
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-3 items-center flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-dark-100 text-sm pl-8 pr-3 py-2 rounded-md border border-dark-300 text-gray-300"
              />
            </div>

            <button
              onClick={() => setHideCompleted((prev) => !prev)}
              className="flex items-center px-3 py-2 text-sm bg-dark-100 border border-dark-300 rounded-md hover:border-gray-600 transition"
            >
              {hideCompleted ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
              {hideCompleted ? 'Show Completed' : 'Hide Completed'}
            </button>

            <div className="flex gap-2 items-center">
              {/* Sort Dropdown */}
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value)}
                  className="appearance-none bg-dark-100 border border-dark-300 text-sm text-gray-300 px-3 py-2 pr-8 rounded-md focus:outline-none hover:border-gray-500 transition"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.key} value={opt.key} className="bg-dark-100 text-gray-300">
                      Sort by {opt.label}
                    </option>
                  ))}
                </select>
                {/* Optional dropdown caret */}
                <div className="pointer-events-none absolute right-2 top-2.5 text-gray-400">
                  ▼
                </div>
              </div>

              {/* Sort Direction Toggle (moved out of the select) */}
              <button
                onClick={() => setSortAsc((prev) => !prev)}
                className="p-2 border border-dark-300 rounded-md bg-dark-100 hover:bg-dark-200 text-gray-300 transition"
              >
                {sortAsc ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpZA className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mb-2 text-gray-400 text-sm">
          Progress: <span className="text-white">{completed}</span>/<span className="text-white">{total}</span> completed
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pb-20">
        {filteredTasks.map((task, idx) => (
          <motion.div
            key={task.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card
              className={`rounded-xl p-5 shadow-xl relative overflow-hidden transition-all hover:scale-[1.01] ${
                task.completed
                  ? 'bg-gradient-to-r from-green-400/10 to-green-300/10 border border-green-300/30'
                  : `bg-gradient-to-r ${typeStyles[task.type]} border`
              }`}
            >
              {task.completed && (
                <motion.div
                  className="absolute inset-0 bg-green-400/10 flex justify-center items-center text-green-300 font-bold text-lg z-10 backdrop-blur-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 150 }}
                >
                  <CheckCircle className="w-6 h-6 mr-2" /> Completed
                </motion.div>
              )}
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <p className="text-sm text-muted mt-2">{task.description}</p>
              <div className="mt-4 flex justify-between items-center text-xs">
                <div className={`px-3 py-1 rounded-full ${task.completed ? 'bg-green-400/20 text-green-400' : 'bg-dark-200 text-gray-300'}`}>
                  {task.type}
                </div>
                <div className="font-medium text-sm">{task.reward}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
