import { Link, useNavigate } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'donor') return '/donor';
    if (currentUser.role === 'hospital') return '/hospital';
    if (currentUser.role === 'bloodbank') return '/bloodbank';
    if (currentUser.role === 'admin') return '/admin';
    return '/';
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col justify-between">
      {/* Top Header */}
      <header className="p-6 max-w-7xl mx-auto w-full flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#B81D24] flex items-center justify-center text-white shadow-xs">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">LifeLink</span>
        </Link>

        <Link
          to="/login"
          className="text-sm font-semibold text-stone-700 hover:text-[#B81D24] transition-colors"
        >
          Log in
        </Link>
      </header>

      {/* Main 404 Visual Content (UI/UX Page 27 exact replica) */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center py-12">
        <div className="max-w-md w-full space-y-6">
          {/* 4 [Drop] 4 Graphic */}
          <div className="flex items-center justify-center gap-2 font-black text-7xl sm:text-8xl text-[#B81D24] select-none tracking-tighter">
            <span>4</span>
            <div className="w-14 h-18 sm:w-16 sm:h-20 flex items-center justify-center">
              <Droplet className="w-14 h-14 sm:w-16 sm:h-16 fill-[#B81D24] stroke-none animate-bounce" />
            </div>
            <span>4</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            We can't find that page
          </h1>

          <p className="text-sm text-stone-600 leading-relaxed max-w-sm mx-auto">
            The link may be broken, or the page may have moved. If you followed an alert link, it may
            have expired or already been used.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Go to home
            </Link>
            <button
              onClick={() => navigate(getDashboardPath())}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-semibold text-sm shadow-xs transition-colors"
            >
              Go to my dashboard
            </button>
          </div>

          {/* Contact Support Link */}
          <div className="text-xs text-stone-500 pt-2">
            Still stuck?{' '}
            <button
              onClick={() => alert('Support contact form')}
              className="font-semibold text-[#B81D24] underline hover:text-[#9E151E]"
            >
              Contact support
            </button>
          </div>

          {/* Medical Notice Box (UI/UX Page 27 bottom box) */}
          <div className="mt-8 bg-[#FAF3F1] border border-red-100 rounded-2xl p-5 text-xs text-stone-700 leading-relaxed max-w-lg mx-auto">
            Need urgent medical help? Please contact your local emergency services directly.
            LifeLink is not an emergency line.
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-xs text-stone-400">
        © 2026 LifeLink. All rights reserved.
      </footer>
    </div>
  );
};

export default NotFoundPage;
