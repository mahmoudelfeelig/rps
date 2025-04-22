import React from 'react'

const Switch = ({ checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:bg-pink-500 transition" />
  </label>
)

export default Switch
