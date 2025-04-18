// src/pages/Store.jsx
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const storeItems = [
  { name: 'Golden Badge', price: 1000, type: 'badge', unlockedBy: 'store' },
  { name: 'Boost Token', price: 500, type: 'consumable' },
  { name: 'Background Theme', price: 300, type: 'cosmetic' },
];

const Store = () => {
  return (
    <motion.div
      className="max-w-5xl mx-auto p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <h1 className="text-3xl font-bold mb-6 text-center">Item Store</h1>
      <div className="grid md:grid-cols-3 gap-6">
        {storeItems.map((item, idx) => (
          <Card key={idx} className="text-center space-y-4">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="text-gray-400">{item.type}</p>
            <span className="text-pink-500 font-bold">${item.price}</span>
            <Button>Buy</Button>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default Store;
