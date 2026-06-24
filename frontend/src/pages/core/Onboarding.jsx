import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gamepad2, Landmark, PawPrint, Store, Trophy } from 'lucide-react';
import { PageFrame, PageHero } from '../../components/ui/page';

const steps = [
  { title: 'Play a quick round', desc: 'Start with Casino, Minefield, RPS, or the Advanced Arcade.', to: '/games', icon: Gamepad2 },
  { title: 'Visit the store', desc: 'Power-ups and boosts help your next run feel different.', to: '/store', icon: Store },
  { title: 'Try the economy', desc: 'Open a card pack, join a guild, stake coins, or attack a raid.', to: '/economy', icon: Landmark },
  { title: 'Adopt a critter', desc: 'Your pet hub has resources, gacha, shop, and breeding.', to: '/games/virtual-pet', icon: PawPrint },
  { title: 'Track progress', desc: 'Tasks, achievements, and leaderboard movement give long-term goals.', to: '/dashboard', icon: Trophy },
];

export default function Onboarding() {
  return (
    <PageFrame className="bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.16),transparent_30%),linear-gradient(180deg,#030712_0%,#09090b_55%,#020202_100%)]">
      <PageHero
        meta="Start here"
        title="Your first five moves"
        description="RPS has a lot of systems. Start with these shortcuts and the rest will make more sense."
      />
      <div className="grid gap-4 lg:grid-cols-5">
        {steps.map(({ title, desc, to, icon: Icon }, index) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
          >
            <Link to={to} className="block h-full rounded-[30px] border border-white/10 bg-white/[0.055] p-5 shadow-xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-200/30">
              <Icon className="mb-5 h-7 w-7 text-cyan-100" />
              <div className="text-lg font-black">{title}</div>
              <p className="mt-2 text-sm leading-6 text-white/60">{desc}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </PageFrame>
  );
}
