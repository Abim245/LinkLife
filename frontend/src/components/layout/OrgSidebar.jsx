import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Droplet,
  LayoutDashboard,
  AlertTriangle,
  Boxes,
  History,
  Settings,
  Users,
  Building2,
  FileCheck2,
  ScrollText,
  LogOut,
  Menu,
  BadgeCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useBloodData } from '../../context/BloodDataContext';

export const OrgSidebar = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { applications } = useBloodData();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = currentUser?.role || 'hospital';

  const pendingApprovalsCount = applications.filter((a) => a.status === 'PENDING').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on role
  let navItems = [];
  if (role === 'hospital') {
    navItems = [
      { name: 'Dashboard', path: '/hospital', icon: LayoutDashboard },
      { name: 'Emergencies', path: '/hospital/emergencies', icon: AlertTriangle },
      { name: 'Inventory', path: '/hospital/inventory', icon: Boxes },
      { name: 'Donation history', path: '/hospital/history', icon: History },
      { name: 'Settings', path: '/hospital/settings', icon: Settings },
    ];
  } else if (role === 'bloodbank') {
    navItems = [
      { name: 'Dashboard', path: '/bloodbank', icon: LayoutDashboard },
      { name: 'Stock', path: '/bloodbank/inventory', icon: Boxes },
      { name: 'Hospital requests', path: '/bloodbank#requests', icon: AlertTriangle, badge: '2' },
      { name: 'Regional shortages', path: '/bloodbank#shortages', icon: Building2 },
      { name: 'Donation history', path: '/bloodbank/history', icon: History },
      { name: 'Settings', path: '/bloodbank/settings', icon: Settings },
    ];
  } else if (role === 'admin') {
    navItems = [
      { name: 'Overview', path: '/admin', icon: LayoutDashboard },
      { name: 'Approvals', path: '/admin#approvals', icon: FileCheck2, badge: String(pendingApprovalsCount) },
      { name: 'Users', path: '/admin#users', icon: Users },
      { name: 'Organizations', path: '/admin#organizations', icon: Building2 },
      { name: 'Emergencies', path: '/admin#emergencies', icon: AlertTriangle },
      { name: 'Alert log', path: '/admin#alerts', icon: ScrollText },
      { name: 'Settings', path: '/admin#settings', icon: Settings },
    ];
  }

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#1F060E] text-stone-300 w-64 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-red-950/40">
        <Link to="/" className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-[#B81D24] flex items-center justify-center text-white shadow-xs">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">LifeLink</span>
        </Link>

        {/* Organization / Admin Badge */}
        {role === 'admin' ? (
          <div>
            <div className="text-xs uppercase tracking-wider text-red-300 font-semibold">Admin console</div>
            <div className="text-sm font-medium text-white truncate">{currentUser?.name || 'Clara Chen'}</div>
          </div>
        ) : (
          <div>
            <div className="text-sm font-semibold text-white truncate mb-1">
              {currentUser?.orgName || (role === 'hospital' ? 'St. Jude Emergency Hospital' : 'Metropolitan Blood Center')}
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
              <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
              VERIFIED
            </div>
          </div>
        )}
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#B81D24] text-white shadow-xs font-semibold'
                  : 'text-stone-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white text-[#B81D24]' : 'bg-[#B81D24] text-white'
                }`}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-red-950/40 bg-black/20">
        <div className="text-xs font-medium text-stone-300 truncate mb-1">
          {currentUser?.coordinatorName || currentUser?.staffName || currentUser?.name || 'Dr. Sarah Vance'}
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-red-300 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FAF9F8]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg text-stone-700 hover:bg-stone-100"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#B81D24] flex items-center justify-center text-white">
              <Droplet className="w-3.5 h-3.5 fill-white" />
            </div>
            <span className="font-bold text-stone-900 text-sm">LifeLink</span>
          </div>
          <div className="w-6" />
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default OrgSidebar;
