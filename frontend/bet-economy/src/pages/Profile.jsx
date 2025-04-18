import React from 'react'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'

const Profile = () => {
  const username = 'Player123'
  const email = 'player@example.com'
  const hearts = 5

  return (
    <div className="min-h-screen pt-28 px-4 text-white">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="bg-dark-100 p-6 rounded-xl border border-dark-200 shadow-lg">
          <h1 className="text-3xl font-bold mb-4">👤 Profile Overview</h1>
          <div className="grid gap-4">
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
            <div className="flex gap-4">
              <Button>Edit</Button>
              <Button variant="secondary">Logout</Button>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-dark-100 p-6 rounded-xl border border-dark-200 shadow-md">
          <h2 className="text-2xl font-bold mb-4">⚙️ Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Change Username</label>
              <Input placeholder="New username" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Update Email</label>
              <Input placeholder="New email address" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Change Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <Button className="mt-4">Save Settings</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
