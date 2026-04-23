import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../logo.png';
import './LandingPage.css';

const features = [
  { icon: '🧠', title: 'Teach What You Know', desc: 'Share your expertise — from coding to cooking, music to marketing. Every skill has value.' },
  { icon: '⏰', title: 'Earn Time Credits',   desc: 'Teach 1 hour, earn 1 time credit. Your time is equally valuable regardless of the skill.' },
  { icon: '🎓', title: 'Learn What You Want', desc: 'Spend your credits to learn any skill from community members. No money involved.' },
  { icon: '🤝', title: 'Build Community',      desc: 'Connect with neighbors and peers. Skills flow through a trusted local network.' },
  { icon: '⭐', title: 'Rate & Review',         desc: 'Build your reputation as a teacher and learner through honest community reviews.' },
  { icon: '📅', title: 'Flexible Scheduling',  desc: 'Schedule sessions at your convenience. Online or in-person — your choice.' },
];

const howItWorks = [
  { step: '01', title: 'Create Your Profile',    desc: 'Sign up and list the skills you can teach and the skills you want to learn.' },
  { step: '02', title: 'Browse the Marketplace', desc: 'Explore skills offered by community members. Filter by category, credits, and ratings.' },
  { step: '03', title: 'Request a Session',       desc: 'Pick a time slot and send a session request. Provider accepts and you are set!' },
  { step: '04', title: 'Exchange & Earn',          desc: 'Complete the session. Credits transfer automatically — teach to earn, learn to grow.' },
];

const categories = ['💻 Technology','🎨 Design','🎵 Music','🍳 Cooking','📚 Education','💪 Fitness','🌐 Language','🎭 Arts & Crafts'];

const stats = [
  { value: '2,400+', label: 'Community Members' },
  { value: '180+',   label: 'Skills Available' },
  { value: '8,500+', label: 'Hours Exchanged' },
  { value: '4.9★',   label: 'Average Rating' },
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="landing">

      {/* ── Navbar ────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="nav-inner">
          <img src={logo} alt="SkillSwap" className="nav-logo" />
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#categories">Skills</a>
          </div>
          <div className="nav-actions">
            <Link to="/login"    className="btn btn-ghost">Log In</Link>
            <Link to="/register" className="btn btn-primary">Get Started Free</Link>
          </div>
          <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
          <div className="shape shape-3" />
        </div>
        <div className="hero-inner">
          {/* Left text */}
          <div className="hero-text">
            <div className="hero-badge">🌟 Community-Powered Learning</div>
            <h1>Exchange Skills,<br /><span className="hero-gradient">Not Money</span></h1>
            <p className="hero-sub">
              Join a community where your time is the currency. Teach what you know,
              learn what you want. Every skill — from guitar to graphic design — has equal value here.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-primary btn-lg">🚀 Start Exchanging Skills</Link>
              <Link to="/login"    className="btn btn-outline btn-lg">Explore Community</Link>
            </div>
            <div className="hero-trust">
              <div className="trust-avatars">
                {['😊','🧑','👩','🧑‍💻','👨'].map((e, i) => (
                  <div key={i} className="trust-avatar">{e}</div>
                ))}
              </div>
              <span>Join <strong>2,400+</strong> members already exchanging skills</span>
            </div>
          </div>

          {/* Right — floating skill cards */}
          <div className="hero-visual">
            <div className="hero-card-stack">
              <div className="floating-card card-a">
                <div className="fc-icon">🍜</div>
                <div>
                  <div className="fc-title">Thai Cooking</div>
                  <div className="fc-meta">1 credit/hr · ⭐ 5.0</div>
                </div>
              </div>
              <div className="floating-card card-b">
                <div className="fc-icon">🎸</div>
                <div>
                  <div className="fc-title">Guitar</div>
                  <div className="fc-meta">2 credits/hr · ⭐ 4.9</div>
                </div>
              </div>
              <div className="floating-card card-c">
                <div className="fc-icon">💻</div>
                <div>
                  <div className="fc-title">Python Coding</div>
                  <div className="fc-meta">3 credits/hr · ⭐ 4.8</div>
                </div>
              </div>
              <div className="credit-pulse">
                <div className="credit-pulse-icon">⏰</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.3rem', color: '#78350f' }}>10</div>
                  <div style={{ fontSize: '0.72rem', color: '#92400e', fontWeight: 700 }}>Free Credits</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ─────────────────────────────────────────── */}
      <section className="stats-bar">
        <div className="container">
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">✨ Why SkillSwap</div>
            <h2>Everything You Need to <span className="gradient-text">Exchange & Grow</span></h2>
            <p>A fair, community-driven platform where your knowledge is your currency</p>
          </div>
          <div className="features-grid">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────── */}
      <section className="how-section" id="how">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🚀 Simple Process</div>
            <h2>How <span className="gradient-text">SkillSwap</span> Works</h2>
            <p>Get started in minutes and start exchanging skills today</p>
          </div>
          <div className="steps-grid">
            {howItWorks.map((s, i) => (
              <div key={i} className="step-card">
                <div className="step-number">{s.step}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                {i < howItWorks.length - 1 && <div className="step-arrow">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ────────────────────────────────────────── */}
      <section className="categories-section" id="categories">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">🎯 Browse Skills</div>
            <h2>Hundreds of Skills <span className="gradient-text">Available</span></h2>
          </div>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <Link to="/register" key={i} className="cat-chip">{cat}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-bg-circle cta-c1" />
            <div className="cta-bg-circle cta-c2" />
            <h2>Ready to Start Your<br />Skill Exchange Journey?</h2>
            <p>Join thousands of community members sharing knowledge and growing together.<br />
               Sign up today and get <strong>10 free time credits</strong> to get started!</p>
            <div className="cta-actions">
              <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
              <Link to="/login"    className="btn btn-outline btn-lg"
                style={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white' }}>
                I Already Have Account
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-brand">
              <img src={logo} alt="SkillSwap" className="footer-logo" />
              <p>Exchange skills, build community, grow together.</p>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h4>Platform</h4>
                <Link to="/register">Get Started</Link>
                <a href="#features">Features</a>
                <a href="#how">How It Works</a>
              </div>
              <div className="footer-col">
                <h4>Support</h4>
                <a href="mailto:support@skillswap.app">Contact Us</a>
                <a href="#!">Privacy Policy</a>
                <a href="#!">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2025 SkillSwap. Built with ❤️ for the community.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
