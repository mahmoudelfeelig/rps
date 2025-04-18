import React from 'react'

const Select = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={onChange}
    className="bg-black border border-pink-500 text-white text-sm rounded px-3 py-1"
  >
    {options.map(opt => (
      <option key={opt.value} value={opt.value}>
        {opt.label}
      </option>
    ))}
  </select>
)

export default Select
