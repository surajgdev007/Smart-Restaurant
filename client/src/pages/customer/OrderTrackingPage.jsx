import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrder } from '../../services/api';
import { getSocket } from '../../hooks/useSocket';

const STATUS_STEPS = [
  { key: 'pending',   icon: '🕐', label: 'Order Received',  desc: 'We got your order' },
  { key: 'accepted',  icon: '✅', label: 'Order Accepted',  desc: 'Kitchen is ready' },
  { key: 'preparing', icon: '👨‍🍳', label: 'Preparing',      desc: 'Chef is cooking' },
  { key: 'ready',     icon: '🔔', label: 'Ready to Serve',  desc: 'Your food is ready' },
  { key: 'delivered', icon: '🎉', label: 'Delivered',        desc: 'Enjoy your meal!' },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(orderId)
      .then(r => setOrder(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));

    // Socket.io real-time updates
    const socket = getSocket();
    socket.emit('join_order', orderId);
    socket.on('order_status_update', ({ orderId: id, orderStatus }) => {
      if (id === orderId || id.toString() === orderId) {
        setOrder(prev => prev ? { ...prev, orderStatus } : prev);
      }
    });

    return () => {
      socket.off('order_status_update');
    };
  }, [orderId]);

  const currentStep = STATUS_STEPS.findIndex(s => s.key === order?.orderStatus);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="dot-loading flex gap-2">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="bg-dark-900/95 border-b border-dark-700">
        <div className="page-container py-4">
          <h1 className="font-display font-bold text-white text-xl">📦 Order Tracking</h1>
          <p className="text-dark-400 text-sm">Table {order?.tableNumber} • {order?.customerName}</p>
        </div>
      </header>

      <div className="page-container py-8 max-w-2xl mx-auto">
        {/* Status Card */}
        <div className="card p-6 mb-6 text-center bg-gradient-to-br from-brand-500/10 to-dark-800">
          <p className="text-5xl mb-3">{STATUS_STEPS[currentStep]?.icon || '🕐'}</p>
          <h2 className="text-2xl font-display font-bold text-white mb-1">
            {STATUS_STEPS[currentStep]?.label}
          </h2>
          <p className="text-dark-400">{STATUS_STEPS[currentStep]?.desc}</p>
          {order?.orderStatus !== 'delivered' && order?.orderStatus !== 'cancelled' && (
            <div className="mt-4 flex items-center justify-center gap-2 text-brand-400 text-sm">
              <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
              Live updates enabled
            </div>
          )}
        </div>

        {/* Progress Steps */}
        <div className="card p-6 mb-6">
          <div className="relative">
            {/* Progress line */}
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-dark-700" />
            <div
              className="absolute left-6 top-6 w-0.5 bg-brand-500 transition-all duration-1000"
              style={{ height: `${Math.max(0, currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
            />

            <div className="space-y-6 relative">
              {STATUS_STEPS.map((step, idx) => {
                const isDone = idx <= currentStep;
                const isCurrent = idx === currentStep;
                return (
                  <div key={step.key} className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl z-10 transition-all duration-500 ${
                      isDone ? 'bg-brand-500 shadow-lg shadow-brand-500/30' : 'bg-dark-700'
                    } ${isCurrent ? 'ring-4 ring-brand-500/30' : ''}`}>
                      {step.icon}
                    </div>
                    <div>
                      <p className={`font-semibold ${isDone ? 'text-white' : 'text-dark-500'}`}>
                        {step.label}
                      </p>
                      <p className={`text-sm ${isDone ? 'text-dark-400' : 'text-dark-600'}`}>
                        {step.desc}
                      </p>
                    </div>
                    {isCurrent && (
                      <span className="ml-auto badge-popular text-xs">Current</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Items */}
        {order?.items && (
          <div className="card p-6 mb-6">
            <h3 className="font-display font-bold text-white mb-4">Your Order</h3>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-dark-300 text-sm">
                  <span>{item.name} × {item.quantity}</span>
                  <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-dark-600 pt-2 flex justify-between text-white font-bold">
                <span>Grand Total</span>
                <span className="gradient-text">₹{order?.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {order?.orderStatus === 'delivered' && (
          <button
            onClick={() => navigate(`/menu?table=${order.tableNumber}`)}
            className="w-full btn-primary py-4"
          >
            🍽️ Order Again
          </button>
        )}
      </div>
    </div>
  );
}
