/**
 * PRAMAN Centralized API Client Service
 * Connects frontend to Express Backend (:5000) through Vite proxy (/api)
 * Automatically attaches JWT Bearer token and normalizes case-sensitivity.
 */

const API_BASE = '/api';

/**
 * Helper to safely extract response body and give meaningful error messages
 */
async function parseResponse(res) {
  const text = await res.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text || `Server error (Status ${res.status})` };
    }
  }

  if (!res.ok) {
    const errorMsg = data.error || data.message || 
      (res.status === 409 ? 'An account with this email already exists. Please sign in or use another email.' :
       res.status === 502 ? 'Backend service gateway error. Please ensure the server is running.' :
       `Request failed with HTTP status ${res.status}`);
    throw new Error(errorMsg);
  }
  return data;
}

/**
 * Helper to get authorization headers
 */
function getAuthHeaders(isJson = true) {
  const token = localStorage.getItem('praman_token') || localStorage.getItem('praman_auth_token');
  const headers = {};
  if (isJson) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Case-insensitive string normalizer helper
 */
export function normalizeString(str) {
  return (str || '').trim().toUpperCase();
}

export function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

export const api = {
  // ─── AUTHENTICATION ───
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: normalizeEmail(email),
        password: (password || '').trim()
      })
    });
    const data = await parseResponse(res);
    if (data.token) {
      localStorage.setItem('praman_token', data.token);
      localStorage.setItem('praman_auth_token', data.token);
    }
    return data;
  },

  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: userData.name?.trim(),
        email: normalizeEmail(userData.email),
        password: userData.password?.trim(),
        role: normalizeString(userData.role || 'BIDDER'),
        organization: userData.organization?.trim(),
        department: userData.department?.trim(),
        designation: userData.designation?.trim(),
        phone: userData.phone?.trim(),
      })
    });
    const data = await parseResponse(res);
    if (data.token) {
      localStorage.setItem('praman_token', data.token);
      localStorage.setItem('praman_auth_token', data.token);
    }
    return data;
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeaders()
      });
      if (!res.ok) return null;
      return await parseResponse(res);
    } catch (e) {
      return null;
    }
  },

  async verifyKyc(kycData) {
    const res = await fetch(`${API_BASE}/auth/kyc/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(kycData)
    });
    return await parseResponse(res);
  },

  // ─── TENDERS ───
  async getTenders(status = null) {
    const url = status ? `${API_BASE}/tenders?status=${status}` : `${API_BASE}/tenders`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await parseResponse(res);
    return data.tenders || [];
  },

  async createTender(tenderData) {
    const res = await fetch(`${API_BASE}/tenders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(tenderData)
    });
    return await parseResponse(res);
  },

  async generateAITenderDraft(draftPayload) {
    const res = await fetch(`${API_BASE}/tenders/ai-assist`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(draftPayload)
    });
    const data = await parseResponse(res);
    return data.draft || data;
  },

  async publishTender(tenderId) {
    const res = await fetch(`${API_BASE}/tenders/${tenderId}/publish`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getTenderEvaluations(tenderId) {
    const res = await fetch(`${API_BASE}/verification/tender/${tenderId}/evaluations`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  // ─── BIDDER DIRECTORY ───
  async getBidders() {
    try {
      const res = await fetch(`${API_BASE}/bidders`, {
        headers: getAuthHeaders()
      });
      const data = await parseResponse(res);
      return data.bidders || [];
    } catch (e) {
      console.warn('Could not fetch bidders:', e.message);
      return [];
    }
  },

  // ─── BIDS & SUBMISSIONS ───
  async getAllBids(tenderId = null) {
    const url = tenderId ? `${API_BASE}/bids?tenderId=${tenderId}` : `${API_BASE}/bids`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await parseResponse(res);
    return data.bids || data.submissions || [];
  },

  async getMyBids() {
    const res = await fetch(`${API_BASE}/bids/my-submissions`, {
      headers: getAuthHeaders()
    });
    const data = await parseResponse(res);
    return data.submissions || [];
  },

  async getBidsForTender(tenderId) {
    const res = await fetch(`${API_BASE}/bids/tender/${tenderId}`, {
      headers: getAuthHeaders()
    });
    const data = await parseResponse(res);
    return data.submissions || data.bids || [];
  },

  async submitBid(formDataOrJson) {
    const isFormData = formDataOrJson instanceof FormData;
    const res = await fetch(`${API_BASE}/bids/submit`, {
      method: 'POST',
      headers: getAuthHeaders(!isFormData),
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
    });
    return await parseResponse(res);
  },

  async resolveGstin(gstin) {
    if (!gstin) return null;
    const res = await fetch(`${API_BASE}/bids/resolve-gstin/${encodeURIComponent(gstin.trim())}`);
    return await parseResponse(res);
  },

  async verifyPan(pan, name = '', context = {}) {
    if (!pan) return null;
    const params = new URLSearchParams();
    if (name) params.append('name', name);
    if (context.city) params.append('city', context.city);
    if (context.state) params.append('state', context.state);
    if (context.udyam) params.append('udyam', context.udyam);
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE}/bids/verify-pan/${encodeURIComponent(pan.trim())}${query}`);
    return await parseResponse(res);
  },

  // ─── AI ASSISTANCE ───
  async scanDocument(file, claimedType = '', claimedId = '') {
    const formData = new FormData();
    formData.append('file', file);
    if (claimedType) formData.append('claimedType', claimedType);
    if (claimedId) formData.append('claimedId', claimedId);

    const res = await fetch(`${API_BASE}/ai/verify-document`, {
      method: 'POST',
      headers: getAuthHeaders(false), // multipart/form-data
      body: formData
    });
    return await parseResponse(res);
  },

  async parseTenderNit(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/ai/tender/parse-nit`, {
      method: 'POST',
      headers: getAuthHeaders(false), // multipart/form-data
      body: formData
    });
    return await parseResponse(res);
  },

  async preflightCheck(payload) {
    const res = await fetch(`${API_BASE}/ai/preflight`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return await parseResponse(res);
  },

  // ─── FORENSICS & COLLUSION ───
  async getCollusionAnalysis(tenderId) {
    try {
      const res = await fetch(`${API_BASE}/forensics/${tenderId}/collusion`, {
        headers: getAuthHeaders()
      });
      return await parseResponse(res);
    } catch (e) {
      console.warn('Backend collusion fetch error:', e.message);
      return null;
    }
  },

  async getForensicDashboard(tenderId) {
    try {
      const res = await fetch(`${API_BASE}/forensics/${tenderId}/dashboard`, {
        headers: getAuthHeaders()
      });
      return await parseResponse(res);
    } catch (e) {
      console.warn('Backend forensics dashboard fetch error:', e.message);
      return null;
    }
  },

  // ─── VERIFICATION & 3-PANE WORKSPACE ───
  async triggerVerification(bidId) {
    const res = await fetch(`${API_BASE}/verification/${bidId}/verify`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getEvidence(bidId) {
    const res = await fetch(`${API_BASE}/verification/${bidId}/evidence`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async submitOfficerDecision(bidId, decision, justification = '') {
    const res = await fetch(`${API_BASE}/verification/${bidId}/decision`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        decision: normalizeString(decision),
        officerJustification: justification?.trim()
      })
    });
    return await parseResponse(res);
  },

  // ─── AUDIT TRAIL ───
  async getAuditLedger() {
    const res = await fetch(`${API_BASE}/audit`, {
      headers: getAuthHeaders()
    });
    const data = await parseResponse(res);
    return data.ledger || data.blocks || [];
  },

  async verifyAuditChain() {
    const res = await fetch(`${API_BASE}/audit/verify`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  // ─── CRAC (Consignee Receipt and Acceptance Certificate) ───
  async submitCrac(data) {
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders(!isFormData);
    const res = await fetch(`${API_BASE}/crac/create`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return await parseResponse(res);
  },

  async updateCrac(cracId, data) {
    const isFormData = data instanceof FormData;
    const headers = getAuthHeaders(!isFormData);
    const res = await fetch(`${API_BASE}/crac/update/${cracId}`, {
      method: 'POST',
      headers,
      body: isFormData ? data : JSON.stringify(data)
    });
    return await parseResponse(res);
  },

  async getMyCracs() {
    const res = await fetch(`${API_BASE}/crac/my-cracs`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getPendingContractsForCrac() {
    const res = await fetch(`${API_BASE}/crac/pending-contracts`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getAllCracs() {
    const res = await fetch(`${API_BASE}/crac/all`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getCracForBid(bidId) {
    const res = await fetch(`${API_BASE}/crac/bid/${bidId}`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  }
};

export default api;
