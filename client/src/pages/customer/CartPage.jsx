import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items, tableNumber, subtotal, tax, serviceCharge, grandTotal, totalItems,
    addItem, removeItem, updateQuantity, clearCart
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center text-center px-4">
        <div className="text-8xl mb-6 animate-bounce">🛒</div>
        <h2 className="text-2xl font-display font-bold text-white mb-2">Your cart is empty</h2>
        <p className="text-dark-400 mb-8">Add some delicious food to get started!</p>
        <button
          onClick={() => navigate(`/menu${tableNumber ? `?table=${tableNumber}` : ''}`)}
          className="btn-primary"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
        <div className="page-container py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-dark-400 hover:text-white transition-colors">
            ← Back
          </button>
          <h1 className="font-display font-bold text-white">Your Cart</h1>
          <button
            onClick={() => { clearCart(); }}
            className="text-red-400 hover:text-red-300 text-sm transition-colors"
          >
            Clear All
          </button>
        </div>
      </header>

      <div className="page-container py-6 max-w-2xl mx-auto">
        {tableNumber && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-brand-500/10 border border-brand-500/30 rounded-xl">
            <span>📍</span>
            <span className="text-brand-400 font-medium">Table {tableNumber}</span>
          </div>
        )}

        {/* Cart Items */}
        <div className="space-y-3 mb-6">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex items-center gap-4 animate-enter">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{item.name}</p>
                <p className="text-brand-400 font-bold">₹{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item._id, item.quantity - 1)}
                  className="w-8 h-8 rounded-lg bg-dark-700 hover:bg-dark-600 text-white font-bold flex items-center justify-center transition-colors"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                  className="w-8 h-8 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-bold flex items-center justify-center transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item._id)}
                  className="ml-1 text-red-400 hover:text-red-300 text-lg transition-colors"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Summary */}
        <div className="card p-6 mb-6">
          <h3 className="font-display font-bold text-white mb-4">Bill Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-dark-300">
              <span>Subtotal ({totalItems} items)</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-dark-300">
              <span>Tax (5%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-dark-300">
              <span>Service Charge (2%)</span>
              <span>₹{serviceCharge.toFixed(2)}</span>
            </div>
            <div className="border-t border-dark-600 pt-3 flex justify-between">
              <span className="font-display font-bold text-white text-lg">Grand Total</span>
              <span className="font-display font-bold gradient-text text-xl">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <button
          id="checkout-btn"
          onClick={() => navigate('/checkout')}
          className="w-full btn-primary py-4 text-lg"
        >
          Proceed to Checkout →
        </button>
      </div>
    </div>
  );
}
