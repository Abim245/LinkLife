import { createContext, useContext, useState, useEffect , useRef} from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
import { connectSocket, disconnectSocket } from '../lib/socket';

const URGENCY_LABEL = { critical: 'Critical', urgent: 'Urgent', standard: 'Standard' };
const STATUS_LABEL = { open: 'LIVE', fulfilled: 'FULFILLED', closed: 'CLOSED', expired: 'EXPIRED' };

const mapEmergency = (r, fallbackHospital = '') => ({
  id: r._id,
  hospitalName: r.orgId?.name || fallbackHospital,
  coordinatorName: '',
  bloodType: r.bloodType,
  unitsNeeded: r.unitsNeeded,
  unitsConfirmed: 0,
  urgency: URGENCY_LABEL[r.urgency] || 'Urgent',
  status: STATUS_LABEL[r.status] || 'LIVE',
  declaredAt: new Date(r.createdAt).toLocaleString(),
  neededBy: r.neededBy ? new Date(r.neededBy).toLocaleString() : 'ASAP',
  distanceKm: null,
  currentRadiusKm: r.currentRadiusKm,
  wideningIn: '—',
  notes: r.notes || '',
  donorsAlerted: 0,
  responders: [],
  activityLog: [],
  myResponse: r.myResponse || 'none',
  myEta: r.myEtaMinutes ? `${r.myEtaMinutes} min` : null,
});

// Shape of the live 'emergency:new' socket event
const mapAlert = (a) => ({
  ...mapEmergency(
    { _id: a.requestId, bloodType: a.bloodType, unitsNeeded: a.unitsNeeded, urgency: a.urgency, status: 'open', createdAt: new Date() },
    a.hospital
  ),
  distanceKm: a.distanceKm,
});

const statusFor = (units, low) => (units < low ? 'LOW' : units <= low + 2 ? 'WATCH' : 'OK');

const mapInventory = (inv) =>
  inv.stock.map((s) => ({
    type: s.bloodType,
    units: s.units,
    lowThreshold: inv.lowThreshold,
    status: statusFor(s.units, inv.lowThreshold),
    lastChanged: '—',
  }));const BloodDataContext = createContext(null);

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
  const { currentUser } = useAuth();
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
  const emergenciesRef = useRef(emergencies);
  emergenciesRef.current = emergencies;
  const refreshEmergency = async (id) => {
  try {
    const { data } = await api.get(`/emergencies/${id}/alerts`);
    const responders = data.map((a, i) => ({
      id: `${id}-${i}`,
      name: (typeof a.donor === 'string' ? a.donor : a.donor?.name) || a.name || a.donorName || 'Donor',
      bloodType: a.bloodType || a.donor?.bloodType || '—',
      status:
        a.response === 'accepted' ? 'ON THE WAY' : a.response === 'declined' ? 'DECLINED' : 'AWAITING REPLY',
      eta: a.etaMinutes ? `${a.etaMinutes} min` : '—',
    }));
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, donorsAlerted: data.length, unitsConfirmed: responders.filter((r) => r.status === 'ON THE WAY').length, responders }
          : e
      )
    );
  } catch {
    /* donors aren't allowed to read the alert list */
  }
  };
  const refreshInventory = async () => {
  if (!currentUser?.id || !['hospital', 'bloodbank'].includes(currentUser.role)) return;
  try {
    const { data: inv } = await api.get('/inventory');
    setInventory(mapInventory(inv));
  } catch {
    /* keep what we have */
  }
  };
  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token || !currentUser?.id) return; // mock users keep the mock data

  const isOrg = ['hospital', 'bloodbank'].includes(currentUser.role);

  (async () => {
    try {
      const { data } = await api.get('/emergencies');
      const mapped = data.map((r) => mapEmergency(r, currentUser.orgName));
      setEmergencies(mapped);

      if (isOrg) {
        mapped.filter((e) => e.status === 'LIVE').forEach((e) => refreshEmergency(e.id));
        const { data: inv } = await api.get('/inventory');
        setInventory(mapInventory(inv));
        setStockMovements([]);
      }
    } catch (err) {
      console.error('Load failed:', err.message);
    }
  })();

  const socket = connectSocket(token);
  if (!socket) return;

  socket.on('emergency:new', (a) =>
    setEmergencies((prev) => (prev.some((e) => e.id === a.requestId) ? prev : [mapAlert(a), ...prev]))
  );
  socket.on('emergency:update', (u) => {
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === u.requestId
          ? {
              ...e,
              status: STATUS_LABEL[u.status] || e.status,
              currentRadiusKm: u.radiusKm ?? e.currentRadiusKm,
              unitsConfirmed: u.acceptedCount ?? e.unitsConfirmed,
              donorsAlerted: u.alerted ?? e.donorsAlerted,
            }
          : e
      )
    );
    refreshEmergency(u.requestId);
  });
  socket.on('emergency:closed', (c) =>
    setEmergencies((prev) =>
      prev.map((e) => (e.id === c.requestId ? { ...e, status: STATUS_LABEL[c.reason] || 'CLOSED' } : e))
    )
  );

  return () => disconnectSocket();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [currentUser?.id]);
    useEffect(() => {
    if (!currentUser?.id || !['hospital', 'bloodbank'].includes(currentUser.role)) return;
    const timer = setInterval(() => {
      emergenciesRef.current
        .filter((e) => e.status === 'LIVE')
        .forEach((e) => refreshEmergency(e.id));
    }, 8000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?.id]);
  const widenRadius = async (id) => {
  try {
    const { data } = await api.post(`/emergencies/${id}/escalate`);
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, currentRadiusKm: data.radiusKm, wideningIn: `Widened to ${data.radiusKm} km`, donorsAlerted: e.donorsAlerted + data.alerted }
          : e
      )
    );
  } catch (err) {
    alert(err.response?.data?.message || 'Could not widen the radius');
  }
  };

  const declareEmergency = async (form) => {
    const { data } = await api.post('/emergencies', {
      bloodType: form.bloodType,
      unitsNeeded: Number(form.unitsNeeded),
      urgency: String(form.urgency || 'urgent').toLowerCase(),
      ...(form.notes && { notes: form.notes }),
    });
    const created = { ...mapEmergency(data.request, currentUser?.orgName), donorsAlerted: data.alerted };
    setEmergencies((prev) => [created, ...prev]);
    return created;
  };

  const updateEmergencyStatus = async (id, status) => {
    try {
      await api.patch(`/emergencies/${id}/close`, { fulfilled: status === 'FULFILLED' });
      setEmergencies((prev) => prev.map((e) => (e.id === id ? { ...e, status } : e)));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update the request');
    }
  };

const respondToEmergency = async (id, response, etaMinutes = '20 min') => {
  try {
    await api.post(`/emergencies/${id}/respond`, {
      response: response === 'ACCEPTED' ? 'accepted' : 'declined',
      ...(response === 'ACCEPTED' && { etaMinutes: parseInt(etaMinutes, 10) || 20 }),
    });
    setEmergencies((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              myResponse: response === 'ACCEPTED' ? 'accepted' : 'declined',
              myEta: response === 'ACCEPTED' ? etaMinutes : null,
            }
          : e
      )
    );
    return true;
  } catch (err) {
    alert(err.response?.data?.message || 'Could not send your response');
    return false;
  }
  };

  // Adjust stock units
const adjustStock = (bloodType, delta) => {
  const current = inventory.find((i) => i.type === bloodType)?.units ?? 0;
  if (delta < 0 && current === 0) return; // nothing to remove

  setInventory((prev) =>
    prev.map((item) => {
      if (item.type !== bloodType) return item;
      const newUnits = Math.max(0, item.units + delta);
      const newStatus =
        newUnits < item.lowThreshold ? 'LOW' : newUnits <= item.lowThreshold + 2 ? 'WATCH' : 'OK';
      return { ...item, units: newUnits, status: newStatus, lastChanged: 'Just now' };
    })
  );

  if (localStorage.getItem('token') && currentUser?.id) {
    // If the server rejects it, reload the real numbers instead of leaving the screen wrong
    api.patch('/inventory', { bloodType, change: delta }).catch(() => refreshInventory());
  }
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
