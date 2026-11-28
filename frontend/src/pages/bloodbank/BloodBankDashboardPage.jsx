import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check, Plus, Minus } from 'lucide-react';
import OrgSidebar from '../../components/layout/OrgSidebar';
import StatusPill from '../../components/common/StatusPill';
import { useBloodData } from '../../context/BloodDataContext';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { useHashScroll } from '../../utils/useHashScroll';
export const BloodBankDashboardPage = () => {
  useHashScroll();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { inventory, adjustStock, refreshInventory } = useBloodData();
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [hospitalRequests, setHospitalRequests] = useState([]);
  const [shortages, setShortages] = useState([]);
  const lowTypes = inventory.filter((i) => i.status === 'LOW').map((i) => i.type);

  // Real data, refreshed every 15 seconds. Demo logins have no account, so they stay empty.
  useEffect(() => {
    if (!currentUser?.id) return;
    let alive = true;
    const load = async () => {
      try {
        const [reqs, short] = await Promise.all([
          api.get('/emergencies/open'),
          api.get('/inventory/shortages'),
        ]);
        if (!alive) return;
        setHospitalRequests((prev) => {
          const hidden = new Set(prev.filter((p) => p.hidden).map((p) => p.id));
          return reqs.data.map((r) => ({ ...r, hidden: hidden.has(r.id) }));
        });
        setShortages(
          short.data.flatMap((o) =>
            o.low.map((l) => ({ hospital: o.organization, bloodType: l.bloodType }))
          )
        );
      } catch {
        /* keep what we have */
      }
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [currentUser?.id]);

  const visibleRequests = hospitalRequests.filter((r) => !r.hidden);
  const hide = (id) =>
    setHospitalRequests((prev) => prev.map((r) => (r.id === id ? { ...r, hidden: true } : r)));

  const handleFulfill = (req) => {
    const have = inventory.find((i) => i.type === req.bloodType)?.units ?? 0;
    if (have < req.units) {
      alert(`Not enough ${req.bloodType} in stock (you have ${have}, they need ${req.units}).`);
      return;
    }
    adjustStock(req.bloodType, -req.units); // really removes the units
    hide(req.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleDeclineRequest = (id) => hide(id);

  const handleSaveStock = async () => {
    await refreshInventory();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <OrgSidebar>
      <div className="space-y-8">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Blood bank dashboard
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Changes are saved as you adjust the units.
            </p>
          </div>
          <button
            onClick={handleSaveStock}
            className="px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            Refresh stock
          </button>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Stock is up to date.</span>
          </div>
        )}

        {/* Low Stock Warning Banner (only when something is low) */}
        {lowTypes.length > 0 && (
          <div className="bg-[#FAF3F1] border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-[#B81D24] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-[#B81D24]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {lowTypes.join(', ')} {lowTypes.length > 1 ? 'are' : 'is'} below your low-stock threshold
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Declare a shortage to alert eligible donors near you.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/hospital#declare-form')}
              className="px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              Declare shortage
            </button>
          </div>
        )}

        {/* 2-Column Split: Stock by blood type (Left) & Hospital Requests / Regional Shortages (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Stock by Blood Type */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Stock by blood type</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Units available and the level that triggers a low-stock warning.
              </p>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Units available</th>
                      <th className="py-2.5 px-3">Low-stock at</th>
                      <th className="py-2.5 px-3">Level</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {inventory.map((item) => (
                      <tr key={item.type} className="hover:bg-stone-50/60">
                        <td className="py-3 px-3 font-bold text-[#B81D24] text-sm">{item.type}</td>
                        <td className="py-3 px-3">
                          <div className="inline-flex items-center gap-1.5 border border-stone-200 rounded-lg p-0.5 bg-white">
                            <button
                              type="button"
                              onClick={() => adjustStock(item.type, -1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-bold text-stone-900 text-xs">
                              {item.units}
                            </span>
                            <button
                              type="button"
                              onClick={() => adjustStock(item.type, 1)}
                              className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-stone-600">
                          <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200">
                            {item.lowThreshold}
                          </span>
                        </td>
                        <td className="py-3 px-3 w-28 sm:w-36">
                          <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                item.status === 'LOW'
                                  ? 'bg-[#B81D24]'
                                  : item.status === 'WATCH'
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${Math.min(100, (item.units / 20) * 100)}%` }}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <StatusPill status={item.status} size="xs" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Hospital Requests & Regional Shortages */}
          <div className="lg:col-span-5 space-y-6">
            {/* Hospital Requests Card */}
            <div
              id="requests"
              className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900">Hospital requests</h2>
                <span className="text-xs font-bold text-[#B81D24] bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                  {visibleRequests.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {visibleRequests.map((req) => (
                  <div
                    key={req.id}
                    className="border border-stone-200 rounded-xl p-4 bg-[#FAF9F8] space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 text-xs">{req.hospital}</span>
                      <StatusPill status={String(req.urgency).toUpperCase()} size="xs" />
                    </div>

                    <div className="text-xs text-stone-600">
                      <strong className="text-[#B81D24] font-bold text-sm">{req.bloodType}</strong>{' '}
                      {req.units} units
                      {req.distanceKm != null ? ` · ${req.distanceKm} km away` : ''}
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleFulfill(req)}
                        className="flex-1 py-1.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors"
                      >
                        Fulfill from stock
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(req.id)}
                        className="flex-1 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-medium border border-stone-300 transition-colors"
                      >
                        Can't fulfill
                      </button>
                    </div>
                  </div>
                ))}

                {visibleRequests.length === 0 && (
                  <div className="py-6 text-center text-xs text-stone-400">
                    No open requests right now.
                  </div>
                )}
              </div>
            </div>

            {/* Regional Shortages Card */}
            <div
              id="shortages"
              className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4"
            >
              <div>
                <h2 className="text-base font-bold text-stone-900">Regional shortages</h2>
                <p className="text-xs text-stone-500 mt-0.5">Organizations running low on stock</p>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Organization</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {shortages.slice(0, 6).map((s, i) => (
                      <tr key={i} className="hover:bg-stone-50/60">
                        <td className="py-2.5 px-3 font-medium text-stone-900">{s.hospital}</td>
                        <td className="py-2.5 px-3 font-bold text-[#B81D24]">{s.bloodType}</td>
                        <td className="py-2.5 px-3 text-right">
                          <StatusPill status="LOW" size="xs" />
                        </td>
                      </tr>
                    ))}
                    {shortages.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 px-3 text-center text-stone-400">
                          No shortages reported.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </OrgSidebar>
  );
};

export default BloodBankDashboardPage;