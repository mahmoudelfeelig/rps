const Achievements = () => {
    const achievements = [
      { name: 'First Bet', icon: '🎉', desc: 'Place your first bet' },
      { name: 'High Roller', icon: '💰', desc: 'Win over $10,000' },
      { name: 'Sharp Shooter', icon: '🎯', desc: 'Win 5 bets in a row' },
    ]
  
    return (
      <div className="min-h-screen bg-dark p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-primary mb-6">🏅 Achievements</h1>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {achievements.map((achv, idx) => (
              <div key={idx} className="p-6 bg-dark-100 rounded-xl border border-dark-200 text-center">
                <div className="text-5xl mb-4">{achv.icon}</div>
                <h2 className="text-xl font-semibold text-primary mb-2">{achv.name}</h2>
                <p className="text-gray-300">{achv.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }
  
  export default Achievements
  