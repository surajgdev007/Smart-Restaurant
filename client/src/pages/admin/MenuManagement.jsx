import { useState, useEffect } from 'react';
import { getAllMenuItems, getAllCategories, createMenuItem, updateMenuItem, deleteMenuItem } from '../../services/api';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', price: '', category: '', isVeg: true, isAvailable: true, isPopular: false, isBestSeller: false, prepTime: 15, spiceLevel: 'mild' };

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [filterCat, setFilterCat] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [itemsRes, catsRes] = await Promise.all([getAllMenuItems({ category: filterCat || undefined }), getAllCategories()]);
      setItems(itemsRes.data.data);
      setCategories(catsRes.data.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [filterCat]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setImageFile(null); setShowModal(true); };
  const openEdit = (item) => {
    setEditing(item._id);
    setForm({
      name: item.name, description: item.description, price: item.price,
      category: item.category?._id || '', isVeg: item.isVeg, isAvailable: item.isAvailable,
      isPopular: item.isPopular, isBestSeller: item.isBestSeller, prepTime: item.prepTime, spiceLevel: item.spiceLevel,
    });
    setImageFile(null);
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editing) {
        await updateMenuItem(editing, fd);
        toast.success('Item updated!');
      } else {
        await createMenuItem(fd);
        toast.success('Item added!');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteMenuItem(id);
      toast.success('Item deleted');
      fetchAll();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Menu Management</h2>
          <p className="text-dark-400 text-sm">{items.length} items</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Item</button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFilterCat('')} className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all ${!filterCat ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300'}`}>All</button>
        {categories.map(c => (
          <button key={c._id} onClick={() => setFilterCat(c._id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${filterCat === c._id ? 'bg-brand-500 text-white' : 'bg-dark-800 text-dark-300'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-48 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item._id} className="card p-4 flex gap-3 animate-enter">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-dark-700 flex-shrink-0">
                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate text-sm">{item.name}</p>
                <p className="text-dark-400 text-xs truncate">{item.category?.name}</p>
                <p className="text-brand-400 font-bold text-sm">₹{item.price}</p>
                <div className="flex gap-1 mt-1">
                  <span className={item.isVeg ? 'badge-veg' : 'badge-nonveg'}>{item.isVeg ? '🟢' : '🔴'}</span>
                  {!item.isAvailable && <span className="badge bg-red-500/20 text-red-400 border-red-500/30">Unavailable</span>}
                  {item.isBestSeller && <span className="badge-bestseller">⭐</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => openEdit(item)} className="text-blue-400 hover:text-blue-300 text-xs px-2 py-1 bg-blue-500/10 rounded-lg transition-colors">Edit</button>
                <button onClick={() => handleDelete(item._id, item.name)} className="text-red-400 hover:text-red-300 text-xs px-2 py-1 bg-red-500/10 rounded-lg transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-enter">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white text-xl">{editing ? 'Edit Item' : 'Add New Item'}</h3>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-dark-300 text-sm mb-1">Item Name *</label>
                  <input className="input-field" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Paneer Tikka" />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm mb-1">Category *</label>
                  <select className="select-field" required value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-dark-300 text-sm mb-1">Price (₹) *</label>
                  <input type="number" min="0" className="input-field" required value={form.price} onChange={e => setForm(f => ({...f, price: e.target.value}))} placeholder="280" />
                </div>
                <div className="col-span-2">
                  <label className="block text-dark-300 text-sm mb-1">Description</label>
                  <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description..." />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm mb-1">Prep Time (min)</label>
                  <input type="number" min="1" className="input-field" value={form.prepTime} onChange={e => setForm(f => ({...f, prepTime: e.target.value}))} />
                </div>
                <div>
                  <label className="block text-dark-300 text-sm mb-1">Spice Level</label>
                  <select className="select-field" value={form.spiceLevel} onChange={e => setForm(f => ({...f, spiceLevel: e.target.value}))}>
                    {['mild', 'medium', 'hot', 'extra-hot'].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-dark-300 text-sm mb-1">Food Image</label>
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="input-field text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-brand-500 file:text-white" />
                </div>
                <div className="col-span-2 flex flex-wrap gap-4">
                  {[['isVeg', 'Vegetarian 🟢'], ['isAvailable', 'Available'], ['isPopular', 'Popular 🔥'], ['isBestSeller', 'Best Seller ⭐']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.checked}))} className="w-4 h-4 rounded accent-brand-500" />
                      <span className="text-dark-300 text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : editing ? 'Update Item' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
