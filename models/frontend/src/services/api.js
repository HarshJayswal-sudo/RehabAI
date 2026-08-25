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
  const token = localStorage.getItem('rehab_ai_token');
  
  // HACKATHON DEMO BYPASS: If no token or demo token, use mock data so the app works without a backend/auth
  if (!token || token === 'demo-token') {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (endpoint.includes('/progress')) resolve(mockProgress);
        else if (endpoint.includes('/sessions') && options.method === 'POST') resolve({ id: 999 });
        else resolve({ success: true });
      }, 500); // simulate network delay
    });
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized globally (e.g., clear token and reload to trigger redirect)
    localStorage.removeItem('rehab_ai_token');
    localStorage.removeItem('rehab_ai_user');
    window.location.href = '/'; 
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

  return response.json();
}

export const api = {
  // Auth
  patientLogin: (data) => fetchWithAuth('/auth/patient/login', { method: 'POST', body: JSON.stringify(data) }),
  patientRegister: (data) => fetchWithAuth('/auth/patient/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => fetchWithAuth('/auth/me'),

  // Dashboard / Progress
  getPatientProgress: () => fetchWithAuth('/patients/me/progress'),

  // Sessions
  startSession: (exerciseId) => fetchWithAuth('/sessions', { method: 'POST', body: JSON.stringify({ exercise_id: exerciseId }) }),
  submitSessionResult: (sessionId, resultData) => fetchWithAuth(`/sessions/${sessionId}/results`, { method: 'POST', body: JSON.stringify(resultData) }),
  completeSession: (sessionId) => fetchWithAuth(`/sessions/${sessionId}/complete`, { method: 'PATCH' }),
};
