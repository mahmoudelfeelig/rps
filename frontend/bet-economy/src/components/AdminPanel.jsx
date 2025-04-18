const AdminPanel = () => {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <h1 className="text-3xl mb-8">Admin Dashboard</h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-dark-100 p-6 rounded-xl">
            <h2 className="text-xl mb-4">User Management</h2>
            <div className="space-y-4">
              <button className="w-full">Pending Approvals (3)</button>
              <button className="w-full">Manage Groups</button>
              <button className="w-full">Adjust Balances</button>
            </div>
          </div>
  
          <div className="bg-dark-100 p-6 rounded-xl">
            <h2 className="text-xl mb-4">Economy Controls</h2>
            <div className="space-y-4">
              <button className="w-full">Create New Item</button>
              <button className="w-full">Set Global Odds</button>
              <button className="w-full">View Audit Logs</button>
            </div>
          </div>
  
          <div className="bg-dark-100 p-6 rounded-xl">
            <h2 className="text-xl mb-4">System Monitoring</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Active Bets</span>
                <span>24</span>
              </div>
              <div className="flex justify-between">
                <span>Recent Transactions</span>
                <span>142</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }