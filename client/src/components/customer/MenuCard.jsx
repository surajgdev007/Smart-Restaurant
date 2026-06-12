import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

export default function MenuCard({ item }) {
  const { addItem, items } = useCart();

  const cartItem = items.find(i => i._id === item._id);
  const qty = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} added to cart!`, {
      icon: '🛒',
      style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' },
    });
  };

  const stars = '★'.repeat(Math.round(item.rating)) + '☆'.repeat(5 - Math.round(item.rating));

  return (
    <div className="card-hover overflow-hidden group animate-enter">
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-dark-700">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl bg-gradient-to-br from-dark-700 to-dark-800">
            🍽️
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {item.isBestSeller && <span className="badge-bestseller">⭐ Best Seller</span>}
          {item.isPopular && !item.isBestSeller && <span className="badge-popular">🔥 Popular</span>}
        </div>
        <div className="absolute top-2 right-2">
          <span className={item.isVeg ? 'badge-veg' : 'badge-nonveg'}>
            {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
          </span>
        </div>
        {qty > 0 && (
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
            {qty}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-white text-base mb-1 truncate">{item.name}</h3>
        <p className="text-dark-400 text-xs mb-2 line-clamp-2 leading-relaxed">{item.description}</p>

        <div className="flex items-center gap-1 mb-3">
          <span className="text-yellow-400 text-xs">{stars}</span>
          <span className="text-dark-400 text-xs">({item.totalRatings})</span>
          {item.prepTime && (
            <span className="ml-auto text-dark-400 text-xs">⏱ {item.prepTime} min</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-display font-bold gradient-text">₹{item.price}</span>
          <button
            onClick={handleAdd}
            className="btn-primary py-2 px-4 text-sm"
            id={`add-to-cart-${item._id}`}
          >
            {qty > 0 ? `Add More (+${qty})` : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
