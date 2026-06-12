import { useState, useEffect } from 'react';
import { getAllOrders, updateOrderStatus } from '../../services/api';
import { getSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'accepted', 'preparing', 'ready', 'delivered'];
const STATUS_COLOR = {
  pending: 'status-pending', accepted: 'status-accepted', preparing: 'status-preparing',
  ready: 'status-ready', delivered: 'status-delivered', cancelled: 'status-cancelled',
};

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await getAllOrders({ status: filterStatus || undefined });
      setOrders(res.data.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchOrders();
    const socket = getSocket();
    socket.emit('join_admin');
    socket.on('new_order', () => {
      toast('🔔 New order!', { icon: '🧾', style: { background: '#1e293b', color: '#fff' } });
      fetchOrders();
    });
    return () => socket.off('new_order');
  }, [filterStatus]);

  const handleStatusUpdate = async (orderId, orderStatus) => {
    try {
      await updateOrderStatus(orderId, { orderStatus });
      toast.success(`Order marked as ${orderStatus}`);
      fetchOrders();
    } catch { toast.error('Status update failed'); }
  };

  const getNextStatus = (current) => {
    const idx = STATUS_STEPS.indexOf(current);
    return idx < STATUS_STEPS.length - 1 ? STATUS_STEPS[idx + 1] : null;
  };

  const statusFilters = ['', 'pending', 'accepted', 'preparing', 'ready', 'delivered', 'cancelled'];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Orders Management</h2>
          <p className="text-dark-400 text-sm">{orders.length} orders found</p>
        </div>
        <button onClick={fetchOrders} className="btn-secondary text-sm py-2">🔄 Refresh</button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6">
        {statusFilters.map(s => (
          <button
            key={s || 'all'}
            onClick={() => setFilterStatus(s)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize ${
              filterStatus === s ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300 hover:text-white'
            }`}
          >
            {s || 'All Orders'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-dark-400">
          <p className="text-5xl mb-4">🧾</p>
          <p className="text-lg">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order._id} className="card p-4 animate-enter">
              {/* Order Header */}
              <div
                className="flex items-center gap-4 cursor-pointer"
                onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-dark-400 text-xs">#{order._id.slice(-6).toUpperCase()}</span>
                    <span className="font-semibold text-white">Table {order.tableNumber}</span>
                    <span className="text-dark-400 text-sm">· {order.customerName}</span>
                    <span className={`status-badge border ${STATUS_COLOR[order.orderStatus]}`}>
                      {order.orderStatus}
                    </span>
                    {order.paymentStatus === 'paid' ? (
                      <span className="badge bg-green-500/20 text-green-400 border-green-500/30">💳 Paid</span>
                    ) : (
                      <span className="badge bg-yellow-500/20 text-yellow-400 border-yellow-500/30">⏳ Unpaid</span>
                    )}
                  </div>
                  <p className="text-dark-400 text-xs mt-1">
                    {new Date(order.createdAt).toLocaleString('en-IN')} · {order.items?.length} item(s)
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold gradient-text text-lg">₹{order.grandTotal?.toFixed(2)}</p>
                  <p className="text-dark-500 text-xs">{expandedOrder === order._id ? '▲' : '▼'}</p>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedOrder === order._id && (
                <div className="mt-4 pt-4 border-t border-dark-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Items */}
                    <div>
                      <p className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-2">Order Items</p>
                      <div className="space-y-1">
                        {order.items?.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-dark-300">{item.name} × {item.quantity}</span>
                            <span className="text-white">₹{(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold text-white pt-1 border-t border-dark-700">
                          <span>Grand Total</span>
                          <span className="gradient-text">₹{order.grandTotal?.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Special Instructions */}
                    <div>
                      {order.specialInstructions && (
                        <div className="mb-4">
                          <p className="text-dark-400 text-xs font-semibold uppercase tracking-wider mb-1">Special Instructions</p>
                          <p className="text-dark-300 text-sm bg-dark-900 px-3 py-2 rounded-lg">{order.specialInstructions}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {getNextStatus(order.orderStatus) && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, getNextStatus(order.orderStatus))}
                        className="btn-primary py-2 px-4 text-sm"
                      >
                        ✅ Mark as {getNextStatus(order.orderStatus)}
                      </button>
                    )}
                    {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                      <button
                        onClick={() => handleStatusUpdate(order._id, 'cancelled')}
                        className="btn-danger py-2 px-4 text-sm"
                      >
                        ✗ Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
