import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  analyticsAPI, 
  inventoryAPI, 
  requestAPI, 
  donorAPI 
} from '../services/api';
import StatCard from '../components/StatCard';
import BloodStockCard from '../components/BloodStockCard';
import Modal from '../components/Modal';
import { 
  Droplet, 
  Users, 
  GitPullRequest, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus, 
  Calendar,
  Building2,
  RefreshCw
} from 'lucide-react';

const Dashboard = () => {
  const { user, role } = useAuth();

  const [metrics, setMetrics] = useState({
    totalUnits: 0,
    totalDonors: 0,
    pendingRequests: 0,
    criticalRequests: 0,
    fulfilledRequests: 0,
  });
  const [stocks, setStocks] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [recentDonations, setRecentDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [stockChangeUnits, setStockChangeUnits] = useState(5);

  // New blood request form
  const [requestForm, setRequestForm] = useState({
    hospitalName: user?.organizationName || '',
    patientName: '',
    bloodGroup: 'O+',
    unitsRequested: 1,
    urgency: 'Urgent',
    reason: '',
    contactPhone: user?.phone || '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load Analytics
      const analyticsRes = await analyticsAPI.getDashboardMetrics();
      if (analyticsRes.data.success) {
        setMetrics(analyticsRes.data.metrics);
        setRecentDonations(analyticsRes.data.recentDonations || []);
      }

      // 2. Load Inventory
      const invRes = await inventoryAPI.getInventory();
      if (invRes.data.success) {
        setStocks(invRes.data.stocks);
      }

      // 3. Load Requests
      const reqRes = await requestAPI.getRequests();
      if (reqRes.data.success) {
        setRecentRequests(reqRes.data.requests);
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Handle Quick Status Update for Request (Admin)
  const handleStatusChange = async (requestId, status) => {
    try {
      await requestAPI.updateStatus(requestId, { status });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  // Handle Stock adjustment
  const handleStockUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStock) return;
    try {
      await inventoryAPI.updateStock(selectedStock.bloodGroup, { change: Number(stockChangeUnits) });
      setIsStockModalOpen(false);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating stock');
    }
  };

  // Handle Hospital Request Submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      await requestAPI.createRequest(requestForm);
      setIsRequestModalOpen(false);
      setRequestForm({
        hospitalName: user?.organizationName || '',
        patientName: '',
        bloodGroup: 'O+',
        unitsRequested: 1,
        urgency: 'Urgent',
        reason: '',
        contactPhone: user?.phone || '',
      });
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting request');
    }
  };

  const lowStocks = stocks.filter((s) => s.units <= s.minimumThreshold);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name || 'User'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System overview and active operations for <span className="font-semibold capitalize text-slate-700">{role}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {(role === 'hospital' || role === 'admin') && (
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Request Blood Units
            </button>
          )}
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStocks.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">
              Low Stock Alert ({lowStocks.length} group{lowStocks.length > 1 ? 's' : ''} below minimum reserve)
            </h4>
            <div className="flex flex-wrap gap-2 mt-2">
              {lowStocks.map((s) => (
                <span
                  key={s.bloodGroup}
                  className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300"
                >
                  Type {s.bloodGroup}: {s.units} units remaining (min {s.minimumThreshold})
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Blood Units"
          value={metrics.totalUnits}
          subtitle="Available in cold storage"
          icon={Droplet}
          color="red"
        />
        <StatCard
          title="Registered Donors"
          value={metrics.totalDonors}
          subtitle="Active donor records"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Pending Requests"
          value={metrics.pendingRequests}
          subtitle="Awaiting authorization"
          icon={Clock}
          color="amber"
          alert={metrics.pendingRequests > 0}
        />
        <StatCard
          title="Critical Emergencies"
          value={metrics.criticalRequests}
          subtitle="High-priority blood requests"
          icon={AlertTriangle}
          color="purple"
          alert={metrics.criticalRequests > 0}
        />
      </div>

      {/* Blood Inventory Grid (Preview) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-red-600" /> Current Inventory Units
          </h2>
          <span className="text-xs text-slate-400">8 Standard ABO & Rh groups</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {stocks.map((stock) => (
            <BloodStockCard
              key={stock.bloodGroup}
              stock={stock}
              canEdit={role === 'admin'}
              onUpdate={(stk) => {
                setSelectedStock(stk);
                setIsStockModalOpen(true);
              }}
              onQuickRequest={(grp) => {
                setRequestForm((prev) => ({ ...prev, bloodGroup: grp }));
                setIsRequestModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Recent Requests & Recent Donations Dual Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Requests Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-slate-600" /> Recent Blood Requests
            </h3>
            <span className="text-xs text-slate-400">Latest submissions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-2.5">Patient / Hospital</th>
                  <th className="py-2.5">Group</th>
                  <th className="py-2.5">Units</th>
                  <th className="py-2.5">Urgency</th>
                  <th className="py-2.5">Status</th>
                  {role === 'admin' && <th className="py-2.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={role === 'admin' ? 6 : 5} className="py-6 text-center text-slate-400 text-xs">
                      No blood requests registered yet.
                    </td>
                  </tr>
                ) : (
                  recentRequests.slice(0, 5).map((req) => (
                    <tr key={req._id} className="hover:bg-slate-50/50">
                      <td className="py-3">
                        <p className="font-semibold text-slate-800">{req.patientName}</p>
                        <p className="text-xs text-slate-400">{req.hospitalName}</p>
                      </td>
                      <td className="py-3">
                        <span className="font-bold text-red-600">{req.bloodGroup}</span>
                      </td>
                      <td className="py-3 font-semibold text-slate-700">{req.unitsRequested}</td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            req.urgency === 'Critical'
                              ? 'bg-rose-100 text-rose-700'
                              : req.urgency === 'Urgent'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            req.status === 'Approved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : req.status === 'Rejected'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      {role === 'admin' && (
                        <td className="py-3 text-right space-x-1">
                          {req.status === 'Pending' ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(req._id, 'Approved')}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(req._id, 'Rejected')}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Completed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Donations Activity Feed */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-red-600" /> Recent Donations
            </h3>
            <span className="text-xs text-slate-400">Verified logs</span>
          </div>

          <div className="space-y-3">
            {recentDonations.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No donations recorded yet.</p>
            ) : (
              recentDonations.slice(0, 5).map((don) => (
                <div
                  key={don._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 font-bold flex items-center justify-center text-xs">
                      {don.bloodGroup}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{don.donorName}</h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(don.donationDate).toLocaleDateString()} &bull; {don.units} unit(s)
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    Logged
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Adjust Stock Units Modal (Admin) */}
      <Modal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        title={`Adjust Stock: Type ${selectedStock?.bloodGroup}`}
      >
        <form onSubmit={handleStockUpdate} className="space-y-4">
          <p className="text-xs text-slate-500">
            Current units available: <strong className="text-slate-800">{selectedStock?.units}</strong>
          </p>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Add / Deduct Units (+ to add, - to deduct)
            </label>
            <input
              type="number"
              required
              value={stockChangeUnits}
              onChange={(e) => setStockChangeUnits(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200"
          >
            Update Inventory
          </button>
        </form>
      </Modal>

      {/* Request Blood Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Submit Emergency Blood Request"
      >
        <form onSubmit={handleRequestSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
            <input
              type="text"
              required
              value={requestForm.hospitalName}
              onChange={(e) => setRequestForm({ ...requestForm, hospitalName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={requestForm.patientName}
              onChange={(e) => setRequestForm({ ...requestForm, patientName: e.target.value })}
              placeholder="Full patient name"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group Needed</label>
              <select
                value={requestForm.bloodGroup}
                onChange={(e) => setRequestForm({ ...requestForm, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Units Required</label>
              <input
                type="number"
                min="1"
                required
                value={requestForm.unitsRequested}
                onChange={(e) => setRequestForm({ ...requestForm, unitsRequested: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency Level</label>
              <select
                value={requestForm.urgency}
                onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Normal">Normal</option>
                <option value="Urgent">Urgent</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                required
                value={requestForm.contactPhone}
                onChange={(e) => setRequestForm({ ...requestForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Clinical Details</label>
            <textarea
              rows="2"
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              placeholder="e.g. ICU surgery, accident trauma"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 mt-2"
          >
            Submit Request to Blood Bank
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;
