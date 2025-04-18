const Profile = () => {
  const user = {
    name: "JohnDoe",
    balance: 2450.75,
    hearts: 42,
    badges: ['High Roller', 'Community Hero', 'Lucky Streak']
  }

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        <div className="p-6 bg-dark-100 rounded-xl border border-dark-200 mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">{user.name}'s Profile</h1>
          <div className="flex gap-6">
            <div className="flex items-center gap-2 bg-dark-200 px-4 py-2 rounded-lg">
              <span className="text-primary">💰</span>
              <span>${user.balance.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-dark-200 px-4 py-2 rounded-lg">
              <span className="text-primary">❤️</span>
              <span>{user.hearts} Hearts</span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
          <h2 className="text-2xl font-bold text-primary mb-6">Badges 🏆</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {user.badges.map((badge, index) => (
              <div key={index} className="p-4 bg-dark-200 rounded-lg text-center border border-dark-300">
                <div className="text-3xl mb-2">🛡️</div>
                <span className="text-gray-100 font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile