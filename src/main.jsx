import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Operators use one shared password. The email is only used internally by Supabase Auth.
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

          <button type="submit" disabled={loading}>
            {loading ? 'Checking…' : 'ENTER'}
          </button>
        </form>
      </section>
    </main>
  );
}

function App() {
  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <main className="page-center">
      <section className="card">
        <div className="brand">SHAMPOO PLANT</div>
        <h1>Welcome</h1>
        <p className="muted">Plant access is active.</p>
        <button onClick={logout}>LOG OUT</button>
      </section>
    </main>
  );
}

function Root() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
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
  return session ? <App /> : <Login onLogin={setSession} />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
);
