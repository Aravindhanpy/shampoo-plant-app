import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// One shared password for all operators. Supabase uses this existing user internally.
const SHARED_OPERATOR_EMAIL = 'aravindhan090804@gmail.com';

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!supabase) {
      setError('The app is not configured correctly. Please contact the supervisor.');
      return;
    }
    if (!password) {
      setError('Please enter the access password.');
      return;
    }
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: SHARED_OPERATOR_EMAIL,
      password,
    });
    setLoading(false);
    if (signInError) {
      setError('Incorrect access password. Please try again.');
      return;
    }
    onLogin(data.session);
  }

  return (
    <main className="page-center">
      <section className="card login-card">
        <div className="brand">SHAMPOO PLANT</div>
        <h1>Plant Access</h1>
        <p className="muted">Enter the shared access password to continue.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label htmlFor="access-password">Access password</label>
          <input
            id="access-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            autoFocus
          />
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" disabled={loading}>{loading ? 'Checking…' : 'ENTER'}</button>
        </form>
      </section>
    </main>
  );
}

const initialBatches = [
  { id: 'B-260920-01', product: 'Daily Fresh Shampoo', tank: 'Mixing Tank 02', qty: '2,000 L', progress: 72, status: 'In production' },
  { id: 'B-260920-02', product: 'Anti-Dandruff Shampoo', tank: 'Mixing Tank 01', qty: '1,500 L', progress: 28, status: 'Mixing' },
  { id: 'B-260920-03', product: 'Conditioner', tank: 'Mixing Tank 03', qty: '1,000 L', progress: 0, status: 'Queued' },
];

function StatusDot({ state = 'online' }) {
  return <span className={`status-dot ${state}`} aria-hidden="true" />;
}

function Dashboard({ onLogout }) {
  const [batches, setBatches] = useState(initialBatches);
  const [activeNav, setActiveNav] = useState('Overview');
  const [alerts, setAlerts] = useState([
    { id: 1, level: 'warning', title: 'Low fragrance stock', detail: 'Fragrance F-07 is below reorder level.' },
    { id: 2, level: 'info', title: 'Tank 03 available', detail: 'Cleaning cycle completed 8 minutes ago.' },
  ]);

  const startNextBatch = () => {
    setBatches((current) => current.map((batch, index) =>
      index === 2 ? { ...batch, progress: 1, status: 'Starting' } : batch
    ));
  };

  const acknowledge = (id) => setAlerts((current) => current.filter((alert) => alert.id !== id));

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">SP</div>
          <div><strong>SHAMPOO PLANT</strong><span>Operations</span></div>
        </div>
        <nav>
          {['Overview', 'Production', 'Batches', 'Inventory', 'Quality', 'Reports'].map((item) => (
            <button key={item} className={`nav-item ${activeNav === item ? 'active' : ''}`} onClick={() => setActiveNav(item)}>
              <span className="nav-icon">{item === 'Overview' ? '⌂' : item === 'Production' ? '◉' : item === 'Batches' ? '▤' : item === 'Inventory' ? '▥' : item === 'Quality' ? '✓' : '▧'}</span>
              {item}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="plant-state"><StatusDot /><div><strong>Plant online</strong><span>All core systems running</span></div></div>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div><p className="eyebrow">OPERATIONS / {activeNav.toUpperCase()}</p><h1>{activeNav}</h1></div>
          <div className="topbar-right"><span className="live-pill"><StatusDot /> LIVE</span><span className="operator">Operator</span><div className="avatar">OP</div></div>
        </header>

        <section className="content">
          <div className="welcome-row">
            <div><h2>Good morning, operator.</h2><p>Here is the current plant status and today's production plan.</p></div>
            <button className="primary-action" onClick={startNextBatch}>+ Start next batch</button>
          </div>

          <div className="metric-grid">
            <div className="metric-card"><span>Today's output</span><strong>4,860 L</strong><small className="positive">↑ 12.4% vs yesterday</small></div>
            <div className="metric-card"><span>Active batches</span><strong>2</strong><small>1 batch queued</small></div>
            <div className="metric-card"><span>Plant efficiency</span><strong>91.8%</strong><small className="positive">↑ 2.1% this shift</small></div>
            <div className="metric-card"><span>Quality pass rate</span><strong>98.6%</strong><small className="positive">Within target</small></div>
          </div>

          <div className="main-grid">
            <section className="panel production-panel">
              <div className="panel-header"><div><h3>Production today</h3><p>Current batch activity</p></div><button className="text-button" onClick={() => setActiveNav('Batches')}>View all →</button></div>
              <div className="batch-list">
                {batches.map((batch) => (
                  <div className="batch-row" key={batch.id}>
                    <div className="batch-main"><div className="batch-code">{batch.id}</div><strong>{batch.product}</strong><span>{batch.tank} · {batch.qty}</span></div>
                    <div className="batch-progress"><div className="progress-label"><span>{batch.status}</span><b>{batch.progress}%</b></div><div className="progress-track"><div className="progress-fill" style={{ width: `${batch.progress}%` }} /></div></div>
                  </div>
                ))}
              </div>
            </section>

            <section className="panel plant-panel">
              <div className="panel-header"><div><h3>Plant status</h3><p>Equipment overview</p></div><span className="healthy"><StatusDot /> Healthy</span></div>
              <div className="equipment-list">
                {[
                  ['Mixing Tank 01', 'Running', 'online'],
                  ['Mixing Tank 02', 'Running', 'online'],
                  ['Mixing Tank 03', 'Cleaning', 'cleaning'],
                  ['Filling Line 01', 'Running', 'online'],
                  ['Filling Line 02', 'Idle', 'idle'],
                ].map(([name, status, state]) => <div className="equipment-row" key={name}><span>{name}</span><span><StatusDot state={state} />{status}</span></div>)}
              </div>
            </section>
          </div>

          <div className="lower-grid">
            <section className="panel alerts-panel">
              <div className="panel-header"><div><h3>Alerts & actions</h3><p>Items requiring attention</p></div><span className="alert-count">{alerts.length}</span></div>
              {alerts.length === 0 ? <div className="empty-state">✓ No outstanding alerts</div> : <div className="alert-list">{alerts.map((alert) => <div className="alert-row" key={alert.id}><div className={`alert-icon ${alert.level}`}>!</div><div><strong>{alert.title}</strong><p>{alert.detail}</p></div><button className="ack-button" onClick={() => acknowledge(alert.id)}>Acknowledge</button></div>)}</div>}
            </section>
            <section className="panel shift-panel">
              <div className="panel-header"><div><h3>Shift summary</h3><p>Current shift · 06:00–14:00</p></div></div>
              <div className="shift-stat"><span>Target</span><strong>5,500 L</strong></div><div className="shift-stat"><span>Produced</span><strong>4,860 L</strong></div><div className="shift-stat"><span>Remaining</span><strong>640 L</strong></div>
              <div className="shift-track"><div style={{ width: '88.4%' }} /></div><small>88.4% of shift target complete</small>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return undefined; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="loading">Loading…</div>;
  return session ? <Dashboard onLogout={() => supabase.auth.signOut()} /> : <Login onLogin={setSession} />;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Root /></React.StrictMode>);
