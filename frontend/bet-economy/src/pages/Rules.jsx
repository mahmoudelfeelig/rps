const Rules = () => {
  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Game Rules & Guidelines</h1>

        <div className="space-y-8">
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <span className="text-2xl">💎</span>
              </div>
              <h2 className="text-xl font-semibold text-primary">Earning Currency</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Community contributions (hosting events, helping others)</li>
              <li>Completing achievements and challenges</li>
              <li>Receiving heart reactions on your messages</li>
              <li>Successful bets and casino games</li>
            </ul>
          </div>

          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <span className="text-2xl">🛒</span>
              </div>
              <h2 className="text-xl font-semibold text-primary">Spending Currency</h2>
            </div>
            <ul className="list-disc pl-6 space-y-2 text-gray-300">
              <li>Purchasing limited edition badges</li>
              <li>Buying special items from the bank</li>
              <li>Commissioning tasks from other users</li>
              <li>Participating in high-stakes bets</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rules