import axios from 'axios';
import { mockStore } from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bloodbank_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Wrapper helper to execute API call with automatic offline/demo fallback
const callWithFallback = async (apiFn, mockFallbackFn) => {
  try {
    const res = await apiFn();
    return res;
  } catch (err) {
    // If backend is not deployed, unreachable, or returns 404 (static Vercel hosting)
    const isOffline =
      !err.response ||
      err.response.status === 404 ||
      err.code === 'ERR_NETWORK' ||
      err.code === 'ECONNABORTED';

    if (isOffline && mockFallbackFn) {
      console.info('[HemoSync] Cloud API offline or not configured. Using local responsive demo store.');
      return mockFallbackFn();
    }
    throw err;
  }
};

export const authAPI = {
  login: async ({ email, password }) => {
    return callWithFallback(
      () => api.post('/auth/login', { email, password }),
      () => {
        const users = mockStore.getUsers();
        const found = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );
        if (found) {
          const userCopy = { ...found };
          delete userCopy.password;
          return {
            data: {
              success: true,
              token: 'mock_demo_token_' + userCopy.id,
              user: userCopy,
            },
          };
        }
        const error = new Error('Invalid email or password');
        error.response = { data: { success: false, message: 'Invalid email or password. You can use the 1-click Demo buttons!' } };
        throw error;
      }
    );
  },

  register: async (userData) => {
    return callWithFallback(
      () => api.post('/auth/register', userData),
      () => {
        const users = mockStore.getUsers();
        const exists = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
        if (exists) {
          const error = new Error('User already exists with this email');
          error.response = { data: { success: false, message: 'User already exists with this email' } };
          throw error;
        }

        const newUser = {
          id: 'u_' + Date.now(),
          name: userData.name,
          email: userData.email,
          role: userData.role || 'donor',
          phone: userData.phone || '',
          address: userData.address || '',
          organizationName: userData.organizationName || '',
          bloodGroup: userData.bloodGroup || '',
        };

        users.push({ ...newUser, password: userData.password });
        mockStore.saveUsers(users);

        return {
          data: {
            success: true,
            token: 'mock_demo_token_' + newUser.id,
            user: newUser,
          },
        };
      }
    );
  },

  getMe: async () => {
    return callWithFallback(
      () => api.get('/auth/me'),
      () => {
        const saved = localStorage.getItem('bloodbank_user');
        if (saved) {
          return { data: { success: true, user: JSON.parse(saved) } };
        }
        const error = new Error('Unauthorized');
        error.response = { status: 401 };
        throw error;
      }
    );
  },
};

export const inventoryAPI = {
  getInventory: async () => {
    return callWithFallback(
      () => api.get('/inventory'),
      () => {
        const stocks = mockStore.getStocks();
        const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);
        const lowStockAlerts = stocks.filter((s) => s.units <= s.minimumThreshold);
        return {
          data: {
            success: true,
            totalUnits,
            lowStockCount: lowStockAlerts.length,
            stocks,
            lowStockAlerts,
          },
        };
      }
    );
  },

  getCompatibility: async () => {
    return callWithFallback(
      () => api.get('/inventory/compatibility'),
      () => ({
        data: {
          success: true,
          compatibility: {},
        },
      })
    );
  },

  updateStock: async (bloodGroup, data) => {
    return callWithFallback(
      () => api.put(`/inventory/${encodeURIComponent(bloodGroup)}`, data),
      () => {
        const stocks = mockStore.getStocks();
        const stock = stocks.find((s) => s.bloodGroup === bloodGroup);
        if (stock) {
          if (data.units !== undefined) stock.units = Math.max(0, Number(data.units));
          if (data.change !== undefined) stock.units = Math.max(0, stock.units + Number(data.change));
          if (data.minimumThreshold !== undefined) stock.minimumThreshold = Number(data.minimumThreshold);
          mockStore.saveStocks(stocks);
        }
        return { data: { success: true, stock } };
      }
    );
  },
};

export const donorAPI = {
  getDonors: async (params) => {
    return callWithFallback(
      () => api.get('/donors', { params }),
      () => {
        let donors = mockStore.getDonors();
        if (params?.bloodGroup) {
          donors = donors.filter((d) => d.bloodGroup === params.bloodGroup);
        }
        if (params?.search) {
          const q = params.search.toLowerCase();
          donors = donors.filter(
            (d) =>
              d.name.toLowerCase().includes(q) ||
              d.phone.includes(q) ||
              (d.city && d.city.toLowerCase().includes(q))
          );
        }
        return { data: { success: true, count: donors.length, donors } };
      }
    );
  },

  getDonorById: async (id) => {
    return callWithFallback(
      () => api.get(`/donors/${id}`),
      () => {
        const donor = mockStore.getDonors().find((d) => d._id === id);
        return { data: { success: true, donor, donations: [] } };
      }
    );
  },

  createDonor: async (data) => {
    return callWithFallback(
      () => api.post('/donors', data),
      () => {
        const donors = mockStore.getDonors();
        const newDonor = {
          _id: 'd_' + Date.now(),
          ...data,
          status: 'Eligible',
          totalDonations: 0,
          lastDonationDate: null,
          createdAt: new Date().toISOString(),
        };
        donors.unshift(newDonor);
        mockStore.saveDonors(donors);
        return { data: { success: true, message: 'Donor registered successfully', donor: newDonor } };
      }
    );
  },

  recordDonation: async (donorId, data) => {
    return callWithFallback(
      () => api.post(`/donors/${donorId}/donate`, data),
      () => {
        const donors = mockStore.getDonors();
        const donor = donors.find((d) => d._id === donorId);
        if (!donor) throw new Error('Donor not found');

        const units = Number(data.units || 1);
        donor.totalDonations = (donor.totalDonations || 0) + units;
        donor.lastDonationDate = new Date().toISOString();
        mockStore.saveDonors(donors);

        // Increment inventory
        const stocks = mockStore.getStocks();
        const stock = stocks.find((s) => s.bloodGroup === donor.bloodGroup);
        if (stock) {
          stock.units += units;
          mockStore.saveStocks(stocks);
        }

        // Add donation
        const donations = mockStore.getDonations();
        const newDon = {
          _id: 'don_' + Date.now(),
          donor: donor._id,
          donorName: donor.name,
          bloodGroup: donor.bloodGroup,
          units,
          donationDate: new Date().toISOString(),
          hemoglobinLevel: data.hemoglobinLevel || 13.5,
          bloodPressure: data.bloodPressure || '120/80',
          status: 'Completed',
        };
        donations.unshift(newDon);
        mockStore.saveDonations(donations);

        return {
          data: {
            success: true,
            message: `Successfully logged donation of ${units} unit(s) of ${donor.bloodGroup}. Inventory updated.`,
            donation: newDon,
          },
        };
      }
    );
  },

  getAllDonations: async () => {
    return callWithFallback(
      () => api.get('/donors/donations/all'),
      () => ({ data: { success: true, donations: mockStore.getDonations() } })
    );
  },
};

export const requestAPI = {
  getRequests: async (params) => {
    return callWithFallback(
      () => api.get('/requests', { params }),
      () => {
        let requests = mockStore.getRequests();
        if (params?.status) requests = requests.filter((r) => r.status === params.status);
        if (params?.urgency) requests = requests.filter((r) => r.urgency === params.urgency);
        return { data: { success: true, count: requests.length, requests } };
      }
    );
  },

  createRequest: async (data) => {
    return callWithFallback(
      () => api.post('/requests', data),
      () => {
        const requests = mockStore.getRequests();
        const newReq = {
          _id: 'r_' + Date.now(),
          ...data,
          status: 'Pending',
          createdAt: new Date().toISOString(),
        };
        requests.unshift(newReq);
        mockStore.saveRequests(requests);
        return { data: { success: true, message: 'Request submitted successfully', request: newReq } };
      }
    );
  },

  updateStatus: async (id, data) => {
    return callWithFallback(
      () => api.put(`/requests/${id}/status`, data),
      () => {
        const requests = mockStore.getRequests();
        const req = requests.find((r) => r._id === id);
        if (!req) throw new Error('Request not found');

        const prevStatus = req.status;
        const newStatus = data.status;

        // Stock deduction on approval
        if (newStatus === 'Approved' && prevStatus !== 'Approved') {
          const stocks = mockStore.getStocks();
          const stock = stocks.find((s) => s.bloodGroup === req.bloodGroup);
          if (!stock || stock.units < req.unitsRequested) {
            const err = new Error('Insufficient stock');
            err.response = {
              data: {
                success: false,
                message: `Insufficient stock! Requested ${req.unitsRequested} units of ${req.bloodGroup}, but only ${stock ? stock.units : 0} are available.`,
              },
            };
            throw err;
          }
          stock.units -= req.unitsRequested;
          mockStore.saveStocks(stocks);
        }

        req.status = newStatus;
        if (data.adminNotes) req.adminNotes = data.adminNotes;
        mockStore.saveRequests(requests);

        return { data: { success: true, message: `Status updated to ${newStatus}`, request: req } };
      }
    );
  },
};

export const analyticsAPI = {
  getDashboardMetrics: async () => {
    return callWithFallback(
      () => api.get('/analytics/dashboard'),
      () => {
        const stocks = mockStore.getStocks();
        const donors = mockStore.getDonors();
        const requests = mockStore.getRequests();
        const donations = mockStore.getDonations();

        const totalUnits = stocks.reduce((acc, curr) => acc + curr.units, 0);
        const pendingRequests = requests.filter((r) => r.status === 'Pending').length;
        const criticalRequests = requests.filter(
          (r) => r.status === 'Pending' && (r.urgency === 'Urgent' || r.urgency === 'Critical')
        ).length;
        const fulfilledRequests = requests.filter((r) => r.status === 'Fulfilled').length;

        const inventoryData = stocks.map((item) => ({
          group: item.bloodGroup,
          units: item.units,
          threshold: item.minimumThreshold,
          isLow: item.units <= item.minimumThreshold,
        }));

        return {
          data: {
            success: true,
            metrics: {
              totalUnits,
              totalDonors: donors.length,
              pendingRequests,
              criticalRequests,
              fulfilledRequests,
            },
            inventoryData,
            recentDonations: donations.slice(0, 5),
            recentRequests: requests.slice(0, 5),
          },
        };
      }
    );
  },
};

export default api;
