'use client';

import { useEffect, useState } from 'react';
import { checkHealth, getAuthProfile, loginUser, registerUser, updateAuthProfile } from '../lib/api';
import styles from './page.module.css';

const TOKEN_KEY = 'microfinance_jwt';
const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'U';
const formatDate = (value) => value ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' }).format(new Date(value)) : 'Not available';

export default function Home() {
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [health, setHealth] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '', rememberMe: true });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    Promise.resolve().then(() => {
      const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
      if (!storedToken) { setLoading(false); return; }
      setToken(storedToken);
      getAuthProfile(storedToken).then(({ data }) => {
        setUser(data); setProfileForm({ name: data.name || '', phone: data.phone || '' });
      }).catch(() => { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); }).finally(() => setLoading(false));
    });
  }, []);

  useEffect(() => { checkHealth().then(setHealth).catch(() => setHealth(null)); }, []);

  const submitAuth = async (event) => {
    event.preventDefault(); setError(''); setNotice(''); setSubmitting(true);
    try {
      const response = authMode === 'login' ? await loginUser(loginForm) : await registerUser(registerForm);
      if (authMode === 'login' && !loginForm.rememberMe) sessionStorage.setItem(TOKEN_KEY, response.token);
      else localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token); setUser(response.user); setProfileForm({ name: response.user.name || '', phone: response.user.phone || '' });
      setNotice(authMode === 'login' ? 'Welcome back. Your workspace is ready.' : 'Your account has been created.');
    } catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };

  const logout = () => { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setNotice('You have been signed out.'); };
  const saveProfile = async (event) => {
    event.preventDefault(); setError(''); setSubmitting(true);
    try { const response = await updateAuthProfile(token, profileForm); setUser(response.user); setEditingProfile(false); setNotice('Profile details updated successfully.'); }
    catch (requestError) { setError(requestError.message); } finally { setSubmitting(false); }
  };

  if (loading) return <main className={styles.loading}><span className={styles.loader} />Preparing your workspace</main>;

  if (user) return (
    <main className={styles.appShell}>
      <aside className={styles.sidebar}><div className={styles.brand}><span className={styles.brandMark}>MF</span><span>MicroFinance</span></div><nav className={styles.nav} aria-label="Main navigation"><a className={styles.navItemActive} href="#overview">Overview</a><a className={styles.navItem} href="#accounts">Accounts</a><a className={styles.navItem} href="#activity">Activity</a></nav><div className={styles.sidebarBottom}><div className={styles.systemStatus}><span className={health?.database?.readyState === 1 ? styles.statusDot : styles.statusDotOffline} />{health?.database?.readyState === 1 ? 'Systems operational' : 'System unavailable'}</div><button className={styles.signOutButton} onClick={logout}>Sign out</button></div></aside>
      <section className={styles.dashboard} id="overview"><header className={styles.topbar}><div><p className={styles.eyebrow}>Workspace / Overview</p><h1>Good to see you, {user.name.split(' ')[0]}.</h1></div><div className={styles.profileSummary}><div className={styles.avatar}>{initials(user.name)}</div><div><strong>{user.name}</strong><span>{user.role.replace('_', ' ')}</span></div></div></header>
        {notice && <div className={styles.notice}>{notice}</div>}{error && <div className={styles.error}>{error}</div>}
        <div className={styles.statGrid}><article className={styles.statCard}><span className={styles.statLabel}>Account status</span><strong>Active</strong><span className={styles.statMeta}>Verified member</span></article><article className={styles.statCard}><span className={styles.statLabel}>Access level</span><strong className={styles.capitalize}>{user.role.replace('_', ' ')}</strong><span className={styles.statMeta}>Role-based access enabled</span></article><article className={styles.statCard}><span className={styles.statLabel}>Member since</span><strong>{formatDate(user.createdAt)}</strong><span className={styles.statMeta}>Account registration date</span></article></div>
        <div className={styles.contentGrid} id="accounts"><article className={styles.panel}><div className={styles.panelHeader}><div><p className={styles.eyebrow}>Account details</p><h2>Your profile</h2></div><button className={styles.secondaryButton} onClick={() => setEditingProfile((value) => !value)}>{editingProfile ? 'Cancel' : 'Edit profile'}</button></div>{editingProfile ? <form className={styles.profileForm} onSubmit={saveProfile}><label>Full name<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required /></label><label>Phone number<input value={profileForm.phone} onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })} /></label><button className={styles.primaryButton} disabled={submitting}>{submitting ? 'Saving...' : 'Save changes'}</button></form> : <div className={styles.detailList}><div><span>Full name</span><strong>{user.name}</strong></div><div><span>Email address</span><strong>{user.email}</strong></div><div><span>Phone number</span><strong>{user.phone || 'Not provided'}</strong></div><div><span>Last sign-in</span><strong>{formatDate(user.lastLogin)}</strong></div></div>}</article><article className={styles.panel} id="activity"><div className={styles.panelHeader}><div><p className={styles.eyebrow}>Recent activity</p><h2>Account timeline</h2></div></div><div className={styles.timeline}><div><span className={styles.timelineDot} /><div><strong>Signed in successfully</strong><span>{formatDate(user.lastLogin)}</span></div></div><div><span className={styles.timelineDotMuted} /><div><strong>Profile created</strong><span>{formatDate(user.createdAt)}</span></div></div></div></article></div>
      </section>
    </main>
  );

  const setAuthValue = (field, value) => authMode === 'login' ? setLoginForm({ ...loginForm, [field]: value }) : setRegisterForm({ ...registerForm, [field]: value });
  return <main className={styles.authShell}><section className={styles.authIntro}><div className={styles.brand}><span className={styles.brandMark}>MF</span><span>MicroFinance</span></div><div><p className={styles.kicker}>Core banking platform</p><h1>Simple tools for stronger financial communities.</h1><p className={styles.introText}>Manage member relationships, lending operations, and daily activity from one dependable workspace.</p></div><div className={styles.introFooter}><span className={styles.statusDot} />Secure access with encrypted sessions</div></section><section className={styles.authPanel}><div className={styles.authCard}><div className={styles.authHeader}><p className={styles.eyebrow}>Welcome</p><h2>{authMode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2><p>{authMode === 'login' ? 'Use your credentials to continue to the dashboard.' : 'Set up a secure account in less than a minute.'}</p></div><div className={styles.authTabs}><button className={authMode === 'login' ? styles.activeTab : ''} onClick={() => { setAuthMode('login'); setError(''); }}>Sign in</button><button className={authMode === 'register' ? styles.activeTab : ''} onClick={() => { setAuthMode('register'); setError(''); }}>Register</button></div>{error && <div className={styles.error}>{error}</div>}<form className={styles.authForm} onSubmit={submitAuth}>{authMode === 'register' && <><label>Full name<input value={registerForm.name} onChange={(event) => setAuthValue('name', event.target.value)} placeholder="Your full name" required /></label><label>Phone number <span>(optional)</span><input value={registerForm.phone} onChange={(event) => setAuthValue('phone', event.target.value)} placeholder="+94 77 123 4567" /></label></>}<label>Email address<input type="email" value={authMode === 'login' ? loginForm.email : registerForm.email} onChange={(event) => setAuthValue('email', event.target.value)} placeholder="you@example.com" required /></label><label>Password<div className={styles.passwordField}><input type={showPassword ? 'text' : 'password'} value={authMode === 'login' ? loginForm.password : registerForm.password} onChange={(event) => setAuthValue('password', event.target.value)} placeholder="At least 6 characters" minLength={6} required /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Hide' : 'Show'}</button></div></label>{authMode === 'login' && <label className={styles.checkbox}><input type="checkbox" checked={loginForm.rememberMe} onChange={(event) => setLoginForm({ ...loginForm, rememberMe: event.target.checked })} /> Keep me signed in</label>}<button className={styles.primaryButton} disabled={submitting}>{submitting ? 'Please wait...' : authMode === 'login' ? 'Continue to dashboard' : 'Create account'}</button></form><p className={styles.legal}>By continuing, you agree to use this platform responsibly and keep your account details private.</p></div></section></main>;
}
