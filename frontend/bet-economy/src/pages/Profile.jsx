const Profile = () => {
  const username = 'Player123'
  const email = 'player@example.com'
  const hearts = 5

  return (
    <div className="min-h-screen bg-dark text-gray-100 py-12 px-6">
      <div className="max-w-3xl mx-auto bg-dark-100 p-8 rounded-xl border border-dark-200">
        <h1 className="text-3xl font-bold text-primary mb-6">👤 Your Profile</h1>

        <div className="space-y-4">
          <div>
            <label className="text-gray-400">Username:</label>
            <p className="text-lg font-semibold">{username}</p>
          </div>

          <div>
            <label className="text-gray-400">Email:</label>
            <p className="text-lg font-semibold">{email}</p>
          </div>

          <div>
            <label className="text-gray-400">Hearts:</label>
            <p className="text-lg font-semibold">{hearts} ❤️</p>
          </div>

          <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg">
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile
