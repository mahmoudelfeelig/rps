const Home = () => {
  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-900 bg-clip-text text-transparent mb-6">
            BetEconomy
          </h1>
          <p className="text-xl text-gray-300 mb-8">Where Every Action Counts</p>
          
          <div className="flex justify-center gap-4">
            <a href="/login" className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg transition-colors">
              Get Started
            </a>
            <a href="/rules" className="border border-primary-500 text-primary-500 hover:bg-primary-900/20 px-8 py-3 rounded-lg text-lg transition-colors">
              Learn Rules
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <h3 className="text-xl font-semibold text-primary mb-4">🎯 Achievements</h3>
            <p className="text-gray-300">Complete challenges and earn unique rewards</p>
          </div>
          
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <h3 className="text-xl font-semibold text-primary mb-4">🏆 Leaderboards</h3>
            <p className="text-gray-300">Compete with players and groups worldwide</p>
          </div>
          
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <h3 className="text-xl font-semibold text-primary mb-4">🛡️ Safe Play</h3>
            <p className="text-gray-300">Fair and monitored gaming environment</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home