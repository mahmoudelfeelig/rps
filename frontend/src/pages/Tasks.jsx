import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import {
  CheckCircle, CalendarDays, Award, Flame, Search, EyeOff, Eye,
  ArrowDownAZ, ArrowUpZA
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../api';

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
  const { user, token, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Daily');
  const [search, setSearch] = useState('');
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortKey, setSortKey] = useState('title');
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const normalized = data.tasks.map(task => ({
          ...task,
          type: task.type === 'daily' ? 'Daily'
               : task.type === 'weekly' ? 'Weekly'
               : 'Bonus',
          completed: task.completedBy.includes(user._id),
          reward: `💸 ${task.reward}` // or badge logic if needed
        }));
        setTasks(normalized);
      })
      .catch(err => console.error('Error fetching tasks:', err));
  }, [token, user]);

  const handleComplete = async (taskId) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ taskId })
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) =>
            t._id === taskId ? { ...t, completed: true } : t
          )
        );
      }
      await refreshUser();
    } catch (err) {
      console.error('Complete task error:', err);
    }
  };

  const parseRewardValue = (reward) => {
    const match = reward.match(/(\d+)/);
    return match ? parseInt(match[0]) : 0;
  };

  const sortOptions = [
    { key: 'title', label: 'Title' },
    { key: 'rewardValue', label: 'Reward Money' },
    { key: 'completed', label: 'Completion' },
  ];

  let filteredTasks = tasks
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

  const total = tasks.filter((t) => t.type === activeTab).length;
  const completed = tasks.filter((t) => t.type === activeTab && t.completed).length;

  return (
    <div className="flex flex-col min-h-screen pt-24 px-6 max-w-6xl mx-auto">
    <div className="flex space-x-4 mb-4">
      {Object.keys(tabIcons).map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 py-2 rounded-full border transition-all ${
            activeTab === tab
              ? 'bg-white text-black font-semibold'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          {tabIcons[tab]} {tab}
        </button>
      ))}
    </div>
      
      <div className="mb-2 text-gray-400 text-sm">
        Progress: <span className="text-white">{completed}</span>/<span className="text-white">{total}</span> completed
      </div>

      <div className="grid md:grid-cols-2 gap-6 pb-20">
        {filteredTasks.map((task, idx) => (
          <motion.div
            key={task._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <Card
              onClick={() => !task.completed && handleComplete(task._id)}
              className={`cursor-pointer rounded-xl p-5 shadow-xl relative overflow-hidden transition-all hover:scale-[1.01] ${
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
