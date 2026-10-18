import React, { useState, useEffect } from 'react';
import { donorAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import { 
  Users, 
  Search, 
  UserPlus, 
  Droplet, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Phone, 
  MapPin, 
  Heart,
  RefreshCw 
} from 'lucide-react';

const DonorsPage = () => {
  const { role } = useAuth();
  const [donors, setDonors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [activeDonor, setActiveDonor] = useState(null);

  // New Donor Form
  const [donorForm, setDonorForm] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: 'O+',
    age: 25,
    gender: 'Male',
    weight: 65,
    city: '',
    address: '',
  });

  // Record Donation Form
  const [donationForm, setDonationForm] = useState({
    units: 1,
    hemoglobinLevel: 13.5,
    bloodPressure: '120/80',
    notes: 'Standard voluntary donation',
  });

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedGroup) params.bloodGroup = selectedGroup;

      const res = await donorAPI.getDonors(params);
      if (res.data.success) {
        setDonors(res.data.donors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, [selectedGroup]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDonors();
  };

  // Register Donor Submit
  const handleRegisterDonor = async (e) => {
    e.preventDefault();
    try {
      await donorAPI.createDonor(donorForm);
      setIsRegisterModalOpen(false);
      setDonorForm({
        name: '',
        email: '',
        phone: '',
        bloodGroup: 'O+',
        age: 25,
        gender: 'Male',
        weight: 65,
        city: '',
        address: '',
      });
      fetchDonors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering donor');
    }
  };

  // Record Donation Submit (Updates Inventory!)
  const handleRecordDonation = async (e) => {
    e.preventDefault();
    if (!activeDonor) return;
    try {
      const res = await donorAPI.recordDonation(activeDonor._id, donationForm);
      alert(res.data.message || 'Donation logged successfully!');
      setIsDonateModalOpen(false);
      fetchDonors();
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording donation');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-red-600" /> Donors & Donation Registry
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage certified voluntary donors and record intake sessions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 transition-all flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" /> Register New Donor
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2 w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search donor by name, phone, or city..."
              className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Group:</span>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">All Blood Groups</option>
            {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Donors Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-6">Donor Details</th>
                <th className="py-3 px-6">Blood Group</th>
                <th className="py-3 px-6">Contact & City</th>
                <th className="py-3 px-6">Total Donations</th>
                <th className="py-3 px-6">Last Donated</th>
                <th className="py-3 px-6">Eligibility</th>
                {role === 'admin' && <th className="py-3 px-6 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {donors.length === 0 ? (
                <tr>
                  <td colSpan={role === 'admin' ? 7 : 6} className="py-8 text-center text-slate-400 text-sm">
                    No donors matching the criteria found.
                  </td>
                </tr>
              ) : (
                donors.map((donor) => {
                  const daysSinceLast = donor.lastDonationDate
                    ? Math.round((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24))
                    : null;
                  const isEligible = !daysSinceLast || daysSinceLast >= 56;

                  return (
                    <tr key={donor._id} className="hover:bg-slate-50/50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                            {donor.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{donor.name}</p>
                            <p className="text-xs text-slate-400">{donor.age} yrs &bull; {donor.gender} &bull; {donor.weight} kg</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-50 text-red-600 font-extrabold text-sm border border-red-100">
                          {donor.bloodGroup}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-600 space-y-0.5">
                        <p className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3 text-slate-400" /> {donor.phone}</p>
                        {donor.city && <p className="flex items-center gap-1 text-slate-400"><MapPin className="w-3 h-3 text-slate-400" /> {donor.city}</p>}
                      </td>
                      <td className="py-4 px-6 font-semibold text-slate-700">
                        {donor.totalDonations} time(s)
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        {donor.lastDonationDate
                          ? `${new Date(donor.lastDonationDate).toLocaleDateString()} (${daysSinceLast}d ago)`
                          : 'Never'}
                      </td>
                      <td className="py-4 px-6">
                        {isEligible ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" /> Deferred ({56 - daysSinceLast}d left)
                          </span>
                        )}
                      </td>
                      {role === 'admin' && (
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => {
                              setActiveDonor(donor);
                              setIsDonateModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <Droplet className="w-3.5 h-3.5" /> Log Donation
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register Donor Modal */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Register New Volunteer Donor"
      >
        <form onSubmit={handleRegisterDonor} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={donorForm.name}
              onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              placeholder="e.g. John Doe"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Group</label>
              <select
                value={donorForm.bloodGroup}
                onChange={(e) => setDonorForm({ ...donorForm, bloodGroup: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                required
                value={donorForm.phone}
                onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                placeholder="+1 555-0100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Age (18-65)</label>
              <input
                type="number"
                min="18"
                max="65"
                required
                value={donorForm.age}
                onChange={(e) => setDonorForm({ ...donorForm, age: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Gender</label>
              <select
                value={donorForm.gender}
                onChange={(e) => setDonorForm({ ...donorForm, gender: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weight (kg &ge;45)</label>
              <input
                type="number"
                min="45"
                required
                value={donorForm.weight}
                onChange={(e) => setDonorForm({ ...donorForm, weight: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                value={donorForm.email}
                onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                value={donorForm.city}
                onChange={(e) => setDonorForm({ ...donorForm, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 mt-2"
          >
            Save Donor Profile
          </button>
        </form>
      </Modal>

      {/* Record Donation Modal (Increment Blood Stock) */}
      <Modal
        isOpen={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        title={`Log Blood Donation: ${activeDonor?.name}`}
      >
        <form onSubmit={handleRecordDonation} className="space-y-3.5">
          <div className="p-3 bg-red-50 rounded-xl border border-red-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-red-900">
              Donor Blood Group: <strong className="text-red-700 text-sm">{activeDonor?.bloodGroup}</strong>
            </span>
            <span className="text-xs text-red-600 font-medium">Adds units directly to stock</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Units Collected</label>
              <input
                type="number"
                min="1"
                required
                value={donationForm.units}
                onChange={(e) => setDonationForm({ ...donationForm, units: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hemoglobin (g/dL)</label>
              <input
                type="number"
                step="0.1"
                required
                value={donationForm.hemoglobinLevel}
                onChange={(e) => setDonationForm({ ...donationForm, hemoglobinLevel: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Blood Pressure</label>
            <input
              type="text"
              required
              value={donationForm.bloodPressure}
              onChange={(e) => setDonationForm({ ...donationForm, bloodPressure: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
              placeholder="e.g. 120/80"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Notes</label>
            <textarea
              rows="2"
              value={donationForm.notes}
              onChange={(e) => setDonationForm({ ...donationForm, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
            ></textarea>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 mt-2"
          >
            Confirm & Increment Blood Bank Stock
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default DonorsPage;
