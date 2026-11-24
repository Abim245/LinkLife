import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import BloodBadge from '../../components/common/BloodBadge';
import StatusPill from '../../components/common/StatusPill';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';
import { useAuth } from '../../context/AuthContext';
import { useBloodData } from '../../context/BloodDataContext';
import { api } from '../../lib/api';

const COOLDOWN_DAYS = 56;

// "10:00 PM" -> "22:00" (the backend stores 24-hour HH:MM)
const to24 = (t) => {
  const [time, ap] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

export const DonorDashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { emergencies, respondToEmergency, donorHistory } = useBloodData();

  const donor = currentUser || {};
  const isReal = Boolean(donor.id); // demo logins have no account on the server

  const activeAlert = emergencies.find((e) => e.status === 'LIVE') || null;
  const myResponse = activeAlert?.myResponse || 'none';
  const distanceText =
    activeAlert?.distanceKm != null ? `${activeAlert.distanceKm} km away` : 'Nearby';

  const [availableForAlerts, setAvailableForAlerts] = useState(donor.availableForAlerts ?? true);
  const [radiusKm, setRadiusKm] = useState(donor.alertRadius ?? 15);
  const [quietFrom, setQuietFrom] = useState(donor.quietHours?.from || '10:00 PM');
  const [quietTo, setQuietTo] = useState(donor.quietHours?.to || '7:00 AM');
  const [allowCriticalQuiet, setAllowCriticalQuiet] = useState(
    donor.allowCriticalInQuietHours ?? true
  );
  const [smsAlerts, setSmsAlerts] = useState(donor.smsAlerts ?? true);
  const [locationUpdated, setLocationUpdated] = useState(false);
  const [error, setError] = useState('');

  // Eligibility from the last donation date (56-day cooldown)
  const lastDonation = donor.lastDonationDate ? new Date(donor.lastDonationDate) : null;
  const daysSince = lastDonation
    ? Math.floor((Date.now() - lastDonation.getTime()) / (24 * 60 * 60 * 1000))
    : null;
  const eligible = daysSince === null || daysSince >= COOLDOWN_DAYS;
  const nextEligible =
    lastDonation && !eligible
      ? new Date(lastDonation.getTime() + COOLDOWN_DAYS * 24 * 60 * 60 * 1000)
      : null;
  const cooldownPercent =
    daysSince === null ? 100 : Math.min(100, Math.round((daysSince / COOLDOWN_DAYS) * 100));

  // Donation stats: real accounts have no donation records yet, so show dashes
  const history = isReal ? [] : donorHistory.slice(0, 3);
  const totalDonations = isReal ? '—' : '8';
  const alertsAnswered = isReal ? '—' : '12';
  const lastDonationText = lastDonation
    ? lastDonation.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : '—';

  const saveSettings = (data) => {
    if (!isReal) return;
    setError('');
    api.patch('/donors/me', data).catch(() => setError('Could not save that setting.'));
  };

  const handleUpdateLocation = () => {
    setError('');
    if (!isReal) return setError('Log in with a real account to update your location.');
    if (!navigator.geolocation) return setError('Location is not available on this device.');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await api.put('/donors/me/location', {
            coordinates: [pos.coords.longitude, pos.coords.latitude], // [lng, lat]
          });
          setLocationUpdated(true);
          setTimeout(() => setLocationUpdated(false), 3000);
        } catch (err) {
          setError(err.response?.data?.message || 'Could not update your location.');
        }
      },
      () => setError('Allow location access in your browser to update your location.'),
      { timeout: 10000 }
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Donor Greeting & Blood Type Header */}
        <div className="flex flex-wrap items-center gap-4">
          <BloodBadge type={donor.bloodType || '—'} size="lg" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Hi, {donor.firstName || donor.name || 'there'}
              </h1>
              <StatusPill status={eligible ? 'ELIGIBLE TO DONATE' : 'PENDING'} size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Ready to save lives in your community.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Emergency Alert Card & Your Donations */}
          <div className="lg:col-span-7 space-y-6">
            {activeAlert ? (
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5 relative">
                {/* Emergency Near You Header */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B81D24] uppercase tracking-wide">
                    <span className="w-2 h-2 rounded-full bg-[#B81D24] animate-ping" />
                    <span>EMERGENCY NEAR YOU</span>
                  </div>
                  <span className="text-xs text-stone-500 font-medium">{activeAlert.declaredAt}</span>
                </div>

                {/* Blood Badge & Hospital Info */}
                <div className="flex items-start gap-4">
                  <BloodBadge type={activeAlert.bloodType} size="lg" />
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                      {activeAlert.hospitalName || 'A hospital'} needs {activeAlert.unitsNeeded} units
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      {distanceText} · needed by {activeAlert.neededBy}
                    </p>
                  </div>
                </div>

                {/* Map with Route to Hospital */}
                <InteractiveMapMock
                  mode="route"
                  hospitalName={activeAlert.hospitalName}
                  distanceText={distanceText}
                  height="h-52"
                />

                {/* Action Response */}
                {myResponse !== 'none' ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>
                        {myResponse === 'accepted'
                          ? `You confirmed! ETA: ${activeAlert.myEta || 'on the way'}. The hospital is expecting you.`
                          : 'Alert declined. Thank you for letting us know.'}
                      </span>
                    </div>
                    {myResponse === 'accepted' && (
                      <p className="text-xs text-emerald-700">
                        Head to the hospital's emergency entrance.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => navigate(`/alert/${activeAlert.id}`)}
                        className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors active:scale-95"
                      >
                        I can come
                      </button>
                      <button
                        onClick={() => respondToEmergency(activeAlert.id, 'DECLINED')}
                        className="w-full py-3 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-medium text-sm border border-stone-300 transition-colors"
                      >
                        Can't make it
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-500 text-center pt-1">
                      After you accept, you'll see where to go.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs text-sm text-stone-600">
                No active emergencies near you. We'll alert you when someone needs your blood type.
              </div>
            )}

            {/* Your Donations Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-stone-900">Your donations</h2>
                <Link
                  to="/donor/history"
                  className="text-xs font-semibold text-[#B81D24] hover:underline"
                >
                  View full history
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#FAF9F8] border border-stone-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-stone-900">{totalDonations}</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                    Total donations
                  </div>
                </div>
                <div className="bg-[#FAF9F8] border border-stone-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-stone-900">{alertsAnswered}</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                    Alerts answered
                  </div>
                </div>
                <div className="bg-[#FAF3F1] border border-red-100 rounded-xl p-3">
                  <div className="text-sm sm:text-base font-bold text-[#B81D24]">
                    {lastDonationText}
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 mt-0.5">Last donation</div>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Hospital</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-800">
                    {history.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 px-3 text-center text-stone-400">
                          No donations recorded yet.
                        </td>
                      </tr>
                    )}
                    {history.map((dh) => (
                      <tr key={dh.id} className="hover:bg-stone-50/60">
                        <td className="py-2.5 px-3 font-medium">{dh.where}</td>
                        <td className="py-2.5 px-3 font-bold text-[#B81D24]">{dh.bloodType}</td>
                        <td className="py-2.5 px-3 text-stone-500">{dh.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Availability, Eligibility, Alert Preferences */}
          <div className="lg:col-span-5 space-y-6">
            {/* Available for Alerts Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900">Available for alerts</h2>
                <p className="text-xs text-stone-500 mt-0.5">Turn off to pause all alerts.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={availableForAlerts}
                  onChange={(e) => {
                    setAvailableForAlerts(e.target.checked);
                    saveSettings({ available: e.target.checked });
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {/* Eligibility Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Eligibility</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  {eligible ? (
                    <>
                      You can donate <strong className="text-stone-900">now</strong>.
                    </>
                  ) : (
                    <>
                      You can donate again from{' '}
                      <strong className="text-stone-900">
                        {nextEligible.toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </strong>
                      .
                    </>
                  )}
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${eligible ? 'bg-emerald-600' : 'bg-amber-500'}`}
                    style={{ width: `${cooldownPercent}%` }}
                  />
                </div>
                <div
                  className={`text-[11px] font-semibold ${
                    eligible ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  {eligible
                    ? `${COOLDOWN_DAYS} day waiting period complete`
                    : `${daysSince} of ${COOLDOWN_DAYS} days since your last donation`}
                </div>
              </div>
            </div>

            {/* Alert Preferences Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-5 text-xs">
              <h2 className="text-base font-bold text-stone-900">Alert preferences</h2>

              {/* Radius Slider */}
              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>Alert radius:</span>
                  <span className="text-[#B81D24] font-bold">{radiusKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  onPointerUp={() => saveSettings({ radiusKm })}
                  className="w-full accent-[#B81D24] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <span>5 km</span>
                  <span>25 km</span>
                  <span>50 km</span>
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="font-semibold text-stone-800">Quiet hours</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-1">From</label>
                    <select
                      value={quietFrom}
                      onChange={(e) => {
                        setQuietFrom(e.target.value);
                        saveSettings({
                          quietHours: { start: to24(e.target.value), end: to24(quietTo) },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="9:00 PM">9:00 PM</option>
                      <option value="10:00 PM">10:00 PM</option>
                      <option value="11:00 PM">11:00 PM</option>
                      <option value="12:00 AM">12:00 AM</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] text-stone-500 block mb-1">To</label>
                    <select
                      value={quietTo}
                      onChange={(e) => {
                        setQuietTo(e.target.value);
                        saveSettings({
                          quietHours: { start: to24(quietFrom), end: to24(e.target.value) },
                        });
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="6:00 AM">6:00 AM</option>
                      <option value="7:00 AM">7:00 AM</option>
                      <option value="8:00 AM">8:00 AM</option>
                      <option value="9:00 AM">9:00 AM</option>
                    </select>
                  </div>
                </div>
                <p className="text-[11px] text-stone-500 pt-1 leading-snug">
                  Critical emergencies always get through during quiet hours.
                </p>
              </div>

              {/* Critical in Quiet Hours Toggle */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-800">
                  Allow critical alerts in quiet hours
                </span>
                <input
                  type="checkbox"
                  checked={allowCriticalQuiet}
                  onChange={(e) => setAllowCriticalQuiet(e.target.checked)}
                  className="h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              {/* SMS Alerts Toggle */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="font-semibold text-stone-800">SMS alerts</span>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              {/* Update Location Button */}
              <div className="pt-3 border-t border-stone-100">
                {locationUpdated && (
                  <div className="mb-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Location updated</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleUpdateLocation}
                  className="w-full py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 font-semibold text-xs border border-stone-300 transition-colors shadow-xs"
                >
                  Update my location
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorDashboardPage;