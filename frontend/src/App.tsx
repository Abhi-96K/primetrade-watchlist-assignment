import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<'login' | 'register'>('login');

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
        backgroundColor: 'hsl(225, 25%, 6%)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          background: 'linear-gradient(135deg, hsl(248, 85%, 60%) 0%, hsl(180, 100%, 48%) 100%)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          color: 'hsl(225, 25%, 6%)',
          boxShadow: '0 0 20px hsl(180, 100%, 48%)',
        }}>PT</div>
        <p style={{ fontFamily: 'Outfit, sans-serif', color: 'hsl(215, 20%, 72%)', fontSize: '0.9rem' }}>
          DECRYPTING PORTFOLIO SECURELY...
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Dashboard />;
  }

  if (view === 'register') {
    return <Register onNavigateToLogin={() => setView('login')} />;
  }

  return <Login onNavigateToRegister={() => setView('register')} />;
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  );
}
