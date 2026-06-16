import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { placeOrder, createRazorpayOrder, verifyPayment } from '../../services/api';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, tableNumber, subtotal, tax, serviceCharge, grandTotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  // Guard: redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-display font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-dark-400 mb-6">Add items to your cart before checking out.</p>
        <button onClick={() => navigate(-1)} className="btn-primary">← Go Back</button>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!tableNumber) {
      toast.error('Table number is missing. Please scan the QR code again.');
      return;
    }
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      // 1. Place order in DB
      const orderItems = items.map(i => ({
        menuItem: i._id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        image: i.image || '',
      }));

      const orderRes = await placeOrder({
        tableNumber: Number(tableNumber),
        items: orderItems,
        specialInstructions: instructions,
        customerName,
      });
      const order = orderRes.data.data;

      // 2. Create Razorpay order
      const rzpRes = await createRazorpayOrder({ orderId: order._id, amount: grandTotal });
      const { razorpayOrderId, keyId } = rzpRes.data.data;

      // 3. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: Math.round(grandTotal * 100),
        currency: 'INR',
        name: 'Smart Restaurant',
        description: `Table ${tableNumber} - Order`,
        order_id: razorpayOrderId,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              orderId: order._id,
            });
            clearCart();
            toast.success('🎉 Payment successful! Order placed!');
            navigate(`/order/${order._id}`);
          } catch {
            toast.error('Payment verification failed');
          }
        },
        prefill: { name: customerName },
        theme: { color: '#f97316' },
        modal: {
          ondismiss: () => toast('Payment cancelled', { icon: '⚠️' }),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
        <div className="page-container py-4 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="text-dark-400 hover:text-white transition-colors">
            ← Back
          </button>
          <h1 className="font-display font-bold text-white">Checkout</h1>
        </div>
      </header>

      <div className="page-container py-6 max-w-2xl mx-auto">
        {/* Table Info */}
        <div className="card p-4 mb-6 flex items-center gap-3 bg-brand-500/10 border-brand-500/30">
          <span className="text-2xl">📍</span>
          <div>
            <p className="text-white font-semibold">Table {tableNumber}</p>
            <p className="text-dark-400 text-sm">Your order will be delivered to this table</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="card p-6 mb-6">
          <h3 className="font-display font-bold text-white mb-4">Your Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-dark-300 text-sm mb-2">Your Name *</label>
              <input
                id="customer-name"
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Enter your name"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-dark-300 text-sm mb-2">Special Instructions (optional)</label>
              <textarea
                id="special-instructions"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                placeholder="e.g. No onions, less spicy..."
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="card p-6 mb-6">
          <h3 className="font-display font-bold text-white mb-4">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {items.map(item => (
              <div key={item._id} className="flex justify-between text-dark-300 text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span>₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-600 pt-4 space-y-2">
            <div className="flex justify-between text-dark-300 text-sm">
              <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-dark-300 text-sm">
              <span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-dark-300 text-sm">
              <span>Service Charge (2%)</span><span>₹{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-white text-lg pt-2 border-t border-dark-600">
              <span>Total</span>
              <span className="gradient-text">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Note */}
        <div className="flex items-start gap-2 mb-6 text-dark-400 text-xs">
          <span>🔒</span>
          <span>Secure payment powered by Razorpay. Test mode active — no real money charged.</span>
        </div>

        <button
          id="pay-now-btn"
          onClick={handlePayment}
          disabled={loading}
          className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="dot-loading flex gap-1">
              <span /><span /><span />
            </div>
          ) : (
            <>💳 Pay ₹{grandTotal.toFixed(2)}</>
          )}
        </button>
      </div>
    </div>
  );
}
