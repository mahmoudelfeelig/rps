const AdminPanel = () => {
  return (
    <section className="max-w-7xl mx-auto p-4">
      <h1 className="text-3xl font-bold text-primary mb-8">Admin Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Management */}
        <PanelCard title="User Management" items={[
          'Pending Approvals (3)',
          'Manage Groups',
          'Adjust Balances'
        ]} />

        {/* Economy Controls */}
        <PanelCard title="Economy Controls" items={[
          'Create New Item',
          'Set Global Odds',
          'View Audit Logs'
        ]} />

        {/* System Monitoring */}
        <div className="bg-dark-100 p-6 rounded-xl">
          <h2 className="text-xl font-semibold text-primary mb-4">System Monitoring</h2>
          <div className="space-y-2 text-gray-300">
            <StatRow label="Active Bets" value="24" />
            <StatRow label="Recent Transactions" value="142" />
          </div>
        </div>
      </div>
    </section>
  );
};

const PanelCard = ({ title, items }) => (
  <div className="bg-dark-100 p-6 rounded-xl">
    <h2 className="text-xl font-semibold text-primary mb-4">{title}</h2>
    <div className="space-y-4">
      {items.map((item, idx) => (
        <button key={idx} className="w-full text-left text-white bg-dark-200 px-4 py-2 rounded-lg hover:bg-dark-300 transition">
          {item}
        </button>
      ))}
    </div>
  </div>
);

const StatRow = ({ label, value }) => (
  <div className="flex justify-between text-sm">
    <span>{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default AdminPanel;
