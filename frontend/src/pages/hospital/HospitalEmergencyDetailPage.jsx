import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BloodBadge from '../../components/common/BloodBadge';
import StatusPill from '../../components/common/StatusPill';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';
import { useBloodData } from '../../context/BloodDataContext';

export const HospitalEmergencyDetailPage = () => {
  const { id } = useParams();
  const { emergencies, updateEmergencyStatus, widenRadius } = useBloodData();

  const emergency = emergencies.find((e) => e.id === id) || emergencies[0];
  const [filterTab, setFilterTab] = useState('ALL');

  const filteredResponders = emergency.responders.filter((r) => {
    if (filterTab === 'ON_THE_WAY') return r.status === 'ON THE WAY';
    if (filterTab === 'AWAITING') return r.status === 'AWAITING REPLY';
    if (filterTab === 'DECLINED') return r.status === 'DECLINED';
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

          <div className="text-xs font-semibold text-stone-500">
            Emergency Ref: <span className="text-stone-800 font-mono">{emergency.id}</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Emergency Card (UI/UX Page 12 exact replica) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <BloodBadge type={emergency.bloodType} size="xl" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusPill status={emergency.status} />
                  <StatusPill status={emergency.urgency} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  {emergency.unitsNeeded} units needed
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 mt-1">
                  Declared {emergency.declaredAt} · needed by {emergency.neededBy}
                </p>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => updateEmergencyStatus(emergency.id, 'FULFILLED')}
                className="px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Mark fulfilled
              </button>
              <button
                onClick={() => updateEmergencyStatus(emergency.id, 'CLOSED')}
                className="px-5 py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors"
              >
                Close request
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-xs font-semibold text-stone-700">
              <span>
                {emergency.unitsConfirmed} of {emergency.unitsNeeded} donors confirmed
              </span>
              <span className="text-[#B81D24]">
                {Math.round((emergency.unitsConfirmed / emergency.unitsNeeded) * 100)}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#B81D24] rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min(
                    100,
                    (emergency.unitsConfirmed / emergency.unitsNeeded) * 100
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* 2-Column Split: Donor Responses (Left) & Search/Details/Activity (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Donor Responses (Page 12) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-stone-900">Donor responses</h2>
              {/* Filter Tabs */}
              <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs font-medium">
                <button
                  onClick={() => setFilterTab('ALL')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterTab === 'ALL' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  All [{emergency.responders.length}]
                </button>
                <button
                  onClick={() => setFilterTab('ON_THE_WAY')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterTab === 'ON_THE_WAY' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  On the way
                </button>
                <button
                  onClick={() => setFilterTab('AWAITING')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterTab === 'AWAITING' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  Awaiting
                </button>
                <button
                  onClick={() => setFilterTab('DECLINED')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    filterTab === 'DECLINED' ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  Declined
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">Donor</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredResponders.map((r, idx) => (
                    <tr key={r.id || idx} className="hover:bg-stone-50/60">
                      <td className="py-3 px-3 font-medium">{r.name}</td>
                      <td className="py-3 px-3 font-bold text-[#B81D24]">{r.bloodType}</td>
                      <td className="py-3 px-3">
                        <StatusPill status={r.status} size="xs" />
                      </td>
                      <td className="py-3 px-3 font-semibold text-stone-700">{r.eta}</td>
                    </tr>
                  ))}
                  {filteredResponders.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-stone-400">
                        No donors in this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Privacy Subtext */}
            <p className="text-xs text-stone-500 pt-1">
              Donor names are shown only after they accept. Contact details are released on arrival.
            </p>
          </div>

          {/* Right Column: Search Area + Request Details + Activity */}
          <div className="lg:col-span-5 space-y-6">
            {/* Search Area Card with 10km and 25km rings map */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900">Search area</h2>
              <InteractiveMapMock
                mode="rings"
                radiusKm={emergency.currentRadiusKm}
                outerRadiusKm={25}
                height="h-56"
              />
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-stone-700 font-medium">
                  Now <strong className="text-stone-900">{emergency.currentRadiusKm} km</strong> · widening in [{emergency.wideningIn}]
                </span>
                <button
                  onClick={() => widenRadius(emergency.id)}
                  className="px-3 py-1.5 rounded-md bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-xs transition-colors"
                >
                  Widen now
                </button>
              </div>
            </div>

            {/* Request Details Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-3">
              <h2 className="text-base font-bold text-stone-900">Request details</h2>
              <dl className="divide-y divide-stone-100 text-xs">
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Blood type</dt>
                  <dd className="font-bold text-[#B81D24]">{emergency.bloodType}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Units</dt>
                  <dd className="font-semibold text-stone-800">{emergency.unitsNeeded}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Urgency</dt>
                  <dd className="font-semibold text-stone-800">{emergency.urgency}</dd>
                </div>
                <div className="py-2 flex justify-between">
                  <dt className="text-stone-500 font-medium">Declared by</dt>
                  <dd className="font-semibold text-stone-800">{emergency.coordinatorName}</dd>
                </div>
                <div className="py-2">
                  <dt className="text-stone-500 font-medium mb-1">Notes</dt>
                  <dd className="text-stone-800 bg-[#FAF9F8] p-2.5 rounded-lg border border-stone-200 leading-relaxed">
                    {emergency.notes || 'Emergency entrance open 24/7.'}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Activity Stream Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-stone-900">Activity</h2>
              <ul className="space-y-3 text-xs">
                {emergency.activityLog.map((act, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        i === emergency.activityLog.length - 1 ? 'bg-[#B81D24]' : 'bg-emerald-500'
                      }`}
                    />
                    <div className="text-stone-700">
                      <span>{act.text}</span> · <span className="text-stone-400">{act.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalEmergencyDetailPage;
