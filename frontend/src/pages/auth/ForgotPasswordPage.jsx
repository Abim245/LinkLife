import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet, ArrowLeft } from 'lucide-react';

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/reset-password/verify?target=' + encodeURIComponent(identifier || 'user@example.com'));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F8]">
      {/* Left Maroon Panel (UI/UX Page 23) */}
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
              Locked out? We'll get you back in.
            </h1>
            <p className="text-base text-red-100 max-w-sm">It only takes a minute.</p>
          </div>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-xs text-red-100">
          For your safety, reset codes expire after 10 minutes and work only once.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Forgot your password?
          </h2>
          <p className="text-sm text-stone-600 mb-8">
            Enter the email or phone number you signed up with and we'll send you a reset code.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Email or phone number
              </label>
              <input
                type="text"
                required
                placeholder="you@example.com or +1 (555) 000-0000"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B81D24] bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Send reset code
            </button>

            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-stone-700 hover:text-[#B81D24] inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to log in</span>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
