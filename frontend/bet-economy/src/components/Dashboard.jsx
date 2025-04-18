import BetList from './BetList'

const Dashboard = () => {
  const balance = 2450.75
  const badges = ['High Roller', 'Newbie', 'Lucky Streak']

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-4">Welcome Back, Player! 🎮</h1>
          <div className="bg-gradient-to-r from-primary-900 to-primary-500 p-6 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl text-gray-100">Your Balance</h2>
              <span className="px-3 py-1 bg-white/10 text-primary rounded-full">VIP Member</span>
            </div>
            <p className="text-4xl font-bold text-gray-100 mb-6">${balance.toLocaleString()}</p>
            <div className="flex gap-4">
              <button className="bg-white/10 hover:bg-white/20 text-gray-100 px-6 py-2 rounded-lg transition-colors">
                Deposit
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-gray-100 px-6 py-2 rounded-lg transition-colors">
                Withdraw
              </button>
            </div>
          </div>
        </div>

        <BetList />

        <div className="mt-8 p-6 bg-dark-100 rounded-xl border border-dark-200">
          <h2 className="text-2xl font-bold mb-6 text-primary">Your Badges ✨</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {badges.map((badge, index) => (
              <div key={index} className="p-4 bg-dark-200 rounded-lg text-center border border-dark-300">
                <div className="text-3xl mb-2">🏅</div>
                <span className="text-gray-100 font-medium">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard