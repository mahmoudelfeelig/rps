import React from 'react';
import { Card } from '../components/ui/card';
import { motion } from 'framer-motion';

const tasks = [
  { title: 'Place 5 Bets', description: 'Complete 5 bets today.', type: 'Daily', completed: true },
  { title: 'Win 3 Bets', description: 'Win 3 bets in a row.', type: 'Daily', completed: false },
  { title: 'Invite a Friend', description: 'Get a friend to join your group.', type: 'Weekly', completed: false },
  { title: 'Complete All Tasks', description: 'Finish every task for extra rewards!', type: 'Weekly', completed: false },
];

const Tasks = () => {
  return (
    <motion.div
      className="max-w-5xl mx-auto p-6 pt-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl mb-6">Your Tasks</h1>
      <div className="grid md:grid-cols-2 gap-6">
        {tasks.map((task, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
          >
            <Card className={`rounded-2xl p-5 shadow-xl transition duration-300 hover:scale-[1.01] ${task.completed ? 'bg-gradient-to-r from-green-400/10 to-green-300/10 border border-green-300/30' : 'bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-400/30'}`}>
              <h2 className="text-xl font-semibold">{task.title}</h2>
              <p className="text-sm text-muted mt-2">{task.description}</p>
              <div className={`mt-4 inline-block px-3 py-1 rounded-full text-xs ${task.completed ? 'bg-green-400/20 text-green-400' : 'bg-pink-400/20 text-pink-400'}`}>
                {task.completed ? 'Completed' : task.type}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default Tasks;
