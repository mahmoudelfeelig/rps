const Admin = () => {
  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Heart Management */}
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <h2 className="text-xl font-semibold text-primary mb-4">❤️ Heart Management</h2>
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Username"
                className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
              />
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors">
                Add Heart
              </button>
            </div>
          </div>

          {/* Bet Creation */}
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <h2 className="text-xl font-semibold text-primary mb-4">🎲 Create New Bet</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Bet Title"
                className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
              />
              <input
                type="number"
                placeholder="Odds"
                className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
              />
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors">
                Create Bet
              </button>
            </form>
          </div>

          {/* Badge Creation */}
          <div className="p-6 bg-dark-100 rounded-xl border border-dark-200">
            <h2 className="text-xl font-semibold text-primary mb-4">🛡️ Create New Badge</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Badge Name"
                className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
              />
              <input
                type="text"
                placeholder="Description"
                className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
              />
              <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition-colors">
                Create Badge
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin