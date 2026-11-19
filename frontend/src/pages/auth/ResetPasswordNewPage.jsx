import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export const ResetPasswordNewPage = () => {
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [logoutOthers, setLogoutOthers] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/reset-password/success');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F8]">
      {/* Left Maroon Panel (UI/UX Page 25) */}
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
              Almost done. Pick a new password.
            </h1>
            <p className="text-base text-red-100 max-w-sm">Then you're back to saving lives.</p>
          </div>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-xs text-red-100">
          For your safety, reset codes expire after 10 minutes and work only once.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-xs font-bold uppercase tracking-wider text-[#B81D24] mb-1">
            STEP 2 OF 2
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Create a new password
          </h2>
          <p className="text-sm text-stone-600 mb-8">Choose something you haven't used before.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                New password
              </label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B81D24] bg-white"
              />
              <span className="text-[11px] text-stone-500 mt-1 block">
                Use 8 or more characters. A mix of letters and numbers is best.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                required
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B81D24] bg-white"
              />
            </div>

            <div className="pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logoutOthers}
                  onChange={(e) => setLogoutOthers(e.target.checked)}
                  className="h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
                <span className="text-xs text-stone-700 font-medium">
                  Log me out of other devices
                </span>
              </label>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
              >
                Reset password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordNewPage;
