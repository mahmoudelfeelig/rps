import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';

const tasks = [
  { title: 'Place Your First Bet', description: 'Start by placing your first bet to earn XP.', xp: 50 },
  { title: 'Join a Group', description: 'Team up with others and earn bonuses.', xp: 100 },
  { title: 'Win 5 Bets', description: 'Prove your luck and win five times.', xp: 200 },
];

const Tasks = () => {
  return (
    <motion.div
      className="max-w-5xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Your Daily Tasks</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {tasks.map((task, idx) => (
          <Card key={idx} className="hover:scale-[1.02] transition-transform cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">{task.title}</h2>
            <p className="text-sm text-gray-400 mb-2">{task.description}</p>
            <span className="text-pink-400 font-bold">+{task.xp} XP</span>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default Tasks;
