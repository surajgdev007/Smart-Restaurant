import { useState, useEffect } from 'react';
import { getTables, createTable, deleteTable, regenerateQR } from '../../services/api';
import toast from 'react-hot-toast';

export default function TableManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ tableNumber: '', capacity: 4 });
  const [saving, setSaving] = useState(false);
  const [qrModal, setQrModal] = useState(null);

  const fetchTables = async () => {
    try {
      const res = await getTables();
      setTables(res.data.data);
    } catch { toast.error('Failed to load tables'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTables(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createTable({ tableNumber: Number(form.tableNumber), capacity: Number(form.capacity) });
      toast.success(`Table ${form.tableNumber} created with QR code!`);
      setShowModal(false);
      setForm({ tableNumber: '', capacity: 4 });
      fetchTables();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create table');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, num) => {
    if (!window.confirm(`Delete Table ${num}?`)) return;
    try { await deleteTable(id); toast.success('Table deleted'); fetchTables(); }
    catch { toast.error('Delete failed'); }
  };

  const handleRegenerateQR = async (id, num) => {
    try {
      await regenerateQR(id);
      toast.success(`QR Code regenerated for Table ${num}`);
      fetchTables();
    } catch { toast.error('Failed to regenerate QR'); }
  };

  const downloadQR = (table) => {
    const link = document.createElement('a');
    link.href = table.qrCode;
    link.download = `Table_${table.tableNumber}_QR.png`;
    link.click();
    toast.success(`QR Code downloaded for Table ${table.tableNumber}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-2xl font-bold text-white">Tables & QR Codes</h2>
          <p className="text-dark-400 text-sm">{tables.length} tables configured</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">+ Add Table</button>
      </div>

      {/* Info Banner */}
      <div className="card p-4 mb-6 flex items-start gap-3 bg-blue-500/10 border-blue-500/30">
        <span className="text-xl">ℹ️</span>
        <div>
          <p className="text-blue-400 font-medium text-sm">How QR Codes work</p>
          <p className="text-dark-400 text-xs mt-1">Each table gets a unique QR code. When customers scan it, they are taken directly to the menu with the table number pre-selected. Print and place QR codes on each table.</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="card h-64 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(table => (
            <div key={table._id} className="card p-5 text-center animate-enter">
              <div className="flex items-center justify-between mb-3">
                <span className="badge bg-brand-500/20 text-brand-400 border-brand-500/30">Table {table.tableNumber}</span>
                <span className="text-dark-400 text-xs">👥 {table.capacity}</span>
              </div>

              {/* QR Code Preview */}
              {table.qrCode && (
                <div
                  className="w-32 h-32 mx-auto mb-3 bg-white rounded-xl p-2 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => setQrModal(table)}
                  title="Click to view full QR"
                >
                  <img src={table.qrCode} alt={`QR Table ${table.tableNumber}`} className="w-full h-full" />
                </div>
              )}

              <p className="text-dark-500 text-xs mb-1 truncate">{table.qrUrl}</p>

              <div className="flex gap-1 flex-wrap justify-center mt-3">
                <button onClick={() => downloadQR(table)} className="text-green-400 text-xs px-2 py-1 bg-green-500/10 rounded-lg hover:bg-green-500/20 transition-colors">⬇ Download</button>
                <button onClick={() => handleRegenerateQR(table._id, table.tableNumber)} className="text-blue-400 text-xs px-2 py-1 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition-colors">🔄 Regen</button>
                <button onClick={() => handleDelete(table._id, table.tableNumber)} className="text-red-400 text-xs px-2 py-1 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition-colors">🗑 Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md p-6 animate-enter">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-white text-xl">Add New Table</h3>
              <button onClick={() => setShowModal(false)} className="text-dark-400 hover:text-white text-2xl">×</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-dark-300 text-sm mb-1">Table Number *</label>
                <input type="number" min="1" className="input-field" required value={form.tableNumber} onChange={e => setForm(f => ({...f, tableNumber: e.target.value}))} placeholder="e.g. 11" />
              </div>
              <div>
                <label className="block text-dark-300 text-sm mb-1">Seating Capacity</label>
                <select className="select-field" value={form.capacity} onChange={e => setForm(f => ({...f, capacity: e.target.value}))}>
                  {[2, 4, 6, 8, 10].map(n => <option key={n} value={n}>{n} people</option>)}
                </select>
              </div>
              <p className="text-dark-400 text-xs">A QR code will be automatically generated and linked to: <br /><code className="text-brand-400">/menu?table={form.tableNumber || 'N'}</code></p>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 btn-primary">{saving ? 'Generating QR...' : '+ Create Table'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Full View Modal */}
      {qrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setQrModal(null)}>
          <div className="card p-8 text-center animate-enter" onClick={e => e.stopPropagation()}>
            <h3 className="font-display font-bold text-white text-xl mb-4">Table {qrModal.tableNumber} – QR Code</h3>
            <div className="bg-white rounded-2xl p-4 w-64 h-64 mx-auto mb-4">
              <img src={qrModal.qrCode} alt="QR Code" className="w-full h-full" />
            </div>
            <p className="text-dark-400 text-sm mb-4">Scan to open: <span className="text-brand-400">{qrModal.qrUrl}</span></p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => downloadQR(qrModal)} className="btn-primary py-2 px-6">⬇ Download PNG</button>
              <button onClick={() => setQrModal(null)} className="btn-secondary py-2 px-6">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
