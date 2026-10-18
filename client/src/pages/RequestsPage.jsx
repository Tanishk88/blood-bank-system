import React, { useState, useEffect } from 'react';
import { requestAPI, inventoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  GitPullRequest, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  Phone, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';

const RequestsPage = () => {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  // Form
  const [form, setForm] = useState({
    hospitalName: user?.organizationName || '',
    patientName: '',
    bloodGroup: 'O+',
    unitsRequested: 1,
    urgency: 'Urgent',
    reason: '',
    contactPhone: user?.phone || '',
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (urgencyFilter) params.urgency = urgencyFilter;

      const res = await requestAPI.getRequests(params);
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, urgencyFilter]);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      await requestAPI.createRequest(form);
      setIsNewModalOpen(false);
      setForm({
        hospitalName: user?.organizationName || '',
        patientName: '',
        bloodGroup: 'O+',
        unitsRequested: 1,
        urgency: 'Urgent',
        reason: '',
        contactPhone: user?.phone || '',
      });
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting request');
    }
  };

  const handleStatusSubmit = async (status) => {
    if (!activeRequest) return;
    try {
      await requestAPI.updateStatus(activeRequest._id, {
        status,
        adminNotes,
      });
      setIsReviewModalOpen(false);
      setActiveRequest(null);
      setAdminNotes('');
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <GitPullRequest className="w-6 h-6 text-red-600" /> Hospital Blood Requests
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Emergency requisitions, quota approvals, and automated inventory fulfillment
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Emergency Request
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Fulfilled">Fulfilled</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="">All Urgencies</option>
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Patient & Hospital</th>
                <th className="py-3 px-6">Blood Type</th>
                <th className="py-3 px-6">Units</th>
                <th className="py-3 px-6">Urgency</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6">Date Requested</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-sm">
                    No requests found matching your filters.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50/50">
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{req.patientName}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Building2 className="w-3 h-3" /> {req.hospitalName} &bull; {req.contactPhone}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 font-extrabold text-sm border border-red-100">
                        {req.bloodGroup}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-slate-800">{req.unitsRequested} units</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.urgency === 'Critical'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : req.urgency === 'Urgent'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {req.urgency === 'Critical' && <AlertTriangle className="w-3 h-3" />}
                        {req.urgency}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : req.status === 'Rejected'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : req.status === 'Fulfilled'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {role === 'admin' ? (
                        <button
                          onClick={() => {
                            setActiveRequest(req);
                            setAdminNotes(req.adminNotes || '');
                            setIsReviewModalOpen(true);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                        >
                          Review &amp; Decide
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Logged</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal (Admin) */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title={`Review Request: Patient ${activeRequest?.patientName}`}
      >
        {activeRequest && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <p><strong>Hospital:</strong> {activeRequest.hospitalName}</p>
              <p><strong>Contact:</strong> {activeRequest.contactPhone}</p>
              <p><strong>Requested:</strong> <span className="text-red-600 font-bold">{activeRequest.unitsRequested} units</span> of <span className="text-red-600 font-bold">{activeRequest.bloodGroup}</span></p>
              <p><strong>Urgency:</strong> {activeRequest.urgency}</p>
              <p><strong>Clinical Reason:</strong> {activeRequest.reason || 'None provided'}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Resolution Notes</label>
              <textarea
                rows="2"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Optional notes or dispatch dispatch tracking info"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              ></textarea>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => handleStatusSubmit('Rejected')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
              >
                Reject Request
              </button>
              <button
                type="button"
                onClick={() => handleStatusSubmit('Approved')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Approve &amp; Deduct Units
              </button>
              <button
                type="button"
                onClick={() => handleStatusSubmit('Fulfilled')}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
              >
                Mark Fulfilled
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Request Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Submit Emergency Blood Request"
      >
        <form onSubmit={handleCreateRequest} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Hospital / Clinic Name</label>
            <input
              type="text"
              required
              value={form.hospitalName}
              onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              placeholder="e.g. City General Hospital"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Patient Name</label>
            <input
              type="text"
              required
              value={form.patientName}
              onChange={(e) => setForm({ ...form, patientName: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              placeholder="e.g. Sarah Connor"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
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
                value={form.unitsRequested}
                onChange={(e) => setForm({ ...form, unitsRequested: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Urgency</label>
              <select
                value={form.urgency}
                onChange={(e) => setForm({ ...form, urgency: e.target.value })}
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
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                placeholder="+1 555-0199"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Clinical Details</label>
            <textarea
              rows="2"
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              placeholder="e.g. Emergency surgery scheduled at 8 AM"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 mt-2"
          >
            Submit Request
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default RequestsPage;
