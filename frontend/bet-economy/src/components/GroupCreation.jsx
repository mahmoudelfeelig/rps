const GroupCreation = () => {
    const [formData, setFormData] = useState({
      name: '',
      rules: '',
      startingBalance: 1000
    })
  
    return (
      <div className="max-w-2xl mx-auto p-4 bg-dark-100 rounded-xl">
        <h2 className="text-2xl mb-6">Create New Group</h2>
        
        <form className="space-y-4">
          <div>
            <label>Group Name</label>
            <input 
              type="text" 
              className="w-full bg-dark-200 rounded p-2 mt-1"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
  
          <div>
            <label>Starting Balance</label>
            <input
              type="number"
              className="w-full bg-dark-200 rounded p-2 mt-1"
              value={formData.startingBalance}
              onChange={(e) => setFormData({...formData, startingBalance: e.target.value})}
            />
          </div>
  
          <div>
            <label>Group Rules</label>
            <textarea
              className="w-full bg-dark-200 rounded p-2 mt-1 h-32"
              value={formData.rules}
              onChange={(e) => setFormData({...formData, rules: e.target.value})}
            />
          </div>
  
          <button type="submit" className="w-full py-3">
            Create Group
          </button>
        </form>
      </div>
    )
  }