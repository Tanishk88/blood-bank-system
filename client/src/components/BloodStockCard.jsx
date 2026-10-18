import React from 'react';
import { Droplet, AlertTriangle, PlusCircle, CheckCircle2 } from 'lucide-react';

const BloodStockCard = ({ stock, onUpdate, onQuickRequest, canEdit = false }) => {
  const isLow = stock.units <= stock.minimumThreshold;
  const isCritical = stock.units <= Math.floor(stock.minimumThreshold / 2);

  // Status color badge
  const getStatusBadge = () => {
    if (isCritical) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800 border border-rose-200">
          <AlertTriangle className="w-3 h-3 text-rose-600" /> Critical Shortage
        </span>
      );
    }
    if (isLow) {
      return (
        <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Well Stocked
      </span>
    );
  };

  const percentage = Math.min(100, Math.round((stock.units / (stock.minimumThreshold * 2.5)) * 100));

  return (
    <div className={`p-5 rounded-2xl bg-white border ${isLow ? 'border-amber-300 shadow-sm' : 'border-slate-200'} shadow-sm hover:border-red-300 transition-all flex flex-col justify-between`}>
      <div>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center font-black text-red-600 text-xl tracking-wider shadow-inner">
              {stock.bloodGroup}
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-700">Type {stock.bloodGroup}</h4>
              <p className="text-xs text-slate-400">Min. req: {stock.minimumThreshold} units</p>
            </div>
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        <div className="mt-5">
          <div className="flex items-baseline justify-between mb-1.5">
            <span className="text-3xl font-extrabold text-slate-900">{stock.units}</span>
            <span className="text-xs font-medium text-slate-500">Available Units</span>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isCritical
                  ? 'bg-rose-500'
                  : isLow
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
        {canEdit ? (
          <button
            onClick={() => onUpdate && onUpdate(stock)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Adjust Stock
          </button>
        ) : (
          <button
            onClick={() => onQuickRequest && onQuickRequest(stock.bloodGroup)}
            className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <Droplet className="w-3.5 h-3.5 text-red-600" /> Request Units
          </button>
        )}
      </div>
    </div>
  );
};

export default BloodStockCard;
