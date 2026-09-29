import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight,
  Shield,
  Key
} from 'lucide-react';
import { api } from '../services/api';

export function AuthPage({ onLoginSuccess }) {
  // 'login' or 'signup'
  const [authMode, setAuthMode] = useState('login');
  
  // Selected role: 'OFFICER' or 'BIDDER'
  const [selectedRole, setSelectedRole] = useState('OFFICER');

  // Form fields
  const [email, setEmail] = useState('officer@praman.test');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [department, setDepartment] = useState('Ministry of Heavy Industries');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 1-Click Demo Profiles
  const fillDemoAccount = (role) => {
    setSelectedRole(role);
    setAuthMode('login');
    setErrorMessage('');
    setSuccessMessage('');
    if (role === 'OFFICER') {
      setEmail('officer@praman.test');
      setPassword('password123');
    } else {
      setEmail('bidder@praman.test');
      setPassword('password123');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    if (!email || !password) {
      setErrorMessage('Please enter both email address and password.');
      setIsLoading(false);
      return;
    }

    if (authMode === 'signup') {
      if (!name.trim()) {
        setErrorMessage('Please enter your full legal name.');
        setIsLoading(false);
        return;
      }
      if (!organisation.trim()) {
        setErrorMessage('Please specify your organization or government department.');
        setIsLoading(false);
        return;
      }
    }

    try {
      let data;
      if (authMode === 'login') {
        data = await api.login(email, password);
      } else {
        data = await api.register({
          name: name.trim(),
          email: email.trim(),
          password: password.trim(),
          role: selectedRole,
          organization: organisation.trim(),
          department: selectedRole === 'OFFICER' ? department : undefined,
        });
        setSuccessMessage('Registration successful! Signing you into the portal...');
      }

      setTimeout(() => {
        const userObj = data.user || {
          name: name || (selectedRole === 'OFFICER' ? 'Dr. Rajesh Verma' : 'Vikram Solar Enterprises'),
          email: email.trim().toLowerCase(),
          role: selectedRole,
          organization: organisation || (selectedRole === 'OFFICER' ? 'Ministry of Heavy Industries' : 'Vikram Solar Green Energy Pvt Ltd')
        };
        onLoginSuccess(userObj, selectedRole);
      }, 300);

    } catch (err) {
      console.error('Auth error:', err.message);
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      
      {/* Brand Header */}
      <div className="auth-header-brand">
        <div className="auth-emblem-wrap">
          प्र
        </div>
        <h1 className="auth-title">PRAMAN</h1>
        <p className="auth-subtitle">
          Next-Gen AI Statutory Verification, Forensics & Cartel Detection Engine<br />
          Government e-Marketplace (GeM) & CPPP Architecture
        </p>
      </div>

      {/* Main Form Card */}
      <div className="auth-card-container">
        
        {/* Mode Tabs: Sign In vs Register */}
        <div className="auth-tabs-row">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            className={`auth-tab-btn ${authMode === 'login' ? 'active' : ''}`}
          >
            Sign In to Portal
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            className={`auth-tab-btn ${authMode === 'signup' ? 'active' : ''}`}
          >
            Register Portal Account
          </button>
        </div>

        {/* Operating Role Selector */}
        <div style={{ marginBottom: 14 }}>
          <label className="auth-label">SELECT OPERATING ROLE</label>
          <div className="auth-role-grid">
            <button
              type="button"
              onClick={() => setSelectedRole('OFFICER')}
              className={`auth-role-card ${selectedRole === 'OFFICER' ? 'active' : ''}`}
            >
              <ShieldCheck style={{ width: 18, height: 18, color: selectedRole === 'OFFICER' ? '#0f172a' : '#94a3b8', flexShrink: 0 }} />
              <div>
                <div className="auth-role-title">Procurement Officer</div>
                <div className="auth-role-sub">Evaluation & NIT Gating</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('BIDDER')}
              className={`auth-role-card ${selectedRole === 'BIDDER' ? 'active' : ''}`}
            >
              <Building style={{ width: 18, height: 18, color: selectedRole === 'BIDDER' ? '#0f172a' : '#94a3b8', flexShrink: 0 }} />
              <div>
                <div className="auth-role-title">Vendor / Bidder</div>
                <div className="auth-role-sub">Pre-Flight & Bid Ingestion</div>
              </div>
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div style={{
            padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3',
            borderRadius: 4, color: '#be123c', fontSize: '0.74rem', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{
            padding: '8px 12px', background: '#ecfdf5', border: '1px solid #a7f3d0',
            borderRadius: 4, color: '#047857', fontSize: '0.74rem', marginBottom: 12,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            <CheckCircle style={{ width: 14, height: 14, flexShrink: 0 }} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit}>
          {authMode === 'signup' && (
            <>
              <div className="auth-form-group">
                <label className="auth-label">Full Legal Name</label>
                <div className="auth-input-wrap">
                  <User className="auth-input-icon" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={selectedRole === 'OFFICER' ? 'Dr. Rajesh Verma' : 'Vikram Sharma'}
                    className="auth-input"
                  />
                </div>
              </div>

              <div className="auth-form-group">
                <label className="auth-label">
                  {selectedRole === 'OFFICER' ? 'Government Ministry / PSU' : 'Company / Business Legal Name'}
                </label>
                <div className="auth-input-wrap">
                  <Building className="auth-input-icon" />
                  <input
                    type="text"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    placeholder={selectedRole === 'OFFICER' ? 'Ministry of Heavy Industries' : 'Vikram Solar Green Energy Pvt Ltd'}
                    className="auth-input"
                  />
                </div>
              </div>
            </>
          )}

          <div className="auth-form-group">
            <label className="auth-label">Official Email Address</label>
            <div className="auth-input-wrap">
              <Mail className="auth-input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={selectedRole === 'OFFICER' ? 'officer@praman.test' : 'bidder@praman.test'}
                className="auth-input"
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Password</label>
            <div className="auth-input-wrap">
              <Lock className="auth-input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="auth-input"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 10, background: 'none',
                  border: 'none', color: '#94a3b8', cursor: 'pointer'
                }}
              >
                {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-btn-primary"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>
                  {authMode === 'login' 
                    ? `Sign In as ${selectedRole === 'OFFICER' ? 'Procurement Officer' : 'Bidder'}` 
                    : `Complete ${selectedRole === 'OFFICER' ? 'Officer' : 'Bidder'} Registration`}
                </span>
                <ArrowRight style={{ width: 14, height: 14 }} />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Profiles */}
        <div className="auth-demo-section">
          <span className="auth-demo-label">Instant 1-Click Demo Profiles</span>
          <div className="auth-demo-grid">
            <button
              type="button"
              onClick={() => fillDemoAccount('OFFICER')}
              className="auth-demo-btn"
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>Officer Demo</div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Dr. Rajesh Verma (Govt)</div>
              </div>
              <ArrowRight style={{ width: 12, height: 12, color: '#94a3b8' }} />
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('BIDDER')}
              className="auth-demo-btn"
            >
              <div>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#0f172a' }}>Bidder Demo</div>
                <div style={{ fontSize: '0.64rem', color: '#64748b' }}>Vikram Solar Enterprises</div>
              </div>
              <ArrowRight style={{ width: 12, height: 12, color: '#94a3b8' }} />
            </button>
          </div>
        </div>

      </div>

      {/* Security Footer */}
      <div className="auth-footer-trust">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Shield style={{ width: 12, height: 12, color: '#16a34a' }} />
          DSC Token Valid
        </span>
        <span>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Lock style={{ width: 12, height: 12, color: '#2563eb' }} />
          SHA-256 Cryptographic Ledger
        </span>
        <span>•</span>
        <span>GeM SIH PS 26100</span>
      </div>

    </div>
  );
}

export default AuthPage;
