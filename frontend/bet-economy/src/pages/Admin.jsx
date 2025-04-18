import PropTypes from 'prop-types';

const AdminPanel = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#161616] to-[#0f0f0f] pt-24 px-6 text-white">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-pink-400 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            Admin Panel
          </h1>
          <span className="px-4 py-1 bg-white/10 text-white text-sm rounded-full border border-white/10 backdrop-blur">
            🔒 Superuser Mode
          </span>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          <PanelCard title="👥 user management" items={[
            'Pending Approvals (3)',
            'Manage Groups',
          ]} />

          <PanelCard title="🎁 item controls" items={[
            'Create New Item',
            'Review Store Inventory',
          ]} />

          <SystemMonitor />
        </div>
      </div>
    </div>
  );
};

const PanelCard = ({ title, items }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
    <h2 className="text-xl font-semibold text-pink-300 mb-4 uppercase tracking-wide">{title}</h2>
    <div className="space-y-3">
      {items.map((item) => (
        <button
          key={item}
          className="w-full text-left px-4 py-2 rounded-lg bg-dark-200 hover:bg-pink-600 hover:text-white transition duration-200 font-medium text-white/90"
        >
          {item}
        </button>
      ))}
    </div>
  </div>
);

const SystemMonitor = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
    <h2 className="text-xl font-semibold text-pink-300 mb-4 uppercase tracking-wide">
      📊 system monitoring
    </h2>
    <div className="space-y-3 text-sm text-white/80">
      <StatRow label="Active Bets" value="24" />
      <StatRow label="Recent Transactions" value="142" />
      <StatRow label="Server Load" value="🔵 Normal" />
    </div>
  </div>
);

const StatRow = ({ label, value }) => (
  <div className="flex justify-between bg-white/5 px-4 py-2 rounded-md">
    <span>{label}</span>
    <span className="font-semibold text-white">{value}</span>
  </div>
);

PanelCard.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

StatRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default AdminPanel;
