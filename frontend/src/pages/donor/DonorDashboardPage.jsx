import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import BloodBadge from '../../components/common/BloodBadge';
import StatusPill from '../../components/common/StatusPill';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';
import { useAuth } from '../../context/AuthContext';
import { useBloodData } from '../../context/BloodDataContext';
import {api} from '../../lib/api';
export const DonorDashboardPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    emergencies,
    donorAlertResponse,
    respondToEmergency,
    donorHistory,
  } = useBloodData();

  const donor = currentUser || {};
  const activeAlert = emergencies.find((e) => e.status === 'LIVE') || null;
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
  const saveDonorSettings = (data) => {
  if (!donor.id) return; // demo users have no account
  api.patch('/donors/me', data).catch(() => {});
  };
  const handleUpdateLocation = () => {
  if (!navigator.geolocation) return alert('Location is not available on this device');
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        await api.put('/donors/me/location', {
          coordinates: [pos.coords.longitude, pos.coords.latitude], // [lng, lat]
        });
        setLocationUpdated(true);
        setTimeout(() => setLocationUpdated(false), 3000);
      } catch (err) {
        alert(err.response?.data?.message || 'Could not update your location');
      }
    },
    () => alert('Allow location access to update your location')
  );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Donor Greeting & Blood Type Header (UI/UX Page 8) */}
        <div className="flex flex-wrap items-center gap-4">
          <BloodBadge type={donor.bloodType || 'O−'} size="lg" />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                Hi, {donor.firstName || donor.name || 'Lucas'}
              </h1>
              <StatusPill status="ELIGIBLE TO DONATE" size="sm" />
            </div>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Ready to save lives in your community.
            </p>
          </div>
        </div>

        {/* 2-Column Responsive Layout (UI/UX Page 8) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Emergency Alert Card & Your Donations */}
          <div className="lg:col-span-7 space-y-6">
            {/* Active Emergency Alert Card (Page 8 exact replica) */}
            {activeAlert ? (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-5 relative">
              {/* Emergency Near You Header */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#B81D24] uppercase tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#B81D24] animate-ping" />
                  <span>EMERGENCY NEAR YOU</span>
                </div>
                <span className="text-xs text-stone-500 font-medium">3 min ago</span>
              </div>

              {/* Blood Badge & Hospital Info */}
              
              <div className="flex items-start gap-4">
                <BloodBadge type={activeAlert.bloodType} size="lg" />
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-stone-900">
                    {activeAlert.hospitalName} needs {activeAlert.unitsNeeded} units
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                    {activeAlert.distanceKm} km away · needed by 3:45 PM
                  </p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-stone-700">
                  <span>
                    {donorAlertResponse?.status === 'ACCEPTED'
                      ? '4 of 4 donors on the way'
                      : '3 of 4 donors on the way'}
                  </span>
                  <span className="text-[#B81D24]">
                    {donorAlertResponse?.status === 'ACCEPTED' ? '100%' : '75%'}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#B81D24] rounded-full transition-all duration-500"
                    style={{
                      width: donorAlertResponse?.status === 'ACCEPTED' ? '100%' : '75%',
                    }}
                  />
                </div>
              </div>

              {/* Map with Route to Hospital */}
              <InteractiveMapMock
                mode="route"
                hospitalName={activeAlert.hospitalName}
                distanceText={`${activeAlert.distanceKm} km away`}
                height="h-52"
              />

              {/* Action Response */}
              {donorAlertResponse ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {donorAlertResponse.status === 'ACCEPTED'
                        ? `You confirmed! ETA: ${donorAlertResponse.eta}. Hospital is expecting you.`
                        : 'Alert declined. Thank you for notifying us.'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Directions and check-in instructions have been sent via SMS.
                  </p>
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
                    After you accept, you'll see directions and the hospital's contact desk.
                  </p>
                </div>
              )}
            </div>
             ) : (
                <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs text-sm text-stone-600">
                  No active emergencies near you. We'll alert you when someone needs your blood type.
                </div>
              )}
            {/* Your Donations Card (Page 8) */}
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

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#FAF9F8] border border-stone-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-stone-900">8</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                    Total donations
                  </div>
                </div>
                <div className="bg-[#FAF9F8] border border-stone-200 rounded-xl p-3">
                  <div className="text-2xl font-extrabold text-stone-900">12</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-0.5">
                    Alerts answered
                  </div>
                </div>
                <div className="bg-[#FAF3F1] border border-red-100 rounded-xl p-3">
                  <div className="text-sm sm:text-base font-bold text-[#B81D24]">Aug 15</div>
                  <div className="text-[11px] font-medium text-stone-500 mt-0.5">Last donation</div>
                </div>
              </div>

              {/* Mini Table */}
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
                    {donorHistory.slice(0, 3).map((dh) => (
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

          {/* Right Column: Availability, Eligibility, Alert Preferences (Page 8) */}
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
                    saveDonorSettings({ available: e.target.checked });
                  }}                  
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:width-5 after:transition-all peer-checked:bg-emerald-600" />
              </label>
            </div>

            {/* Eligibility Card */}
            <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs space-y-4">
              <div>
                <h2 className="text-base font-bold text-stone-900">Eligibility</h2>
                <p className="text-xs text-stone-600 mt-0.5">
                  You can donate again from <strong className="text-stone-900">Today</strong>.
                </p>
              </div>
              <div className="space-y-1.5">
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-600 rounded-full w-full" />
                </div>
                <div className="text-[11px] font-semibold text-emerald-700">
                  56 day waiting period complete
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
                  className="w-full accent-[#B81D24] cursor-pointer"
                  onPointerUp={() => saveDonorSettings({ radiusKm })}
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
                      onChange={(e) => setQuietFrom(e.target.value)}
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
                      onChange={(e) => setQuietTo(e.target.value)}
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
                  Critical emergencies can still reach you during quiet hours if you allow it below.
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
