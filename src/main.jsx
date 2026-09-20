import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// One shared password for all operators. Supabase uses the existing auth user internally.
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

function Dashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('Production Entry');
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    date: '2026-09-19',
    shift: 'Shift 1',
    timing: '',
    machine: 'M-01',
    operator: '',
    collectionOperator: '',
    laminateSupplier: '',
    defect: '',
    qc: '',
    totalCld: '',
    acceptedCld: '',
    rejectedCld: '',
  });

  function update(field, value) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  function saveEntry(event) {
    event.preventDefault();
    setSaved(true);
  }

  const navItems = ['Production Entry', 'Production Records', 'Quality', 'Reports'];

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">SP</div>
          <div><strong>SHAMPOO PLANT</strong><span>Operations</span></div>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              <span className="nav-icon">{item === 'Production Entry' ? '＋' : item === 'Production Records' ? '▤' : item === 'Quality' ? '✓' : '▧'}</span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="plant-state">
            <span className="status-dot" />
            <div><strong>Plant online</strong><span>Production system ready</span></div>
          </div>
          <button className="logout-button" onClick={onLogout}>Log out</button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="topbar">
          <div>
            <p className="eyebrow">SHAMPOO PLANT / OPERATIONS</p>
            <h1>{activeNav}</h1>
          </div>
          <div className="topbar-right">
            <span className="live-pill"><span className="status-dot" /> LIVE</span>
            <span className="operator">Operator</span>
            <div className="avatar">OP</div>
          </div>
        </header>

        <section className="content production-content">
          {activeNav === 'Production Entry' ? (
            <>
              <div className="page-heading">
                <div>
                  <h2>PRODUCTION ENTRY</h2>
                  <p>Enter the production details for the selected shift and machine.</p>
                </div>
                <div className="entry-date-badge">19/09/2026</div>
              </div>

              <form className="production-form panel" onSubmit={saveEntry}>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="date">Date</label>
                    <input id="date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="shift">Shift</label>
                    <select id="shift" value={form.shift} onChange={(e) => update('shift', e.target.value)}>
                      <option>Shift 1</option>
                      <option>Shift 2</option>
                      <option>Shift 3</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="timing">Timing</label>
                    <input id="timing" type="text" value={form.timing} onChange={(e) => update('timing', e.target.value)} placeholder="" />
                  </div>

                  <div className="field">
                    <label htmlFor="machine">Machine</label>
                    <select id="machine" value={form.machine} onChange={(e) => update('machine', e.target.value)}>
                      <option>M-01</option>
                      <option>M-02</option>
                      <option>M-03</option>
                      <option>M-04</option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="operator">Operator</label>
                    <input id="operator" type="text" value={form.operator} onChange={(e) => update('operator', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="collectionOperator">Collection Operator</label>
                    <input id="collectionOperator" type="text" value={form.collectionOperator} onChange={(e) => update('collectionOperator', e.target.value)} />
                  </div>

                  <div className="field field-wide">
                    <label htmlFor="laminateSupplier">Laminate Supplier</label>
                    <input id="laminateSupplier" type="text" value={form.laminateSupplier} onChange={(e) => update('laminateSupplier', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="defect">Defect</label>
                    <input id="defect" type="text" value={form.defect} onChange={(e) => update('defect', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="qc">QC</label>
                    <input id="qc" type="text" value={form.qc} onChange={(e) => update('qc', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="totalCld">Total CLD</label>
                    <input id="totalCld" type="number" min="0" value={form.totalCld} onChange={(e) => update('totalCld', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="acceptedCld">Accepted CLD</label>
                    <input id="acceptedCld" type="number" min="0" value={form.acceptedCld} onChange={(e) => update('acceptedCld', e.target.value)} />
                  </div>

                  <div className="field">
                    <label htmlFor="rejectedCld">Rejected CLD</label>
                    <input id="rejectedCld" type="number" min="0" value={form.rejectedCld} onChange={(e) => update('rejectedCld', e.target.value)} />
                  </div>
                </div>

                <div className="form-footer">
                  {saved && <span className="save-message">Production entry saved.</span>}
                  <button className="save-button" type="submit">SAVE</button>
                </div>
              </form>
            </>
          ) : (
            <div className="panel placeholder-panel">
              <h2>{activeNav}</h2>
              <p>This section is ready for the next production workflow.</p>
            </div>
          )}
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
