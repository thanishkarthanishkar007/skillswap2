import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../logo.png';
import './AuthPage.css';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill in all fields');
    setLoading(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(`Welcome back, ${data.user.name.split(' ')[0]}! 👋`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="auth-visual-content">
          <img src={logo} alt="SkillSwap" className="auth-logo-big" />
          <h2>Welcome Back!</h2>
          <p>Continue your skill exchange journey. Teach, learn, and grow with the community.</p>
          <div className="auth-visual-stats">
            <div className="astat"><span className="astat-num">10+</span><span>Free Credits</span></div>
            <div className="astat"><span className="astat-num">180+</span><span>Skills</span></div>
            <div className="astat"><span className="astat-num">2.4k</span><span>Members</span></div>
          </div>
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-form-wrap">
          <Link to="/" className="auth-back">← Back to Home</Link>
          <img src={logo} alt="SkillSwap" className="auth-logo-sm" />
          <h1>Sign In</h1>
          <p className="auth-sub">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email" className="form-input"
                placeholder="your@email.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                autoComplete="email" required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-toggle">
                <input
                  type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="current-password" required
                />
                <button type="button" className="pass-toggle" onClick={() => setShowPass(s => !s)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider"><span>or try a demo account</span></div>
          <div className="demo-accounts">
            <button className="demo-btn" onClick={() => setForm({ email: 'demo@skillswap.app', password: 'demo123' })}>
              👤 User Demo
            </button>
            <button className="demo-btn" onClick={() => setForm({ email: 'admin@skillswap.app', password: 'admin123' })}>
              🛡️ Admin Demo
            </button>
          </div>

          <p className="auth-switch">
            Don't have an account? <Link to="/register">Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
