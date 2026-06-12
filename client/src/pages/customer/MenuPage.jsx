import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { getMenuItems, getCategories } from '../../services/api';
import { useCart } from '../../context/CartContext';
import MenuCard from '../../components/customer/MenuCard';
import toast from 'react-hot-toast';

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const tableNumber = searchParams.get('table');
  const navigate = useNavigate();
  const { totalItems, grandTotal, setTable, tableNumber: cartTable } = useCart();

  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, veg, nonveg

  useEffect(() => {
    if (tableNumber) setTable(Number(tableNumber));
  }, [tableNumber]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data)).catch(console.error);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCat) params.category = selectedCat;
      if (search) params.search = search;
      const res = await getMenuItems(params);
      let data = res.data.data;
      if (filter === 'veg') data = data.filter(i => i.isVeg);
      if (filter === 'nonveg') data = data.filter(i => !i.isVeg);
      setItems(data);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [selectedCat, search, filter]);

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [fetchItems]);

  const popular = items.filter(i => i.isPopular || i.isBestSeller).slice(0, 6);

  return (
    <div className="min-h-screen bg-dark-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-dark-900/95 backdrop-blur-md border-b border-dark-700">
        <div className="page-container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🍽️</span>
            <div>
              <h1 className="font-display font-bold text-white text-lg">Smart Restaurant</h1>
              {tableNumber && (
                <p className="text-brand-400 text-xs font-medium">📍 Table {tableNumber}</p>
              )}
            </div>
          </div>
          <button
            id="view-cart-btn"
            onClick={() => navigate('/cart')}
            className="relative flex items-center gap-2 btn-primary py-2 px-4 text-sm"
          >
            🛒 Cart
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center font-bold animate-bounce-in">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="page-container pb-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">🔍</span>
            <input
              id="menu-search"
              type="text"
              placeholder="Search for food..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 py-2.5 text-sm"
            />
          </div>
        </div>

        {/* Veg/NonVeg Filter */}
        <div className="page-container pb-3 flex gap-2">
          {['all', 'veg', 'nonveg'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-brand-500 text-white'
                  : 'bg-dark-800 text-dark-300 hover:text-white'
              }`}
            >
              {f === 'all' ? '🍽️ All' : f === 'veg' ? '🟢 Veg' : '🔴 Non-Veg'}
            </button>
          ))}
        </div>
      </header>

      <div className="page-container py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCat('')}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCat === ''
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'bg-dark-800 text-dark-300 hover:text-white'
            }`}
          >
            🍴 All
          </button>
          {categories.map(cat => (
            <button
              key={cat._id}
              onClick={() => setSelectedCat(cat._id)}
              className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                selectedCat === cat._id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                  : 'bg-dark-800 text-dark-300 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Popular Section */}
        {!selectedCat && !search && popular.length > 0 && (
          <section className="mb-8">
            <h2 className="section-heading flex items-center gap-2">
              🔥 <span className="gradient-text">Popular & Best Sellers</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {popular.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          </section>
        )}

        {/* All Items */}
        <section>
          <h2 className="section-heading">
            {selectedCat ? categories.find(c => c._id === selectedCat)?.name : '🍽️ All Items'}
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card h-72 animate-pulse bg-dark-800/50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 text-dark-400">
              <p className="text-5xl mb-4">🍽️</p>
              <p className="text-lg">No items found</p>
              <p className="text-sm">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          )}
        </section>
      </div>

      {/* Sticky Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-dark-900/95 backdrop-blur-md border-t border-dark-700">
          <button
            onClick={() => navigate('/cart')}
            className="w-full btn-primary flex items-center justify-between py-4"
          >
            <span className="bg-brand-700 rounded-lg px-2 py-0.5 text-sm font-bold">{totalItems}</span>
            <span>View Cart</span>
            <span>₹{grandTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
}
