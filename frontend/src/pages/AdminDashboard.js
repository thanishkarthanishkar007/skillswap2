import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { isMockMode, mockAdminStats, mockAdminGetUsers, mockAdminToggleUser, mockAdminDeleteSkill, mockGetSkills } from '../utils/mockData';
import { MdPeople, MdSchool, MdSwapHoriz, MdTrendingUp, MdToggleOn, MdToggleOff, MdDelete } from 'react-icons/md';
import toast from 'react-hot-toast';
import './AdminDashboard.css';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'users', label: '👥 Users' },
  { key: 'skills', label: '🎓 Skills' },
];

function statusColor(s) {
  return { pending:'warning', accepted:'info', active:'info', completed:'success', rejected:'danger', cancelled:'gray' }[s] || 'gray';
}

export default function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      if (isMockMode()) {
        setStats(mockAdminStats());
        setUsers(mockAdminGetUsers());
        setSkills(mockGetSkills({ limit: 50 }).skills);
        return;
      }
      const [statsRes, usersRes, skillsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users?limit=50'),
        api.get('/admin/skills'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setSkills(skillsRes.data.skills || []);
    } catch {
      // Fallback to mock
      setStats(mockAdminStats());
      setUsers(mockAdminGetUsers());
      setSkills(mockGetSkills({ limit: 50 }).skills);
    } finally {
      setLoading(false);
    }
  };

  const toggleUser = async (id) => {
    try {
      if (isMockMode()) {
        const result = mockAdminToggleUser(id);
        setUsers(prev => prev.map(u => u._id === id ? result.user : u));
        toast.success(result.message);
        return;
      }
      const res = await api.put(`/admin/users/${id}/toggle`);
      setUsers(prev => prev.map(u => u._id === id ? res.data.user : u));
      toast.success(res.data.message);
    } catch { toast.error('Failed to toggle user'); }
  };

  const deleteSkill = async (id) => {
    if (!window.confirm('Remove this skill listing?')) return;
    try {
      if (isMockMode()) {
        mockAdminDeleteSkill(id);
        setSkills(prev => prev.filter(s => s._id !== id));
        toast.success('Skill removed');
        return;
      }
      await api.delete(`/admin/skills/${id}`);
      setSkills(prev => prev.filter(s => s._id !== id));
      toast.success('Skill removed');
    } catch { toast.error('Failed to remove skill'); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="admin-dashboard">
      <div className="page-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Manage users, skills, and monitor platform activity</p>
      </div>

      <div className="admin-tabs">
        {TABS.map(t => (
          <button key={t.key} className={`tab-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && stats && (
        <div>
          <div className="admin-stats-grid">
            {[
              { icon:<MdPeople/>, label:'Total Users', value:stats.stats.totalUsers, color:'blue' },
              { icon:<MdSchool/>, label:'Active Skills', value:stats.stats.totalSkills, color:'green' },
              { icon:<MdSwapHoriz/>, label:'Total Exchanges', value:stats.stats.totalExchanges, color:'purple' },
              { icon:<MdTrendingUp/>, label:'Completed', value:stats.stats.completedExchanges, color:'success' },
            ].map((s,i) => (
              <div key={i} className={`admin-stat-card ${s.color}`}>
                <div className="asc-icon">{s.icon}</div>
                <div className="asc-value">{s.value}</div>
                <div className="asc-label">{s.label}</div>
              </div>
            ))}
          </div>

          {stats.categoryStats?.length > 0 && (
            <div className="card" style={{marginBottom:20}}>
              <div className="card-body">
                <h3 style={{fontWeight:800,marginBottom:16}}>Skills by Category</h3>
                <div className="category-bars">
                  {stats.categoryStats.map(c => {
                    const max = stats.categoryStats[0]?.count || 1;
                    return (
                      <div key={c._id} className="cat-bar-row">
                        <span className="cat-bar-label">{c._id}</span>
                        <div className="cat-bar-track">
                          <div className="cat-bar-fill" style={{width:`${(c.count/max)*100}%`}} />
                        </div>
                        <span className="cat-bar-count">{c.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <h3 style={{fontWeight:800,marginBottom:16}}>Recent Exchanges</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead><tr><th>Skill</th><th>Provider</th><th>Learner</th><th>Date</th><th>Status</th></tr></thead>
                  <tbody>
                    {stats.recentExchanges?.slice(0,8).map(ex => (
                      <tr key={ex._id}>
                        <td style={{fontWeight:700}}>{ex.skill?.title||'—'}</td>
                        <td>{ex.provider?.name}</td>
                        <td>{ex.learner?.name}</td>
                        <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{new Date(ex.createdAt).toLocaleDateString()}</td>
                        <td><span className={`badge badge-${statusColor(ex.status)}`}>{ex.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="card">
          <div className="card-body">
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:12}}>
              <h3 style={{fontWeight:800}}>All Users ({filteredUsers.length})</h3>
              <input className="form-input" style={{width:220}} placeholder="Search by name or email..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)} />
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Credits</th><th>Exchanges</th><th>Joined</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u._id}>
                      <td style={{fontWeight:700}}>{u.name}</td>
                      <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{u.email}</td>
                      <td><span className={`badge ${u.role==='admin'?'badge-primary':'badge-gray'}`}>{u.role}</span></td>
                      <td style={{fontWeight:700}}>{u.timeCredits}</td>
                      <td>{u.totalExchanges}</td>
                      <td style={{color:'var(--text-muted)',fontSize:'0.82rem'}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge ${u.isActive?'badge-success':'badge-danger'}`}>{u.isActive?'Active':'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => toggleUser(u._id)}>
                          {u.isActive
                            ? <MdToggleOn style={{color:'var(--success)',fontSize:'1.4rem'}} />
                            : <MdToggleOff style={{color:'var(--danger)',fontSize:'1.4rem'}} />
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'skills' && (
        <div className="card">
          <div className="card-body">
            <h3 style={{fontWeight:800,marginBottom:16}}>All Skills ({skills.length})</h3>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr><th>Title</th><th>Category</th><th>Provider</th><th>Credits/hr</th><th>Sessions</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {skills.map(s => (
                    <tr key={s._id}>
                      <td style={{fontWeight:700}}>{s.title}</td>
                      <td><span className="badge badge-gray">{s.category}</span></td>
                      <td>{s.provider?.name}</td>
                      <td>{s.timeCreditsPerHour}</td>
                      <td>{s.totalSessions}</td>
                      <td><span className={`badge ${s.isActive?'badge-success':'badge-danger'}`}>{s.isActive?'Active':'Inactive'}</span></td>
                      <td>
                        <button className="btn btn-ghost btn-sm" onClick={() => deleteSkill(s._id)}>
                          <MdDelete style={{color:'var(--danger)'}} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
