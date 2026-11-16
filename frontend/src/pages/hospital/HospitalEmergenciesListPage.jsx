import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import StatusPill from '../../components/common/StatusPill';
import { useBloodData } from '../../context/BloodDataContext';
import { BLOOD_TYPES } from '../../utils/compatibility';

export const HospitalEmergenciesListPage = () => {
  const { emergencies } = useBloodData();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('ALL');

  const filteredEmergencies = emergencies.filter((e) => {
    if (statusFilter !== 'ALL' && e.status !== statusFilter) return false;
    if (bloodTypeFilter !== 'ALL' && e.bloodType !== bloodTypeFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Top Bar with Back Link */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/hospital"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-[#B81D24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title and Declare Button (UI/UX Page 13) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Emergencies
            </h1>
            <p className="text-sm text-stone-600 mt-1">
              Every request your hospital has declared.
            </p>
          </div>
          <Link
            to="/hospital#declare-form"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Declare emergency</span>
          </Link>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-stone-200/80 shadow-xs">
          {/* Status Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'LIVE', 'FULFILLED', 'CLOSED', 'EXPIRED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {/* Blood Type Dropdown */}
          <select
            value={bloodTypeFilter}
            onChange={(e) => setBloodTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-stone-300 text-xs font-medium text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#B81D24]"
          >
            <option value="ALL">All blood types</option>
            {BLOOD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Emergencies Table */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Donors confirmed</th>
                  <th className="py-3 px-4">Declared</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredEmergencies.map((e) => (
                  <tr key={e.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#B81D24] text-sm">{e.bloodType}</td>
                    <td className="py-3.5 px-4 font-semibold">{e.unitsNeeded}</td>
                    <td className="py-3.5 px-4 font-medium">{e.urgency}</td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={e.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      {e.unitsConfirmed} of {e.unitsNeeded}
                    </td>
                    <td className="py-3.5 px-4 text-stone-500">{e.declaredAt}</td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to={`/hospital/emergencies/${e.id}`}
                        className="font-bold text-[#B81D24] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
                {filteredEmergencies.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-stone-400">
                      No emergencies match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-stone-200 bg-[#FAF9F8] flex items-center justify-between text-xs text-stone-600">
            <span>Showing [1–{filteredEmergencies.length}] of [{filteredEmergencies.length}]</span>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-stone-400 cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-stone-400 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalEmergenciesListPage;
