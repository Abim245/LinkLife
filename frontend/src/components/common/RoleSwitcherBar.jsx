import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronDown, ChevronUp, X, RefreshCw } from 'lucide-react';

export const RoleSwitcherBar = () => {
  const { currentUser, switchRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleRoleSelect = (role, path) => {
    switchRole(role);
    navigate(path);
  };

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        title="Open Role Switcher"
        className="fixed bottom-4 right-4 z-50 bg-[#1A040A] text-white hover:bg-red-900 border border-red-700/50 shadow-lg px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 transition-all opacity-90 hover:opacity-100"
      >
        <RefreshCw className="w-3.5 h-3.5 text-red-400" />
        <span>Switch Persona ({currentUser?.role || 'Guest'})</span>
      </button>
    );
  }

  return (
    <div className="bg-[#1A040A] text-stone-200 text-xs border-b border-red-950/40 relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-bold text-red-400">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Prototype Mode:
          </span>
          <span className="hidden sm:inline text-stone-300">
            Active Persona: <strong className="text-white uppercase">{currentUser?.role || 'Guest'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className={`px-2 py-0.5 rounded transition-colors ${
                location.pathname === '/' ? 'bg-[#B81D24] text-white font-semibold' : 'hover:bg-white/10 text-stone-300'
              }`}
            >
              Landing Page
            </button>
            <button
              onClick={() => handleRoleSelect('donor', '/donor')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentUser?.role === 'donor' && location.pathname.startsWith('/donor')
                  ? 'bg-[#B81D24] text-white font-semibold'
                  : 'hover:bg-white/10 text-stone-300'
              }`}
            >
              Donor View
            </button>
            <button
              onClick={() => handleRoleSelect('hospital', '/hospital')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentUser?.role === 'hospital' && location.pathname.startsWith('/hospital')
                  ? 'bg-[#B81D24] text-white font-semibold'
                  : 'hover:bg-white/10 text-stone-300'
              }`}
            >
              Hospital View
            </button>
            <button
              onClick={() => handleRoleSelect('bloodbank', '/bloodbank')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentUser?.role === 'bloodbank' && location.pathname.startsWith('/bloodbank')
                  ? 'bg-[#B81D24] text-white font-semibold'
                  : 'hover:bg-white/10 text-stone-300'
              }`}
            >
              Blood Bank View
            </button>
            <button
              onClick={() => handleRoleSelect('admin', '/admin')}
              className={`px-2 py-0.5 rounded transition-colors ${
                currentUser?.role === 'admin' && location.pathname.startsWith('/admin')
                  ? 'bg-[#B81D24] text-white font-semibold'
                  : 'hover:bg-white/10 text-stone-300'
              }`}
            >
              Admin View
            </button>
            <button
              onClick={() => navigate('/alert/emg-001')}
              className="px-2 py-0.5 rounded bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800/50 flex items-center gap-1"
            >
              <span>Donor Alert UI</span>
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-[11px]"
          >
            <span>All Screens</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            title="Hide prototype bar"
            className="p-1 rounded hover:bg-white/10 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded screen selector menu */}
      {isOpen && (
        <div className="bg-[#140207] border-t border-stone-800 p-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
            <div>
              <div className="font-bold text-red-400 mb-1">Public & Onboarding</div>
              <ul className="space-y-1 text-stone-300">
                <li><button onClick={() => { navigate('/'); setIsOpen(false); }} className="hover:text-white">Landing Page</button></li>
                <li><button onClick={() => { navigate('/register'); setIsOpen(false); }} className="hover:text-white">Sign Up (Step 1)</button></li>
                <li><button onClick={() => { navigate('/verify-phone'); setIsOpen(false); }} className="hover:text-white">Verify Phone (Step 2)</button></li>
                <li><button onClick={() => { navigate('/application-status'); setIsOpen(false); }} className="hover:text-white">Application Under Review</button></li>
                <li><button onClick={() => { navigate('/login'); setIsOpen(false); }} className="hover:text-white">Log In</button></li>
                <li><button onClick={() => { navigate('/forgot-password'); setIsOpen(false); }} className="hover:text-white">Forgot Password</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-red-400 mb-1">Donor Screens</div>
              <ul className="space-y-1 text-stone-300">
                <li><button onClick={() => { handleRoleSelect('donor', '/donor'); setIsOpen(false); }} className="hover:text-white">Donor Home & Alert</button></li>
                <li><button onClick={() => { handleRoleSelect('donor', '/donor/history'); setIsOpen(false); }} className="hover:text-white">Donation History & Chart</button></li>
                <li><button onClick={() => { handleRoleSelect('donor', '/donor/profile'); setIsOpen(false); }} className="hover:text-white">Profile & Preferences</button></li>
                <li><button onClick={() => { navigate('/alert/emg-001'); setIsOpen(false); }} className="hover:text-white text-red-300">Mobile Alert Response</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-red-400 mb-1">Hospital Screens</div>
              <ul className="space-y-1 text-stone-300">
                <li><button onClick={() => { handleRoleSelect('hospital', '/hospital'); setIsOpen(false); }} className="hover:text-white">Hospital Live Dashboard</button></li>
                <li><button onClick={() => { handleRoleSelect('hospital', '/hospital/emergencies/emg-001'); setIsOpen(false); }} className="hover:text-white">Emergency Tracking (Rings)</button></li>
                <li><button onClick={() => { handleRoleSelect('hospital', '/hospital/emergencies'); setIsOpen(false); }} className="hover:text-white">Emergencies Archive</button></li>
                <li><button onClick={() => { handleRoleSelect('hospital', '/hospital/inventory'); setIsOpen(false); }} className="hover:text-white">Hospital Inventory</button></li>
                <li><button onClick={() => { handleRoleSelect('hospital', '/hospital/settings'); setIsOpen(false); }} className="hover:text-white">Organization Settings</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-red-400 mb-1">Blood Bank Screens</div>
              <ul className="space-y-1 text-stone-300">
                <li><button onClick={() => { handleRoleSelect('bloodbank', '/bloodbank'); setIsOpen(false); }} className="hover:text-white">Blood Bank Dashboard</button></li>
                <li><button onClick={() => { handleRoleSelect('bloodbank', '/bloodbank/inventory'); setIsOpen(false); }} className="hover:text-white">Stock & Movement Log</button></li>
                <li><button onClick={() => { handleRoleSelect('bloodbank', '/bloodbank/settings'); setIsOpen(false); }} className="hover:text-white">Blood Bank Settings</button></li>
              </ul>
            </div>
            <div>
              <div className="font-bold text-red-400 mb-1">Admin & Utility</div>
              <ul className="space-y-1 text-stone-300">
                <li><button onClick={() => { handleRoleSelect('admin', '/admin'); setIsOpen(false); }} className="hover:text-white">Admin Console Overview</button></li>
                <li><button onClick={() => { navigate('/404'); setIsOpen(false); }} className="hover:text-white">404 Error Page</button></li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSwitcherBar;
