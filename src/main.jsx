import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const SHARED_OPERATOR_EMAIL = 'aravindhan090804@gmail.com';
const MACHINES = Array.from({ length: 17 }, (_, index) => ({
  id: index + 1,
  machine_no: `M-${String(index + 1).padStart(2, '0')}`,
}));

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60 * 1000).toISOString().slice(0, 10);
}

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
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
            autoFocus
          />
          {error && <div className="error" role="alert">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'ENTER'}
          </button>
        </form>
      </section>
    </main>
  );
}

function ProductionEntry({ session, onSaved }) {
  const [form, setForm] = useState({
    date: localDate(),
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
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function update(field, value) {
    setMessage('');
    setError('');
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveEntry(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    const required = ['date', 'shift', 'machine', 'operator', 'defect', 'totalCld', 'acceptedCld', 'rejectedCld'];
    if (required.some((key) => !String(form[key]).trim())) {
      setError('Please fill all required fields before saving.');
      return;
    }

    const total = Number(form.totalCld);
    const accepted = Number(form.acceptedCld);
    const rejected = Number(form.rejectedCld);
    const defect = Number(form.defect);

    if ([total, accepted, rejected, defect].some((value) => !Number.isFinite(value) || value < 0)) {
      setError('CLD and Defect values must be zero or greater.');
      return;
    }

    if (accepted + rejected !== total) {
      setError('Accepted CLD + Rejected CLD must equal Total CLD.');
      return;
    }

    if (!supabase) {
      setError('Supabase is not configured.');
      return;
    }

    setSaving(true);

    const { data: machineRow, error: machineError } = await supabase
      .from('machines')
      .select('id')
      .eq('machine_no', form.machine)
      .single();

    if (machineError || !machineRow) {
      setSaving(false);
      setError('Could not find the selected machine.');
      return;
    }

    const { error: insertError } = await supabase
      .from('production_records')
      .insert({
        production_date: form.date,
        shift: form.shift,
        timing: form.timing || null,
        machine_id: machineRow.id,
        operator_name: form.operator,
        collection_operator_name: form.collectionOperator || null,
        laminate_supplier_name: form.laminateSupplier || null,
        defect,
        qc: form.qc || null,
        clds_total: total,
        accepted_cld: accepted,
        rejected_cld: rejected,
        created_by: session?.user?.id || null,
        updated_by: session?.user?.id || null,
      });

    setSaving(false);

    if (insertError) {
      setError(`Could not save the entry: ${insertError.message}`);
      return;
    }

    setMessage('Production entry saved successfully.');
    onSaved?.();
    setForm((current) => ({
      ...current,
      timing: '',
      operator: '',
      collectionOperator: '',
      laminateSupplier: '',
      defect: '',
      qc: '',
      totalCld: '',
      acceptedCld: '',
      rejectedCld: '',
    }));
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>PRODUCTION ENTRY</h2>
          <p>Enter the production details for the selected shift and machine.</p>
        </div>
        <div className="entry-date-badge">{form.date}</div>
      </div>

      <form className="production-form panel" onSubmit={saveEntry}>
        <div className="form-grid">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={(event) => update('date', event.target.value)} />
          </div>
          <div className="field">
            <label>Shift</label>
            <select value={form.shift} onChange={(event) => update('shift', event.target.value)}>
              <option>Shift 1</option>
              <option>Shift 2</option>
              <option>Shift 3</option>
            </select>
          </div>
          <div className="field">
            <label>Timing</label>
            <input value={form.timing} onChange={(event) => update('timing', event.target.value)} />
          </div>
          <div className="field">
            <label>Machine</label>
            <select value={form.machine} onChange={(event) => update('machine', event.target.value)}>
              {MACHINES.map((machine) => (
                <option key={machine.machine_no}>{machine.machine_no}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Operator</label>
            <input value={form.operator} onChange={(event) => update('operator', event.target.value)} />
          </div>
          <div className="field">
            <label>Collection Operator</label>
            <input value={form.collectionOperator} onChange={(event) => update('collectionOperator', event.target.value)} />
          </div>
          <div className="field field-wide">
            <label>Laminate Supplier</label>
            <input value={form.laminateSupplier} onChange={(event) => update('laminateSupplier', event.target.value)} />
          </div>
          <div className="field">
            <label>Defect</label>
            <input type="number" min="0" value={form.defect} onChange={(event) => update('defect', event.target.value)} />
          </div>
          <div className="field">
            <label>QC</label>
            <input value={form.qc} onChange={(event) => update('qc', event.target.value)} />
          </div>
          <div className="field">
            <label>Total CLD</label>
            <input type="number" min="0" value={form.totalCld} onChange={(event) => update('totalCld', event.target.value)} />
          </div>
          <div className="field">
            <label>Accepted CLD</label>
            <input type="number" min="0" value={form.acceptedCld} onChange={(event) => update('acceptedCld', event.target.value)} />
          </div>
          <div className="field">
            <label>Rejected CLD</label>
            <input type="number" min="0" value={form.rejectedCld} onChange={(event) => update('rejectedCld', event.target.value)} />
          </div>
        </div>

        <div className="form-footer">
          {error && <span className="error-inline">{error}</span>}
          {message && <span className="save-message">{message}</span>}
          <button className="save-button" type="submit" disabled={saving}>
            {saving ? 'SAVING…' : 'SAVE'}
          </button>
        </div>
      </form>
    </>
  );
}

function MachineDashboard({ refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');

  useEffect(() => {
    let active = true;

    async function load() {
      if (!supabase) {
        setError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');

      const { data, error: queryError } = await supabase
        .from('production_records')
        .select('id,machine_id,production_date,shift,timing,operator_name,collection_operator_name,laminate_supplier_name,defect,qc,clds_total,accepted_cld,rejected_cld')
        .order('production_date', { ascending: false })
        .order('id', { ascending: false });

      if (!active) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setRecords(data || []);
      }
      setLoading(false);
    }

    load();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const dates = useMemo(
    () => [...new Set(records.map((record) => record.production_date).filter(Boolean))].sort().reverse(),
    [records]
  );

  const filteredRecords = useMemo(
    () => records.filter(
      (record) =>
        (dateFilter === 'all' || record.production_date === dateFilter) &&
        (shiftFilter === 'all' || record.shift === shiftFilter)
    ),
    [records, dateFilter, shiftFilter]
  );

  const cumulative = useMemo(
    () => filteredRecords.reduce(
      (summary, record) => ({
        total: summary.total + Number(record.clds_total || 0),
        accepted: summary.accepted + Number(record.accepted_cld || 0),
        rejected: summary.rejected + Number(record.rejected_cld || 0),
        defect: summary.defect + Number(record.defect || 0),
      }),
      { total: 0, accepted: 0, rejected: 0, defect: 0 }
    ),
    [filteredRecords]
  );

  const rows = useMemo(
    () => MACHINES.map((machine) => {
      const machineRecords = filteredRecords.filter((record) => record.machine_id === machine.id);
      return {
        ...machine,
        total: machineRecords.reduce((sum, record) => sum + Number(record.clds_total || 0), 0),
        accepted: machineRecords.reduce((sum, record) => sum + Number(record.accepted_cld || 0), 0),
        rejected: machineRecords.reduce((sum, record) => sum + Number(record.rejected_cld || 0), 0),
        defect: machineRecords.reduce((sum, record) => sum + Number(record.defect || 0), 0),
        qc: machineRecords.length ? machineRecords[0].qc || '—' : '—',
      };
    }),
    [filteredRecords]
  );

  const periodLabel = dateFilter === 'all' ? 'All dates' : dateFilter;
  const shiftLabel = shiftFilter === 'all' ? 'All shifts' : shiftFilter;

  return (
    <>
      <div className="page-heading">
        <div>
          <h2>MACHINE OVERVIEW</h2>
          <p>{periodLabel} · {shiftLabel} · overall cumulative and machine-wise production.</p>
        </div>
        <div className="dashboard-filters">
          <label>
            Date
            <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value)}>
              <option value="all">All dates</option>
              {dates.map((date) => <option key={date} value={date}>{date}</option>)}
            </select>
          </label>
          <label>
            Shift
            <select value={shiftFilter} onChange={(event) => setShiftFilter(event.target.value)}>
              <option value="all">All shifts</option>
              <option>Shift 1</option>
              <option>Shift 2</option>
              <option>Shift 3</option>
            </select>
          </label>
        </div>
      </div>

      <div className="summary-grid">
        <div className="summary-card"><span>Total CLDs</span><strong>{cumulative.total}</strong></div>
        <div className="summary-card"><span>Accepted CLD</span><strong>{cumulative.accepted}</strong></div>
        <div className="summary-card"><span>Rejected CLD</span><strong>{cumulative.rejected}</strong></div>
        <div className="summary-card"><span>Defect</span><strong>{cumulative.defect}</strong></div>
      </div>

      <div className="panel machine-panel">
        <div className="section-title">
          <h3>MACHINE-WISE RECORD</h3>
          <p>All 17 machines for the selected period.</p>
        </div>
        {error && <div className="error">Could not load dashboard: {error}</div>}
        {loading ? (
          <div className="dashboard-loading">Loading machine data…</div>
        ) : (
          <div className="machine-table-wrap">
            <table className="machine-table">
              <thead>
                <tr>
                  <th>Machine</th>
                  <th>Total CLD</th>
                  <th>Accepted CLD</th>
                  <th>Rejected CLD</th>
                  <th>Defect</th>
                  <th>QC</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.machine_no}>
                    <td><strong>{row.machine_no}</strong></td>
                    <td>{row.total}</td>
                    <td>{row.accepted}</td>
                    <td>{row.rejected}</td>
                    <td>{row.defect}</td>
                    <td>{row.qc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="panel machine-panel" style={{ marginTop: 18 }}>
        <div className="section-title">
          <h3>PRODUCTION HISTORY</h3>
          <p>Every saved production record matching the same date and shift filters.</p>
        </div>
        <div className="machine-table-wrap">
          <table className="machine-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Shift</th>
                <th>Timing</th>
                <th>Machine</th>
                <th>Operator</th>
                <th>Collection Operator</th>
                <th>Laminate Supplier</th>
                <th>Defect</th>
                <th>QC</th>
                <th>Total CLD</th>
                <th>Accepted CLD</th>
                <th>Rejected CLD</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr><td colSpan="12">No production records for the selected filters.</td></tr>
              ) : (
                filteredRecords.map((record) => {
                  const machine = MACHINES.find((item) => item.id === record.machine_id);
                  return (
                    <tr key={record.id}>
                      <td>{record.production_date}</td>
                      <td>{record.shift}</td>
                      <td>{record.timing || '—'}</td>
                      <td>{machine?.machine_no || '—'}</td>
                      <td>{record.operator_name || '—'}</td>
                      <td>{record.collection_operator_name || '—'}</td>
                      <td>{record.laminate_supplier_name || '—'}</td>
                      <td>{record.defect ?? 0}</td>
                      <td>{record.qc || '—'}</td>
                      <td>{record.clds_total ?? 0}</td>
                      <td>{record.accepted_cld ?? 0}</td>
                      <td>{record.rejected_cld ?? 0}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function Dashboard({ onLogout, session }) {
  const [activeNav, setActiveNav] = useState('Machine Overview');
  const [refreshKey, setRefreshKey] = useState(0);
  const navItems = ['Machine Overview', 'Production Entry', 'Quality', 'Reports'];

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">SP</div>
          <div>
            <strong>SHAMPOO PLANT</strong>
            <span>Operations</span>
          </div>
        </div>

        <nav>
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activeNav === item ? 'active' : ''}`}
              onClick={() => setActiveNav(item)}
            >
              <span className="nav-icon">
                {item === 'Production Entry' ? '＋' : item === 'Machine Overview' ? '▦' : item === 'Quality' ? '✓' : '▧'}
              </span>
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="plant-state">
            <span className="status-dot" />
            <div>
              <strong>Plant online</strong>
              <span>Production system ready</span>
            </div>
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
            <span className="operator">Supervisor / QC</span>
            <div className="avatar">QC</div>
          </div>
        </header>

        <section className="content">
          {activeNav === 'Production Entry' ? (
            <ProductionEntry session={session} onSaved={() => setRefreshKey((key) => key + 1)} />
          ) : activeNav === 'Machine Overview' ? (
            <MachineDashboard refreshKey={refreshKey} />
          ) : (
            <div className="panel placeholder-panel">
              <h2>{activeNav}</h2>
              <p>This section will use the same saved Supabase production records.</p>
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
    if (!supabase) {
      setReady(true);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (!ready) return <div className="loading">Loading…</div>;
  if (session) return <Dashboard session={session} onLogout={() => supabase.auth.signOut()} />;
  return <Login onLogin={setSession} />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
