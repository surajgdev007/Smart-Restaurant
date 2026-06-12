import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/api';
import { getSocket } from '../../hooks/useSocket';
import StatsCard from '../../components/admin/StatsCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  pending: 'status-pending', accepted: 'status-accepted', preparing: 'status-preparing',
  ready: 'status-ready', delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchStats = async () => {
    try {
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const socket = getSocket();
    socket.emit('join_admin');
    socket.on('new_order', () => {
      toast('🔔 New order received!', { icon: '🧾', style: { background: '#1e293b', color: '#fff' } });
      fetchStats();
    });
    return () => socket.off('new_order');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="dot-loading flex gap-2"><span /><span /><span /></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-dark-400 text-sm mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary text-sm py-2">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="🧾" label="Total Orders" value={stats?.totalOrders || 0} color="orange" />
        <StatsCard icon="💰" label="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toFixed(0)}`} color="green" />
        <StatsCard icon="📅" label="Today's Orders" value={stats?.todayOrders || 0} color="blue" />
        <StatsCard icon="⚡" label="Active Orders" value={stats?.activeOrders || 0} color="purple" />
      </div>

      {/* Chart + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display font-bold text-white mb-6">📈 Revenue – Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.last7Days || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 12 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} />
              <Tooltip
                contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }}
              />
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="card p-6">
          <h3 className="font-display font-bold text-white mb-4">⚡ Quick Actions</h3>
          <div className="space-y-3">
            {[
              { label: 'View All Orders', icon: '🧾', path: '/admin/orders' },
              { label: 'Manage Menu', icon: '🍽️', path: '/admin/menu' },
              { label: 'Manage Tables', icon: '🪑', path: '/admin/tables' },
              { label: 'View Reports', icon: '📊', path: '/admin/reports' },
            ].map(a => (
              <button
                key={a.path}
                onClick={() => navigate(a.path)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-dark-900 hover:bg-dark-700 rounded-xl text-dark-300 hover:text-white transition-all text-sm"
              >
                <span className="text-xl">{a.icon}</span>
                <span>{a.label}</span>
                <span className="ml-auto">→</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      {stats?.recentOrders?.length > 0 && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">🕐 Recent Orders</h3>
            <button onClick={() => navigate('/admin/orders')} className="text-brand-400 text-sm hover:text-brand-300">
              View All →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-dark-400 border-b border-dark-700">
                  <th className="text-left py-2 pr-4">Order</th>
                  <th className="text-left py-2 pr-4">Table</th>
                  <th className="text-left py-2 pr-4">Amount</th>
                  <th className="text-left py-2 pr-4">Status</th>
                  <th className="text-left py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order._id} className="border-b border-dark-800 hover:bg-dark-800/50 transition-colors">
                    <td className="py-3 pr-4 text-dark-300 font-mono text-xs">#{order._id.slice(-6).toUpperCase()}</td>
                    <td className="py-3 pr-4 text-white">Table {order.tableNumber}</td>
                    <td className="py-3 pr-4 text-brand-400 font-semibold">₹{order.grandTotal?.toFixed(2)}</td>
                    <td className="py-3 pr-4">
                      <span className={`status-badge border ${STATUS_COLOR[order.orderStatus]}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-dark-400 text-xs">
                      {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
