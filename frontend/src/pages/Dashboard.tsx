import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  note: string | null;
  createdAt: string;
}

interface AdminStats {
  totalUsers: number;
  totalItems: number;
  totalPortfolioValue: number;
  users: Array<{
    id: string;
    email: string;
    name: string | null;
    role: string;
    createdAt: string;
    _count: {
      watchlist: number;
    };
  }>;
  recentWatchlist: Array<{
    id: string;
    symbol: string;
    name: string;
    amount: number;
    purchasePrice: number;
    createdAt: string;
    user: {
      email: string;
      name: string | null;
    };
  }>;
}

export const Dashboard: React.FC = () => {
  const { user, token, logout, isAdmin } = useAuth();
  const { showToast } = useToast();

  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<WatchlistItem | null>(null);
  const [formSymbol, setFormSymbol] = useState('');
  const [formName, setFormName] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formNote, setFormNote] = useState('');

  // Fetch standard user watchlist
  const fetchWatchlist = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5001/api/v1/watchlist', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setWatchlist(data.data);
      } else {
        showToast(data.message || 'Failed to fetch watchlist', 'error');
      }
    } catch (err) {
      showToast('Error connecting to backend server', 'error');
    }
  }, [token, showToast]);

  // Fetch admin intelligence stats
  const fetchAdminStats = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const response = await fetch('http://localhost:5001/api/v1/watchlist/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setAdminStats(data.data);
      } else {
        showToast(data.message || 'Failed to fetch admin stats', 'error');
      }
    } catch (err) {
      showToast('Error loading platform metrics', 'error');
    }
  }, [isAdmin, token, showToast]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchWatchlist(), fetchAdminStats()]);
    setIsLoading(false);
  }, [fetchWatchlist, fetchAdminStats]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Total Portfolio Metrics
  const totalWatchlistValue = watchlist.reduce((acc, curr) => acc + (curr.amount * curr.purchasePrice), 0);
  const totalAssetCount = watchlist.length;

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormSymbol('');
    setFormName('');
    setFormAmount('');
    setFormPrice('');
    setFormNote('');
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (item: WatchlistItem) => {
    setEditingItem(item);
    setFormSymbol(item.symbol);
    setFormName(item.name);
    setFormAmount(item.amount.toString());
    setFormPrice(item.purchasePrice.toString());
    setFormNote(item.note || '');
    setIsModalOpen(true);
  };

  // Handle Form Submission (Add or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formSymbol || !formName || !formAmount || !formPrice) {
      showToast('Please fill out all required fields', 'error');
      return;
    }

    const payload = {
      symbol: formSymbol.toUpperCase().trim(),
      name: formName.trim(),
      amount: parseFloat(formAmount),
      purchasePrice: parseFloat(formPrice),
      note: formNote.trim() || null,
    };

    if (isNaN(payload.amount) || payload.amount <= 0) {
      showToast('Amount must be a positive number', 'error');
      return;
    }

    if (isNaN(payload.purchasePrice) || payload.purchasePrice < 0) {
      showToast('Purchase price must be positive', 'error');
      return;
    }

    setIsLoading(true);
    try {
      let response;
      if (editingItem) {
        // PUT UPDATE
        response = await fetch(`http://localhost:5001/api/v1/watchlist/${editingItem.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        // POST CREATE
        response = await fetch('http://localhost:5001/api/v1/watchlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      const data = await response.json();
      if (response.ok && data.success) {
        showToast(editingItem ? 'Watchlist item updated!' : 'Asset added to Watchlist!', 'success');
        setIsModalOpen(false);
        // Refresh local data & global admin panel if admin
        await loadAllData();
      } else {
        showToast(data.message || 'Operation failed', 'error');
      }
    } catch (err) {
      showToast('Network error during operation', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Action
  const handleDeleteItem = async (id: string, symbol: string) => {
    if (!window.confirm(`Are you sure you want to remove ${symbol} from your watchlist?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/v1/watchlist/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast(`${symbol} removed from watchlist`, 'success');
        await loadAllData();
      } else {
        showToast(data.message || 'Failed to delete asset', 'error');
      }
    } catch (err) {
      showToast('Network error while deleting asset', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin User Role Management Action
  const handleToggleUserRole = async (targetUserId: string, currentRole: string) => {
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    const confirmMessage = currentRole === 'ADMIN'
      ? 'Are you sure you want to demote this Admin back to a standard User?'
      : 'Are you sure you want to promote this User to an Admin?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/api/v1/watchlist/admin/users/${targetUserId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        showToast(`User role successfully changed to ${newRole}!`, 'success');
        await loadAllData();
      } else {
        showToast(data.message || 'Failed to update user role', 'error');
      }
    } catch (err) {
      showToast('Network error while modifying user role', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper formatting utility
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 4,
    }).format(value);
  };

  return (
    <div className="app-container">
      {/* Navbar Component */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-symbol">PT</div>
          <span>Primetrade.ai</span>
        </div>
        <div className="nav-user">
          <div className="user-badge">
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-emerald)',
                boxShadow: '0 0 8px var(--accent-emerald)',
              }}
            ></span>
            <span>{user?.name || user?.email}</span>
            <span className={`role-tag ${isAdmin ? 'admin' : 'user'}`}>
              {user?.role}
            </span>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-sm">
            DISCONNECT
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        <div className="dashboard-header">
          <div className="dashboard-title">
            <h1>Trading Intelligence Dashboard</h1>
            <p>Track your spot watchlist entries and algorithmic strategy signals.</p>
          </div>
          <div>
            <button onClick={handleOpenAddModal} className="btn btn-primary">
              ⚡ ADD SPOT ENTRY
            </button>
          </div>
        </div>

        {/* Portfolio Stats Grid */}
        <section className="metrics-grid">
          <div className="card metric-card">
            <span className="metric-label">Total Portfolio Value</span>
            <span className="metric-value">{formatCurrency(totalWatchlistValue)}</span>
            <span className="metric-trend up">
              ▲ Live Value (USD)
            </span>
          </div>
          <div className="card metric-card">
            <span className="metric-label">Tracked Spots</span>
            <span className="metric-value">{totalAssetCount} Assets</span>
            <span className="metric-trend up" style={{ color: 'var(--accent-cyan)' }}>
              ✦ Modifiable
            </span>
          </div>
          <div className="card metric-card">
            <span className="metric-label">Aggregated Portfolios</span>
            <span className="metric-value">
              {isAdmin && adminStats ? formatCurrency(adminStats.totalPortfolioValue) : formatCurrency(totalWatchlistValue)}
            </span>
            <span className="metric-trend up">
              ▲ Global platform tracking
            </span>
          </div>
        </section>

        {/* Watchlist Table */}
        <section className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>
              📁 Personal Asset Watchlist
            </h2>
            <button onClick={fetchWatchlist} className="btn btn-secondary btn-sm" disabled={isLoading}>
              🔄 Refresh List
            </button>
          </div>

          {watchlist.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📈</div>
              <h3>Watchlist Empty</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                You have not added any coin positions to track yet. Click "ADD SPOT ENTRY" to get started!
              </p>
            </div>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>ASSET / COIN</th>
                    <th>PURCHASE PRICE</th>
                    <th>AMOUNT HELD</th>
                    <th>TOTAL POSITION VALUE</th>
                    <th>PERSONAL STRATEGY NOTE</th>
                    <th style={{ textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="token-badge">
                          <div className="token-icon">
                            {item.symbol.slice(0, 2)}
                          </div>
                          <div>
                            <div className="token-symbol">{item.symbol}</div>
                            <div className="token-name">{item.name}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{formatCurrency(item.purchasePrice)}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{item.amount}</div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                          {formatCurrency(item.amount * item.purchasePrice)}
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          {item.note || <em style={{ color: 'var(--text-muted)' }}>No strategies noted</em>}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="btn btn-secondary btn-sm"
                            title="Edit entries"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id, item.symbol)}
                            className="btn btn-danger btn-sm"
                            title="Remove asset"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Admin Intelligence Panel (Only visible to authenticated ADMIN) */}
        {isAdmin && adminStats && (
          <section className="card admin-section" style={{ padding: '2rem' }}>
            <div className="admin-header">
              <h2>🛡️ Systems Architect Global Panel</h2>
              <span className="admin-alert-pill">ADMIN PRIVILEGE ENABLED</span>
            </div>
            
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
              Real-time administrative observatory. View registration volumes, platform metrics, and audit system-wide watchlist counts.
            </p>

            <div className="metrics-grid" style={{ marginBottom: '2.5rem' }}>
              <div className="card metric-card" style={{ background: 'hsla(350, 95%, 60%, 0.02)', borderColor: 'hsla(350, 95%, 60%, 0.15)' }}>
                <span className="metric-label" style={{ color: 'var(--accent-rose)' }}>Global Users Active</span>
                <span className="metric-value">{adminStats.totalUsers} Profiles</span>
              </div>
              <div className="card metric-card" style={{ background: 'hsla(350, 95%, 60%, 0.02)', borderColor: 'hsla(350, 95%, 60%, 0.15)' }}>
                <span className="metric-label" style={{ color: 'var(--accent-rose)' }}>System Assets Tracked</span>
                <span className="metric-value">{adminStats.totalItems} Watchlists</span>
              </div>
              <div className="card metric-card" style={{ background: 'hsla(350, 95%, 60%, 0.02)', borderColor: 'hsla(350, 95%, 60%, 0.15)' }}>
                <span className="metric-label" style={{ color: 'var(--accent-rose)' }}>Cumulative Market Value</span>
                <span className="metric-value">{formatCurrency(adminStats.totalPortfolioValue)}</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-heading)' }}>
              👥 User Directory & Activity Logs
            </h3>
            
            <div className="table-container" style={{ borderColor: 'hsla(350, 95%, 60%, 0.15)' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>USER ID</th>
                    <th>EMAIL ADDRESS</th>
                    <th>HANDLE / NAME</th>
                    <th>ROLE CLEARANCE</th>
                    <th>TRACKED COINS</th>
                    <th>REGISTRATION STAMP</th>
                    <th style={{ textAlign: 'right' }}>ROLE ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {u.id}
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.email}</td>
                      <td>{u.name || 'Anonymous'}</td>
                      <td>
                        <span className={`role-tag ${u.role === 'ADMIN' ? 'admin' : 'user'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{u._count.watchlist} assets</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(u.createdAt).toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {u.id === user?.id ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            (Current Session)
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleUserRole(u.id, u.role)}
                            className={`btn ${u.role === 'ADMIN' ? 'btn-danger' : 'btn-secondary'} btn-sm`}
                            style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            disabled={isLoading}
                          >
                            {u.role === 'ADMIN' ? '👤 Demote' : '🛡️ Make Admin'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 style={{ fontSize: '1.1rem', marginTop: '2.5rem', marginBottom: '1rem', color: 'var(--accent-rose)', fontFamily: 'var(--font-heading)' }}>
              📈 Recent System-wide Watchlist Spot Injections
            </h3>

            <div className="table-container" style={{ borderColor: 'hsla(350, 95%, 60%, 0.15)' }}>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>OWNER</th>
                    <th>ASSET</th>
                    <th>PURCHASE PRICE</th>
                    <th>AMOUNT</th>
                    <th>VALUE</th>
                    <th>TIME INJECTED</th>
                  </tr>
                </thead>
                <tbody>
                  {adminStats.recentWatchlist.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.user.name || 'Anonymous'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user.email}</div>
                        </div>
                      </td>
                      <td>
                        <div className="token-symbol">{item.symbol}</div>
                      </td>
                      <td>{formatCurrency(item.purchasePrice)}</td>
                      <td>{item.amount}</td>
                      <td style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{formatCurrency(item.amount * item.purchasePrice)}</td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Pop-up Overlay Modal (Add & Edit Item) */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="card modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingItem ? '✏️ Edit Spot Entry Detail' : '⚡ Add Coin to Watchlist'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">TOKEN SYMBOL *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., BTC"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    disabled={!!editingItem} // Cannot change token symbol once created for consistency
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">TOKEN NAME *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g., Bitcoin"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    disabled={!!editingItem}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">AMOUNT HELD / WATCHED *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g., 1.45"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">PURCHASE / ENTRY PRICE (USD) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g., 68500"
                  value={formPrice}
                  onChange={(e) => setFormPrice(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">STRATEGY ANALYSIS NOTE (OPTIONAL)</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  placeholder="e.g., Confirmed weekly double bottom. Target $75k."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  CANCEL
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoading}>
                  {editingItem ? 'UPDATE COIN' : 'INJECT ASSET'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
