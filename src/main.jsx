import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const SHARED_OPERATOR_EMAIL = 'aravindhan090804@gmail.com';
const MACHINES = Array.from({ length: 17 }, (_, i) => `M-${String(i + 1).padStart(2, '0')}`);

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    if (!supabase) return setError('The app is not configured correctly. Please contact the supervisor.');
    if (!password) return setError('Please enter the access password.');
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: SHARED_OPERATOR_EMAIL, password });
    setLoading(false);
    if (signInError) return setError('Incorrect access password. Please try again.');
    onLogin(data.session);
  }

  return <main className="page-center"><section className="card login-card">
    <div className="brand">SHAMPOO PLANT</div><h1>Plant Access</h1>
    <p className="muted">Enter the shared access password to continue.</p>
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="access-password">Access password</label>
      <input id="access-password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" autoFocus />
      {error && <div className="error" role="alert">{error}</div>}
      <button type="submit" disabled={loading}>{loading ? 'Checking…' : 'ENTER'}</button>
    </form>
  </section></main>;
}

function Overview() {
  const [date, setDate] = useState('2026-09-19');
  const [shift, setShift] = useState('All shifts');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const rows = MACHINES.map(machine => ({ machine, total: '—', accepted: '—', rejected: '—', defect: '—', qc: '—' }));

  return <section className="content">
    <div className="page-heading"><div><p className="eyebrow">SUPERVISOR / QUALITY OVERVIEW</p><h2>Machine Overview</h2><p>All 17 machines · production and quality summary</p></div></div>
    <div className="filter-bar panel">
      <div className="field"><label htmlFor="overview-date">Date</label><input id="overview-date" type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
      <div className="field"><label htmlFor="overview-shift">Shift</label><select id="overview-shift" value={shift} onChange={e => setShift(e.target.value)}><option>All shifts</option><option>Shift 1</option><option>Shift 2</option><option>Shift 3</option></select></div>
      <div className="filter-note">Showing all 17 machines</div>
    </div>
    <div className="metric-grid overview-metrics">
      <div className="metric-card"><span>CLDs Total</span><strong>—</strong><small>Selected date / shift</small></div>
      <div className="metric-card"><span>Accepted CLD</span><strong>—</strong><small>Selected date / shift</small></div>
      <div className="metric-card"><span>Rejected CLD</span><strong>—</strong><small>Selected date / shift</small></div>
      <div className="metric-card"><span>Machines</span><strong>17</strong><small>M-01 to M-17</small></div>
    </div>
    <section className="panel machine-panel">
      <div className="panel-header"><div><h3>17 Machine Overview</h3><p>Click a machine to open its detailed entries</p></div><span className="record-count">17 machines</span></div>
      <div className="table-wrap"><table><thead><tr><th>Machine</th><th>CLDs Total</th><th>Accepted CLD</th><th>Rejected CLD</th><th>Defect</th><th>QC</th></tr></thead><tbody>
        {rows.map(row => <tr key={row.machine} onClick={() => setSelectedMachine(row.machine)}><td className="machine-name">{row.machine}</td><td>{row.total}</td><td>{row.accepted}</td><td>{row.rejected}</td><td>{row.defect}</td><td>{row.qc}</td></tr>)}
      </tbody></table></div>
    </section>
    {selectedMachine && <div className="machine-detail panel"><div><p className="eyebrow">MACHINE DETAIL</p><h3>{selectedMachine}</h3><p>No production entry has been loaded for this machine yet.</p></div><button className="secondary-button" onClick={() => setSelectedMachine(null)}>Close</button></div>}
  </section>;
}

function ProductionEntry() {
  const [form, setForm] = useState({ date: '2026-09-19', shift: 'Shift 1', timing: '', machine: 'M-01', operator: '', collectionOperator: '', laminateSupplier: '', defect: '', qc: '', totalCld: '', acceptedCld: '', rejectedCld: '' });
  const [saved, setSaved] = useState(false);
  const update = (field, value) => { setSaved(false); setForm(current => ({ ...current, [field]: value })); };
  const saveEntry = event => { event.preventDefault(); setSaved(true); };
  return <section className="content">
    <div className="page-heading"><div><p className="eyebrow">PRODUCTION</p><h2>PRODUCTION ENTRY</h2><p>Enter the production details for the selected shift and machine.</p></div></div>
    <form className="production-form panel" onSubmit={saveEntry}><div className="form-grid">
      <div className="field"><label>Date</label><input type="date" value={form.date} onChange={e => update('date', e.target.value)} /></div>
      <div className="field"><label>Shift</label><select value={form.shift} onChange={e => update('shift', e.target.value)}><option>Shift 1</option><option>Shift 2</option><option>Shift 3</option></select></div>
      <div className="field"><label>Timing</label><input value={form.timing} onChange={e => update('timing', e.target.value)} /></div>
      <div className="field"><label>Machine</label><select value={form.machine} onChange={e => update('machine', e.target.value)}>{MACHINES.map(m => <option key={m}>{m}</option>)}</select></div>
      <div className="field"><label>Operator</label><input value={form.operator} onChange={e => update('operator', e.target.value)} /></div>
      <div className="field"><label>Collection Operator</label><input value={form.collectionOperator} onChange={e => update('collectionOperator', e.target.value)} /></div>
      <div className="field field-wide"><label>Laminate Supplier</label><input value={form.laminateSupplier} onChange={e => update('laminateSupplier', e.target.value)} /></div>
      <div className="field"><label>Defect</label><input value={form.defect} onChange={e => update('defect', e.target.value)} /></div>
      <div className="field"><label>QC</label><input value={form.qc} onChange={e => update('qc', e.target.value)} /></div>
      <div className="field"><label>Total CLD</label><input type="number" min="0" value={form.totalCld} onChange={e => update('totalCld', e.target.value)} /></div>
      <div className="field"><label>Accepted CLD</label><input type="number" min="0" value={form.acceptedCld} onChange={e => update('acceptedCld', e.target.value)} /></div>
      <div className="field"><label>Rejected CLD</label><input type="number" min="0" value={form.rejectedCld} onChange={e => update('rejectedCld', e.target.value)} /></div>
    </div><div className="form-footer">{saved && <span className="save-message">Production entry saved.</span>}<button className="save-button" type="submit">SAVE</button></div></form>
  </section>;
}

function Dashboard({ onLogout }) {
  const [activeNav, setActiveNav] = useState('Overview');
  const navItems = ['Overview', 'Production Entry', 'Production Records', 'Quality', 'Reports'];
  return <div className="dashboard-shell"><aside className="sidebar">
    <div className="sidebar-brand"><div className="brand-mark">SP</div><div><strong>SHAMPOO PLANT</strong><span>Operations</span></div></div>
    <nav>{navItems.map(item => <button key={item} className={`nav-item ${activeNav === item ? 'active' : ''}`} onClick={() => setActiveNav(item)}><span className="nav-icon">{item === 'Overview' ? '⌂' : item === 'Production Entry' ? '＋' : item === 'Production Records' ? '▤' : item === 'Quality' ? '✓' : '▧'}</span>{item}</button>)}</nav>
    <div className="sidebar-bottom"><div className="plant-state"><span className="status-dot" /><div><strong>Plant online</strong><span>Production system ready</span></div></div><button className="logout-button" onClick={onLogout}>Log out</button></div>
  </aside><main className="dashboard-main"><header className="topbar"><div><p className="eyebrow">SHAMPOO PLANT / {activeNav.toUpperCase()}</p><h1>{activeNav}</h1></div><div className="topbar-right"><span className="live-pill"><span className="status-dot" /> LIVE</span><span className="operator">Supervisor / Quality</span><div className="avatar">SQ</div></div></header>{activeNav === 'Overview' ? <Overview /> : activeNav === 'Production Entry' ? <ProductionEntry /> : <section className="content"><div className="panel placeholder-panel"><h2>{activeNav}</h2><p>This section will use the same production records and quality data.</p></div></section>}</main></div>;
}

function Root() {
  const [session, setSession] = useState(null); const [ready, setReady] = useState(false);
  useEffect(() => { if (!supabase) { setReady(true); return undefined; } supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); }); const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession)); return () => listener.subscription.unsubscribe(); }, []);
  if (!ready) return <div className="loading">Loading…</div>;
  return session ? <Dashboard onLogout={() => supabase.auth.signOut()} /> : <Login onLogin={setSession} />;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><Root /></React.StrictMode>);
