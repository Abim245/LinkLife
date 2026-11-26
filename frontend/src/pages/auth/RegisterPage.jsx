import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet, Building2, Boxes } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../utils/compatibility';
import { normalizePhone } from '../../lib/format';
import InteractiveMapMock from '../../components/common/InteractiveMapMock';

// Browser location as [longitude, latitude]
const getPosition = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Location is not available on this device'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve([pos.coords.longitude, pos.coords.latitude]),
      () => reject(new Error('Allow location access so we can place your organization on the map')),
      { timeout: 10000 }
    );
  });

const apiError = (err) => {
  const d = err.response?.data;
  if (d?.errors?.length) return d.errors.map((x) => `${x.field}: ${x.message}`).join(', ');
  return d?.message || err.message || 'Something went wrong';
};

const inputClass =
  'w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B81D24] focus:border-transparent bg-white';

export const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { registerWithApi } = useAuth();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleParam = searchParams.get('role');
  const [selectedRole, setSelectedRole] = useState(
    roleParam && ['donor', 'hospital', 'bloodbank'].includes(roleParam) ? roleParam : 'donor'
  );

  // Form state for donor
  const [donorForm, setDonorForm] = useState({
    fullName: '',
    phone: '',
    bloodType: 'O-',
    password: '',
    consentLocation: true,
    consentSMS: true,
    agreeTerms: true,
  });

  // Form state for organization
  const [orgForm, setOrgForm] = useState({
    orgName: '',
    licenseNumber: '',
    address: '',
    contactName: '',
    jobTitle: '',
    officialEmail: '',
    phone247: '',
    password: '',
    isAuthorized: true,
    agreeTerms: true,
  });

  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const phone = normalizePhone(donorForm.phone);

      // Location is optional for donors: they can set it later from the dashboard
      let location;
      if (donorForm.consentLocation) {
        try {
          location = { coordinates: await getPosition() };
        } catch {
          /* continue without it */
        }
      }

      await registerWithApi({
        role: 'donor',
        name: donorForm.fullName,
        phone,
        password: donorForm.password,
        bloodType: donorForm.bloodType,
        ...(location && { location }),
      });
      navigate(`/verify-phone?phone=${encodeURIComponent(phone)}&role=donor`);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOrgSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const phone = normalizePhone(orgForm.phone247);
      const coordinates = await getPosition(); // required: donors are searched around this point

      await registerWithApi({
        role: selectedRole,
        name: orgForm.contactName,
        phone,
        password: orgForm.password,
        orgName: orgForm.orgName,
        address: orgForm.address,
        location: { coordinates },
        registrationNumber: orgForm.licenseNumber,
        jobTitle: orgForm.jobTitle,
        email: orgForm.officialEmail,
      });
      navigate(`/verify-phone?phone=${encodeURIComponent(phone)}&role=${selectedRole}`);
    } catch (err) {
      setError(apiError(err));
    } finally {
      setLoading(false);
    }
  };

  const roleCard = (role, Icon, title, text) => (
    <button
      type="button"
      onClick={() => setSelectedRole(role)}
      className={`p-4 rounded-xl border text-left transition-all relative ${
        selectedRole === role
          ? 'border-[#B81D24] bg-red-50/40 ring-1 ring-[#B81D24]'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className={`w-5 h-5 ${selectedRole === role ? 'text-[#B81D24]' : 'text-stone-400'}`} />
        <div
          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
            selectedRole === role ? 'border-[#B81D24] bg-[#B81D24]' : 'border-stone-300'
          }`}
        >
          {selectedRole === role && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </div>
      <div className="font-bold text-sm text-stone-900">{title}</div>
      <div className="text-xs text-stone-500 mt-0.5 leading-snug">{text}</div>
    </button>
  );

  const errorBox = error && (
    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F8]">
      {/* Left Maroon Hero Panel */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#6B0E23] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between shrink-0">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 mb-12 sm:mb-16">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B0E23]">
              <Droplet className="w-4 h-4 fill-[#6B0E23]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LifeLink</span>
          </Link>

          {selectedRole === 'donor' ? (
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                One account. The dashboard built for your role.
              </h1>
              <p className="text-base text-red-100 max-w-sm">
                Pick how you'll use LifeLink and we'll take you straight to the right place after you
                sign in.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                Register your hospital. Reach donors in seconds.
              </h1>
              <p className="text-base text-red-100 max-w-sm">
                Tell us about your organization. An admin verifies it before you can declare
                emergencies.
              </p>
            </div>
          )}
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-xs text-red-100 leading-relaxed">
          {selectedRole === 'donor'
            ? 'Hospitals and blood banks are reviewed by an admin before they can declare emergencies. This keeps every alert trustworthy.'
            : 'Your location is what lets us find donors within range, so register from the place your emergency entrance is.'}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-16 overflow-y-auto">
        <div className="max-w-xl mx-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-[#B81D24] mb-1">
            STEP 1 OF 2
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-6">
            {selectedRole === 'donor' ? 'Create your account' : 'Create your organization account'}
          </h2>

          {/* Role Selector Cards */}
          <div className="mb-8">
            <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-2.5">
              I am signing up as
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {roleCard('donor', Droplet, 'Donor', 'Get alerts and donate nearby')}
              {roleCard('hospital', Building2, 'Hospital', 'Declare shortages and track donors')}
              {roleCard('bloodbank', Boxes, 'Blood bank', 'Manage stock and respond to requests')}
            </div>
          </div>

          {selectedRole === 'donor' ? (
            /* DONOR SIGN UP FORM */
            <form onSubmit={handleDonorSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={donorForm.fullName}
                  onChange={(e) => setDonorForm({ ...donorForm, fullName: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+2348012345678"
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className={inputClass}
                  />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Include your country code. We'll text you a verification code.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Blood type
                  </label>
                  <select
                    value={donorForm.bloodType}
                    onChange={(e) => setDonorForm({ ...donorForm, bloodType: e.target.value })}
                    className={inputClass}
                  >
                    {BLOOD_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    Only shown to hospitals once you accept.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="At least 6 characters"
                  value={donorForm.password}
                  onChange={(e) => setDonorForm({ ...donorForm, password: e.target.value })}
                  className={inputClass}
                />
              </div>

              <div className="space-y-3 pt-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donorForm.consentLocation}
                    onChange={(e) =>
                      setDonorForm({ ...donorForm, consentLocation: e.target.checked })
                    }
                    className="mt-0.5 h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                  />
                  <span className="text-xs text-stone-600">
                    Allow LifeLink to use my location to match me with nearby emergencies.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={donorForm.consentSMS}
                    onChange={(e) => setDonorForm({ ...donorForm, consentSMS: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                  />
                  <span className="text-xs text-stone-600">
                    Send me emergency alerts by SMS. I can opt out at any time.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={donorForm.agreeTerms}
                    onChange={(e) => setDonorForm({ ...donorForm, agreeTerms: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                  />
                  <span className="text-xs text-stone-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#B81D24] underline">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[#B81D24] underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <div className="pt-4 space-y-3">
                {errorBox}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60"
                >
                  {loading ? 'Creating account...' : 'Continue'}
                </button>
              </div>
            </form>
          ) : (
            /* ORGANIZATION (HOSPITAL / BLOOD BANK) SIGN UP FORM */
            <form onSubmit={handleOrgSubmit} className="space-y-6">
              {/* ORGANIZATION */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  ORGANIZATION
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {selectedRole === 'hospital' ? 'Hospital name' : 'Blood bank name'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      selectedRole === 'hospital' ? 'Your hospital name' : 'Your blood bank name'
                    }
                    value={orgForm.orgName}
                    onChange={(e) => setOrgForm({ ...orgForm, orgName: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    License or registration number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HOSP-12345"
                    value={orgForm.licenseNumber}
                    onChange={(e) => setOrgForm({ ...orgForm, licenseNumber: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    License document
                  </label>
                  <div className="border border-stone-300 rounded-lg p-3 bg-white flex items-center justify-between text-xs text-stone-600">
                    <input
                      type="file"
                      className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-700 hover:file:bg-stone-200"
                    />
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    PDF or image, up to 10 MB. Used only for verification.
                  </span>
                </div>
              </div>

              {/* LOCATION */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  LOCATION
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Street address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Street, city, state"
                    value={orgForm.address}
                    onChange={(e) => setOrgForm({ ...orgForm, address: e.target.value })}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Your position
                  </label>
                  <InteractiveMapMock mode="pin" editable={true} height="h-44" />
                  <span className="text-[11px] text-stone-500 mt-1 block">
                    We use your browser's location when you submit, so register from your site and
                    allow location access.
                  </span>
                </div>
              </div>

              {/* CONTACT PERSON */}
              <div className="space-y-4 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  CONTACT PERSON
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Full name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contact person"
                      value={orgForm.contactName}
                      onChange={(e) => setOrgForm({ ...orgForm, contactName: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Job title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Emergency Coordinator"
                      value={orgForm.jobTitle}
                      onChange={(e) => setOrgForm({ ...orgForm, jobTitle: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Official email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.org"
                      value={orgForm.officialEmail}
                      onChange={(e) => setOrgForm({ ...orgForm, officialEmail: e.target.value })}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      24/7 phone number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+2348012345678"
                      value={orgForm.phone247}
                      onChange={(e) => setOrgForm({ ...orgForm, phone247: e.target.value })}
                      className={inputClass}
                    />
                    <span className="text-[11px] text-stone-500 mt-1 block">
                      Include your country code. We'll text a verification code.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="At least 6 characters"
                    value={orgForm.password}
                    onChange={(e) => setOrgForm({ ...orgForm, password: e.target.value })}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={orgForm.isAuthorized}
                    onChange={(e) => setOrgForm({ ...orgForm, isAuthorized: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                  />
                  <span className="text-xs text-stone-600">
                    I confirm I am authorized to declare blood emergencies on behalf of this
                    organization.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={orgForm.agreeTerms}
                    onChange={(e) => setOrgForm({ ...orgForm, agreeTerms: e.target.checked })}
                    className="mt-0.5 h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                  />
                  <span className="text-xs text-stone-600">
                    I agree to the{' '}
                    <Link to="/terms" className="text-[#B81D24] underline">
                      Terms
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-[#B81D24] underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
              </div>

              <div className="pt-2 space-y-3">
                {errorBox}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors disabled:opacity-60"
                >
                  {loading ? 'Submitting...' : 'Submit for review'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center mt-8 text-xs text-stone-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#B81D24] hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;