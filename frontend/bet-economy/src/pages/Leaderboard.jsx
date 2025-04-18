// src/pages/Leaderboard.jsx
import { useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { motion } from "framer-motion";

const Leaderboard = () => {
  const [groupSearch, setGroupSearch] = useState("");
  const [playerSearch, setPlayerSearch] = useState("");

  const groups = [
    { name: "High Rollers", total: 24500, members: 12 },
    { name: "Risk Takers", total: 19800, members: 8 },
  ];

  const players = [
    { name: "Alice", wealth: 12400, group: "High Rollers" },
    { name: "Bob", wealth: 9800, group: "Risk Takers" },
  ];

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(groupSearch.toLowerCase())
  );
  const filteredPlayers = players.filter((p) =>
    p.name.toLowerCase().includes(playerSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <motion.h1
        className="text-4xl font-bold mb-10 text-center bg-gradient-to-r from-pink-500 to-purple-500 text-transparent bg-clip-text"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Global Leaderboard
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-semibold">Top Groups</h2>
          <Input
            placeholder="Search group..."
            value={groupSearch}
            onChange={(e) => setGroupSearch(e.target.value)}
          />
          {filteredGroups.map((group, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex flex-col gap-2">
                <div className="text-lg font-bold">{group.name}</div>
                <div className="text-sm text-gray-400">
                  Total: ${group.total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  Members: {group.members}
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold">Top Players</h2>
          <Input
            placeholder="Search player..."
            value={playerSearch}
            onChange={(e) => setPlayerSearch(e.target.value)}
          />
          {filteredPlayers.map((player, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex justify-between items-center">
                <div>
                  <div className="font-bold">{player.name}</div>
                  <div className="text-xs text-gray-400">
                    Group: {player.group}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-purple-400">
                    ${player.wealth.toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
