import React from 'react'

const Switch = ({ checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="sr-only peer"
    />
    <div className="relative h-6 w-11 rounded-full border border-white/10 bg-white/10 transition peer-checked:border-cyan-200/40 peer-checked:bg-cyan-300/25 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white/70 after:shadow-lg after:transition peer-checked:after:translate-x-5 peer-checked:after:bg-cyan-100" />
  </label>
)

export default Switch
