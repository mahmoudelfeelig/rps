import { useState } from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'

const Achievements = () => {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Place your first bet', completed: true },
    { id: 2, title: 'Join a group', completed: true },
    { id: 3, title: 'Win 3 bets in a row', completed: false },
    { id: 4, title: 'Buy a badge', completed: false },
    { id: 5, title: 'Reach 10,000 coins', completed: false },
    { id: 6, title: 'Invite 3 friends', completed: false },
  ])

  const toggleTask = (id) =>
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    )

  return (
    <motion.div
      className="max-w-4xl mx-auto p-6 pt-28"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-4xl font-bold mb-8 text-center">🏅 Achievements</h1>
      <div className="grid gap-4">
        {tasks.map((task) => (
          <motion.div key={task.id} whileHover={{ scale: 1.02 }}>
            <Card className={`p-5 flex justify-between items-center rounded-xl border transition ${task.completed ? 'opacity-50' : ''}`}>
              <div>
                <h2 className="text-lg font-semibold">{task.title}</h2>
                <p className="text-sm text-muted">Complete to earn a badge</p>
              </div>
              <Button variant={task.completed ? 'secondary' : 'default'} onClick={() => toggleTask(task.id)}>
                {task.completed ? 'Undo' : 'Complete'}
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Achievements
