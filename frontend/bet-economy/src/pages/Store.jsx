import React from 'react'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { motion } from 'framer-motion'

const storeItems = [
  { name: 'Golden Badge', price: 5000, image: '/assets/badges/golden.png' },
  { name: 'Silver Badge', price: 3000, image: '/assets/badges/silver.png' },
  { name: 'Mystery Box', price: 1000, image: '/assets/store/mystery-box.png' },
  { name: 'Double XP (24h)', price: 800, image: '/assets/store/double-xp.png' },
  { name: 'Heart Pack (x3)', price: 1200, image: '/assets/store/heart-pack.png' },
  { name: 'Custom Avatar Frame', price: 2500, image: '/assets/store/frame.png' },
]

const Store = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-12 min-h-screen">
      <motion.h1
        className="text-4xl font-bold mb-10 text-center text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛒 In-App Store
      </motion.h1>

      <motion.div
        className="grid sm:grid-cols-2 md:grid-cols-3 gap-8"
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        {storeItems.map((item, index) => (
          <motion.div
            key={index}
            className="hover:scale-[1.02] transition"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-tr from-pink-400/10 to-purple-400/10 border border-pink-400/20 p-6 rounded-2xl backdrop-blur-md shadow-lg">
              <img src={item.image} alt={item.name} className="w-20 h-20 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-center text-pink-300">{item.name}</h3>
              <p className="text-center text-sm text-muted mt-1 mb-3">${item.price}</p>
              <div className="flex justify-center">
                <Button className="px-4 py-1 text-sm">Purchase</Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

export default Store
