import { Link, useNavigate } from 'react-router-dom';
import { Droplet, Clock, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import StatusPill from '../../components/common/StatusPill';

export const ApplicationUnderReviewPage = () => {
  const { currentUser, logout, switchRole } = useAuth();
  const navigate = useNavigate();

  const orgName = currentUser?.orgName || 'St. Jude Emergency Hospital';

  const handleSimulateApproval = () => {
    switchRole(currentUser?.role === 'bloodbank' ? 'bloodbank' : 'hospital');
    navigate(currentUser?.role === 'bloodbank' ? '/bloodbank' : '/hospital');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#B81D24] flex items-center justify-center text-white shadow-xs">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">LifeLink</span>
        </Link>

        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="text-sm font-medium text-stone-600 hover:text-[#B81D24] transition-colors"
        >
          Log out
        </button>
      </header>

      {/* Main Review Card (UI/UX Page 6 exact replica) */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-stone-200/80">
          {/* Clock Icon Badge */}
          <div className="w-12 h-12 rounded-full bg-red-50 text-[#B81D24] flex items-center justify-center mb-6">
            <Clock className="w-6 h-6 text-[#B81D24]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-3">
            Your application is under review
          </h1>
          <p className="text-sm text-stone-600 leading-relaxed mb-8">
            Thanks, <strong className="text-stone-800">{orgName}</strong>. An admin is verifying
            your details. This usually takes 1–2 business days. We'll email and text you as soon as
            it's done.
          </p>

          {/* Stepper Timeline */}
          <div className="space-y-6 relative pl-8 border-l-2 border-stone-200 ml-3 mb-8">
            {/* Step 1: Submitted */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0.5 w-6 h-6 rounded-full bg-[#B81D24] text-white flex items-center justify-center shadow-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Application submitted</h3>
                <p className="text-xs text-stone-500 mt-0.5">Today at 08:30 AM</p>
              </div>
            </div>

            {/* Step 2: Admin Verification */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-2 border-[#B81D24] bg-white text-[#B81D24] flex items-center justify-center text-xs font-bold">
                2
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-stone-900">Admin verification</h3>
                  <StatusPill status="IN PROGRESS" size="xs" />
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  We're checking your license and location.
                </p>
              </div>
            </div>

            {/* Step 3: Approved */}
            <div className="relative">
              <div className="absolute -left-[41px] top-0.5 w-6 h-6 rounded-full border-2 border-stone-300 bg-white text-stone-400 flex items-center justify-center text-xs font-bold">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-400">Approved</h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  You can then declare emergencies and manage inventory.
                </p>
              </div>
            </div>
          </div>

          {/* Alert Note Box */}
          <div className="bg-[#FAF3F1] border border-red-100 rounded-xl p-4 text-xs text-stone-700 leading-relaxed mb-6">
            Need to fix a detail, or missing a document? You can edit your application while it's
            under review.
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/register?role=hospital')}
              className="flex-1 py-3 px-4 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Edit application
            </button>
            <button
              onClick={() => alert('Support ticket initiated. Our team responds within 2 hours.')}
              className="flex-1 py-3 px-4 rounded-lg bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-medium text-sm transition-colors"
            >
              Contact support
            </button>
          </div>

          {/* Quick Demo Approval Simulator */}
          <div className="mt-6 pt-4 border-t border-stone-100 text-center">
            <button
              onClick={handleSimulateApproval}
              className="text-xs text-[#B81D24] font-semibold hover:underline inline-flex items-center gap-1"
            >
              <span>[Demo: Fast-track Admin Approval & Enter Dashboard]</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      <div className="p-6 text-center text-xs text-stone-400">
        © 2026 LifeLink. All rights reserved.
      </div>
    </div>
  );
};

export default ApplicationUnderReviewPage;
