import React, { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import BloodStockCard from '../components/BloodStockCard';
import Modal from '../components/Modal';
import { Layers, AlertTriangle, ShieldCheck, RefreshCw, Droplet, ArrowUpDown } from 'lucide-react';

const InventoryPage = () => {
  const { role } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit stock modal
  const [selectedStock, setSelectedStock] = useState(null);
  const [editUnits, setEditUnits] = useState(0);
  const [editThreshold, setEditThreshold] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getInventory();
      if (res.data.success) {
        setStocks(res.data.stocks);
        setTotalUnits(res.data.totalUnits);
        setLowStockAlerts(res.data.lowStockAlerts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const openEditModal = (stock) => {
    setSelectedStock(stock);
    setEditUnits(stock.units);
    setEditThreshold(stock.minimumThreshold);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.updateStock(selectedStock.bloodGroup, {
        units: Number(editUnits),
        minimumThreshold: Number(editThreshold),
      });
      setIsModalOpen(false);
      fetchInventory();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stock');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-red-600" /> Blood Stock Inventory
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time tracking of units across all 8 ABO/Rh blood groups
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-right">
            <span className="text-xs text-slate-500 block">Total Capacity</span>
            <span className="text-lg font-bold text-slate-800">{totalUnits} units</span>
          </div>
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Low Stock Alerts Banner */}
      {lowStockAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Low Stock Warnings ({lowStockAlerts.length} groups below safety threshold)
            </h4>
            <p className="text-xs text-amber-700 mt-1">
              Safety threshold requires at least 10-15 units per blood group. Organize targeted donor drives for depleted groups.
            </p>
          </div>
        </div>
      )}

      {/* Grid of 8 Blood Types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stocks.map((stock) => (
          <BloodStockCard
            key={stock.bloodGroup}
            stock={stock}
            canEdit={role === 'admin'}
            onUpdate={openEditModal}
          />
        ))}
      </div>

      {/* Edit Modal (Admin) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Configure Inventory: Type ${selectedStock?.bloodGroup}`}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Available Units</label>
            <input
              type="number"
              min="0"
              required
              value={editUnits}
              onChange={(e) => setEditUnits(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Safety Threshold</label>
            <input
              type="number"
              min="1"
              required
              value={editThreshold}
              onChange={(e) => setEditThreshold(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              When units fall at or below this threshold, an emergency notification is shown.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 mt-2"
          >
            Save Stock Configuration
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
