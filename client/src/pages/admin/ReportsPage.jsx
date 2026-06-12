import { useState, useEffect } from 'react';
import { getAllOrders } from '../../services/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

export default function ReportsPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7'); // days

  useEffect(() => {
    getAllOrders()
      .then(res => setOrders(res.data.data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');

  // Daily revenue for last N days
  const getDailyData = () => {
    const days = [];
    for (let i = Number(period) - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const dayOrders = paidOrders.filter(o => {
        const created = new Date(o.createdAt);
        return created >= d && created < next;
      });
      days.push({
        date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        revenue: dayOrders.reduce((s, o) => s + o.grandTotal, 0),
        orders: dayOrders.length,
      });
    }
    return days;
  };

  // Orders by status pie
  const statusData = () => {
    const groups = {};
    orders.forEach(o => { groups[o.orderStatus] = (groups[o.orderStatus] || 0) + 1; });
    return Object.entries(groups).map(([name, value]) => ({ name, value }));
  };

  // Top items
  const topItems = () => {
    const counts = {};
    paidOrders.forEach(o => o.items?.forEach(item => {
      counts[item.name] = (counts[item.name] || 0) + item.quantity;
    }));
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, qty]) => ({ name, qty }));
  };

  const totalRevenue = paidOrders.reduce((s, o) => s + o.grandTotal, 0);
  const avgOrderValue = paidOrders.length ? totalRevenue / paidOrders.length : 0;
  const dailyData = getDailyData();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Reports & Analytics</h2>
          <p className="text-dark-400 text-sm">Business insights and revenue data</p>
        </div>
        <select className="select-field w-auto" value={period} onChange={e => setPeriod(e.target.value)}>
          <option value="7">Last 7 days</option>
          <option value="14">Last 14 days</option>
          <option value="30">Last 30 days</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: '💰', label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, color: 'text-green-400' },
          { icon: '🧾', label: 'Total Orders', value: orders.length, color: 'text-brand-400' },
          { icon: '✅', label: 'Paid Orders', value: paidOrders.length, color: 'text-blue-400' },
          { icon: '📊', label: 'Avg Order Value', value: `₹${avgOrderValue.toFixed(0)}`, color: 'text-purple-400' },
        ].map(card => (
          <div key={card.label} className="card p-5">
            <p className="text-2xl mb-2">{card.icon}</p>
            <p className={`text-2xl font-display font-bold ${card.color}`}>{card.value}</p>
            <p className="text-dark-400 text-sm mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-6">
          <h3 className="font-display font-bold text-white mb-4">📈 Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Bar dataKey="revenue" fill="#f97316" radius={[4, 4, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-white mb-4">📦 Daily Orders</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
              <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="Orders" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status Pie + Top Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-bold text-white mb-4">🥧 Orders by Status</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData()} cx="50%" cy="50%" outerRadius={80} dataKey="value" nameKey="name" label={({ name, value }) => `${name}: ${value}`}>
                {statusData().map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-bold text-white mb-4">🏆 Top Selling Items</h3>
          {topItems().length === 0 ? (
            <p className="text-dark-400 text-sm">No data yet</p>
          ) : (
            <div className="space-y-3">
              {topItems().map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-dark-400 text-sm w-6">{i + 1}.</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-white text-sm truncate">{item.name}</span>
                      <span className="text-dark-400 text-sm">{item.qty} sold</span>
                    </div>
                    <div className="h-1.5 bg-dark-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-500 rounded-full"
                        style={{ width: `${(item.qty / topItems()[0].qty) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
