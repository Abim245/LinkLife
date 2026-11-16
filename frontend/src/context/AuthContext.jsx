import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const DEFAULT_PROFILES = {
  donor: {
    role: 'donor',
    name: 'Lucas Miller',
    firstName: 'Lucas',
    phone: '+1 (555) 234-5678',
    email: 'lucas.miller@example.com',
    bloodType: 'O-',
    dob: '1996-05-14',
    lastDonationDate: '2026-08-15',
    isEligible: true,
    daysSinceDonation: 56,
    availableForAlerts: true,
    alertRadius: 15,
    quietHours: { from: '10:00 PM', to: '7:00 AM' },
    allowCriticalInQuietHours: true,
    smsAlerts: true,
    pushAlerts: true,
    shareLocation: true,
    totalDonations: 8,
    alertsAnswered: 12,
    location: '40.730610, -73.935242',
    address: 'Brooklyn, New York',
  },
  hospital: {
    role: 'hospital',
    name: 'Dr. Sarah Vance',
    coordinatorName: 'Sarah Vance',
    orgName: 'St. Jude Emergency Hospital',
    verified: true,
    registrationNumber: 'HOSP-NY-84920',
    phone: '+1 (555) 019-2834',
    email: 'emergency@stjude.org',
    jobTitle: 'Head Emergency Coordinator',
    address: '450 1st Avenue, Manhattan, NY',
    location: '40.741895, -73.989308',
    emergencyDefaults: {
      defaultUrgency: 'Critical',
      firstAlertRadius: 10,
      widenAfterMinutes: 5,
      largestRadius: 50,
      alertBySMS: true,
    },
    notifications: {
      donorAccepts: true,
      requestFulfilled: true,
      stockThreshold: true,
      adminMessages: true,
    },
  },
  bloodbank: {
    role: 'bloodbank',
    name: 'Marcus Reed',
    staffName: 'Marcus Reed',
    orgName: 'Metropolitan Blood Center',
    verified: true,
    registrationNumber: 'BB-NY-19304',
    phone: '+1 (555) 304-9102',
    email: 'inventory@metroblood.org',
    jobTitle: 'Operations & Stock Director',
    address: '120 E 16th Street, New York, NY',
    location: '40.735412, -73.988114',
  },
  admin: {
    role: 'admin',
    name: 'Clara Chen',
    email: 'admin.clara@lifelink.org',
    phone: '+1 (555) 900-1122',
  },
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('lifelink_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_PROFILES.hospital;
      }
    }
    return DEFAULT_PROFILES.hospital;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('lifelink_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('lifelink_user');
    }
  }, [currentUser]);

  const switchRole = (role) => {
    if (DEFAULT_PROFILES[role]) {
      setCurrentUser({ ...DEFAULT_PROFILES[role] });
    }
  };

  const login = (role = 'hospital', customData = {}) => {
    const base = DEFAULT_PROFILES[role] || DEFAULT_PROFILES.hospital;
    setCurrentUser({ ...base, ...customData });
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (data) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        login,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
