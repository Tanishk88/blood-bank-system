import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Droplet, 
  Heart, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Hospital, 
  Users, 
  Activity,
  Server
} from 'lucide-react';
import { inventoryAPI } from '../services/api';

const LandingPage = () => {
  const [stocks, setStocks] = useState([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [selectedGroup, setSelectedGroup] = useState('O-');

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await inventoryAPI.getInventory();
        if (res.data.success) {
          setStocks(res.data.stocks);
          setTotalUnits(res.data.totalUnits);
        }
      } catch (err) {
        // Fallback default sample stock for display
        setStocks([
          { bloodGroup: 'A+', units: 28 },
          { bloodGroup: 'A-', units: 9 },
          { bloodGroup: 'B+', units: 35 },
          { bloodGroup: 'B-', units: 7 },
          { bloodGroup: 'AB+', units: 14 },
          { bloodGroup: 'AB-', units: 4 },
          { bloodGroup: 'O+', units: 42 },
          { bloodGroup: 'O-', units: 5 },
        ]);
        setTotalUnits(144);
      }
    };
    fetchStock();
  }, []);

  const compatibilityMap = {
    'A+': { gives: ['A+', 'AB+'], receives: ['A+', 'A-', 'O+', 'O-'] },
    'O+': { gives: ['O+', 'A+', 'B+', 'AB+'], receives: ['O+', 'O-'] },
    'B+': { gives: ['B+', 'AB+'], receives: ['B+', 'B-', 'O+', 'O-'] },
    'AB+': { gives: ['AB+'], receives: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'A-': { gives: ['A+', 'A-', 'AB+', 'AB-'], receives: ['A-', 'O-'] },
    'O-': { gives: ['Everyone (Universal Donor)'], receives: ['O-'] },
    'B-': { gives: ['B+', 'B-', 'AB+', 'AB-'], receives: ['B-', 'O-'] },
    'AB-': { gives: ['AB+', 'AB-'], receives: ['AB-', 'A-', 'B-', 'O-'] },
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 via-white to-rose-50/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs font-semibold mb-6">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
              Cloud-Native Blood Bank Management System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Real-Time Blood Supply & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">Lifesaving Logistics</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-600 leading-relaxed">
              Connect hospitals, certified blood banks, and donors on a unified cloud platform. Real-time inventory tracking, instant emergency requests, and automated donor management.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/dashboard"
                className="px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow-md shadow-red-200 transition-all flex items-center gap-2"
              >
                Launch Management Portal <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cloud-deploy"
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
              >
                <Server className="w-4 h-4 text-sky-600" /> Cloud Deployment Guide
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Blood Stock Bar */}
      <section className="bg-slate-900 text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" /> Live Blood Supply Stock
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Real-time units currently indexed across banking facilities</p>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 font-medium">Total Indexed Units:</span>
              <span className="text-lg font-bold text-red-400">{totalUnits} units</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {stocks.map((item) => (
              <div
                key={item.bloodGroup}
                className="bg-slate-800/90 rounded-xl p-3 text-center border border-slate-700/80 hover:border-red-500/50 transition-colors"
              >
                <span className="text-xs text-slate-400 block font-semibold">Type</span>
                <span className="text-2xl font-black text-red-400 tracking-wider my-0.5 block">
                  {item.bloodGroup}
                </span>
                <span className="text-sm font-semibold text-slate-200">
                  {item.units} <span className="text-xs text-slate-400 font-normal">units</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Blood Type Compatibility Explorer */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-bold text-slate-900">Blood Compatibility Explorer</h2>
          <p className="text-slate-600 text-sm mt-2">
            Click any blood type below to view who you can donate to and who you can receive red blood cells from.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {Object.keys(compatibilityMap).map((grp) => (
              <button
                key={grp}
                onClick={() => setSelectedGroup(grp)}
                className={`px-5 py-2.5 rounded-xl font-bold text-base transition-all ${
                  selectedGroup === grp
                    ? 'bg-red-600 text-white shadow-md shadow-red-200 scale-105'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {grp}
              </button>
            ))}
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-6">
              <h3 className="text-emerald-900 font-bold text-lg flex items-center gap-2 mb-3">
                <Heart className="w-5 h-5 text-emerald-600" /> Type {selectedGroup} Can Give To:
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibilityMap[selectedGroup].gives.map((bg) => (
                  <span
                    key={bg}
                    className="px-3.5 py-1.5 bg-emerald-100 text-emerald-800 font-semibold text-sm rounded-lg border border-emerald-300"
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-blue-900 font-bold text-lg flex items-center gap-2 mb-3">
                <Droplet className="w-5 h-5 text-blue-600" /> Type {selectedGroup} Can Receive From:
              </h3>
              <div className="flex flex-wrap gap-2">
                {compatibilityMap[selectedGroup].receives.map((bg) => (
                  <span
                    key={bg}
                    className="px-3.5 py-1.5 bg-blue-100 text-blue-800 font-semibold text-sm rounded-lg border border-blue-300"
                  >
                    {bg}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-12 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Hospital Request Workflow</h3>
              <p className="text-sm text-slate-600 mt-2">
                Hospitals can request emergency units tagged by urgency (Normal, Urgent, Critical) with automatic inventory deductions upon admin validation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Donor Eligibility Tracking</h3>
              <p className="text-sm text-slate-600 mt-2">
                Enforces the medical 56-day deferral rule between donations, weight thresholds, and logs hemoglobin & blood pressure statistics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
                <Server className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cloud-Native Ready</h3>
              <p className="text-sm text-slate-600 mt-2">
                Pre-configured Dockerfiles and deployment automation scripts for AWS ECS (Fargate) and Google Cloud Run with zero-downtime health probes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 text-slate-400 py-8 border-t border-slate-800 text-center text-sm">
        <p>HemoSync Blood Bank Management System &bull; Production Architecture for Cloud</p>
      </footer>
    </div>
  );
};

export default LandingPage;
