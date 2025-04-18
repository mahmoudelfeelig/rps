const BetList = () => {
  const bets = [
    { id: 1, title: "World Cup Winner", odds: 2.5, endTime: "2024-07-15" },
    { id: 2, title: "Election Prediction", odds: 3.2, endTime: "2024-11-05" }
  ];

  return (
    <section className="p-6 bg-dark-100 rounded-xl border border-dark-200">
      <h2 className="text-2xl font-bold text-primary mb-6">Active Bets 🔥</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bets.map(bet => (
          <BetCard key={bet.id} {...bet} />
        ))}
      </div>
    </section>
  );
};

const BetCard = ({ title, odds, endTime }) => (
  <div className="p-4 bg-dark-200 border border-dark-300 rounded-lg hover:border-primary transition">
    <div className="flex justify-between items-start mb-4">
      <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">{odds}x</span>
    </div>
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">⏳ {endTime}</span>
      <button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg">
        Place Bet
      </button>
    </div>
  </div>
);

export default BetList;
