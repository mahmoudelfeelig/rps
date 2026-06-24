import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, CalendarDays, Flame, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { API_BASE } from '../../api';
import { EmptyState, PageFrame, PageHero, StatCard } from '../../components/ui/page';

const tabConfig = [
  { key: 'Daily',  icon: <CalendarDays className="inline-block w-4 h-4 mr-1" /> },
  { key: 'Weekly', icon: <Flame        className="inline-block w-4 h-4 mr-1" /> },
  { key: 'Bonus',  icon: <Award        className="inline-block w-4 h-4 mr-1" /> },
];

const typeStyles = {
  Daily:  'from-pink-500/10 to-purple-500/10 border-pink-400/30 text-pink-400',
  Weekly: 'from-blue-500/10 to-indigo-500/10 border-blue-400/30 text-blue-400',
  Bonus:  'from-yellow-500/10 to-orange-500/10 border-yellow-400/30 text-yellow-400',
};

export default function Tasks() {
  const { user, token, refreshUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('Daily');
  const audio = new Audio('/assets/sounds/success.mp3');

  useEffect(() => {
    async function load() {
      const [ tRes, sRes ] = await Promise.all([
        fetch(`${API_BASE}/api/tasks`,      { headers:{ Authorization:`Bearer ${token}` } }),
        fetch(`${API_BASE}/api/user/stats`, { headers:{ Authorization:`Bearer ${token}` } }),
      ]);
      const { tasks: tData } = await tRes.json();
      const sData            = await sRes.json();

      const normalized = tData.map(task => {
        const progVal   = sData[task.goalType] || 0;
        const progress  = Math.min(100, (progVal / task.goalAmount) * 100);
        const complete  = progress >= 100;
        const typeLabel = task.type === 'daily'
          ? 'Daily'
          : task.type === 'weekly'
            ? 'Weekly'
            : 'Bonus';
        return { ...task, progVal, progress, complete, typeLabel };
      });

      setTasks(normalized);
    }
    load().catch(console.error);
  }, [token, user, refreshUser]);

  const handleComplete = async (taskId, title) => {
    const res  = await fetch(`${API_BASE}/api/tasks/complete`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${token}`
      },
      body: JSON.stringify({ taskId })
    });
    const data = await res.json();
    if (res.ok) {
      try { await audio.play(); } catch {}
      toast.success(`Completed "${title}"! +${data.reward} coins`);
      setTasks(ts => ts.filter(t => t._id !== taskId));
      await refreshUser();
    } else {
      toast.error(data.error || data.message);
    }
  };

  const filtered = tasks.filter(t => t.typeLabel === activeTab);

  return (
    <PageFrame className="bg-[radial-gradient(circle_at_18%_5%,rgba(59,130,246,0.13),transparent_32%),radial-gradient(circle_at_88%_2%,rgba(245,158,11,0.11),transparent_32%),linear-gradient(180deg,#04070f_0%,#09090b_55%,#020202_100%)]">
      <PageHero
        title="Tasks"
        description="Daily, weekly, and bonus goals that push players through different parts of the game loop."
        actions={(
          <>
            <StatCard label="Player" value={user?.username || 'Player'} tone="text-cyan-100" />
            <StatCard label="Balance" value={`${Number(user?.balance || 0).toLocaleString()} coins`} tone="text-amber-100" />
          </>
        )}
      />
      <div className="mb-6 flex flex-wrap gap-3">
        {tabConfig.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-full border transition ${
              activeTab === tab.key
                ? 'bg-white text-black'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {tab.icon}{tab.key}
          </button>
        ))}
      </div>
      {filtered.length > 0
        ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(task => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`relative p-5 border rounded-lg bg-gradient-to-r ${typeStyles[task.typeLabel]}`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <h2 className="text-xl font-semibold">{task.title}</h2>
                </div>
                <p className="text-sm">{task.description}</p>
                <div className="flex justify-between items-center mt-3 text-xs text-gray-300">
                  <span>
                    {task.goalType} • {task.progVal}/{task.goalAmount}
                  </span>
                  <span>{task.reward} coins</span>
                </div>
                <div className="mt-2 bg-gray-700 rounded h-2 overflow-hidden">
                  <div
                    className="h-2 bg-blue-400 rounded-full"
                    style={{ width: `${task.progress}%` }}
                  />
                </div>
                {task.complete && (
                  <button
                    onClick={() => handleComplete(task._id, task.title)}
                    className="mt-4 w-full py-1 text-sm font-medium bg-green-500 rounded hover:bg-green-600 flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Complete
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        : <EmptyState title="No tasks here" description="Switch categories or check back after the next task refresh." />
      }
    </PageFrame>
  );
}
