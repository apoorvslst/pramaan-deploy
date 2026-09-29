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

  async submitBid(formDataOrJson) {
    const isFormData = formDataOrJson instanceof FormData;
    const res = await fetch(`${API_BASE}/bids/submit`, {
      method: 'POST',
      headers: getAuthHeaders(!isFormData),
      body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
    });
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
  }
};

export default api;
