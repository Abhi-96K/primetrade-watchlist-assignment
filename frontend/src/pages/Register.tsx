import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface RegisterProps {
  onNavigateToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onNavigateToLogin }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.data.token, data.data.user);
        showToast('Wallet registered successfully! Logged in.', 'success');
      } else {
        const errorMsg = data.errors ? data.errors[0].message : (data.message || 'Registration failed');
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      showToast('Network error. Is the backend running?', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="brand-symbol">PT</div>
          </div>
          <h2 className="auth-title">Register Wallet</h2>
          <p className="auth-subtitle">Join the leading Web3 trading intelligence hub</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">TRADER HANDLE (NAME)</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="e.g., WhaleTrader"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">EMAIL ADDRESS</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="trader@primetrade.ai"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">PASSWORD</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'GENERATING SIGNATURES...' : 'GENERATE WALLET ACCOUNT'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToLogin(); }}>
            Access platform
          </a>
        </div>
      </div>
    </div>
  );
};
