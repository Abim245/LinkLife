import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import OrgSidebar from '../../components/layout/OrgSidebar';
import BloodBadge from '../../components/common/BloodBadge';
import StatusPill from '../../components/common/StatusPill';
import { useBloodData } from '../../context/BloodDataContext';
import { BLOOD_TYPES } from '../../utils/compatibility';

export const HospitalDashboardPage = () => {
  const {
    emergencies,
    inventory,
    declareEmergency,
    updateEmergencyStatus,
    widenRadius,
  } = useBloodData();

  // Active emergency (e.g. emg-001)
  const activeEmergency = emergencies.find((e) => e.status === 'LIVE') || emergencies[0];

  // Quick Declare Emergency Form State
  const [formBloodType, setFormBloodType] = useState('O-');
  const [formUnits, setFormUnits] = useState('4');
  const [formNeededBy, setFormNeededBy] = useState('ASAP (under 45 min)');
  const [formUrgency, setFormUrgency] = useState('Critical');
  const [formNotes, setFormNotes] = useState('');
  const [alertSuccess, setAlertSuccess] = useState(false);

  const handleDeclareSubmit = (e) => {
    e.preventDefault();
    declareEmergency({
      bloodType: formBloodType,
      unitsNeeded: formUnits,
      neededBy: formNeededBy,
      urgency: formUrgency,
      notes: formNotes,
    });
    setAlertSuccess(true);
    setTimeout(() => setAlertSuccess(false), 4000);
  };

  return (
    <OrgSidebar>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-stone-600 mt-1">One emergency is active right now.</p>
          </div>
          <button
            onClick={() => {
              const el = document.getElementById('declare-form');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-sm font-semibold shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Declare emergency</span>
          </button>
        </div>

        {/* Top 2 Cards: Active Emergency (Left) and Declare Emergency (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Emergency Live Card (Page 7 left card) */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-6">
            {/* Live Pill and Time */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <StatusPill status="LIVE" />
              <span className="text-xs text-stone-500 font-medium">
                Declared {activeEmergency.declaredAt} · needed by {activeEmergency.neededBy}
              </span>
            </div>

            {/* Blood Type & Units */}
            <div className="flex items-start gap-4">
              <BloodBadge type={activeEmergency.bloodType} size="lg" />
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                  {activeEmergency.unitsNeeded} units needed
                </h2>
                <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                  {activeEmergency.donorsAlerted} donors alerted within {activeEmergency.currentRadiusKm} km
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-stone-700">
                <span>
                  {activeEmergency.unitsConfirmed} of {activeEmergency.unitsNeeded} donors confirmed
                </span>
                <span className="text-[#B81D24]">
                  {Math.round((activeEmergency.unitsConfirmed / activeEmergency.unitsNeeded) * 100)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B81D24] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      100,
                      (activeEmergency.unitsConfirmed / activeEmergency.unitsNeeded) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Donor Responder Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
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
                    {activeEmergency.responders.map((r, i) => (
                      <tr key={r.id || i} className="hover:bg-stone-50/60">
                        <td className="py-3 px-3 font-medium">{r.name}</td>
                        <td className="py-3 px-3 font-bold text-[#B81D24]">{r.bloodType}</td>
                        <td className="py-3 px-3">
                          <StatusPill status={r.status} size="xs" />
                        </td>
                        <td className="py-3 px-3 font-semibold text-stone-700">{r.eta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Escalation Bar Box */}
            <div className="bg-[#FAF3F1] border border-red-100 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="text-stone-700">
                Searching within <strong className="text-stone-900">{activeEmergency.currentRadiusKm} km</strong>. Widening to 25 km in{' '}
                <strong className="text-[#B81D24]">[{activeEmergency.wideningIn}]</strong>.
              </div>
              <button
                onClick={() => widenRadius(activeEmergency.id)}
                className="px-3.5 py-1.5 rounded-md bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-xs transition-colors shrink-0"
              >
                Widen now
              </button>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateEmergencyStatus(activeEmergency.id, 'FULFILLED')}
                  className="px-4 py-2 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  Mark fulfilled
                </button>
                <button
                  onClick={() => updateEmergencyStatus(activeEmergency.id, 'CLOSED')}
                  className="px-4 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold border border-stone-300 transition-colors"
                >
                  Close request
                </button>
              </div>

              <Link
                to={`/hospital/emergencies/${activeEmergency.id}`}
                className="text-xs font-semibold text-[#B81D24] hover:underline flex items-center gap-1"
              >
                <span>Full live radar view</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Quick Declare Emergency Form (Page 7 right card) */}
          <div
            id="declare-form"
            className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-stone-900">Declare emergency</h2>
              <p className="text-xs text-stone-500 mt-0.5">Matching donors are alerted instantly.</p>
            </div>

            {alertSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Emergency declared! Matching donors in range alerted.</span>
              </div>
            )}

            <form onSubmit={handleDeclareSubmit} className="space-y-4 text-xs">
              {/* Blood Type Grid (8 selectable pills) */}
              <div>
                <label className="block font-semibold text-stone-700 mb-2">
                  Blood type needed
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormBloodType(type)}
                      className={`py-2 text-center rounded-lg font-bold text-xs transition-all ${
                        formBloodType === type
                          ? 'bg-[#B81D24] text-white shadow-xs'
                          : 'bg-white border border-stone-300 text-stone-700 hover:border-stone-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Units & Needed By */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Units needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formUnits}
                    onChange={(e) => setFormUnits(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Needed by
                  </label>
                  <select
                    value={formNeededBy}
                    onChange={(e) => setFormNeededBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  >
                    <option value="ASAP (under 45 min)">ASAP (&lt; 45 min)</option>
                    <option value="Within 2 hours">Within 2 hours</option>
                    <option value="Today by 6:00 PM">Today by 6:00 PM</option>
                    <option value="Tomorrow morning">Tomorrow morning</option>
                  </select>
                </div>
              </div>

              {/* Urgency Selector */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Urgency</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Critical', 'Urgent', 'Standard'].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormUrgency(lvl)}
                      className={`py-2 rounded-lg font-semibold text-center transition-all ${
                        formUrgency === lvl
                          ? lvl === 'Critical'
                            ? 'bg-[#B81D24] text-white'
                            : lvl === 'Urgent'
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-white'
                          : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Notes for donors (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Use the emergency entrance"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
              </div>

              {/* Helper text */}
              <div className="text-[11px] text-stone-500">
                About 28 eligible donors within 10 km will be alerted.
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors active:scale-95"
              >
                Send alert now
              </button>
            </form>
          </div>
        </div>

        {/* Inventory Section (Page 7) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Inventory</h2>
              <p className="text-xs text-stone-500 mt-0.5">Current blood supply levels</p>
            </div>
            <Link
              to="/hospital/inventory"
              className="text-xs font-semibold text-[#B81D24] hover:underline"
            >
              Update stock
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {inventory.map((item) => (
              <div
                key={item.type}
                className="border border-stone-200 rounded-xl p-4 bg-[#FAFAF9] flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-[#B81D24]">{item.type}</span>
                  <StatusPill status={item.status} size="xs" />
                </div>
                <div className="text-xs font-semibold text-stone-600 mb-2">
                  {item.units < 10 ? `0${item.units}` : item.units} units
                </div>
                {/* Level indicator bar */}
                <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
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
              </div>
            ))}
          </div>
        </div>

        {/* Recent Requests Section (Page 7) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Recent requests</h2>
              <p className="text-xs text-stone-500 mt-0.5">Emergency declarations log</p>
            </div>
            <Link
              to="/hospital/emergencies"
              className="text-xs font-semibold text-[#B81D24] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-4">Blood type</th>
                    <th className="py-2.5 px-4">Units</th>
                    <th className="py-2.5 px-4">Urgency</th>
                    <th className="py-2.5 px-4">Status</th>
                    <th className="py-2.5 px-4">Donors confirmed</th>
                    <th className="py-2.5 px-4">Declared</th>
                    <th className="py-2.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {emergencies.slice(0, 4).map((e) => (
                    <tr key={e.id} className="hover:bg-stone-50/60">
                      <td className="py-3 px-4 font-bold text-[#B81D24] text-sm">{e.bloodType}</td>
                      <td className="py-3 px-4">{e.unitsNeeded}</td>
                      <td className="py-3 px-4">{e.urgency}</td>
                      <td className="py-3 px-4">
                        <StatusPill status={e.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {e.unitsConfirmed} of {e.unitsNeeded}
                      </td>
                      <td className="py-3 px-4 text-stone-500">{e.declaredAt}</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/hospital/emergencies/${e.id}`}
                          className="font-semibold text-[#B81D24] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </OrgSidebar>
  );
};

export default HospitalDashboardPage;
