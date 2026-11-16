import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Droplet, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isPublic = !currentUser || location.pathname === '/' || location.pathname.startsWith('/login') || location.pathname.startsWith('/register');
  const isDonor = currentUser?.role === 'donor';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-[#B81D24] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">LifeLink</span>
        </Link>

        {/* Public Desktop Navigation */}
        {isPublic ? (
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-stone-600">
            <a href="#how-it-works" className="hover:text-stone-900 transition-colors">
              How it works
            </a>
            <a href="#blood-types" className="hover:text-stone-900 transition-colors">
              Blood types
            </a>
            <a href="#for-donors" className="hover:text-stone-900 transition-colors">
              For donors
            </a>
            <a href="#for-hospitals" className="hover:text-stone-900 transition-colors">
              For hospitals
            </a>
          </nav>
        ) : isDonor ? (
          /* Donor Desktop Navigation (Page 8) */
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link
              to="/donor"
              className={`transition-colors py-1 ${
                location.pathname === '/donor'
                  ? 'text-[#B81D24] font-semibold border-b-2 border-[#B81D24]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Home
            </Link>
            <Link
              to="/donor/history"
              className={`transition-colors py-1 ${
                location.pathname === '/donor/history'
                  ? 'text-[#B81D24] font-semibold border-b-2 border-[#B81D24]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              History
            </Link>
            <Link
              to="/donor/profile"
              className={`transition-colors py-1 ${
                location.pathname === '/donor/profile'
                  ? 'text-[#B81D24] font-semibold border-b-2 border-[#B81D24]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Profile
            </Link>
          </nav>
        ) : (
          /* Hospital / Blood bank / Admin top indicator */
          <div className="hidden md:flex items-center gap-3">
            <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
              {currentUser?.role === 'hospital' && '🏥 Hospital Portal'}
              {currentUser?.role === 'bloodbank' && '💉 Blood Bank Portal'}
              {currentUser?.role === 'admin' && '🛡️ Admin Console'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isPublic ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-stone-700 hover:text-stone-900 px-3 py-2 transition-colors"
              >
                Log in
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold bg-[#B81D24] hover:bg-[#9E151E] text-white px-5 py-2.5 rounded-lg shadow-xs transition-all active:scale-95"
              >
                Become a donor
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-stone-500">
                {currentUser?.name || currentUser?.orgName}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-stone-600 hover:text-[#B81D24] flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-3 pb-6 space-y-3">
          {isPublic ? (
            <>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                How it works
              </a>
              <a
                href="#blood-types"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                Blood types
              </a>
              <a
                href="#for-donors"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                For donors
              </a>
              <a
                href="#for-hospitals"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                For hospitals
              </a>
              <div className="pt-3 border-t border-stone-100 flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-stone-800 border border-stone-300 rounded-lg"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold bg-[#B81D24] text-white rounded-lg shadow-xs"
                >
                  Become a donor
                </Link>
              </div>
            </>
          ) : isDonor ? (
            <>
              <Link
                to="/donor"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                Home
              </Link>
              <Link
                to="/donor/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                History
              </Link>
              <Link
                to="/donor/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-700 font-medium"
              >
                Profile & Settings
              </Link>
              <Link
                to="/alert/emg-001"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-[#B81D24] font-medium"
              >
                View Live Emergency Alert Demo
              </Link>
              <div className="pt-3 border-t border-stone-100">
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-sm font-medium text-stone-600 hover:text-[#B81D24]"
                >
                  Log out
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <Link
                to={
                  currentUser?.role === 'hospital'
                    ? '/hospital'
                    : currentUser?.role === 'bloodbank'
                    ? '/bloodbank'
                    : '/admin'
                }
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-stone-800 font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-medium text-[#B81D24]"
              >
                Log out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
