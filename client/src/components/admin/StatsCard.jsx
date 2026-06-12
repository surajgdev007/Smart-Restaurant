export default function StatsCard({ icon, label, value, sub, color = 'orange' }) {
  const colorMap = {
    orange: 'from-brand-500/20 to-brand-600/10 border-brand-500/30 text-brand-400',
    blue:   'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-400',
    green:  'from-green-500/20 to-green-600/10 border-green-500/30 text-green-400',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-500/30 text-purple-400',
  };

  return (
    <div className={`card p-6 bg-gradient-to-br ${colorMap[color]} border animate-enter`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-3xl">{icon}</span>
        {sub && (
          <span className="text-xs text-dark-400 bg-dark-800 px-2 py-1 rounded-lg">{sub}</span>
        )}
      </div>
      <p className="text-3xl font-display font-bold text-white mb-1">{value}</p>
      <p className="text-dark-400 text-sm">{label}</p>
    </div>
  );
}
