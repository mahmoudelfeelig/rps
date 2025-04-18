const Leaderboard = () => {
    // Mock data
    const groups = [
      { name: 'High Rollers', total: 24500, members: 12 },
      { name: 'Risk Takers', total: 19800, members: 8 }
    ]
  
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl mb-8">Global Leaderboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-dark-100 p-6 rounded-xl">
            <h2 className="text-xl mb-4">Top Groups</h2>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Group</th>
                  <th className="text-right">Total Wealth</th>
                  <th className="text-right">Members</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, index) => (
                  <tr key={index} className="border-t border-dark-200">
                    <td className="py-2">{group.name}</td>
                    <td className="text-right">${group.total.toLocaleString()}</td>
                    <td className="text-right">{group.members}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
  
          <div className="bg-dark-100 p-6 rounded-xl">
            <h2 className="text-xl mb-4">Top Players</h2>
            {/* Similar table structure for players */}
          </div>
        </div>
      </div>
    )
  }