// Mock data store with LocalStorage persistence for standalone frontend / demo preview
const STORAGE_PREFIX = 'hemosync_';

const defaultUsers = [
  {
    id: 'u_admin',
    name: 'System Administrator',
    email: 'admin@bloodbank.org',
    password: 'admin123',
    role: 'admin',
    phone: '+1 555-0199',
    address: 'Central Health HQ, Room 401',
  },
  {
    id: 'u_hosp',
    name: 'Dr. Sarah Mitchell',
    email: 'hospital@citycare.org',
    password: 'hospital123',
    role: 'hospital',
    organizationName: 'City Memorial Hospital',
    phone: '+1 555-0144',
    address: '742 Evergreen Medical Park, Sector 4',
  },
  {
    id: 'u_donor',
    name: 'John Doe',
    email: 'donor@example.com',
    password: 'donor123',
    role: 'donor',
    phone: '+1 555-0188',
    bloodGroup: 'O+',
    address: '42 Maple Street, Westview',
  },
];

const defaultStocks = [
  { bloodGroup: 'A+', units: 28, minimumThreshold: 10 },
  { bloodGroup: 'A-', units: 9, minimumThreshold: 10 },
  { bloodGroup: 'B+', units: 35, minimumThreshold: 10 },
  { bloodGroup: 'B-', units: 7, minimumThreshold: 10 },
  { bloodGroup: 'AB+', units: 14, minimumThreshold: 10 },
  { bloodGroup: 'AB-', units: 4, minimumThreshold: 8 },
  { bloodGroup: 'O+', units: 42, minimumThreshold: 15 },
  { bloodGroup: 'O-', units: 5, minimumThreshold: 12 },
];

const defaultDonors = [
  {
    _id: 'd_1',
    name: 'Michael Vance',
    email: 'michael.v@example.com',
    phone: '+1 555-0101',
    bloodGroup: 'O-',
    age: 29,
    gender: 'Male',
    weight: 74,
    city: 'Metro City',
    status: 'Eligible',
    totalDonations: 3,
    lastDonationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd_2',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    phone: '+1 555-0102',
    bloodGroup: 'A+',
    age: 34,
    gender: 'Female',
    weight: 62,
    city: 'Riverdale',
    status: 'Eligible',
    totalDonations: 5,
    lastDonationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd_3',
    name: 'David Chen',
    email: 'david.c@example.com',
    phone: '+1 555-0103',
    bloodGroup: 'B+',
    age: 41,
    gender: 'Male',
    weight: 80,
    city: 'Oakridge',
    status: 'Eligible',
    totalDonations: 2,
    lastDonationDate: new Date(Date.now() - 110 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'd_4',
    name: 'Priya Sharma',
    email: 'priya.s@example.com',
    phone: '+1 555-0104',
    bloodGroup: 'AB+',
    age: 26,
    gender: 'Female',
    weight: 58,
    city: 'Metro City',
    status: 'Eligible',
    totalDonations: 1,
    lastDonationDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultRequests = [
  {
    _id: 'r_1',
    requesterName: 'Dr. Sarah Mitchell',
    hospitalName: 'City Memorial Hospital',
    patientName: 'Robert Langdon',
    bloodGroup: 'O-',
    unitsRequested: 2,
    urgency: 'Critical',
    status: 'Pending',
    reason: 'Trauma ICU emergency surgery',
    contactPhone: '+1 555-0144',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'r_2',
    requesterName: 'Dr. Sarah Mitchell',
    hospitalName: 'City Memorial Hospital',
    patientName: 'Emma Watson',
    bloodGroup: 'B+',
    unitsRequested: 3,
    urgency: 'Urgent',
    status: 'Pending',
    reason: 'Orthopedic surgical operation',
    contactPhone: '+1 555-0144',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'r_3',
    requesterName: 'Dr. Sarah Mitchell',
    hospitalName: 'City Memorial Hospital',
    patientName: 'James Stewart',
    bloodGroup: 'A+',
    unitsRequested: 1,
    urgency: 'Normal',
    status: 'Approved',
    reason: 'Anemia treatment',
    contactPhone: '+1 555-0144',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

const defaultDonations = [
  {
    _id: 'don_1',
    donorName: 'Michael Vance',
    bloodGroup: 'O-',
    units: 1,
    donationDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    hemoglobinLevel: 14.2,
    bloodPressure: '120/80',
    status: 'Completed',
  },
  {
    _id: 'don_2',
    donorName: 'Elena Rostova',
    bloodGroup: 'A+',
    units: 1,
    donationDate: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(),
    hemoglobinLevel: 13.8,
    bloodPressure: '118/76',
    status: 'Completed',
  },
];

// Helper to get or initialize LocalStorage item
const getStored = (key, fallback) => {
  try {
    const data = localStorage.getItem(STORAGE_PREFIX + key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

const setStored = (key, val) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
  } catch (e) {
    console.warn(e);
  }
};

export const mockStore = {
  getUsers: () => getStored('users', defaultUsers),
  saveUsers: (users) => setStored('users', users),

  getStocks: () => getStored('stocks', defaultStocks),
  saveStocks: (stocks) => setStored('stocks', stocks),

  getDonors: () => getStored('donors', defaultDonors),
  saveDonors: (donors) => setStored('donors', donors),

  getRequests: () => getStored('requests', defaultRequests),
  saveRequests: (reqs) => setStored('requests', reqs),

  getDonations: () => getStored('donations', defaultDonations),
  saveDonations: (dons) => setStored('donations', dons),
};
