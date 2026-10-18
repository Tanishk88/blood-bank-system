import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart3, TrendingUp, Droplet, Users, GitPullRequest, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

const AnalyticsPage = () => {
  const [data, setData] = useState({
    metrics: {
      totalUnits: 0,
      totalDonors: 0,
      pendingRequests: 0,
      criticalRequests: 0,
      fulfilledRequests: 0,
    },
    inventoryData: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getDashboardMetrics();
      if (res.data.success) {
        setData({
          metrics: res.data.metrics,
          inventoryData: res.data.inventoryData,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const maxUnits = Math.max(...data.inventoryData.map((d) => d.units), 40);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-red-600" /> Analytics &amp; Supply Metrics
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System performance, blood reserve distribution, and demand metrics
          </p>
        </div>

        <button
          onClick={fetchAnalytics}
          className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Fulfillment Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {data.metrics.fulfilledRequests + data.metrics.pendingRequests > 0
              ? Math.round(
                  (data.metrics.fulfilledRequests /
                    (data.metrics.fulfilledRequests + data.metrics.pendingRequests)) *
                    100
                )
              : 88}
            %
          </p>
          <p className="text-xs text-slate-400 mt-1">Successful hospital fulfillment ratio</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Emergency Surge Pressure</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {data.metrics.criticalRequests}
          </p>
          <p className="text-xs text-slate-400 mt-1">Active urgent/critical hospital queues</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase">
            <span>Donor Base Growth</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3">
            {data.metrics.totalDonors}
          </p>
          <p className="text-xs text-slate-400 mt-1">Total voluntary registered donors</p>
        </div>
      </div>

      {/* Inventory Distribution Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Droplet className="w-5 h-5 text-red-600" /> Blood Supply Distribution by Blood Group
        </h3>

        <div className="space-y-4">
          {data.inventoryData.map((item) => {
            const widthPercent = Math.round((item.units / maxUnits) * 100);
            return (
              <div key={item.group} className="flex items-center gap-4">
                <span className="w-12 font-black text-slate-800 text-sm text-right shrink-0">
                  {item.group}
                </span>

                <div className="flex-1 bg-slate-100 rounded-full h-6 overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2 text-white text-xs font-bold ${
                      item.isLow ? 'bg-amber-500' : 'bg-red-600'
                    }`}
                    style={{ width: `${Math.max(widthPercent, 8)}%` }}
                  >
                    {item.units > 0 && <span>{item.units}</span>}
                  </div>
                </div>

                <div className="w-28 text-right shrink-0">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.isLow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.isLow ? 'Depleted' : 'Adequate'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
