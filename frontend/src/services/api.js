const BASE_URL = 'http://127.0.0.1:8000/api/v1';

// MOCK DATA FOR DEMO MODE
const mockProgress = {
  patient_id: 1,
  summary: { total_sessions: 24, average_score: 92.4, improvement: 6.3 },
  trends: [
    { date: new Date(Date.now() - 6 * 86400000).toISOString(), score: 85 },
    { date: new Date(Date.now() - 5 * 86400000).toISOString(), score: 88 },
    { date: new Date(Date.now() - 4 * 86400000).toISOString(), score: 86 },
    { date: new Date(Date.now() - 3 * 86400000).toISOString(), score: 92 },
    { date: new Date(Date.now() - 2 * 86400000).toISOString(), score: 89 },
    { date: new Date(Date.now() - 1 * 86400000).toISOString(), score: 94 },
    { date: new Date().toISOString(), score: 95 }
  ]
};

async function fetchWithAuth(endpoint, options = {}) {
  let token = localStorage.getItem('rehab_ai_token');
  if (token === 'undefined' || token === 'null' || !token) {
    token = null;
    localStorage.removeItem('rehab_ai_token');
  }

  // Auth endpoints (login/register) must ALWAYS hit the backend directly without requiring a token
  const isAuthEndpoint = endpoint.startsWith('/auth/');

  // For non-auth endpoints: If explicit demo mode ('demo-token'), return mock data
  if (!isAuthEndpoint && token === 'demo-token') {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint.includes('/progress')) resolve(mockProgress);
        else if (endpoint.includes('/sessions') && options.method === 'POST') resolve({ id: 999 });
        else resolve({ success: true });
      }, 300);
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token && token !== 'demo-token') {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('rehab_ai_token');
      localStorage.removeItem('rehab_ai_user');
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (e) {
        // Not JSON
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err) {
    // If offline / backend not reached on non-auth GET endpoint, fallback gracefully
    if (!isAuthEndpoint && options.method !== 'POST') {
      if (endpoint.includes('/progress')) return mockProgress;
    }
    throw err;
  }
}


export const api = {
  // Auth
  patientLogin: (data) => fetchWithAuth('/auth/patient/login', { method: 'POST', body: JSON.stringify(data) }),
  patientRegister: (data) => fetchWithAuth('/auth/patient/register', { method: 'POST', body: JSON.stringify(data) }),
  doctorLogin: (data) => fetchWithAuth('/auth/doctor/login', { method: 'POST', body: JSON.stringify(data) }),
  doctorRegister: (data) => fetchWithAuth('/auth/doctor/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me'),

  // Doctors & Directory
  getDoctorsList: () => fetchWithAuth('/doctors'),
  getDoctorPatients: () => fetchWithAuth('/doctors/me/patients'),
  getDoctorPatientHistory: (patientId) => fetchWithAuth(`/doctors/me/patients/${patientId}/history`),
  getDoctorPatientProgress: (patientId) => fetchWithAuth(`/doctors/me/patients/${patientId}/progress`),

  // Authorizations (Doctor-Patient Connection)
  getMyAuthorizations: () => fetchWithAuth('/authorizations/me'),
  requestDoctorAuthorization: (doctorId) => fetchWithAuth('/authorizations', { method: 'POST', body: JSON.stringify({ doctor_id: doctorId }) }),
  approveAuthorization: (authId) => fetchWithAuth(`/authorizations/${authId}/approve`, { method: 'PATCH' }),
  rejectAuthorization: (authId) => fetchWithAuth(`/authorizations/${authId}/reject`, { method: 'PATCH' }),
  revokeAuthorization: (authId) => fetchWithAuth(`/authorizations/${authId}/revoke`, { method: 'PATCH' }),

  // Dashboard / Progress with graceful fallback
  getPatientProgress: async () => {
    try {
      return await fetchWithAuth('/patients/me/progress');
    } catch (err) {
      return mockProgress;
    }
  },

  // Sessions
  startSession: (exerciseId) => fetchWithAuth('/sessions', { method: 'POST', body: JSON.stringify({ exercise_id: exerciseId }) }),
  submitSessionResult: (sessionId, resultData) => fetchWithAuth(`/sessions/${sessionId}/results`, { method: 'POST', body: JSON.stringify(resultData) }),
  completeSession: (sessionId) => fetchWithAuth(`/sessions/${sessionId}/complete`, { method: 'PATCH' }),
};

