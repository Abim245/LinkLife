import { Link } from 'react-router-dom';
import { Droplet, Check } from 'lucide-react';

export const ResetPasswordSuccessPage = () => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F8]">
      {/* Left Maroon Panel (UI/UX Page 26) */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#6B0E23] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between shrink-0">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 mb-12 sm:mb-16">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B0E23]">
              <Droplet className="w-4 h-4 fill-[#6B0E23]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LifeLink</span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              All set.
            </h1>
            <p className="text-base text-red-100 max-w-sm">Your account is secure again.</p>
          </div>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-xs text-red-100">
          For your safety, reset codes expire after 10 minutes and work only once.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Green Check Icon Circle */}
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
            <Check className="w-7 h-7 stroke-[3]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Password updated
          </h2>
          <p className="text-sm text-stone-600 mb-8">
            You can now log in with your new password.
          </p>

          <Link
            to="/login"
            className="w-full block text-center py-3.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
          >
            Go to log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordSuccessPage;
