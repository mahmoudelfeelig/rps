import { useState } from 'react'

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  return (
    <div className="min-h-screen bg-dark p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-primary mb-6">⚙️ Settings</h1>

        <div className="bg-dark-100 p-4 rounded-xl border border-dark-200">
          <label className="flex justify-between items-center">
            <span className="text-gray-100">Email Notifications</span>
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={() => setEmailNotifications(!emailNotifications)}
              className="accent-primary-500 w-5 h-5"
            />
          </label>
        </div>

        <div className="bg-dark-100 p-4 rounded-xl border border-dark-200">
          <label className="flex justify-between items-center">
            <span className="text-gray-100">Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="accent-primary-500 w-5 h-5"
            />
          </label>
        </div>
      </div>
    </div>
  )
}

export default Settings
