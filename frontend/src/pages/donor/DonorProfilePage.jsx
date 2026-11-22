import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../utils/compatibility';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';
import { api } from '../../lib/api';

// "10:00 PM" -> "22:00" (the backend stores 24-hour HH:MM)
const to24 = (t) => {
  const [time, ap] = t.split(' ');
  let [h, m] = time.split(':').map(Number);
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const apiError = (err) => {
  const d = err.response?.data;
  if (d?.errors?.length) return d.errors.map((x) => `${x.field}: ${x.message}`).join(', ');
  return d?.message || err.message || 'Something went wrong';
};

export const DonorProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const isReal = Boolean(currentUser?.id); // demo logins have no account on the server
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // Profile (name, phone, blood type are shown but not editable: the server doesn't store changes to them yet)
  const fullName = currentUser?.name || '';
  const phone = currentUser?.phone || '';
  const email = currentUser?.email || '';
  const bloodType = currentUser?.bloodType || '';
  const dob = currentUser?.dob || '';
  const [lastDonationDate, setLastDonationDate] = useState(
    currentUser?.lastDonationDate ? String(currentUser.lastDonationDate).slice(0, 10) : ''
  );

  // Alerts
  const [availableForAlerts, setAvailableForAlerts] = useState(
    currentUser?.availableForAlerts ?? true
  );
  const [alertRadius, setAlertRadius] = useState(currentUser?.alertRadius ?? 15);
  const [quietFrom, setQuietFrom] = useState(currentUser?.quietHours?.from || '10:00 PM');
  const [quietTo, setQuietTo] = useState(currentUser?.quietHours?.to || '7:00 AM');
  const [allowCriticalInQuiet, setAllowCriticalInQuiet] = useState(
    currentUser?.allowCriticalInQuietHours ?? true
  );
  const [smsAlerts, setSmsAlerts] = useState(currentUser?.smsAlerts ?? true);
  const [pushAlerts, setPushAlerts] = useState(currentUser?.pushAlerts ?? true);

  // Location
  const [shareLocation, setShareLocation] = useState(currentUser?.shareLocation ?? true);
  const [locationUpdatedText, setLocationUpdatedText] = useState('Not set yet');

  // Load the saved values from the server
  useEffect(() => {
    if (!isReal) return;
    api
      .get('/donors/me')
      .then(({ data }) => {
        const d = data.donor || {};
        if (d.lastDonationAt) setLastDonationDate(String(d.lastDonationAt).slice(0, 10));
        if (d.available !== undefined) setAvailableForAlerts(d.available);
        if (d.radiusKm) setAlertRadius(d.radiusKm);
        if (d.locationUpdatedAt) {
          setLocationUpdatedText(new Date(d.locationUpdatedAt).toLocaleString());
        }
      })
      .catch(() => {});
  }, [isReal]);

  const flashSaved = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (isReal) {
        await api.patch('/donors/me', {
          available: availableForAlerts,
          radiusKm: alertRadius,
          quietHours: { start: to24(quietFrom), end: to24(quietTo) },
          ...(lastDonationDate && { lastDonationAt: lastDonationDate }),
        });
      }
      updateProfile({
        lastDonationDate,
        availableForAlerts,
        alertRadius,
        quietHours: { from: quietFrom, to: quietTo },
        allowCriticalInQuietHours: allowCriticalInQuiet,
        smsAlerts,
        pushAlerts,
        shareLocation,
      });
      flashSaved();
    } catch (err) {
      setError(apiError(err));
    } finally {
      setSaving(false);
    }
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
          setLocationUpdatedText('Just now');
          flashSaved();
        } catch (err) {
          setError(apiError(err));
        }
      },
      () => setError('Allow location access in your browser to update your location.'),
      { timeout: 10000 }
    );
  };

  const initials =
    fullName
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Top Bar with Back Link */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/donor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-[#B81D24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Profile and settings
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 text-xs font-semibold">
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'location', label: 'Location' },
            { id: 'security', label: 'Security' },
            { id: 'privacy', label: 'Privacy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Changes saved.</span>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* SECTION 1: Profile */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Profile</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                How you appear to hospitals once you accept an alert.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#B81D24] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {initials}
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-stone-700">Mobile number</label>
                    {currentUser?.phoneVerified && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        VERIFIED
                      </span>
                    )}
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    placeholder="Not set"
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Blood type</label>
                  <select
                    value={bloodType}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-600 font-bold"
                  >
                    {!bloodType && <option value="">—</option>}
                    {BLOOD_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Changing this needs a quick re-check by an admin.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Last donation date
                  </label>
                  <input
                    type="date"
                    value={lastDonationDate}
                    onChange={(e) => setLastDonationDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    You won't be alerted for 56 days after a donation.
                  </span>
                </div>
              </div>

              {dob && (
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Date of birth</label>
                  <input
                    type="date"
                    value={dob}
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50 text-stone-600"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 2: Alerts */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Alerts</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Decide when and how far LifeLink can reach you.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-800">Available for alerts</div>
                  <div className="text-stone-500 text-[11px]">Turn off to pause everything.</div>
                </div>
                <input
                  type="checkbox"
                  checked={availableForAlerts}
                  onChange={(e) => setAvailableForAlerts(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between font-semibold text-stone-800">
                  <span>Alert radius:</span>
                  <span className="text-[#B81D24] font-bold">{alertRadius} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={alertRadius}
                  onChange={(e) => setAlertRadius(Number(e.target.value))}
                  className="w-full accent-[#B81D24] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Quiet hours from
                  </label>
                  <select
                    value={quietFrom}
                    onChange={(e) => setQuietFrom(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-xs bg-white"
                  >
                    <option value="9:00 PM">9:00 PM</option>
                    <option value="10:00 PM">10:00 PM</option>
                    <option value="11:00 PM">11:00 PM</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Quiet hours to
                  </label>
                  <select
                    value={quietTo}
                    onChange={(e) => setQuietTo(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-xs bg-white"
                  >
                    <option value="6:00 AM">6:00 AM</option>
                    <option value="7:00 AM">7:00 AM</option>
                    <option value="8:00 AM">8:00 AM</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-800">
                    Allow critical alerts in quiet hours
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Critical emergencies near you always get through.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowCriticalInQuiet}
                  onChange={(e) => setAllowCriticalInQuiet(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-800">SMS alerts</div>
                  <div className="text-stone-500 text-[11px]">
                    Get a text with a one-tap response link.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-semibold text-stone-800">In-app and push alerts</div>
                  <div className="text-stone-500 text-[11px]">
                    Instant alerts while the app is open or installed.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={pushAlerts}
                  onChange={(e) => setPushAlerts(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Location */}
        {activeTab === 'location' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Location</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Used only to match you with emergencies nearby.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-800">Share my location for matching</div>
                  <div className="text-stone-500 text-[11px]">
                    Turn off and we cannot alert you.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={shareLocation}
                  onChange={(e) => setShareLocation(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div>
                <InteractiveMapMock mode="area" height="h-52" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-stone-500">Last updated: {locationUpdatedText}</span>
                <button
                  type="button"
                  onClick={handleUpdateLocation}
                  className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold text-xs shadow-xs transition-colors"
                >
                  Update my location
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Security */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Security</h2>
              <p className="text-xs text-stone-500 mt-0.5">Keep your account safe.</p>
            </div>

            <div className="p-3.5 bg-stone-50 border border-stone-200 text-stone-600 text-xs rounded-xl">
              Changing your password from the app isn't available yet.
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Current password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">New password</label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    disabled
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-50"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled
                  className="px-6 py-2.5 rounded-lg bg-stone-300 text-white font-semibold text-xs cursor-not-allowed"
                >
                  Update password
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 5: Privacy and account */}
        {activeTab === 'privacy' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Privacy and account</h2>
              <p className="text-xs text-stone-500 mt-0.5">You are in control of your data.</p>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Download a copy of my data</div>
                  <div className="text-stone-500 text-[11px]">
                    Receive an archive of your profile, response logs, and donation history.
                  </div>
                </div>
                <button
                  onClick={() => alert('Data download initiated.')}
                  className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-800 font-semibold shadow-xs"
                >
                  Request download
                </button>
              </div>

              <div className="py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[#B81D24]">
                    Delete my account and all my data
                  </div>
                  <div className="text-stone-500 text-[11px]">This cannot be undone.</div>
                </div>
                <button
                  onClick={() => alert('Account deletion confirmation flow')}
                  className="px-4 py-2 rounded-lg border border-red-300 text-[#B81D24] hover:bg-red-50 font-semibold shadow-xs"
                >
                  Delete account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DonorProfilePage;