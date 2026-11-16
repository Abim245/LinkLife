import { createContext, useContext, useState } from 'react';

const BloodDataContext = createContext(null);

export const INITIAL_INVENTORY = [
  { type: 'O-', units: 2, lowThreshold: 6, status: 'LOW', lastChanged: '12 min ago' },
  { type: 'O+', units: 24, lowThreshold: 10, status: 'OK', lastChanged: '2 hours ago' },
  { type: 'A-', units: 5, lowThreshold: 5, status: 'WATCH', lastChanged: 'Today, 09:15' },
  { type: 'A+', units: 38, lowThreshold: 12, status: 'OK', lastChanged: 'Yesterday' },
  { type: 'B-', units: 4, lowThreshold: 5, status: 'WATCH', lastChanged: 'Today, 11:40' },
  { type: 'B+', units: 19, lowThreshold: 8, status: 'OK', lastChanged: '3 days ago' },
  { type: 'AB-', units: 3, lowThreshold: 4, status: 'WATCH', lastChanged: '4 days ago' },
  { type: 'AB+', units: 15, lowThreshold: 6, status: 'OK', lastChanged: 'Oct 28' },
];

export const INITIAL_EMERGENCIES = [
  {
    id: 'emg-001',
    hospitalName: 'St. Jude Emergency Hospital',
    coordinatorName: 'Dr. Sarah Vance',
    bloodType: 'O-',
    unitsNeeded: 4,
    unitsConfirmed: 3,
    urgency: 'Critical',
    status: 'LIVE',
    declaredAt: '12 min ago',
    neededBy: 'ASAP (under 45 min)',
    distanceKm: 2.4,
    currentRadiusKm: 10,
    wideningIn: '04:30',
    notes: 'Severe trauma intake in ER Bay 3. Use emergency ambulance bay entrance.',
    donorsAlerted: 18,
    responders: [
      { id: 'd1', name: 'Lucas M.', bloodType: 'O-', status: 'ON THE WAY', eta: '8 min' },
      { id: 'd2', name: 'Elena R.', bloodType: 'O-', status: 'ON THE WAY', eta: '14 min' },
      { id: 'd3', name: 'David K.', bloodType: 'O-', status: 'ACCEPTED', eta: '25 min' },
      { id: 'd4', name: 'Priya N.', bloodType: 'O-', status: 'AWAITING REPLY', eta: '—' },
      { id: 'd5', name: 'Thomas H.', bloodType: 'O-', status: 'DECLINED', eta: '—' },
    ],
    activityLog: [
      { time: '1 min ago', text: 'Lucas M. updated ETA to 8 min' },
      { time: '4 min ago', text: 'David K. accepted request' },
      { time: '8 min ago', text: 'Elena R. accepted request and is on the way' },
      { time: '12 min ago', text: 'Emergency declared for 4 units of O-' },
    ],
  },
  {
    id: 'emg-002',
    hospitalName: 'Mercy General Hospital',
    coordinatorName: 'James Chen',
    bloodType: 'A-',
    unitsNeeded: 2,
    unitsConfirmed: 2,
    urgency: 'Urgent',
    status: 'FULFILLED',
    declaredAt: 'Today, 10:15',
    neededBy: '1:00 PM',
    distanceKm: 4.8,
    currentRadiusKm: 15,
    donorsAlerted: 12,
    responders: [
      { id: 'd6', name: 'Rachel T.', bloodType: 'A-', status: 'COMPLETED', eta: 'Arrived' },
      { id: 'd7', name: 'Sean W.', bloodType: 'A-', status: 'COMPLETED', eta: 'Arrived' },
    ],
  },
  {
    id: 'emg-003',
    hospitalName: 'Memorial Medical Center',
    coordinatorName: 'Maria Santos',
    bloodType: 'B-',
    unitsNeeded: 3,
    unitsConfirmed: 3,
    urgency: 'Standard',
    status: 'CLOSED',
    declaredAt: 'Yesterday, 14:30',
    neededBy: 'Yesterday 18:00',
    distanceKm: 6.2,
    currentRadiusKm: 15,
    donorsAlerted: 22,
    responders: [],
  },
  {
    id: 'emg-004',
    hospitalName: 'City Children’s Clinic',
    coordinatorName: 'Robert Lang',
    bloodType: 'O-',
    unitsNeeded: 1,
    unitsConfirmed: 0,
    urgency: 'Urgent',
    status: 'EXPIRED',
    declaredAt: 'Nov 12, 08:00',
    neededBy: 'Nov 12, 10:00',
    distanceKm: 8.1,
    currentRadiusKm: 25,
    donorsAlerted: 35,
    responders: [],
  },
  {
    id: 'emg-005',
    hospitalName: 'Northwest Trauma Institute',
    coordinatorName: 'Linda Bell',
    bloodType: 'AB-',
    unitsNeeded: 2,
    unitsConfirmed: 2,
    urgency: 'Critical',
    status: 'FULFILLED',
    declaredAt: 'Nov 10, 22:40',
    neededBy: 'Nov 10, 23:30',
    distanceKm: 11.0,
    currentRadiusKm: 30,
    donorsAlerted: 14,
    responders: [],
  },
];

export const INITIAL_APPLICATIONS = [
  {
    id: 'app-001',
    name: 'St. Jude Emergency Hospital',
    type: 'Hospital',
    submittedAt: 'Today, 08:30 AM',
    status: 'PENDING',
    registrationNumber: 'HOSP-NY-84920',
    contactPerson: 'Dr. Sarah Vance',
    jobTitle: 'Head Emergency Coordinator',
    email: 'emergency@stjude.org',
    phone: '+1 (555) 019-2834',
    phoneVerified: true,
    address: '450 1st Avenue, Manhattan, NY',
    licenseDoc: 'st_jude_medical_license_2026.pdf',
    locationCoordinates: '40.741895, -73.989308',
  },
  {
    id: 'app-002',
    name: 'Metropolitan Blood Center',
    type: 'Blood bank',
    submittedAt: 'Yesterday, 16:15',
    status: 'PENDING',
    registrationNumber: 'BB-NY-19304',
    contactPerson: 'Marcus Reed',
    jobTitle: 'Operations & Stock Director',
    email: 'inventory@metroblood.org',
    phone: '+1 (555) 304-9102',
    phoneVerified: true,
    address: '120 E 16th Street, New York, NY',
    licenseDoc: 'metro_fda_bloodbank_cert.pdf',
    locationCoordinates: '40.735412, -73.988114',
  },
  {
    id: 'app-003',
    name: 'Valley Community Hospital',
    type: 'Hospital',
    submittedAt: '3 days ago',
    status: 'CHANGES REQUESTED',
    registrationNumber: 'HOSP-NJ-11204',
    contactPerson: 'Gregory House',
    jobTitle: 'Chief Medical Officer',
    email: 'ghouse@valleyhosp.org',
    phone: '+1 (555) 832-1920',
    phoneVerified: true,
    address: '920 Valley Rd, Newark, NJ',
    licenseDoc: 'nj_facility_accreditation.pdf',
    locationCoordinates: '40.735657, -74.172366',
    adminNote: 'Please re-upload a clearer copy of your 2026 state blood storage endorsement.',
  },
];

export const INITIAL_USERS = [
  { id: 'u1', name: 'Lucas Miller', role: 'Donor', status: 'ACTIVE', joined: 'Jan 14, 2026', phone: '+1 (555) 234-5678', email: 'lucas.m@example.com' },
  { id: 'u2', name: 'St. Jude Emergency Hospital', role: 'Hospital', status: 'VERIFIED', joined: 'Feb 02, 2026', phone: '+1 (555) 019-2834', email: 'emergency@stjude.org' },
  { id: 'u3', name: 'Metropolitan Blood Center', role: 'Blood bank', status: 'PENDING', joined: 'Mar 10, 2026', phone: '+1 (555) 304-9102', email: 'inventory@metroblood.org' },
  { id: 'u4', name: 'Arthur Pendelton', role: 'Donor', status: 'SUSPENDED', joined: 'Nov 05, 2025', phone: '+1 (555) 441-2091', email: 'arthur.p@example.com' },
  { id: 'u5', name: 'Clara Chen', role: 'Admin', status: 'ACTIVE', joined: 'Jan 01, 2025', phone: '+1 (555) 900-1122', email: 'clara.chen@lifelink.org' },
  { id: 'u6', name: 'Mercy General Hospital', role: 'Hospital', status: 'VERIFIED', joined: 'Jan 20, 2026', phone: '+1 (555) 987-6543', email: 'admin@mercygen.org' },
];

export const INITIAL_STOCK_MOVEMENTS = [
  { id: 'm1', when: '12 min ago', type: 'O-', change: -4, reason: 'Issued to hospital', by: 'Marcus Reed' },
  { id: 'm2', when: 'Today, 09:30', type: 'O+', change: +2, reason: 'Donation received', by: 'Marcus Reed' },
  { id: 'm3', when: 'Yesterday', type: 'A-', change: -1, reason: 'Used', by: 'Sarah Vance' },
  { id: 'm4', when: 'Nov 14', type: 'B+', change: +3, reason: 'Donation received', by: 'Marcus Reed' },
  { id: 'm5', when: 'Nov 12', type: 'AB-', change: -1, reason: 'Adjustment', by: 'Sarah Vance' },
];

export const INITIAL_DONOR_HISTORY = [
  { id: 'dh1', date: 'Aug 15, 2026', where: 'St. Jude Emergency Hospital', bloodType: 'O-', units: 1, status: 'CONFIRMED' },
  { id: 'dh2', date: 'Jun 10, 2026', where: 'St. Jude Emergency Hospital', bloodType: 'O-', units: 1, status: 'CONFIRMED' },
  { id: 'dh3', date: 'Apr 02, 2026', where: 'Metropolitan Blood Center', bloodType: 'O-', units: 1, status: 'AWAITING CONFIRMATION' },
  { id: 'dh4', date: 'Jan 18, 2026', where: 'Memorial Medical Center', bloodType: 'O-', units: 1, status: 'CONFIRMED' },
  { id: 'dh5', date: 'Nov 04, 2025', where: 'St. Jude Emergency Hospital', bloodType: 'O-', units: 1, status: 'CANCELLED BY YOU' },
  { id: 'dh6', date: 'Aug 22, 2025', where: 'Mercy General Hospital', bloodType: 'O-', units: 1, status: 'CONFIRMED' },
];

export const BloodDataProvider = ({ children }) => {
  const [emergencies, setEmergencies] = useState(INITIAL_EMERGENCIES);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);
  const [selectedAppId, setSelectedAppId] = useState('app-001');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [stockMovements, setStockMovements] = useState(INITIAL_STOCK_MOVEMENTS);
  const [donorHistory, setDonorHistory] = useState(INITIAL_DONOR_HISTORY);

  // Active donor emergency response state
  const [donorAlertResponse, setDonorAlertResponse] = useState(null);
  const [selectedEta, setSelectedEta] = useState('20 min');

  // Radius widening state for active emergency
  const widenRadius = (emergencyId) => {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === emergencyId
          ? {
              ...e,
              currentRadiusKm: 25,
              wideningIn: 'Widened to 25 km',
              donorsAlerted: e.donorsAlerted + 24,
              activityLog: [
                { time: 'Just now', text: 'Search radius expanded to 25 km (+24 donors alerted)' },
                ...e.activityLog,
              ],
            }
          : e
      )
    );
  };

  // Declare new emergency
  const declareEmergency = (newEmergency) => {
    const created = {
      id: `emg-${Date.now().toString().slice(-4)}`,
      hospitalName: newEmergency.hospitalName || 'St. Jude Emergency Hospital',
      coordinatorName: newEmergency.coordinatorName || 'Dr. Sarah Vance',
      bloodType: newEmergency.bloodType || 'O-',
      unitsNeeded: Number(newEmergency.unitsNeeded) || 4,
      unitsConfirmed: 0,
      urgency: newEmergency.urgency || 'Critical',
      status: 'LIVE',
      declaredAt: 'Just now',
      neededBy: newEmergency.neededBy || 'ASAP (under 45 min)',
      distanceKm: 2.4,
      currentRadiusKm: 10,
      wideningIn: '05:00',
      notes: newEmergency.notes || '',
      donorsAlerted: 28,
      responders: [],
      activityLog: [{ time: 'Just now', text: `Emergency declared for ${newEmergency.unitsNeeded || 4} units of ${newEmergency.bloodType || 'O-'}` }],
    };
    setEmergencies((prev) => [created, ...prev]);
    return created;
  };

  // Close or fulfill emergency
  const updateEmergencyStatus = (emergencyId, status) => {
    setEmergencies((prev) =>
      prev.map((e) => (e.id === emergencyId ? { ...e, status } : e))
    );
  };

  // Donor accepts or declines
  const respondToEmergency = (emergencyId, response, etaMinutes = '20 min') => {
    setDonorAlertResponse({ status: response, eta: etaMinutes });
    if (response === 'ACCEPTED') {
      setEmergencies((prev) =>
        prev.map((e) => {
          if (e.id === emergencyId) {
            const updatedResponders = [
              { id: 'me', name: 'Lucas M. (You)', bloodType: 'O-', status: 'ON THE WAY', eta: etaMinutes },
              ...e.responders,
            ];
            return {
              ...e,
              unitsConfirmed: Math.min(e.unitsNeeded, e.unitsConfirmed + 1),
              responders: updatedResponders,
              activityLog: [
                { time: 'Just now', text: `You accepted with an ETA of ${etaMinutes}` },
                ...e.activityLog,
              ],
            };
          }
          return e;
        })
      );
    }
  };

  // Adjust stock units
  const adjustStock = (bloodType, delta) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.type === bloodType) {
          const newUnits = Math.max(0, item.units + delta);
          let newStatus = 'OK';
          if (newUnits <= item.lowThreshold) {
            newStatus = 'LOW';
          } else if (newUnits <= item.lowThreshold + 2) {
            newStatus = 'WATCH';
          }
          return {
            ...item,
            units: newUnits,
            status: newStatus,
            lastChanged: 'Just now',
          };
        }
        return item;
      })
    );
  };

  // Record stock movement
  const recordMovement = (type, direction, units, reason, note = '') => {
    const change = direction === 'add' ? Number(units) : -Number(units);
    adjustStock(type, change);
    const newMovement = {
      id: `m-${Date.now()}`,
      when: 'Just now',
      type,
      change,
      reason,
      by: 'Marcus Reed',
      note,
    };
    setStockMovements((prev) => [newMovement, ...prev]);
  };

  // Admin approves / rejects / requests changes
  const updateApplicationStatus = (appId, status, note = '') => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, adminNote: note } : a))
    );
  };

  // Admin user actions
  const updateUserStatus = (userId, newStatus) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  return (
    <BloodDataContext.Provider
      value={{
        emergencies,
        inventory,
        applications,
        selectedAppId,
        setSelectedAppId,
        users,
        stockMovements,
        donorHistory,
        setDonorHistory,
        donorAlertResponse,
        selectedEta,
        setSelectedEta,
        widenRadius,
        declareEmergency,
        updateEmergencyStatus,
        respondToEmergency,
        adjustStock,
        recordMovement,
        updateApplicationStatus,
        updateUserStatus,
      }}
    >
      {children}
    </BloodDataContext.Provider>
  );
};

export const useBloodData = () => {
  const context = useContext(BloodDataContext);
  if (!context) {
    throw new Error('useBloodData must be used within a BloodDataProvider');
  }
  return context;
};
