import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  Activity,
  ArrowRight,
  MapPin,
  CheckCircle2,
} from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BloodBadge from '../components/common/BloodBadge';
import { COMPATIBILITY_MAP, BLOOD_TYPES } from '../utils/compatibility';

export const LandingPage = () => {
  const [heroAlertStatus, setHeroAlertStatus] = useState(null);
  const [city] = useState('New York');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F8]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Live Alerts in City Pill */}
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200/80 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#B81D24]">
                <span className="w-2 h-2 rounded-full bg-[#B81D24] animate-ping" />
                <span>Live alerts in {city.toUpperCase()}</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-950 tracking-tight leading-[1.08]">
                When a hospital <br className="hidden sm:inline" />
                runs short, the right <br className="hidden sm:inline" />
                donors hear first.
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-stone-600 max-w-xl leading-relaxed">
                LifeLink alerts compatible, eligible donors near a hospital within seconds, and shows
                the hospital exactly who is on the way.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <Link
                  to="/register?role=donor"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-base shadow-sm transition-all active:scale-95"
                >
                  <span>Become a donor</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register?role=hospital"
                  className="inline-flex justify-center items-center gap-2 px-6 py-3.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-base shadow-xs transition-colors"
                >
                  <span>I'm a hospital or blood bank</span>
                </Link>
              </div>

              {/* Trust Badges */}
              <p className="text-xs text-stone-500 pt-2 tracking-wide flex flex-wrap items-center gap-x-2 gap-y-1">
                <span>Verified hospitals only</span>
                <span>·</span>
                <span>Your location is used only for matching</span>
                <span>·</span>
                <span>Opt out any time</span>
              </p>
            </div>

            {/* Right Interactive Mockup Card (UI/UX Page 1 exact replica) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xl border border-stone-200/80 relative">
                {/* Emergency Tag & Timestamp */}
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-[#B81D24] text-xs font-bold tracking-wide uppercase border border-red-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#B81D24] animate-pulse" />
                    EMERGENCY · CRITICAL
                  </div>
                  <span className="text-xs text-stone-500 font-medium">Just now</span>
                </div>

                {/* Blood Type & Need Details */}
                <div className="flex items-start gap-4 mb-5">
                  <BloodBadge type="O−" size="lg" />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-stone-900 leading-snug">
                      St. Jude Hospital needs 4 units
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
                      2.4 km away · needed by 3:45 PM
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 mb-6">
                  <div className="flex justify-between text-xs font-semibold text-stone-700">
                    <span>{heroAlertStatus === 'ACCEPTED' ? '4 of 4 donors on the way' : '3 of 4 donors on the way'}</span>
                    <span className="text-[#B81D24]">{heroAlertStatus === 'ACCEPTED' ? '100%' : '75%'}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#B81D24] rounded-full transition-all duration-500"
                      style={{ width: heroAlertStatus === 'ACCEPTED' ? '100%' : '75%' }}
                    />
                  </div>
                </div>

                {/* Response Buttons */}
                {heroAlertStatus ? (
                  <div className="p-3 bg-stone-50 rounded-lg text-center border border-stone-200">
                    <p className="text-xs font-semibold text-stone-800">
                      {heroAlertStatus === 'ACCEPTED'
                        ? '✓ You confirmed attendance! Hospital has been notified.'
                        : 'Alert acknowledged. Thank you!'}
                    </p>
                    <button
                      onClick={() => setHeroAlertStatus(null)}
                      className="text-[11px] text-[#B81D24] hover:underline mt-1 font-medium"
                    >
                      Reset demo
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setHeroAlertStatus('ACCEPTED')}
                      className="w-full py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-sm font-semibold transition-colors shadow-xs active:scale-95"
                    >
                      I can come
                    </button>
                    <button
                      onClick={() => setHeroAlertStatus('DECLINED')}
                      className="w-full py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-700 text-sm font-medium border border-stone-300 transition-colors"
                    >
                      Can't make it
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Wine Stats Band (UI/UX Page 1 exact replica) */}
      <section className="bg-[#1F060E] text-white py-12 border-y border-red-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-red-950/60">
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                14,280+
              </div>
              <div className="text-xs sm:text-sm font-medium text-stone-400 mt-1">
                registered donors
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                184
              </div>
              <div className="text-xs sm:text-sm font-medium text-stone-400 mt-1">
                verified hospitals and blood banks
              </div>
            </div>
            <div className="pt-4 md:pt-0">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                18s
              </div>
              <div className="text-xs sm:text-sm font-medium text-stone-400 mt-1">
                median time to first alert
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section (UI/UX Page 1) */}
      <section id="how-it-works" className="py-20 bg-[#FAF9F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-extrabold text-stone-950 tracking-tight">How it works</h2>
            <p className="text-base text-stone-600 mt-2">
              From declaration to confirmed donors, with no phone tree in between.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B81D24] flex items-center justify-center mb-6">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">1. Hospital declares</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Choose blood type, units and urgency. It takes under 30 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B81D24] flex items-center justify-center mb-6">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">2. Nearby donors alerted</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                Only compatible, eligible donors in range are alerted, in the app and by SMS.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-7 border border-stone-200/80 shadow-xs hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B81D24] flex items-center justify-center mb-6">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">3. Live responses</h3>
              <p className="text-sm text-stone-600 leading-relaxed">
                The hospital sees who accepted and when they will arrive, updated in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Know Your Type, Know Your Impact Section (UI/UX Page 1 & 2) */}
      <section id="blood-types" className="py-20 bg-[#FDF8F5] border-t border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
              Know your type, know your impact
            </h2>
            <p className="text-base text-stone-600 mt-2">
              Red blood cells can be given to these recipient types.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BLOOD_TYPES.map((type) => {
              const info = COMPATIBILITY_MAP[type];
              return (
                <div
                  key={type}
                  className="bg-white rounded-xl p-5 border border-stone-200/80 shadow-xs hover:border-red-300 transition-all flex flex-col justify-between"
                >
                  <div className="text-2xl font-bold text-[#B81D24] mb-2">{type}</div>
                  <div className="text-sm text-stone-600 font-medium">{info.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Two Split Feature Cards (UI/UX Page 2) */}
      <section className="py-20 bg-[#FAF9F8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* For Donors Card */}
            <div id="for-donors" className="bg-white rounded-2xl p-8 sm:p-10 border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#B81D24] tracking-wider">
                  FOR DONORS
                </span>
                <h3 className="text-2xl font-bold text-stone-950 mt-2 mb-6">
                  Be reachable when it counts
                </h3>
                <ul className="space-y-3.5 text-stone-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Set your radius, quiet hours and availability</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Respond to an alert in two taps</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>See your history and next eligible date</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/register?role=donor"
                  className="inline-block px-6 py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-sm font-semibold shadow-xs transition-colors"
                >
                  Register as a donor
                </Link>
              </div>
            </div>

            {/* For Hospitals & Blood Banks Card */}
            <div id="for-hospitals" className="bg-white rounded-2xl p-8 sm:p-10 border border-stone-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-extrabold text-[#B81D24] tracking-wider">
                  FOR HOSPITALS AND BLOOD BANKS
                </span>
                <h3 className="text-2xl font-bold text-stone-950 mt-2 mb-6">
                  Declare a shortage in seconds
                </h3>
                <ul className="space-y-3.5 text-stone-600 text-sm">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Live view of accepted donors and their ETAs</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Automatic radius expansion if responses fall short</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>Simple inventory view by blood type</span>
                  </li>
                </ul>
              </div>
              <div className="mt-8">
                <Link
                  to="/register?role=hospital"
                  className="inline-block px-6 py-3 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 text-sm font-semibold shadow-xs transition-colors"
                >
                  Apply for verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Crimson Join Banner (UI/UX Page 2 exact replica) */}
      <section className="bg-[#B81D24] text-white py-16 sm:py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Join as a donor. It takes two minutes.
          </h2>
          <p className="text-base sm:text-lg text-red-100 max-w-xl mx-auto">
            Verify your phone, add your blood type, and choose how far you can travel.
          </p>
          <div className="pt-4">
            <Link
              to="/register?role=donor"
              className="inline-block px-8 py-3.5 rounded-lg bg-white text-[#B81D24] hover:bg-stone-100 font-bold text-sm shadow-md transition-all active:scale-95"
            >
              Get started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
