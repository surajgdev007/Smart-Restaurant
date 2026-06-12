import { useState, useEffect } from 'react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/api';
import toast from 'react-hot-toast';

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', sortOrder: 0, isActive: true });
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await getAllCategories();
      setCategories(res.data.data);
    } catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditing(null); setForm({ name: '', description: '', sortOrder: categories.length, isActive: true }); setShowModal(true); };
  const openEdit = (cat) => { setEditing(cat._id); setForm({ name: cat.name, description: cat.description, sortOrder: cat.sortOrder, isActive: cat.isActive }); setShowModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) { await updateCategory(editing, form); toast.success('Category updated!'); }
      else { await createCategory(form); toast.success('Category added!'); }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This won't delete its menu items.`)) return;
    try { await deleteCategory(id); toast.success('Deleted'); fetchCategories(); }
    catch { toast.error('Delete failed'); }
  };

  const catEmojis = { 'Starters': '🥗', 'Soups': '🍲', 'Main Course': '🍛', 'Pizza': '🍕', 'Burger': '🍔', 'Pasta': '🍝', 'Chinese': '🥢', 'South Indian': '🫓', 'Desserts': '🍰', 'Beverages': '🥤', 'Combos': '🍱', 'Sandwich': '🥪' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Categories</h2>
          <p className="text-dark-400 text-sm">{categories.length} categories</p>
        </div>
        <button onClick={openAdd} className="btn-primary">+ Add Category</button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className={`card p-5 text-center animate-enter ${!cat.isActive ? 'opacity-50' : ''}`}>
              <p className="text-4xl mb-2">{catEmojis[cat.name] || '🍴'}</p>
              <p className="font-semibold text-white text-sm mb-1">{cat.name}</p>
              {cat.description && <p className="text-dark-400 text-xs mb-3 line-clamp-2">{cat.description}</p>}
              {!cat.isActive && <span className="badge bg-red-500/20 text-red-400 border-red-500/30 mb-3">Inactive</span>}
              <div className="flex gap-2 justify-center">
                <button onClick={() => openEdit(cat)} className="text-blue-400 text-xs px-3 py-1 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">Edit</button>
                <button onClick={() => handleDelete(cat._id, cat.name)} className="text-red-400 text-xs px-3 py-1 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 animate-enter">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white text-xl">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm mb-1">Category Name *</label>
                <input className="input-field" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Starters" />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Description</label>
                <textarea className="input-field resize-none" rows={2} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} placeholder="Brief description..." />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Sort Order</label>
                <input type="number" className="input-field" value={form.sortOrder} onChange={e => setForm(f => ({...f, sortOrder: Number(e.target.value)}))} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({...f, isActive: e.target.checked}))} className="w-4 h-4 rounded accent-brand-500" />
                <span className="text-dark-300 text-sm">Active (visible to customers)</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Saving...' : editing ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
