const Rules = () => {
  return (
    <div className="min-h-screen bg-dark text-gray-100 py-12 px-6">
      <div className="max-w-4xl mx-auto bg-dark-100 p-8 rounded-xl border border-dark-200">
        <h1 className="text-3xl font-bold text-primary mb-6">📜 Game Rules</h1>
        <ul className="space-y-4 list-disc list-inside">
          <li>Bets must be placed before the deadline.</li>
          <li>Hearts and badges are non-transferable.</li>
          <li>Admins reserve the right to audit suspicious activities.</li>
          <li>Winnings are based on final odds at closing time.</li>
          <li>All decisions by system are final in case of a dispute.</li>
        </ul>
      </div>
    </div>
  )
}

export default Rules
