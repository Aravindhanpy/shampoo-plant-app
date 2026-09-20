import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!supabase) {
      setError('Supabase is not configured. Please check the app environment settings.');
      return;
    }
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (signInError) {
      setError('Email or password is incorrect. Please try again.');
      return;
    }
    onLogin(data.session);
  }

  return (
    <main className="page-center">
      <section className="card login-card">
        <div className="brand">SHAMPOO PLANT</div>
        <h1>Sign in</h1>
        <p className="muted">Enter your account details to continue.</p>
        <form onSubmit={handleSubmit} noValidate>
          <label>Email</label>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label>Password</label>
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />

          {error && <div className="error" role="alert">{error}</div>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'LOGIN'}
          </button>
        </form>
      </section>
    </main>
  );
}

function App({ session }) {
  async function logout() {
    await supabase.auth.signOut();
  }

  return (
    <main className="page-center">
      <section className="card">
        <div className="brand">SHAMPOO PLANT</div>
        <h1>Welcome</h1>
        <p className="muted">Signed in as {session.user.email}</p>
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
  return session ? <App session={session} /> : <Login onLogin={setSession} />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode><Root /></React.StrictMode>
);
