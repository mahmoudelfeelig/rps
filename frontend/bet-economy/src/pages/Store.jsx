import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  BadgeCheck,
  Sparkles,
  ArrowDownAZ,
  ArrowUpAZ,
  Filter,
} from 'lucide-react'
import avatar from '../assets/avatar.svg'
import coin from '../assets/coin.svg'
import giftBox from '../assets/gift_box.svg'
import goldMedal from '../assets/gold_medal.svg'
import silverMedal from '../assets/silver_medal.svg'
import heart from '../assets/heart.svg'
import lightningImage from '../assets/lightning.svg'
import star from '../assets/star.svg'

const storeItems = [
  {
    name: 'Golden Badge',
    price: 5000,
    image: goldMedal,
    type: 'badge',
    stock: 3,
  },
  {
    name: 'Silver Badge',
    price: 3000,
    image: silverMedal,
    type: 'badge',
    stock: 10,
  },
  {
    name: 'Mystery Box',
    price: 1000,
    image: giftBox,
    type: 'power-up',
    stock: 25,
  },
  {
    name: 'Double XP (24h)',
    price: 800,
    image: lightningImage,
    type: 'power-up',
    stock: 5,
  },
  {
    name: 'Heart Pack (x3)',
    price: 1200,
    image: heart,
    type: 'power-up',
    stock: 20,
  },
  {
    name: 'Custom Avatar Frame',
    price: 2500,
    image: avatar,
    type: 'cosmetic',
    stock: 2,
  },
  {
    name: 'Neon Name Glow',
    price: 3500,
    image: star,
    type: 'cosmetic',
    stock: 1,
  },
  {
    name: 'Lucky Coin Buff',
    price: 2200,
    image: coin,
    type: 'power-up',
    stock: 8,
  },
]


const Store = () => {
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortField, setSortField] = useState('title')
  const [sortAsc, setSortAsc] = useState(true)

  const safeSort = (a, b) => {
    if (sortField === 'title') {
      const titleA = a.name?.toLowerCase() || ''
      const titleB = b.name?.toLowerCase() || ''
      return sortAsc ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA)
    }

    if (sortField === 'price') {
      return sortAsc ? a.price - b.price : b.price - a.price
    }

    if (sortField === 'stock') {
      return sortAsc ? a.stock - b.stock : b.stock - a.stock
    }

    return 0
  }

  const filteredItems = storeItems
    .filter(item => typeFilter === 'all' || item.type === typeFilter)
    .sort(safeSort)

  return (
    <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 min-h-screen text-white">
      <motion.h1
        className="text-4xl font-bold mb-12 text-center text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        🛒 Rapid Profit Store
      </motion.h1>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { label: 'All', value: 'all', icon: <Filter size={14} /> },
            { label: 'Badges', value: 'badge', icon: <BadgeCheck size={14} /> },
            { label: 'Power-Ups', value: 'power-up', icon: <Sparkles size={14} /> },
            { label: 'Cosmetics', value: 'cosmetic', icon: <star size={14} /> },
          ].map(({ label, value, icon }) => (
            <button
              key={value}
              onClick={() => setTypeFilter(value)}
              className={`px-4 py-1 rounded-full border text-sm flex items-center gap-1 transition ${
                typeFilter === value
                  ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-black'
                  : 'border-gray-600'
              }`}
            >
              {icon} {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setSortAsc(!sortAsc)}
            className="p-2 border border-gray-600 rounded-full hover:bg-gray-800 transition"
          >
            {sortAsc ? <ArrowUpAZ size={16} /> : <ArrowDownAZ size={16} />}
          </button>

          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value)}
            className="bg-black border border-pink-500 text-sm text-white rounded px-3 py-1"
          >
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="stock">Rarity</option>
          </select>
        </div>
      </div>

      <motion.div
        className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        initial="hidden"
        whileInView="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        {filteredItems.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Card className="bg-gradient-to-tr from-pink-400/10 to-purple-400/10 border border-pink-400/20 p-6 rounded-2xl backdrop-blur-md shadow-xl hover:scale-[1.02] transition-all">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-center text-pink-300">
                {item.name}
              </h3>
              <p className="text-center text-sm text-muted mt-1 mb-3 text-white/60">
                ${item.price} • Stock: {item.stock}
              </p>
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
