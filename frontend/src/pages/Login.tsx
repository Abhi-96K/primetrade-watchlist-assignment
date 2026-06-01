import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface LoginProps {
  onNavigateToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5001/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.data.token, data.data.user);
        showToast(`Welcome back, ${data.data.user.name || 'Trader'}!`, 'success');
      } else {
        const errorMsg = data.message || 'Login failed';
        showToast(errorMsg, 'error');
      }
    } catch (error) {
      showToast('Network error. Is the backend running?', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrefill = (type: 'user' | 'admin') => {
    if (type === 'user') {
      setEmail('user@primetrade.ai');
      setPassword('password123');
      showToast('Prefilled standard trader credentials', 'success');
    } else {
      setEmail('admin@primetrade.ai');
      setPassword('password123');
      showToast('Prefilled systems architect admin credentials', 'success');
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="brand-symbol">PT</div>
          </div>
          <h2 className="auth-title">Primetrade.ai</h2>
          <p className="auth-subtitle">Trading intelligence & portfolio tracking</p>
        </div>

        <form onSubmit={handleSubmit}>
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
              placeholder="••••••••"
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
            {isSubmitting ? 'SECUREING SESSION...' : 'ACCESS PLATFORM'}
          </button>
        </form>

        <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800 }}>DEMO PRE-FILLS</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--glass-border)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              onClick={() => handlePrefill('user')}
              className="btn btn-secondary btn-sm"
              disabled={isSubmitting}
            >
              👤 Trader Acc
            </button>
            <button
              onClick={() => handlePrefill('admin')}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: 'hsla(350, 95%, 60%, 0.25)' }}
              disabled={isSubmitting}
            >
              🛡️ Admin Acc
            </button>
          </div>
        </div>

        <div className="auth-footer">
          Don't have an account?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); onNavigateToRegister(); }}>
            Register new wallet/account
          </a>
        </div>
      </div>
    </div>
  );
};
