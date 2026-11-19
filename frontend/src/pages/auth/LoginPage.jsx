import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  const handleSubmit = (e) => {
    e.preventDefault();
    login('hospital');
    navigate('/hospital');
  };

  const handleQuickLogin = (role, path) => {
    switchRole(role);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F8]">
      {/* Left Maroon Hero Panel (UI/UX Page 4 exact replica) */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#6B0E23] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2 mb-12 sm:mb-16">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B0E23]">
              <Droplet className="w-4 h-4 fill-[#6B0E23]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LifeLink</span>
          </Link>

          {/* Heading */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Welcome back. <br />
              Someone may <br />
              need you today.
            </h1>
            <p className="text-base text-red-100 max-w-sm">
              Sign in and we'll take you straight to your dashboard.
            </p>
          </div>
        </div>

        {/* Bottom Role Info Card */}
        <div className="mt-12 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-xs text-red-100">
          <div className="font-semibold text-white mb-1">You'll land on your own view</div>
          <div className="text-red-200">Donor · Hospital · Blood bank · Admin</div>
        </div>
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Log in
          </h2>
          <p className="text-sm text-stone-600 mb-8">
            Use the email or phone number you signed up with.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B81D24] focus:border-transparent bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#B81D24] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B81D24] focus:border-transparent bg-white"
              />
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="h-4 w-4 rounded text-[#B81D24] focus:ring-[#B81D24] border-stone-300"
                />
                <span className="text-xs text-stone-600">Keep me signed in on this device</span>
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
              >
                Log in
              </button>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs text-stone-500">
                <span className="bg-[#FAF9F8] px-3 font-medium">or</span>
              </div>
            </div>

            <Link
              to="/verify-phone"
              className="w-full block text-center py-2.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-sm shadow-xs transition-colors"
            >
              Get a login code by SMS
            </Link>
          </form>

          {/* Quick Persona Demo Logins */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5 text-center">
              Quick Role Sign-in (For Preview)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('donor', '/donor')}
                className="p-2 rounded bg-stone-100 hover:bg-red-50 hover:text-[#B81D24] text-stone-700 font-medium border border-stone-200 transition-colors text-left"
              >
                🩸 Donor Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('hospital', '/hospital')}
                className="p-2 rounded bg-stone-100 hover:bg-red-50 hover:text-[#B81D24] text-stone-700 font-medium border border-stone-200 transition-colors text-left"
              >
                🏥 Hospital Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('bloodbank', '/bloodbank')}
                className="p-2 rounded bg-stone-100 hover:bg-red-50 hover:text-[#B81D24] text-stone-700 font-medium border border-stone-200 transition-colors text-left"
              >
                💉 Blood Bank Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', '/admin')}
                className="p-2 rounded bg-stone-100 hover:bg-red-50 hover:text-[#B81D24] text-stone-700 font-medium border border-stone-200 transition-colors text-left"
              >
                🛡️ Admin Demo
              </button>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-stone-600">
            New to LifeLink?{' '}
            <Link to="/register" className="font-semibold text-[#B81D24] hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
