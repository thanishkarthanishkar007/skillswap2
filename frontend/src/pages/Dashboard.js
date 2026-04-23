import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { isMockMode, mockGetExchanges, mockGetSkills } from '../utils/mockData';
import { MdAccessTime, MdSwapHoriz, MdStar, MdTrendingUp, MdAdd, MdStore } from 'react-icons/md';
import './Dashboard.css';

const CATEGORY_EMOJIS = {
  Technology:'💻',Design:'🎨',Music:'🎵',Cooking:'🍳',Education:'📚',
  Fitness:'💪',Language:'🌐','Arts & Crafts':'🎭',Business:'💼',Other:'🔮'
};

function statusColor(s) {
  return { pending:'warning', accepted:'info', active:'info', completed:'success', rejected:'danger', cancelled:'gray' }[s] || 'gray';
}

export default function Dashboard() {
  const { user } = useAuth();
  const [exchanges, setExchanges] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const uid = user.id || user._id;

    const loadData = async () => {
      try {
        if (isMockMode()) {
          const ex = mockGetExchanges(uid);
          const sk = mockGetSkills({ limit: 6 });
          setExchanges(ex);
          setSkills(sk.skills);
          return;
        }
        const [exRes, skRes] = await Promise.all([
          api.get('/exchanges/my?role=all').catch(() => ({ data: { exchanges: [] } })),
          api.get('/skills?limit=6').catch(() => ({ data: { skills: [] } }))
        ]);
        setExchanges(exRes.data.exchanges || []);
        setSkills(skRes.data.skills || []);
      } catch {
        const ex = mockGetExchanges(uid);
        const sk = mockGetSkills({ limit: 6 });
        setExchanges(ex);
        setSkills(sk.skills);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user]);

  const uid = user?.id || user?._id;
  const earned = exchanges.filter(e => e.status === 'completed' && (e.provider?._id === uid || e.provider?.id === uid));
  const pending = exchanges.filter(e => e.status === 'pending');
  const active = exchanges.filter(e => e.status === 'accepted');
  const initials = user?.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="dashboard">
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            Good day, <span className="grad-name">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-muted">Here's what's happening on your SkillSwap today.</p>
        </div>
        <div className="dash-header-actions">
          <Link to="/marketplace" className="btn btn-outline"><MdStore /> Browse Skills</Link>
          <Link to="/profile" className="btn btn-primary"><MdAdd /> Add Skill</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card credit-card">
          <div className="sc-icon"><MdAccessTime /></div>
          <div className="sc-content">
            <div className="sc-value">{user?.timeCredits ?? 0}</div>
            <div className="sc-label">Time Credits</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="sc-icon green"><MdTrendingUp /></div>
          <div className="sc-content">
            <div className="sc-value">{earned.length}</div>
            <div className="sc-label">Credits Earned</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="sc-icon purple"><MdSwapHoriz /></div>
          <div className="sc-content">
            <div className="sc-value">{user?.totalExchanges ?? 0}</div>
            <div className="sc-label">Exchanges Done</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="sc-icon yellow"><MdStar /></div>
          <div className="sc-content">
            <div className="sc-value">
              {user?.rating > 0 ? (user.rating / (user.totalRatings || 1)).toFixed(1) : '—'}
            </div>
            <div className="sc-label">Avg Rating</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Profile card */}
        <div className="card profile-card">
          <div className="card-body">
            <div className="profile-top">
              <div className="profile-avatar-wrap">
                {user?.avatar
                  ? <img src={user.avatar} alt={user.name} className="profile-avatar" />
                  : <div className="profile-initials">{initials}</div>
                }
              </div>
              <div>
                <h3 className="profile-name">{user?.name}</h3>
                <p className="text-muted text-sm">{user?.location || 'No location set'}</p>
                {user?.bio && <p className="profile-bio">{user.bio}</p>}
              </div>
            </div>
            <hr className="divider" />
            <div className="skills-section">
              <div className="skills-group">
                <h4>🎓 Skills I Teach</h4>
                <div className="skill-pills">
                  {user?.skillsOffered?.length > 0
                    ? user.skillsOffered.map((s, i) => (
                        <span key={i} className="skill-pill offered">
                          {CATEGORY_EMOJIS[s.category] || '🔮'} {s.name}
                        </span>
                      ))
                    : <span className="text-muted text-sm">None added yet</span>
                  }
                </div>
              </div>
              <div className="skills-group">
                <h4>🌱 Skills I Want</h4>
                <div className="skill-pills">
                  {user?.skillsWanted?.length > 0
                    ? user.skillsWanted.map((s, i) => (
                        <span key={i} className="skill-pill wanted">{s.name}</span>
                      ))
                    : <span className="text-muted text-sm">None added yet</span>
                  }
                </div>
              </div>
            </div>
            <Link to="/profile" className="btn btn-outline w-full" style={{marginTop:16}}>Edit Profile</Link>
          </div>
        </div>

        {/* Recent Exchanges */}
        <div className="dash-main">
          <div className="card">
            <div className="card-body">
              <div className="section-title-row">
                <h3>Recent Exchanges</h3>
                <Link to="/exchanges" className="view-all">View All →</Link>
              </div>
              {exchanges.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🤝</div>
                  <h3>No exchanges yet</h3>
                  <p>Browse the marketplace to find skills you want to learn</p>
                  <Link to="/marketplace" className="btn btn-primary" style={{marginTop:12}}>Go to Marketplace</Link>
                </div>
              ) : (
                <div className="exchange-list">
                  {exchanges.slice(0, 6).map(ex => (
                    <div key={ex._id} className="exchange-item">
                      <div className="ex-skill-name">{ex.skill?.title || 'Skill Session'}</div>
                      <div className="ex-parties">
                        <span>{ex.provider?.name} → {ex.learner?.name}</span>
                      </div>
                      <div className="ex-meta">
                        <span className="text-muted text-sm">{new Date(ex.scheduledDate).toLocaleDateString()}</span>
                        <span className={`badge badge-${statusColor(ex.status)}`}>{ex.status}</span>
                        <span className="credit-chip">⏰ {ex.timeCreditsAmount} cr</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {(pending.length > 0 || active.length > 0) && (
            <div className="card" style={{marginTop:20}}>
              <div className="card-body">
                <h3 className="section-title-row" style={{marginBottom:14}}>Needs Your Attention</h3>
                {pending.length > 0 && (
                  <div className="attention-item">
                    <span className="badge badge-warning">⏳ {pending.length} Pending</span>
                    <span className="text-muted text-sm">Requests waiting for response</span>
                    <Link to="/exchanges" className="btn btn-sm btn-primary">Review</Link>
                  </div>
                )}
                {active.length > 0 && (
                  <div className="attention-item">
                    <span className="badge badge-success">✅ {active.length} Active</span>
                    <span className="text-muted text-sm">Sessions in progress</span>
                    <Link to="/exchanges" className="btn btn-sm btn-success">View</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {skills.length > 0 && (
        <div style={{marginTop:28}}>
          <div className="section-title-row" style={{marginBottom:16}}>
            <h2 style={{fontFamily:'var(--font-display)',fontWeight:800}}>✨ Trending Skills</h2>
            <Link to="/marketplace" className="view-all">See All Skills →</Link>
          </div>
          <div className="grid-3">
            {skills.slice(0, 3).map(skill => (
              <Link to={`/skills/${skill._id}`} key={skill._id} className="card card-hover skill-preview-card">
                <div className="card-body">
                  <div className="sp-top">
                    <span className="sp-category">{CATEGORY_EMOJIS[skill.category] || '🔮'} {skill.category}</span>
                    <span className="credit-chip">⏰ {skill.timeCreditsPerHour}/hr</span>
                  </div>
                  <h4 className="sp-title">{skill.title}</h4>
                  <p className="sp-desc">{skill.description?.slice(0, 80)}...</p>
                  <div className="sp-footer">
                    <span className="text-muted text-sm">by {skill.provider?.name}</span>
                    <span className="stars" style={{color:'#f59e0b'}}>
                      {'★'.repeat(Math.round(skill.totalRatings > 0 ? skill.rating / skill.totalRatings : 4))}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
