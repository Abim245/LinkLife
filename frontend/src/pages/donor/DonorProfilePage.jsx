import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../utils/compatibility';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';

export const DonorProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form States
  const [fullName, setFullName] = useState(currentUser?.name || 'Lucas Miller');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (555) 234-5678');
  const [email, setEmail] = useState(currentUser?.email || 'lucas.miller@example.com');
  const [bloodType, setBloodType] = useState(currentUser?.bloodType || 'O-');
  const [lastDonationDate, setLastDonationDate] = useState(
    currentUser?.lastDonationDate || '2026-08-15'
  );
  const [dob, setDob] = useState(currentUser?.dob || '1996-05-14');

  // Alerts Form States
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

  // Location Form States
  const [shareLocation, setShareLocation] = useState(currentUser?.shareLocation ?? true);
  const [locationUpdatedText, setLocationUpdatedText] = useState('2 hours ago');

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = (e) => {
    e?.preventDefault();
    updateProfile({
      name: fullName,
      phone,
      email,
      bloodType,
      lastDonationDate,
      dob,
      availableForAlerts,
      alertRadius,
      quietHours: { from: quietFrom, to: quietTo },
      allowCriticalInQuietHours: allowCriticalInQuiet,
      smsAlerts,
      pushAlerts,
      shareLocation,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleUpdateLocation = () => {
    setLocationUpdatedText('Just now');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Top Bar with Back Link (UI/UX Page 17) */}
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

        {/* Filter Navigation Tabs (UI/UX Page 17) */}
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
            <span>Changes saved successfully!</span>
          </div>
        )}

        {/* SECTION 1: Profile (Page 17) */}
        {(activeTab === 'profile' || activeTab === 'all') && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Profile</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                How you appear to hospitals once you accept an alert.
              </p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#B81D24] text-white flex items-center justify-center font-bold text-xl shadow-xs">
                {fullName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'LM'}
              </div>
              <button
                type="button"
                onClick={() => alert('Photo upload dialog')}
                className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
              >
                Change photo
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-semibold text-stone-700">Mobile number</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        VERIFIED
                      </span>
                      <button
                        type="button"
                        onClick={() => alert('Change number modal')}
                        className="text-[11px] font-semibold text-[#B81D24] hover:underline"
                      >
                        Change number
                      </button>
                    </div>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Email (optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Blood type</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white font-bold"
                  >
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
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Date of birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Save changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 2: Alerts (Page 17) */}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Alerts</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Decide when and how far LifeLink can reach you.
              </p>
            </div>

            <div className="space-y-5 text-xs">
              {/* Available for alerts toggle */}
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

              {/* Alert Radius */}
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

              {/* Quiet hours */}
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

              {/* Allow critical alerts toggle */}
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-800">
                    Allow critical alerts in quiet hours
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    Only for critical emergencies near you.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={allowCriticalInQuiet}
                  onChange={(e) => setAllowCriticalInQuiet(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              {/* SMS alerts */}
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

              {/* In-app and push alerts */}
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
                  className="px-6 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Save changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Location (Page 18) */}
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
                <span className="text-stone-500">Last updated [{locationUpdatedText}]</span>
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

        {/* SECTION 4: Security (Page 18) */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Security</h2>
              <p className="text-xs text-stone-500 mt-0.5">Keep your account safe.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Current password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">New password</label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Update password
                </button>
                <button
                  type="button"
                  onClick={() => alert('Logged out of all active devices.')}
                  className="px-5 py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-semibold text-xs border border-stone-300 transition-colors"
                >
                  Log out of all devices
                </button>
              </div>
            </form>
          </div>
        )}

        {/* SECTION 5: Privacy and account (Page 18) */}
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
