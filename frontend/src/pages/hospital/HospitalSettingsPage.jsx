import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, BadgeCheck } from 'lucide-react';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';
import { useAuth } from '../../context/AuthContext';

export const HospitalSettingsPage = () => {
  const { currentUser, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('organization');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Profile Form
  const [hospitalName, setHospitalName] = useState(
    currentUser?.orgName || 'St. Jude Emergency Hospital'
  );
  const [phone247, setPhone247] = useState(currentUser?.phone || '+1 (555) 019-2834');
  const [address, setAddress] = useState(
    currentUser?.address || '450 1st Avenue, Manhattan, NY'
  );

  // Team list
  const [team, setTeam] = useState([
    { name: 'Dr. Sarah Vance', email: 's.vance@stjude.org', role: 'OWNER' },
    { name: 'Dr. Michael Cho', email: 'm.cho@stjude.org', role: 'COORDINATOR' },
    { name: 'Nurse Clara Dixon', email: 'c.dixon@stjude.org', role: 'COORDINATOR' },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');

  // Emergency Defaults
  const [defaultUrgency, setDefaultUrgency] = useState('Critical');
  const [firstRadius, setFirstRadius] = useState(10);
  const [widenAfter, setWidenAfter] = useState(5);
  const [largestRadius, setLargestRadius] = useState(50);
  const [alertSMS, setAlertSMS] = useState(true);

  // Notification Toggles
  const [notifyDonorAccept, setNotifyDonorAccept] = useState(true);
  const [notifyFulfilled, setNotifyFulfilled] = useState(true);
  const [notifyStock, setNotifyStock] = useState(true);
  const [notifyAdmin, setNotifyAdmin] = useState(true);

  // Security
  const [twoStep, setTwoStep] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile({
      orgName: hospitalName,
      phone: phone247,
      address,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeam([...team, { name: 'Invited Member', email: inviteEmail, role: 'COORDINATOR' }]);
    setInviteEmail('');
  };

  const handleRemoveMember = (idx) => {
    setTeam(team.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Top Bar with Back Link */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to={currentUser?.role === 'bloodbank' ? '/bloodbank' : '/hospital'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-[#B81D24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Title (UI/UX Page 19) */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Organization settings
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Same page for hospitals and blood banks. Blood banks swap Emergency defaults for stock
            thresholds.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3 text-xs font-semibold">
          {[
            { id: 'organization', label: 'Organization' },
            { id: 'team', label: 'Team' },
            { id: 'defaults', label: 'Defaults' },
            { id: 'notifications', label: 'Notifications' },
            { id: 'security', label: 'Security' },
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
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* TAB 1: Organization Profile */}
        {(activeTab === 'organization' || activeTab === 'all') && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-stone-900">Organization profile</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Shown to donors when you declare an emergency.
                </p>
              </div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                VERIFIED
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Hospital name</label>
                <input
                  type="text"
                  value={hospitalName}
                  onChange={(e) => setHospitalName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Changing the name needs admin re-verification.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Registration number
                  </label>
                  <input
                    type="text"
                    disabled
                    value={currentUser?.registrationNumber || 'HOSP-NY-84920'}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-200 text-xs bg-stone-100 text-stone-500 cursor-not-allowed"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Locked after verification.
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    24/7 phone number
                  </label>
                  <input
                    type="tel"
                    value={phone247}
                    onChange={(e) => setPhone247(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Street address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Pinned entrance location
                </label>
                <InteractiveMapMock mode="pin" editable={true} height="h-48" />
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

        {/* TAB 2: Team */}
        {activeTab === 'team' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Team</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                People who can declare emergencies for this organization.
              </p>
            </div>

            <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden text-xs">
              {team.map((member, i) => (
                <div key={i} className="p-3.5 flex items-center justify-between hover:bg-stone-50">
                  <div>
                    <span className="font-semibold text-stone-800">{member.name}</span> ·{' '}
                    <span className="text-stone-500">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-100 text-stone-700">
                      {member.role}
                    </span>
                    {member.role !== 'OWNER' && (
                      <button
                        onClick={() => handleRemoveMember(i)}
                        className="text-xs font-semibold text-[#B81D24] hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleInvite} className="pt-2 space-y-2">
              <label className="block text-xs font-semibold text-stone-700">Invite by email</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="name@hospital.org"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-stone-900 hover:bg-black text-white text-xs font-semibold shadow-xs"
                >
                  Send invite
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: Emergency Defaults (Page 19 & 20) */}
        {activeTab === 'defaults' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Emergency defaults</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Pre-fill new requests so you can send faster.
              </p>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Default urgency
                  </label>
                  <select
                    value={defaultUrgency}
                    onChange={(e) => setDefaultUrgency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    First alert radius (km)
                  </label>
                  <input
                    type="number"
                    value={firstRadius}
                    onChange={(e) => setFirstRadius(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Widen radius after (minutes)
                  </label>
                  <input
                    type="number"
                    value={widenAfter}
                    onChange={(e) => setWidenAfter(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">
                    Largest radius (km)
                  </label>
                  <input
                    type="number"
                    value={largestRadius}
                    onChange={(e) => setLargestRadius(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Also alert by SMS</div>
                  <div className="text-stone-500 text-[11px]">
                    Reach donors who are not in the app.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={alertSMS}
                  onChange={(e) => setAlertSMS(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
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

        {/* TAB 4: Notifications (Page 20) */}
        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Notifications</h2>
              <p className="text-xs text-stone-500 mt-0.5">Tell us how to reach your team.</p>
            </div>

            <div className="space-y-4 text-xs divide-y divide-stone-100">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">A donor accepts a request</div>
                  <div className="text-stone-500 text-[11px]">Email and in-app</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDonorAccept}
                  onChange={(e) => setNotifyDonorAccept(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">A request is fulfilled or expires</div>
                  <div className="text-stone-500 text-[11px]">Email</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyFulfilled}
                  onChange={(e) => setNotifyFulfilled(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Stock falls below a threshold</div>
                  <div className="text-stone-500 text-[11px]">Email and SMS</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyStock}
                  onChange={(e) => setNotifyStock(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-stone-800">Admin messages about verification</div>
                  <div className="text-stone-500 text-[11px]">Email</div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyAdmin}
                  onChange={(e) => setNotifyAdmin(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>
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
        )}

        {/* TAB 5: Security (Page 20) */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200/80 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-stone-900">Security</h2>
              <p className="text-xs text-stone-500 mt-0.5">Manage authentication and password.</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-stone-100">
                <div>
                  <div className="font-semibold text-stone-800">Two-step verification</div>
                  <div className="text-stone-500 text-[11px]">
                    Ask for an SMS code when logging in.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={twoStep}
                  onChange={(e) => setTwoStep(e.target.checked)}
                  className="h-5 w-5 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
              </div>

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

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors"
                >
                  Update password
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HospitalSettingsPage;
